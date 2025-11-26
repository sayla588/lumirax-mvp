
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  console.log("API Route /api/chat called");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body || {};

    // 检查 API KEY
    const apiKey = process.env.DEEPSEEK_KEY;
    if (!apiKey) {
      console.error("❌ Missing DEEPSEEK_KEY");
      return res.status(500).json({ error: "Server configuration error: API Key missing" });
    }

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Sending request to DeepSeek...");

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

    // DeepSeek API 错误处理
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ DeepSeek API Error (${response.status}):`, errorText);
      return res.status(response.status).json({
        error: `DeepSeek API Error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error("❌ Unexpected response:", data);
      return res.status(500).json({ error: "Invalid response from DeepSeek" });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error("❌ Server Internal Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
