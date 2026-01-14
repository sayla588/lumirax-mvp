// /api/download.js
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // ✅ 关键修复：从 query 里取 user
    const username = req.query.user;

    if (!username) {
      return res.status(401).json({ error: '未登录' });
    }

    // ✅ 测试 / 白名单 VIP（后端权威）
    const vipUsers = ['viptest', 'admin', 'sayla'];

    if (!vipUsers.includes(username.toLowerCase())) {
      return res.status(403).json({ error: '仅限 VIP 下载' });
    }

    // ✅ GitHub Release 真实地址
    const releaseUrl =
      'https://github.com/sayla588/lumirax-mvp/releases/download/v1.0.0/MiviChain.Pro.Guard_1.0.0_x64-setup.exe';

    // ✅ 302 跳转，浏览器会自动下载
    res.writeHead(302, {
      Location: releaseUrl
    });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '下载失败' });
  }
}
