export default async function handler(req, res) {
  try {
    // 必须：Vercel 解析 JSON 要用 req.json() / req.body 不能 JSON.parse
    const body = req.method === "POST" ? await req.json() : null;
    const message = body?.message;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are LumiraX, an AI assistant specialized in blockchain security."
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!data?.choices?.[0]) {
      return res.status(500).json({ error: "No response from DeepSeek" });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: err.message || "Unknown server error" });
  }
}
