const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');

const analyzeMatch = async (req, res) => {
    try {
        const { userQuery, expertData } = req.body;

        if (!userQuery || !expertData) {
            return res.status(400).json({ error: 'Missing userQuery or expertData' });
        }

        // Check if API key is present
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY missing. Returning mock response.');
            return res.json({
                justification: `AI ANALYSIS (MOCKED): ${expertData.name} matches your request for "${userQuery}" because of their deep expertise in ${expertData.specialty?.join(', ')}. Their background in ${expertData.bio?.slice(0, 50)}... specifically aligns with your project goals.`
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Act as an advanced AI Talent Curator for a platform called ExpertBook.
      User is looking for: "${userQuery}"
      Expert Profile:
      - Name: ${expertData.name}
      - Bio: ${expertData.bio}
      - Specialties: ${expertData.specialty?.join(', ')}

      Task: Write a highly professional, 2-3 sentence technical justification explaining why this expert is a perfect match for the user's specific request. Focus on skill synergy and project impact. Avoid generic praise.
      
      Output format: A single string containing the justification.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ justification: text.trim() });
    } catch (err) {
        console.error('❌ AI Analysis Error:', err);
        res.status(500).json({ error: 'Failed to generate AI analysis' });
    }
};

module.exports = { analyzeMatch };
