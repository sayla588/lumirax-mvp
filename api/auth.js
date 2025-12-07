// /api/auth.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { action, email, password, username } = req.body;

    if (!action || !email || !password) {
        return res.status(400).json({ error: "缺少必要参数" });
    }

    try {
        // 这里简单模拟数据库存储（实际项目中应该使用数据库）
        if (action === 'register') {
            if (!username) {
                return res.status(400).json({ error: "请提供用户名" });
            }

            // 检查邮箱是否已注册（模拟）
            const existingUser = getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: "该邮箱已被注册" });
            }

            // 创建新用户
            const newUser = {
                id: Date.now().toString(),
                email,
                username,
                password: password, // 实际应用中应该使用 bcrypt 加密
                createdAt: new Date().toISOString(),
                avatar: getRandomAvatar()
            };

            // 保存用户（模拟）
            saveUser(newUser);

            return res.status(200).json({
                success: true,
                message: "注册成功",
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    avatar: newUser.avatar
                }
            });

        } else if (action === 'login') {
            // 验证用户（模拟）
            const user = getUserByEmail(email);
            
            if (!user) {
                return res.status(404).json({ error: "用户不存在" });
            }

            if (user.password !== password) {
                return res.status(401).json({ error: "密码错误" });
            }

            return res.status(200).json({
                success: true,
                message: "登录成功",
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    avatar: user.avatar
                }
            });

        } else if (action === 'logout') {
            return res.status(200).json({
                success: true,
                message: "已登出"
            });

        } else {
            return res.status(400).json({ error: "未知操作" });
        }

    } catch (error) {
        console.error("Auth error:", error);
        return res.status(500).json({ error: "服务器内部错误" });
    }
}

// 模拟数据库函数
function getRandomAvatar() {
    const avatars = [
        '👨‍💻', '👩‍💻', '🦸‍♂️', '🦸‍♀️', '🧑‍🚀', '👨‍🚀', '👩‍🚀', '🧙‍♂️', '🧙‍♀️',
        '🐉', '🦊', '🐱', '🦁', '🐯', '🐨', '🐼', '🦄', '🦋'
    ];
    return avatars[Math.floor(Math.random() * avatars.length)];
}

const users = []; // 模拟内存数据库

function getUserByEmail(email) {
    return users.find(user => user.email === email);
}

function saveUser(user) {
    users.push(user);
}
