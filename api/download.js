import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    // 只允许 GET
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 1️⃣ 从请求头中获取钱包地址（前端会传）
    const wallet = req.headers["x-wallet-address"];

    if (!wallet) {
      return res.status(401).json({ error: "未登录钱包" });
    }

    // 2️⃣ 校验 VIP（示例：你可以替换为真实 VIP 逻辑）
    const isVip = await checkVip(wallet);

    if (!isVip) {
      return res.status(403).json({ error: "仅限 VIP 用户下载" });
    }

    // 3️⃣ exe 文件路径
    const filePath = path.join(
      process.cwd(),
      "downloads",
      "mivichain-pro-guard.exe"
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "安装包不存在" });
    }

    // 4️⃣ 设置下载头
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="mivichain-pro-guard.exe"'
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // 5️⃣ 流式下载
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "下载失败" });
  }
}

// ⚠ VIP 校验函数（先用最简单版）
async function checkVip(wallet) {
  // TODO：之后接你的支付 / NFT / 数据库
  const vipWallets = [
    "0x1234567890abcdef",
    "0xabcdef1234567890"
  ];

  return vipWallets.includes(wallet.toLowerCase());
}
