// /api/download.js
export default function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // ① 从请求头读取用户名（前端已保证登录）
    const username = req.headers['x-username'];

    if (!username) {
      return res.status(401).json({ error: '未登录' });
    }

    // ② VIP 校验（示例：测试 / 管理员账号）
    const vipUsers = ['viptest', 'admin', 'sayla'];

    if (!vipUsers.includes(username.toLowerCase())) {
      return res.status(403).json({ error: '仅限 VIP 下载' });
    }

    // ③【与你当前 Release 完全匹配的真实地址】
    const releaseUrl =
      'https://github.com/sayla588/lumirax-mvp/releases/download/v1.0.0/mivichain-pro-guard.exe';

    // ④ 302 跳转到 GitHub Release
    res.writeHead(302, {
      Location: releaseUrl
    });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '下载失败' });
  }
}
