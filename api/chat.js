export default async function handler(req, res) {
  try {
    const { message } = req.body; // ❗ 不要 JSON.parse()

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are LumiraX, an AI assistant specialized in blockchain security." },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        stream: false
      }),
    });

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: "No response from DeepSeek" });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content.trim()
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
