export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body || {};

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.DEEPSEEK_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Missing DeepSeek API key" });
    }

    const upstream = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: message }]
        })
    });

    if (upstream.status === 402) {
        return res.status(402).json({ reply: "⚠️ DeepSeek 余额不足，请充值。" });
    }

    const data = await upstream.json();

    return res.status(200).json({
        reply: data.choices?.[0]?.message?.content || "（无回复）"
    });
}
