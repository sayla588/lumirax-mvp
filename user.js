// /user.js
// 用户状态管理和导航栏更新

function updateNavigation() {
    const navActions = document.getElementById('navActions');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!navActions) return;
    
    if (isLoggedIn && user) {
        // 显示用户信息和退出按钮
        navActions.innerHTML = `
            <div class="user-menu">
                <div class="user-info">
                    <div class="user-avatar">${user.avatar}</div>
                    <span class="user-name">${user.username}</span>
                </div>
                <button class="btn-logout" onclick="logout()">退出</button>
            </div>
        `;
    } else {
        // 显示登录按钮
        navActions.innerHTML = `
            <button class="btn-login" onclick="window.location.href='login.html'">登录 / 注册</button>
        `;
    }
}

async function logout() {
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'logout'
            })
        });
        
        // 清除本地存储的用户信息
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        
        // 更新导航栏
        updateNavigation();
        
        // 刷新当前页面
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
        // 即使API调用失败，也清除本地存储
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        updateNavigation();
        window.location.reload();
    }
}

// 页面加载时更新导航栏
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    
    // 如果是登录页面且已登录，跳转到首页
    if (window.location.pathname.includes('login.html')) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            window.location.href = 'index.html';
        }
    }
});
