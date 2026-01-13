// /api/download.js
export default function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // ✅ 从 URL 参数读取用户名
        const username = req.query.user;

        if (!username) {
            return res.status(401).json({ error: '未登录' });
        }

        // ✅ VIP 白名单（测试阶段完全 OK）
        const vipUsers = ['viptest', 'admin', 'sayla'];

        if (!vipUsers.includes(username.toLowerCase())) {
            return res.status(403).json({ error: '仅限 VIP 下载' });
        }

        // ✅ GitHub Release exe
        const releaseUrl =
            'https://github.com/sayla588/lumirax-mvp/releases/download/v1.0.0/MiviChain.Pro.Guard_1.0.0_x64-setup.exe';

        // ✅ 302 跳转，浏览器自动下载
        res.writeHead(302, { Location: releaseUrl });
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '下载失败' });
    }
}
