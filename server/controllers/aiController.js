const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');

const MOCK_EXPERTS = [
    { id: '1', name: 'Marcus Thorne', specialty: ['Product Strategy', 'Growth', 'FinTech'], bio: 'Ex-Apple strategist specializing in fluid transactional experiences.', hourly_rate: 450 },
    { id: '2', name: 'Elena Vance', specialty: ['UI/UX', 'Motion Systems', 'Accessibility'], bio: 'Senior UI Architect. Creator of the Flux Framework.', hourly_rate: 380 },
    { id: '3', name: 'David Chen', specialty: ['Cloud Infrastructure', 'AWS', 'Azure'], bio: 'Cloud expert for scaling SaaS platforms.', hourly_rate: 420 },
    { id: '4', name: 'Zoe Nakamura', specialty: ['AI/ML', 'Python', 'Data Science'], bio: 'Lead AI researcher. Ethics-first approach.', hourly_rate: 500 },
    { id: '5', name: 'Alex Rivera', specialty: ['Blockchain', 'DeFi', 'Smart Contracts'], bio: 'Web3 pioneer building decentralized finance.', hourly_rate: 460 },
    { id: '6', name: 'Sarah Kim', specialty: ['Growth Marketing', 'SEO', 'Analytics'], bio: 'Growth architect who scaled 4 SaaS companies.', hourly_rate: 340 },
];

/**
 * POST /api/ai/analyze — Single expert analysis (existing)
 */
const analyzeMatch = async (req, res) => {
    try {
        const { userQuery, expertData } = req.body;
        if (!userQuery || !expertData) {
            return res.status(400).json({ error: 'Missing userQuery or expertData' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MOCK_KEY') {
            return res.json({
                justification: `AI ANALYSIS (MOCKED): ${expertData.name} matches your request for "${userQuery}" because of their deep expertise in ${expertData.specialty?.join(', ')}.`
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `
Act as an advanced AI Talent Curator for ExpertBook.
User is looking for: "${userQuery}"
Expert: ${expertData.name} — ${expertData.bio}
Specialties: ${expertData.specialty?.join(', ')}

Write a 2-3 sentence professional justification for why this expert is a match. Focus on skill synergy.
`;
        const result = await model.generateContent(prompt);
        res.json({ justification: result.response.text().trim() });
    } catch (err) {
        console.error('❌ AI Analysis Error:', err);
        res.status(500).json({ error: 'Failed to generate AI analysis' });
    }
};

/**
 * POST /api/ai/match — AI-Powered Expert Matching
 * Takes a project description and returns ranked expert recommendations.
 */
const matchExperts = async (req, res) => {
    try {
        const { projectDescription } = req.body;
        if (!projectDescription) {
            return res.status(400).json({ error: 'projectDescription is required' });
        }

        // Fetch experts from Supabase
        let experts = [];
        try {
            const { data } = await supabase
                .from('experts')
                .select('*, users!experts_user_id_fkey(name)');
            if (data && data.length > 0) {
                experts = data.map(e => ({
                    id: e.id,
                    name: e.users?.name || 'Unknown',
                    specialty: e.specialty || [],
                    bio: e.bio || '',
                    hourly_rate: e.hourly_rate || 0,
                }));
            }
        } catch (e) { /* fall through to mock */ }

        if (experts.length === 0) experts = MOCK_EXPERTS;

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MOCK_KEY') {
            // Mock: simple keyword matching
            const keywords = projectDescription.toLowerCase().split(/\s+/);
            const scored = experts.map(e => {
                const matches = keywords.filter(kw =>
                    e.specialty.some(s => s.toLowerCase().includes(kw)) ||
                    e.bio.toLowerCase().includes(kw)
                ).length;
                return {
                    ...e,
                    score: Math.min(99, 70 + matches * 8 + Math.floor(Math.random() * 10)),
                    justification: `${e.name}'s expertise in ${e.specialty.slice(0, 2).join(' and ')} aligns with your project requirements. Their background in ${e.bio.slice(0, 60)}... makes them a strong candidate.`,
                };
            });
            scored.sort((a, b) => b.score - a.score);
            return res.json({ matches: scored });
        }

        // Real Gemini matching
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const expertList = experts.map(e => `ID:${e.id} | ${e.name} | Specialties: ${e.specialty.join(', ')} | Bio: ${e.bio}`).join('\n');

        const prompt = `
You are an AI Talent Curator for ExpertBook. A client has described their project:

"${projectDescription}"

Available experts:
${expertList}

Rank ALL experts by relevance to this project. Return ONLY a JSON array (no markdown, no code fences) with this structure:
[{"id":"...","score":95,"justification":"2-3 sentence explanation"}]

Score from 0-99. Be specific about why each expert matches or doesn't match.
`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Strip markdown code fences if present
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let rankings;
        try {
            rankings = JSON.parse(responseText);
        } catch (parseErr) {
            console.error('Failed to parse Gemini response:', responseText);
            // Fallback to mock scoring
            const scored = experts.map(e => ({
                ...e,
                score: Math.floor(Math.random() * 30 + 70),
                justification: `AI analysis suggests ${e.name} could be a good fit based on their ${e.specialty[0]} expertise.`,
            }));
            scored.sort((a, b) => b.score - a.score);
            return res.json({ matches: scored });
        }

        // Merge rankings with expert data
        const matches = rankings.map(r => {
            const expert = experts.find(e => String(e.id) === String(r.id));
            return {
                ...(expert || {}),
                score: r.score,
                justification: r.justification,
            };
        }).filter(m => m.name);

        res.json({ matches });
    } catch (err) {
        console.error('❌ AI Match Error:', err);
        res.status(500).json({ error: 'Failed to generate matches' });
    }
};

module.exports = { analyzeMatch, matchExperts };
