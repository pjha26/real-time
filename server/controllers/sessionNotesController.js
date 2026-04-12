const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');

/**
 * POST /api/sessions/:bookingId/notes
 * Generate AI-powered session notes
 */
const generateNotes = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { topics, keyPoints, expertName, sessionTitle } = req.body;

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MOCK_KEY') {
            // Mock fallback
            return res.json({
                id: bookingId,
                summary: `## Session Summary: ${sessionTitle || 'Expert Consultation'}\n\n### Executive Overview\nA productive session was conducted with ${expertName || 'the expert'} covering ${topics || 'the planned agenda'}.\n\n### Key Discussion Points\n${keyPoints ? keyPoints.split(',').map((p, i) => `${i + 1}. ${p.trim()}`).join('\n') : '1. Project requirements and scope\n2. Technical architecture review\n3. Timeline and milestones'}\n\n### Action Items\n- [ ] Follow up on discussed deliverables\n- [ ] Share relevant documentation\n- [ ] Schedule next review session\n\n### Follow-up Recommendations\n- Review shared resources within 48 hours\n- Prepare questions for the next session\n- Document any blockers or changes in scope`,
                generated_at: new Date().toISOString(),
                is_mock: true,
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `
You are an AI assistant generating professional session notes for a consultation platform called ExpertBook.

Session Title: ${sessionTitle || 'Expert Consultation'}
Expert: ${expertName || 'Expert'}
Topics Discussed: ${topics || 'General consultation'}
Key Points: ${keyPoints || 'Not specified'}

Generate a structured, professional session summary in Markdown format with these sections:
1. **Executive Overview** (2-3 sentences)
2. **Key Discussion Points** (bullet list of main topics covered)
3. **Action Items** (checkbox list of follow-ups)
4. **Follow-up Recommendations** (2-3 practical next steps)

Keep it concise, professional, and actionable. Use markdown formatting.
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({
            id: bookingId,
            summary: text.trim(),
            generated_at: new Date().toISOString(),
            is_mock: false,
        });
    } catch (err) {
        console.error('[Session Notes Error]', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/sessions/:bookingId/notes
 * Retrieve saved notes (from localStorage on client for now)
 */
const getNotes = async (req, res) => {
    res.json({ id: req.params.bookingId, summary: null, message: 'Notes are stored client-side in demo mode.' });
};

module.exports = { generateNotes, getNotes };
