export default async function handler(req, res) {
  const wallet = req.headers["x-wallet-address"];
  if (!wallet) {
    return res.status(401).end();
  }

  const isVip = await checkVip(wallet);
  if (!isVip) {
    return res.status(403).end();
  }

  return res.status(200).end();
}

async function checkVip(wallet) {
  const vipWallets = [
    "0x1234567890abcdef",
    "0xabcdef1234567890"
  ];

  return vipWallets.includes(wallet.toLowerCase());
}
