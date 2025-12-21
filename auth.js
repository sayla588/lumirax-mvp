// auth.js - 完整版：登录、注册、VIP升级（爱发电支付 + 滚动弹窗）

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupModalEvents();
});

const DB_KEY_USERS = 'chainGuard_users';
const DB_KEY_SESSION = 'chainGuard_session';

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
    showMsg(msgBox, '登录成功！手机和电脑需分别注册登录一次哦～', 'success');

    setTimeout(() => {
    closeAuthModal();
    location.reload(); // 强制刷新页面，保证状态更新
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
// 检查是否为有效VIP
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
// 更新导航栏
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
// 升级VIP弹窗（带内部滚动条）
// ============================
function showUpgradeModal() {
    const modalHtml = `
        <div id="upgradeModal" class="modal-overlay" style="display:flex;">
            <div class="modal-content vip-modal-scroll">
                <button class="modal-close" onclick="document.getElementById('upgradeModal').remove()">×</button>
                <h3 style="text-align:center; margin-bottom:20px; color:#fff;">升级 VIP 会员</h3>
                <p style="text-align:center; color:#ccc; margin-bottom:30px;">
                    解锁 MiviChain Pro 浏览器插件下载 + 高级工具 + 无广告体验
                </p>

                <!-- 内部可滚动区域 -->
                <div class="vip-scroll-container">

                    <div class="vip-plans">
                        <!-- 中国用户：爱发电 -->
                        <div class="vip-card">
                            <div class="flag">🇨🇳 中国用户</div>
                            <h4>月会员 ¥29 / 月</h4>
                            <p style="color:#94a3b8; margin:10px 0;">支付宝 · 微信支付</p>
                            <button class="btn-full" onclick="window.open('https://ifdian.net/order/create?plan_id=2fda6108d9a211f0ac165254001e7c00&product_type=0&remark=&affiliate_code=&fr=afcom', '_blank')">
                                去爱发电开通
                            </button>
                        </div>

                        <div class="vip-card recommended">
                            <div class="flag">🇨🇳 中国用户</div>
                            <div class="badge">最划算</div>
                            <h4>年会员 ¥17 / 月（建议一次付12个月 ≈ ¥204）</h4>
                            <p style="color:#94a3b8; margin:10px 0;">支付宝 · 微信支付（相当于199元超值年费）</p>
                            <button class="btn-full" onclick="window.open('https://ifdian.net/order/create?plan_id=1d776c8ad9a311f0b58952540025c377&product_type=0&remark=&affiliate_code=&fr=afcom', '_blank')">
                                去爱发电开通
                            </button>
                        </div>
                    </div>

                    <div class="vip-plans" style="margin-top:40px;">
                        <!-- 国际用户：预留 -->
                        <div class="vip-card">
                            <div class="flag">🌍 国际用户</div>
                            <h4>Monthly VIP $4.99 / month</h4>
                            <p style="color:#94a3b8; margin:10px 0;">Credit Card · PayPal · Apple/Google Pay</p>
                            <button class="btn-full" onclick="alert('国际支付功能即将上线，敬请期待！')">
                                即将开通
                            </button>
                        </div>

                        <div class="vip-card recommended">
                            <div class="flag">🌍 国际用户</div>
                            <div class="badge">Best Value</div>
                            <h4>Yearly VIP $49.99 / year</h4>
                            <p style="color:#94a3b8; margin:10px 0;">Credit Card · PayPal（Save 16%）</p>
                            <button class="btn-full" onclick="alert('国际支付功能即将上线，敬请期待！')">
                                即将开通
                            </button>
                        </div>
                    </div>

                    <p style="text-align:center; color:#94a3b8; font-size:0.9rem; margin:30px 0 20px;">
                        支付成功后，请在留言或邮件中提供你的网站用户名，我会手动为你开通 VIP～
                    </p>

                </div>
                <!-- 滚动区域结束 -->
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
// 开发者后门（仅本地或Vercel预览生效）
// ============================
if (window.location.hostname === 'localhost' || window.location.hostname.includes('vercel.app')) {
    window.devVip = function(username) {
        let users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '{}');
        if (!users[username]) {
            alert('用户不存在，先注册一个吧！');
            return;
        }
        users[username].isVip = true;
        users[username].vipUntil = '2099-12-31';
        localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
        alert(`${username} 已强制升级为永久 VIP！刷新页面生效～`);
        checkLoginStatus();
        if (typeof updateVipDisplay === 'function') updateVipDisplay();
    };
}

// ============================
// 全局暴露VIP检查供index.html使用
// ============================
window.isVip = isVip;
window.updateVipDisplay = function() {
    const downloadBtn = document.getElementById('proDownloadBtn');
    if (!downloadBtn) return;

    if (isVip()) {
        downloadBtn.style.display = 'inline-block';
        downloadBtn.onclick = null;
    } else {
        downloadBtn.style.display = 'none';
        downloadBtn.onclick = (e) => {
            e.preventDefault();
            alert('此插件仅限 VIP 会员下载，请先升级会员！');
            showUpgradeModal();
        };
    }
};

// 多语言手动优化（配合Google Translate）
function updateLanguageDisplay() {
    const selectedLang = document.querySelector('.goog-te-combo')?.value || 'zh-CN';
    let lang = 'zh';
    if (selectedLang.includes('en')) lang = 'en';
    else if (selectedLang.includes('ja')) lang = 'ja';
    else if (selectedLang.includes('ko')) lang = 'ko';

    document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = 'none';
        if (el.getAttribute('data-lang') === lang) {
            el.style.display = '';
        }
    });
}

// Google Translate加载后自动执行
document.addEventListener('DOMContentLoaded', () => {
    const checkTranslate = setInterval(() => {
        if (document.querySelector('.goog-te-combo')) {
            updateLanguageDisplay();
            document.querySelector('.goog-te-combo').addEventListener('change', updateLanguageDisplay);
            clearInterval(checkTranslate);
        }
    }, 500);
});

// 手机端特殊修复：页面加载后强制刷新登录状态
window.addEventListener('load', () => {
    setTimeout(() => {
        checkLoginStatus();
        if (typeof updateVipDisplay === 'function') updateVipDisplay();
    }, 1000); // 延迟1秒，确保页面完全加载
});

// 页面可见时也刷新（从后台切换回来）
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        checkLoginStatus();
        if (typeof updateVipDisplay === 'function') updateVipDisplay();
    }
});
