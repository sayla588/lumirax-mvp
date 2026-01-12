import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // 只允许 GET
  if (req.method !== "GET") {
    return res.status(405).end("Method Not Allowed");
  }

  // exe 路径
  const filePath = path.join(
    process.cwd(),
    "downloads",
    "mivichain-pro-guard.exe"
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).end("File not found");
  }

  // 下载头
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="mivichain-pro-guard.exe"'
  );
  res.setHeader("Content-Type", "application/octet-stream");

  // 流式返回
  fs.createReadStream(filePath).pipe(res);
}
