// auth.js - localStorage 本地存储版（最终稳定）

const DB_KEY_USERS = 'chainGuard_users';
const DB_KEY_SESSION = 'chainGuard_session';

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupModalEvents();
});

/* ================= 注册 ================= */
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPass').value.trim();
    const msgBox = document.getElementById('regMsg');

    if (!username || !password) {
        showMsg(msgBox, '用户名和密码不能为空', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');
    if (users[username]) {
        showMsg(msgBox, '该用户名已被注册', 'error');
        return;
    }

    users[username] = {
        password,
        isVip: false,
        vipUntil: null,
        regDate: new Date().toISOString()
    };

    localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
    showMsg(msgBox, '注册成功，请登录', 'success');

    setTimeout(() => {
        switchAuthTab('login');
        document.getElementById('loginUser').value = username;
        msgBox.textContent = '';
    }, 1200);
}

/* ================= 登录 ================= */
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();
    const msgBox = document.getElementById('loginMsg');

    const users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');
    if (!users[username] || users[username].password !== password) {
        showMsg(msgBox, '用户名或密码错误', 'error');
        return;
    }

    localStorage.setItem(DB_KEY_SESSION, username);
    showMsg(msgBox, '登录成功', 'success');

    setTimeout(() => {
        closeAuthModal();
        checkLoginStatus();
        updateVipDisplay();
    }, 800);
}

/* ================= 退出 ================= */
function logout() {
    if (!confirm('确定退出登录？')) return;
    localStorage.removeItem(DB_KEY_SESSION);
    location.reload();
}

/* ================= VIP 判断（仅用于 UI 显示） ================= */
function isVip() {
    const username = localStorage.getItem(DB_KEY_SESSION);
    if (!username) return false;

    const users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');
    const user = users[username];
    if (!user || !user.isVip) return false;

    if (!user.vipUntil) return true;
    return new Date(user.vipUntil) > new Date();
}

/* ================= UI 状态 ================= */
function checkLoginStatus() {
    const username = localStorage.getItem(DB_KEY_SESSION);
    const nav = document.querySelector('.nav-actions');

    if (!username) {
        nav.innerHTML = `<button class="btn-login" onclick="openAuthModal()">登录 / 注册</button>`;
        updateVipDisplay();
        return;
    }

    nav.innerHTML = `
        <div class="user-profile">
            <span>
              <i class="fa-solid fa-user-astronaut"></i>
              ${username}
              ${isVip() ? '<span style="color:#10b981;margin-left:6px;">✨ VIP</span>' : ''}
            </span>
            ${!isVip() ? '<button class="btn-upgrade" onclick="showUpgradeModal()">升级 VIP</button>' : ''}
            <button class="btn-logout" onclick="logout()">退出</button>
        </div>
    `;

    updateVipDisplay();
}

/* ================= VIP 下载按钮显示 ================= */
function updateVipDisplay() {
    const btn = document.getElementById('proDownloadBtn');
    if (!btn) return;
    btn.style.display = isVip() ? 'inline-block' : 'none';
}

/* ================= 下载桌面版（最终正确版） ================= */
function downloadDesktopApp() {
    const username = localStorage.getItem(DB_KEY_SESSION);

    // ① 未登录 → 要求登录
    if (!username) {
        alert('请先登录账号');
        openAuthModal();
        return;
    }

    // ② 不在前端判断 VIP，直接交给后端
    // ③ 浏览器跳转，支持 302 → GitHub Release
    window.location.href = '/api/download';
}

/* ================= 弹窗控制 ================= */
function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    document.querySelectorAll('.auth-input').forEach(i => i.value = '');
    document.querySelectorAll('.auth-msg').forEach(m => m.textContent = '');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById(`form-${tab}`).classList.add('active');
}

function setupModalEvents() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeAuthModal();
        });
    }
}

/* ================= 开发者后门（测试用） ================= */
if (location.hostname.includes('vercel.app') || location.hostname === 'localhost') {
    window.devVip = function (username) {
        const users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');
        if (!users[username]) return alert('用户不存在');
        users[username].isVip = true;
        users[username].vipUntil = '2099-12-31';
        localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
        alert(`${username} 已设置为 VIP`);
        checkLoginStatus();
    };
}

/* ================= 工具 ================= */
function showMsg(el, text, type) {
    el.textContent = text;
    el.className = `auth-msg ${type}`;
}
