// user.js - 添加错误处理版本
try {
    function updateNavigation() {
        const navActions = document.getElementById('navActions');
        if (!navActions) {
            console.warn('navActions 元素未找到，跳过导航栏更新');
            return;
        }
        
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (isLoggedIn && user) {
                navActions.innerHTML = `
                    <div class="user-menu">
                        <div class="user-info">
                            <div class="user-avatar">${user.avatar || '👤'}</div>
                            <span class="user-name">${user.username || '用户'}</span>
                        </div>
                        <button class="btn-logout" onclick="logout()">退出</button>
                    </div>
                `;
            } else {
                navActions.innerHTML = `
                    <button class="btn-login" onclick="window.location.href='login.html'">登录 / 注册</button>
                `;
            }
        } catch (error) {
            console.error('更新导航栏时出错:', error);
            navActions.innerHTML = `
                <button class="btn-login" onclick="window.location.href='login.html'">登录 / 注册</button>
            `;
        }
    }

    async function logout() {
        try {
            await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'logout'
                })
            });
        } catch (error) {
            console.warn('注销 API 调用失败:', error);
        }
        
        // 清除本地存储
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        
        // 更新导航栏并刷新
        updateNavigation();
        window.location.reload();
    }

    // 页面加载时更新导航栏
    document.addEventListener('DOMContentLoaded', () => {
        console.log('user.js 加载成功');
        updateNavigation();
    });

    // 导出函数供全局使用
    window.updateNavigation = updateNavigation;
    window.logout = logout;
    
} catch (error) {
    console.error('user.js 初始化错误:', error);
}
