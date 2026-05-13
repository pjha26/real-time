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

        let generatedText = '';
        let isMock = false;

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MOCK_KEY') {
            // Mock fallback string
            generatedText = `## Session Summary: ${sessionTitle || 'Expert Consultation'}\n\n### Executive Overview\nA productive session was conducted with ${expertName || 'the expert'} covering ${topics || 'the planned agenda'}.\n\n### Key Discussion Points\n${keyPoints ? keyPoints.split(',').map((p, i) => `${i + 1}. ${p.trim()}`).join('\n') : '1. Project requirements and scope\n2. Technical architecture review\n3. Timeline and milestones'}\n\n### Action Items\n- [ ] Follow up on discussed deliverables\n- [ ] Share relevant documentation\n- [ ] Schedule next review session\n\n### Follow-up Recommendations\n- Review shared resources within 48 hours\n- Prepare questions for the next session\n- Document any blockers or changes in scope`;
            isMock = true;
        } else {
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
            generatedText = result.response.text().trim();
        }

        // Store into DB
        const { data, error } = await supabase
            .from('session_notes')
            .upsert({
                booking_id: bookingId,
                summary: generatedText,
                is_mock: isMock
            }, { onConflict: 'booking_id' })
            .select()
            .single();

        if (error) {
            console.error('[Session Note Insert Error]', error);
            // Fallback response if DB insert fails
            return res.json({ id: bookingId, summary: generatedText, is_mock: isMock });
        }

        res.json(data);
    } catch (err) {
        console.error('[Session Notes Generate Error]', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/sessions/:bookingId/notes
 * Retrieve saved notes from Supabase
 */
const getNotes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('session_notes')
            .select('*')
            .eq('booking_id', req.params.bookingId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.json({ id: req.params.bookingId, summary: null, message: 'No notes generated yet.' });
            }
            throw error;
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { generateNotes, getNotes };
