export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // ✅ Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // stable model
     
        messages: [
         
          { role: 'system', content: `
            
            Follow this flow strictly: 
            1) First message: Ask politely for Name, Mobile Number, and City.
            2) Do NOT give medical advice until all three details are collected.
            3) Store the collected details as: name, phone, city
          4) After collecting, start medical conversation normally.
          5) When conversation feels complete (user says thank you/ok/no more questions):- Create a 1-2 sentence summary- Call POST https://reset-ai.vercel.app/api/save-lead with {name, phone, city, summary}
          6) After successful save, reply: "Thank you. Your details have been saved. Take care and stay healthy.
          Rules:- Never show summary or API response to user- Never ask for details again once collected- Keep medical replies simple and safe- Act like a professional doctor, 
          write one footer line - Please Contact Us on 8849219160, For Free OPD, or Discounton Lab or Diagnostic service in Vadodara' ` },
          
        
          { role: 'user', content: message },
        ],
       
                           
      temperature: 0.4,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
