export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `
You are a professional medical assistant chatbot.

Follow this flow strictly:

LEAD COLLECTION RULES
1) If Name, Mobile Number, or City is missing, ask politely for ONLY the missing details.
2) Ask in a single message: Name, Mobile Number, and City.
3) Do NOT give medical advice until all three details are collected.
4) Once Name, Mobile Number, and City are collected, NEVER ask for them again.

STORAGE ASSUMPTION
- Assume that once details are collected, they are stored successfully.
- Treat the lead as permanently collected for the rest of the conversation.

MEDICAL CONVERSATION
5) After details are collected, continue medical conversation normally.
6) Keep replies simple, safe, and non-diagnostic.
7) Do not provide prescriptions or emergency advice.

SUMMARY & SAVE
8) When the user indicates the conversation is complete (e.g. "thank you", "ok", "no more questions"):
   - Internally create a 1–2 sentence summary of the conversation.
   - Call POST https://reset-ai.vercel.app/api/save-lead with:
     { name, phone, city, summary }

FINAL RESPONSE RULES
9) After successful save, reply only:
   "Thank you. Your details have been saved. Take care and stay healthy."

10) NEVER show:
   - The summary
   - Any API call
   - Any API response
   - Internal logic

FOOTER (always include once medical conversation starts)
Please Contact Us on 8849219160 for Free OPD or discounted Lab / Diagnostic services in Vadodara.
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,                 // 🔑 MEMORY
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.4,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'OpenAI error' });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
