import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'CHANGE_ME_SECRET';

export default function handler(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }

  try {
    const token = auth.replace('Bearer ', '');
    const [payloadBase64, signature] = token.split('.');

    const payloadStr = Buffer.from(payloadBase64, 'base64').toString();
    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(payloadStr)
      .digest('hex');

    if (signature !== expectedSig) {
      return res.status(401).json({ error: '无效凭证' });
    }

    const payload = JSON.parse(payloadStr);

    if (payload.exp < Date.now()) {
      return res.status(401).json({ error: '登录已过期' });
    }

    if (!payload.isVip) {
      return res.status(403).json({ error: '仅限 VIP 下载' });
    }

    const releaseUrl =
      'https://github.com/sayla588/lumirax-mvp/releases/download/v1.0.0/MiviChain.Pro.Guard_1.0.0_x64-setup.exe';

    res.writeHead(302, { Location: releaseUrl });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
}
