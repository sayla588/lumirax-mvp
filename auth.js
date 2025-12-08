// auth.js - 处理登录、注册和状态保持

// 1. 初始化：页面加载时检查是否已登录
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupModalEvents();
});

// 模拟数据库键名
const DB_KEY_USERS = 'chainGuard_users'; // 存储所有用户数据
const DB_KEY_SESSION = 'chainGuard_session'; // 存储当前登录用户

// ============================
// 核心逻辑功能
// ============================

// 注册功能
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPass').value.trim();
    const msgBox = document.getElementById('regMsg');

    if (!username || !password) {
        showMsg(msgBox, '用户名和密码不能为空', 'error');
        return;
    }

    // 获取现有用户列表
    let users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');

    // 检查用户是否已存在
    if (users[username]) {
        showMsg(msgBox, '该用户名已被注册', 'error');
        return;
    }

    // 保存新用户
    users[username] = {
        password: password, // 实际项目中这里应该存哈希值
        regDate: new Date().toISOString()
    };
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));

    showMsg(msgBox, '注册成功！请切换到登录页', 'success');
    
    // 1.5秒后自动切换到登录Tab
    setTimeout(() => {
        switchAuthTab('login');
        document.getElementById('loginUser').value = username;
        msgBox.textContent = '';
    }, 1500);
}

// 登录功能
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();
    const msgBox = document.getElementById('loginMsg');

    // 获取用户数据库
    let users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');

    // 验证逻辑
    if (!users[username]) {
        showMsg(msgBox, '用户不存在，请先注册', 'error');
        return;
    }

    if (users[username].password !== password) {
        showMsg(msgBox, '密码错误', 'error');
        return;
    }

    // 登录成功：保存会话
    localStorage.setItem(DB_KEY_SESSION, username);
    showMsg(msgBox, '登录成功！正在跳转...', 'success');

    // 关闭模态框并更新UI
    setTimeout(() => {
        closeAuthModal();
        checkLoginStatus();
    }, 1000);
}

// 退出登录
function logout() {
    if(confirm('确定要退出登录吗？')) {
        localStorage.removeItem(DB_KEY_SESSION);
        checkLoginStatus(); // 刷新UI状态
        window.location.reload(); // 刷新页面以重置所有状态
    }
}

// ============================
// UI 更新与交互逻辑
// ============================

// 检查登录状态并更新导航栏
function checkLoginStatus() {
    const currentUser = localStorage.getItem(DB_KEY_SESSION);
    const navActions = document.querySelector('.nav-actions');

    if (currentUser) {
        // 已登录状态
        navActions.innerHTML = `
            <div class="user-profile">
                <span><i class="fa-solid fa-user-astronaut"></i> ${currentUser}</span>
                <button class="btn-logout" onclick="logout()">退出</button>
            </div>
        `;
    } else {
        // 未登录状态
        navActions.innerHTML = `
            <button class="btn-login" onclick="openAuthModal()">登录 / 注册</button>
        `;
    }
}

// 辅助函数：显示消息
function showMsg(element, text, type) {
    element.textContent = text;
    element.className = `auth-msg ${type}`;
}

// 模态框操作
function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    // 清空输入框
    document.querySelectorAll('.auth-input').forEach(input => input.value = '');
    document.querySelectorAll('.auth-msg').forEach(msg => msg.textContent = '');
}

function switchAuthTab(tab) {
    // 切换 Tab 样式
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    // 切换 Form 显示
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(`form-${tab}`).classList.add('active');
}

// 绑定点击事件（防止HTML中onclick过多）
function setupModalEvents() {
    // 点击遮罩层关闭
    const modal = document.getElementById('authModal');
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAuthModal();
        });
    }
}
