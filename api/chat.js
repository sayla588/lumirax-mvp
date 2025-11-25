export const config = {
  api: {
    bodyParser: true, // 关键：启用 JSON 解析
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body || {};

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
          { role: "system", content: "You are LumiraX, an AI assistant specialized in blockchain security." },
          { role: "user", content: message }
        ],
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "No response from DeepSeek" });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
