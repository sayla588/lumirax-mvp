// /api/download.js —— 商用稳定版（query 鉴权）

export default function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // ✅ 只从 query 取用户（不要再混用 header / session）
    const username = req.query.user;

    if (!username) {
      return res.status(401).json({ error: '未登录' });
    }

    // ✅ VIP 白名单（你后面可以接数据库）
    const vipUsers = ['viptest', 'sayla', 'admin','viptest1',];

    if (!vipUsers.includes(username.toLowerCase())) {
      return res.status(403).json({ error: '仅限 VIP 下载' });
    }

    // ✅ GitHub Release 真实地址（你这个是对的）
    const releaseUrl =
      'https://github.com/sayla588/lumirax-mvp/releases/download/v1.0.0/mivichain-pro-guard.exe';

    // ✅ 必须 302 跳转
    res.writeHead(302, {
      Location: releaseUrl,
    });
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '下载失败' });
  }
}
