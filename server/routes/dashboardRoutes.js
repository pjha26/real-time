const express = require('express');
const router = express.Router();
const supabase = require('../db');
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');

const MOCK_FALLBACK_DATA = {
    flow_tasks: [
        { id: 1, title: "Finalize Zenith Strategy", time: "11:00 AM", type: "Focus Block", priority: "high" },
        { id: 2, title: "Review AI Integration Docs", time: "2:00 PM", type: "Prep", priority: "medium" }
    ],
    curator_notes: [
        "Your upcoming 2PM meeting lacks a defined technical scope.",
        "Consider asking the client for their cloud architecture diagram beforehand."
    ]
};

// GET /api/dashboard/insights
router.get('/insights', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user's bookings to inform the AI
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                experts(*, users!experts_user_id_fkey(name)),
                event_types(title)
            `)
            .or(`client_id.eq.${userId},expert_id.in.(select id from experts where user_id='${userId}')`)
            .eq('status', 'pending')
            .order('start_time', { ascending: true })
            .limit(5);

        if (error) {
            console.error("Dashboard Supabase error:", error);
            return res.json({ ...MOCK_FALLBACK_DATA, active_connections: 0, total_completed: 0 });
        }

        // Just basic network stats based on bookings found
        const active_connections = bookings ? bookings.length : 0;
        
        let flow_tasks = [];
        let curator_notes = [];

        if (!bookings || bookings.length === 0) {
            // No bookings? Use fallback AI insights so the dashboard isn't completely empty
            flow_tasks = [
                { id: 't1', title: 'Initialize your Workspace', type: 'System', time: 'Now', priority: 'high' }
            ];
            curator_notes = [
                "Your flow state is currently paused. Discover an expert or accept a booking to activate the Curator."
            ];
            return res.json({ flow_tasks, curator_notes, active_connections, pending_connections: 0 });
        }

        // Use Gemini API to generate insights based on bookings
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MOCK_KEY') {
            return res.json({ ...MOCK_FALLBACK_DATA, active_connections, pending_connections: active_connections });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const bookingContext = bookings.map(b => 
            `- ${b.event_types?.title || 'Session'} with ${b.scope ? `scope: ${b.scope}` : 'no defined scope'}`
        ).join('\n');

        const prompt = `
You are the AI Curator for the ExpertBook dashboard.
The user has the following upcoming collaborative sessions:
${bookingContext}

Based on these, generate:
1. "flow_tasks": An array of 3 prioritized tasks for the user today. Each task must have: 'id' (string), 'title' (string), 'type' (string, e.g., 'Prep', 'Deep Work', 'Strategy'), 'time' (string, e.g., '2:00 PM'), 'priority' ('high', 'medium', 'low').
2. "curator_notes": An array of 3 brief, insightful sentences (under 12 words each) summarizing what the user should know or ask before these meetings.

Return EXACTLY matching this JSON structure:
{
  "flow_tasks": [...],
  "curator_notes": [...]
}
Do not return markdown formatting (no \`\`\`json). Just the raw JSON object.
`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let aiInsights;
        try {
            aiInsights = JSON.parse(responseText);
            flow_tasks = aiInsights.flow_tasks || MOCK_FALLBACK_DATA.flow_tasks;
            curator_notes = aiInsights.curator_notes || MOCK_FALLBACK_DATA.curator_notes;
        } catch (parseErr) {
            console.error("Gemini JSON Parse Error in dashboard:", parseErr);
            flow_tasks = MOCK_FALLBACK_DATA.flow_tasks;
            curator_notes = MOCK_FALLBACK_DATA.curator_notes;
        }

        res.json({
            flow_tasks,
            curator_notes,
            active_connections,
            pending_connections: active_connections
        });

    } catch (err) {
        console.error('❌ Dashboard Insights Error:', err);
        res.status(500).json({ error: 'Failed to generate dashboard insights' });
    }
});

module.exports = router;
