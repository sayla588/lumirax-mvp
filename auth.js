// auth.js - 本地存储完整版（超级稳定，包含所有功能）

const DB_KEY_USERS = 'chainGuard_users';
const DB_KEY_SESSION = 'chainGuard_session';

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupModalEvents();
});

// ============================
// 注册功能
// ============================
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPass').value.trim();
    const msgBox = document.getElementById('regMsg');

    if (!username || !password) {
        showMsg(msgBox, '用户名和密码不能为空', 'error');
        return;
    }

    let users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');

    if (users[username]) {
        showMsg(msgBox, '该用户名已被注册', 'error');
        return;
    }

    users[username] = {
        password: password,
        isVip: false,
        vipUntil: null,
        regDate: new Date().toISOString()
    };
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));

    showMsg(msgBox, '注册成功！请登录', 'success');
    setTimeout(() => {
        switchAuthTab('login');
        document.getElementById('loginUser').value = username;
        msgBox.textContent = '';
    }, 1500);
}

// ============================
// 登录功能
// ============================
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();
    const msgBox = document.getElementById('loginMsg');

    let users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');
    const user = users[username];

    if (!user || user.password !== password) {
        showMsg(msgBox, '用户名或密码错误', 'error');
        return;
    }

    localStorage.setItem(DB_KEY_SESSION, username);
    showMsg(msgBox, '登录成功！', 'success');

    setTimeout(() => {
        closeAuthModal();
        checkLoginStatus();
        if (typeof updateVipDisplay === 'function') updateVipDisplay();
    }, 1000);
}

// ============================
// 退出登录
// ============================
function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem(DB_KEY_SESSION);
        checkLoginStatus();
        if (typeof updateVipDisplay === 'function') updateVipDisplay();
        location.reload();
    }
}

// ============================
// 检查是否为VIP
// ============================
function isVip() {
    const username = localStorage.getItem(DB_KEY_SESSION);
    if (!username) return false;

    const users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');
    const user = users[username];
    if (!user || !user.isVip) return false;

    if (!user.vipUntil) return true;
    return new Date(user.vipUntil) > new Date();
}

// ============================
// 更新导航栏登录状态
// ============================
function checkLoginStatus() {
    const username = localStorage.getItem(DB_KEY_SESSION);
    const navActions = document.querySelector('.nav-actions');

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
        navActions.innerHTML = `<button class="btn-login" onclick="openAuthModal()">登录 / 注册</button>`;
    }

    if (typeof updateVipDisplay === 'function') updateVipDisplay();
}

// ============================
// VIP显示控制（插件下载 + 桌面下载区）
// ============================
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

// ============================
// 升级VIP弹窗（爱发电 + PayPal年费）
// ============================
function showUpgradeModal() {
    const modalHtml = `
        <div id="upgradeModal" class="modal-overlay" style="display:flex;">
            <div class="modal-content vip-modal-scroll">
                <button class="modal-close" onclick="document.getElementById('upgradeModal').remove()">×</button>
                <h3 style="text-align:center; margin-bottom:20px; color:#fff;">升级 VIP 会员</h3>
                <p style="text-align:center; color:#ccc; margin-bottom:30px;">
                    解锁 MiviChain Pro VIP 专属功能 + 实时保护工具
                </p>

                <div class="vip-scroll-container">
                    <!-- 国内爱发电 -->
                    <div class="vip-plans">
                        <div class="vip-card">
                            <div class="flag">🇨🇳 国内用户</div>
                            <h4>月度VIP ¥29 / 月</h4>
                            <p style="color:#94a3b8;">支付宝 · 微信支付</p>
                            <button class="btn-full" onclick="window.open('你的爱发电月费链接', '_blank')">
                                去爱发电开通
                            </button>
                        </div>

                        <div class="vip-card recommended">
                            <div class="flag">🇨🇳 国内用户</div>
                            <div class="badge">最划算</div>
                            <h4>年度VIP ¥199 / 年</h4>
                            <p style="color:#94a3b8;">支付宝 · 微信支付</p>
                            <button class="btn-full" onclick="window.open('你的爱发电年费链接', '_blank')">
                                去爱发电开通
                            </button>
                        </div>
                    </div>

                    <!-- 国外PayPal年费 -->
                    <div class="vip-plans" style="margin-top:40px;">
                        <div class="vip-card recommended">
                            <div class="flag">🌍 国际用户</div>
                            <div class="badge">年度专享</div>
                            <h4>Yearly VIP $49.99 / 年</h4>
                            <p style="color:#94a3b8;">PayPal 支付</p>
                            <button class="btn-full" onclick="window.open('你的PayPal支付链接', '_blank')">
                                Pay with PayPal
                            </button>
                        </div>
                    </div>

                    <p style="text-align:center; color:#94a3b8; font-size:0.9rem; margin:40px 0 20px;">
                        支付成功后，请提供订单号 + 您的网站用户名<br>
                        我会手动为您开通VIP并发送桌面版实时保护工具下载链接～
                    </p>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// ============================
// 辅助函数
// ============================
function showMsg(element, text, type) {
    element.textContent = text;
    element.className = `auth-msg ${type}`;
}

function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    document.querySelectorAll('.auth-input').forEach(input => input.value = '');
    document.querySelectorAll('.auth-msg').forEach(msg => msg.textContent = '');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(`form-${tab}`).classList.add('active');
}

function setupModalEvents() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAuthModal();
        });
    }
}

// ============================
// 开发者手动开VIP（仅本地或Vercel预览用）
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
        if (typeof updateVipDisplay === 'function') updateVipDisplay();
    };
}
