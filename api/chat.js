export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // 1. 调试日志：确认请求已到达
  console.log("API Route /api/chat called");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body || {};

    // 2. 检查 API Key 是否存在 (关键步骤)
    // 注意：在 Vercel 环境变量里，确保名字是 DEEPSEEK_KEY，没有多余空格
    const apiKey = process.env.DEEPSEEK_KEY;
    
    if (!apiKey) {
      console.error("❌ Error: DEEPSEEK_KEY is missing in process.env");
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

    // 3. 检查 DeepSeek 是否返回了 HTTP 错误 (比如 401, 402, 429, 500)
    if (!response.ok) {
      const errorText = await response.text(); // 获取原始错误信息
      console.error(`❌ DeepSeek API Error (${response.status}):`, errorText);
      
      // 将上游的具体错误直接返回给前端，方便调试
      return res.status(response.status).json({ 
        error: `DeepSeek API Error: ${response.status}`, 
        details: errorText 
      });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error("❌ Unexpected response structure:", JSON.stringify(data));
      return res.status(500).json({ error: "No response content from DeepSeek" });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error("❌ Server Internal Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
