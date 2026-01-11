import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = auth.replace("Bearer ", "");

    // 1️⃣ 验证 token（与你的 verify.js 共用逻辑）
    const payload = jwt.verify(token, process.env.DESKTOP_AUTH_SECRET);

    // 2️⃣ 判断 VIP
    if (!payload.isVIP) {
      return res.status(403).json({ error: "Not VIP" });
    }

    // 3️⃣ exe 路径
    const exePath = path.join(
      process.cwd(),
      "downloads",
      "mivichain-pro-guard.exe"
    );

    if (!fs.existsSync(exePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // 4️⃣ 触发下载
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=mivichain-pro-guard.exe"
    );
    res.setHeader("Content-Type", "application/octet-stream");

    const stream = fs.createReadStream(exePath);
    stream.pipe(res);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
