import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ① 前端必须传 userId（或钱包地址）
  const { userId, isVip } = req.body;

  if (!userId || !isVip) {
    return res.status(403).json({ error: "Not authorized" });
  }

  // ② 生成授权 token（有效期 7 天）
  const token = jwt.sign(
    {
      userId,
      type: "desktop",
    },
    process.env.DESKTOP_AUTH_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    success: true,
    token,
    downloadUrl: "/downloads/mivichain-pro-guard.exe",
  });
}
