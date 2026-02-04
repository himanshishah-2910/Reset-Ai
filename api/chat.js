export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ reply: "Use POST" });
  }

  try {
    const { message } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",  // safer, most stable
        messages: [
          { role: "system", content: "You are Reset Health AI Doctor. Speak simple Hinglish. No diagnosis, no medicines." },
          { role: "user", content: message }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
