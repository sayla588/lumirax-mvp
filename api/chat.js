// Vercel serverless proxy — 转发 DeepSeek API，解决跨域 & 地域阻断 & Key泄露问题
export default async function handler(req, res) {
  try {
    const { prompt } = JSON.parse(req.body || "{}");
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    // 从 Vercel 环境变量读取 key
    const apiKey = process.env.DEEPSEEK_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing DEEPSEEK_KEY in Vercel env" });
    }

    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const raw = await upstream.text();

    try {
      const j = JSON.parse(raw);
      const reply = j.choices?.[0]?.message?.content ?? raw;
      return res.status(200).json({ reply });
    } catch {
      return res.status(200).json({ reply: raw });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

