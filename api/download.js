// /api/download.js
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // ① 取用户名（来自前端）
    const username = req.headers['x-username'];

    if (!username) {
      return res.status(401).json({ error: '未登录' });
    }

    // ② VIP 校验（示例：测试用户）
    const vipUsers = ['viptest', 'admin', 'sayla'];

    if (!vipUsers.includes(username.toLowerCase())) {
      return res.status(403).json({ error: '仅限 VIP 下载' });
    }

    // ③ GitHub Release 下载地址（你自己的）
    const releaseUrl =
      'https://github.com/sayla588/lumirax-mvp/releases/download/v1.0.0/MiviChain.Pro.Guard_1.0.0_x64-setup.exe';

    // ④ 直接跳转（关键）
    res.writeHead(302, {
      Location: releaseUrl
    });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '下载失败' });
  }
}
