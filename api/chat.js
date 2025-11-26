export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  console.log("📩 /api/chat hit");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.DEEPSEEK_KEY;

    if (!apiKey) {
      console.error("❌ DEEPSEEK_KEY missing!");
      return res.status(500).json({ error: "Server misconfigured: Missing API key" });
    }

    console.log("➡️ Sending to DeepSeek:", message);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
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

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ DeepSeek Error ${response.status}:`, errText);

      return res.status(response.status).json({
        error: `DeepSeek API Error (${response.status})`,
        details: errText
      });
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      console.error("❌ Invalid DeepSeek response:", data);
      return res.status(500).json({ error: "Invalid response from DeepSeek" });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error("❌ Server Error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
