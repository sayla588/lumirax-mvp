// auth.js - 真实支付会员系统（支持支付宝、微信、PayPal、Google Pay 等）

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupModalEvents();
});

const DB_KEY_USERS = 'chainGuard_users';
const DB_KEY_SESSION = 'chainGuard_session';

// Stripe Publishable Key（替换成你自己的！）
const STRIPE_PK = 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX'; // 测试键，或换成 live 键

let stripe = null;
if (typeof Stripe !== 'undefined') {
    stripe = Stripe(STRIPE_PK);
}

// ============================
// 注册（普通用户）
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
        vipUntil: null, // ISO 字符串或 null
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

// 登录
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
        if (typeof updateVipDisplay === 'function') updateVipDisplay(); // 主页按钮更新
    }, 1000);
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem(DB_KEY_SESSION);
        checkLoginStatus();
        if (typeof updateVipDisplay === 'function') updateVipDisplay();
        window.location.reload();
    }
}

// 检查是否为有效 VIP
function isVip() {
    const username = localStorage.getItem(DB_KEY_SESSION);
    if (!username) return false;

    const users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');
    const user = users[username];
    if (!user || !user.isVip) return false;

    if (!user.vipUntil) return true;
    return new Date(user.vipUntil) > new Date();
}

// 更新导航栏
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

    // 触发主页下载按钮更新（如果存在）
    if (typeof updateVipDisplay === 'function') updateVipDisplay();
}

// 显示升级会员弹窗（真实支付）
function showUpgradeModal() {
    const modalHtml = `
        <div id="upgradeModal" class="modal-overlay" style="display:flex;">
            <div class="modal-content" style="max-width:600px; width:90%;">
                <button class="modal-close" onclick="document.getElementById('upgradeModal').remove()">×</button>
                <h3 style="text-align:center; margin-bottom:20px; color:#fff;">升级 VIP 会员</h3>
                <div class="vip-plans">
                    <div class="vip-card" data-plan="month">
                        <h4>月会员</h4>
                        <div class="price">¥29<span>/月</span></div>
                        <ul>
                            <li>✓ 下载 MiviChain Pro 插件</li>
                            <li>✓ 优先工具访问</li>
                            <li>✓ 无广告体验</li>
                        </ul>
                        <button class="btn-full" onclick="createCheckout('month')">立即支付</button>
                    </div>
                    <div class="vip-card recommended" data-plan="year">
                        <div class="badge">最划算</div>
                        <h4>年会员</h4>
                        <div class="price">¥199<span>/年</span></div>
                        <p style="font-size:0.9rem; color:#10b981;">相当于每月 ¥16.6，省 ¥149！</p>
                        <ul>
                            <li>✓ 所有月会员权益</li>
                            <li>✓ 一年有效期</li>
                            <li>✓ 专属徽章</li>
                        </ul>
                        <button class="btn-full" onclick="createCheckout('year')">立即支付</button>
                    </div>
                </div>
                <p style="text-align:center; color:#94a3b8; font-size:0.85rem; margin-top:20px;">
                    支持支付宝、微信、PayPal、Google Pay、Apple Pay、信用卡等
                </p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// 创建 Stripe Checkout 会话
async function createCheckout(plan) {
    const username = localStorage.getItem(DB_KEY_SESSION);
    if (!username) {
        alert('请先登录');
        return;
    }

    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '跳转中...';

    try {
        const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan, username })
        });

        const data = await res.json();

        if (!data.sessionId) {
            throw new Error(data.error || '创建支付失败');
        }

        // 跳转到 Stripe Checkout
        const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });

        if (result.error) {
            alert(result.error.message);
        }
    } catch (err) {
        console.error(err);
        alert('支付发起失败：' + err.message);
        btn.disabled = false;
        btn.textContent = '立即支付';
    }
}

// 其他 UI 函数保持不变
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

// 全局暴露 VIP 检查函数供 index.html 使用
window.isVip = isVip;
window.updateVipDisplay = function() {
    const downloadBtn = document.getElementById('proDownloadBtn');
    if (!downloadBtn) return;

    if (isVip()) {
        downloadBtn.style.display = 'inline-block';
        downloadBtn.onclick = null; // 移除提示
    } else {
        downloadBtn.style.display = 'none';
        downloadBtn.onclick = (e) => {
            e.preventDefault();
            alert('此插件仅限 VIP 会员下载，请先升级会员！');
            showUpgradeModal();
        };
    }
};
