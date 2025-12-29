// auth.js - 本地存储版（稳定简单）

const DB_KEY_USERS = 'chainGuard_users';
const DB_KEY_SESSION = 'chainGuard_session';

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupModalEvents();
});

// 注册、登录、退出、辅助函数保持不变（你原来的代码）

// 检查是否为VIP
function isVip() {
    const username = localStorage.getItem(DB_KEY_SESSION);
    if (!username) return false;

    const users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');
    const user = users[username];
    if (!user || !user.isVip) return false;

    if (!user.vipUntil) return true;
    return new Date(user.vipUntil) > new Date();
}

// 更新导航栏和VIP显示（包括桌面下载区）
function checkLoginStatus() {
    const username = localStorage.getItem(DB_KEY_SESSION);
    const navActions = document.getElementById('navActions');

    if (username) {
        const vip = isVip();
        navActions.innerHTML = `
            <div class="user-profile">
                <span><i class="fa-solid fa-user-astronaut"></i> ${username}
                    ${vip ? '<span style="color:#10b981; margin-left:8px;">✨ VIP</span>' : ''}
                </span>
                ${!vip ? '<button class="btn-upgrade" onclick="showUpgradeModal()">升级 VIP</button>' : ''}
                <button class="btn-logout" onclick="logout()">退出</button>
            </div>
        `;
    } else {
        navActions.innerHTML = `<button id="loginBtn" class="btn-login" onclick="openAuthModal()">登录 / 注册</button>`;
    }

    if (typeof updateVipDisplay === 'function') updateVipDisplay();
}

// VIP内容显示控制（插件 + 桌面下载区）
window.updateVipDisplay = function() {
    const downloadBtn = document.getElementById('proDownloadBtn');
    const vipDesktopDownload = document.getElementById('vipDesktopDownload');

    if (isVip()) {
        if (downloadBtn) downloadBtn.style.display = 'inline-block';
        if (vipDesktopDownload) vipDesktopDownload.style.display = 'block';
    } else {
        if (downloadBtn) downloadBtn.style.display = 'none';
        if (vipDesktopDownload) vipDesktopDownload.style.display = 'none';
    }
};

// 你的 showUpgradeModal() 函数保持不变（爱发电 + PayPal）

// 其他函数（handleRegister、handleLogin、logout、showMsg等）保持你原来的代码

// 开发者手动开VIP
if (window.location.hostname === 'localhost' || window.location.hostname.includes('vercel.app')) {
    window.devVip = function(username) {
        let users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');
        if (!users[username]) {
            alert('用户不存在');
            return;
        }
        users[username].isVip = true;
        users[username].vipUntil = '2099-12-31';
        localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
        alert(`${username} 已升级为永久 VIP！`);
        checkLoginStatus();
        updateVipDisplay();
    };
}
