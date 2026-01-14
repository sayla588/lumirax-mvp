import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'CHANGE_ME_SECRET';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: '缺少用户名' });
  }

  // ✅ 正式 VIP 来源（先写死，后面接爱发电）
  const vipUsers = ['sayla', 'viptest', 'admin'];
  const isVip = vipUsers.includes(username.toLowerCase());

  const payload = {
    username,
    isVip,
    exp: Date.now() + 1000 * 60 * 60 * 24 // 24h
  };

  const payloadStr = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payloadStr)
    .digest('hex');

  const token = Buffer.from(payloadStr).toString('base64') + '.' + signature;

  res.json({ token, isVip });
}
