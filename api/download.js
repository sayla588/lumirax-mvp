export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 1️⃣ 获取钱包
    const wallet = req.headers["x-wallet-address"];
    if (!wallet) {
      return res.status(401).json({ error: "未登录" });
    }

    // 2️⃣ 校验 VIP
    const isVip = await checkVip(wallet);
    if (!isVip) {
      return res.status(403).json({ error: "仅限 VIP 用户下载" });
    }

    // 3️⃣ 返回 GitHub Release 下载地址
    return res.status(200).json({
      url: "https://github.com/你的用户名/lumirax-mvp/releases/download/v1.0.0/mivichain-pro-guard.exe"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "服务器错误" });
  }
}

/**
 * VIP 校验（示例版）
 * 你后续可以替换为：
 * - 数据库
 * - NFT
 * - 支付订单
 */
async function checkVip(wallet) {
  const vipWallets = [
    "0x1234567890abcdef",
    "0xabcdef1234567890"
  ];

  return vipWallets.includes(wallet.toLowerCase());
}
