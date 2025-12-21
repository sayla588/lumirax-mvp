// auth.js - Supabase后端完整版（已自动绕过邮箱确认）

// ==== 替换成你的Supabase信息 ====
const SUPABASE_URL = 'https://xsyezbzazewcdpsjmqhc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__j0AlWci5myphWou32Re_w_7jeFlI69';
// =================================

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupModalEvents();
});

// ============================
// 注册（自动绕过邮箱确认问题）
// ============================
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPass').value.trim();
    const msgBox = document.getElementById('regMsg');

    if (!username || !password) {
        showMsg(msgBox, '用户名和密码不能为空', 'error');
        return;
    }

    // 使用假邮箱注册
    const { data, error } = await supabaseClient.auth.signUp({
        email: `${username}@mivichain.fake`, // 假邮箱
        password: password
    });

    if (error) {
        if (error.message.includes('duplicate') || error.message.includes('already registered')) {
            showMsg(msgBox, '用户名已存在，直接登录', 'success');
            setTimeout(() => {
                switchAuthTab('login');
                document.getElementById('loginUser').value = username;
            }, 1500);
            return;
        }
        showMsg(msgBox, '注册失败：' + error.message, 'error');
        return;
    }

    // 新用户注册成功，插入users表
    const { error: dbError } = await supabaseClient
        .from('users')
        .insert({
            id: data.user.id,
            username: username,
            is_vip: false,
            vip_until: null
        });

    if (dbError) {
        showMsg(msgBox, '注册失败，请重试', 'error');
        return;
    }

    showMsg(msgBox, '注册成功！请登录', 'success');
    setTimeout(() => {
        switchAuthTab('login');
        document.getElementById('loginUser').value = username;
    }, 1500);
}

// ============================
// 登录
// ============================
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();
    const msgBox = document.getElementById('loginMsg');

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: `${username}@mivichain.fake`,
        password: password
    });

    if (error) {
        showMsg(msgBox, '用户名或密码错误', 'error');
        return;
    }

    showMsg(msgBox, '登录成功！', 'success');
    setTimeout(() => {
        closeAuthModal();
        checkLoginStatus();
    }, 1000);
}

// ============================
// 退出登录
// ============================
async function logout() {
    if (confirm('确定要退出登录吗？')) {
        await supabaseClient.auth.signOut();
        checkLoginStatus();
    }
}

// ============================
// 检查登录状态和VIP
// ============================
async function checkLoginStatus() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (user) {
        const { data: profile } = await supabaseClient
            .from('users')
            .select('username, is_vip')
            .eq('id', user.id)
            .single();

        if (profile) {
            const vip = profile.is_vip;
            navActions.innerHTML = `
                <div class="user-profile">
                    <span><i class="fa-solid fa-user-astronaut"></i> ${profile.username}
                        ${vip ? '<span style="color:#10b981; margin-left:8px;">✨ VIP</span>' : ''}
                    </span>
                    ${!vip ? '<button class="btn-upgrade" onclick="showUpgradeModal()">升级 VIP</button>' : ''}
                    <button class="btn-logout" onclick="logout()">退出</button>
                </div>
            `;
        }
    } else {
        navActions.innerHTML = `<button class="btn-login" onclick="openAuthModal()">登录 / 注册</button>`;
    }

    updateVipDisplay();
}

// ============================
// VIP下载按钮控制
// ============================
async function updateVipDisplay() {
    const downloadBtn = document.getElementById('proDownloadBtn');
    if (!downloadBtn) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        const { data } = await supabaseClient
            .from('users')
            .select('is_vip')
            .eq('id', user.id)
            .single();

        downloadBtn.style.display = data && data.is_vip ? 'inline-block' : 'none';
    } else {
        downloadBtn.style.display = 'none';
    }
}

// ============================
// 升级VIP弹窗（你的爱发电代码保持不变）
function showUpgradeModal() {
    const modalHtml = `
        <div id="upgradeModal" class="modal-overlay" style="display:flex;">
            <div class="modal-content vip-modal-scroll">
                <button class="modal-close" onclick="document.getElementById('upgradeModal').remove()">×</button>
                <h3 style="text-align:center; margin-bottom:20px; color:#fff;">升级 VIP 会员</h3>
                <p style="text-align:center; color:#ccc; margin-bottom:30px;">
                    解锁 MiviChain Pro 浏览器插件下载 + 高级工具 + 无广告体验
                </p>

                <div class="vip-scroll-container">
                    <div class="vip-plans">
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
                            <p style="color:#94a3b8; margin:10px 0;">支付宝 · 微信支付</p>
                            <button class="btn-full" onclick="window.open('https://ifdian.net/order/create?plan_id=1d776c8ad9a311f0b58952540025c377&product_type=0&remark=&affiliate_code=&fr=afcom', '_blank')">
                                去爱发电开通
                            </button>
                        </div>
                    </div>

                    <div class="vip-plans" style="margin-top:40px;">
                        <div class="vip-card">
                            <div class="flag">🌍 国际用户</div>
                            <h4>Monthly VIP $4.99 / month</h4>
                            <p style="color:#94a3b8; margin:10px 0;">即将开通</p>
                            <button class="btn-full" onclick="alert('国际支付正在审核中，敬请期待！')">
                                即将开通
                            </button>
                        </div>

                        <div class="vip-card recommended">
                            <div class="flag">🌍 国际用户</div>
                            <div class="badge">Best Value</div>
                            <h4>Yearly VIP $49.99 / year</h4>
                            <p style="color:#94a3b8; margin:10px 0;">即将开通</p>
                            <button class="btn-full" onclick="alert('国际支付正在审核中，敬请期待！')">
                                即将开通
                            </button>
                        </div>
                    </div>

                    <p style="text-align:center; color:#94a3b8; font-size:0.9rem; margin:30px 0 20px;">
                        支付成功后，请在留言或邮件中提供你的网站用户名，我会手动为你开通 VIP～
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

// 初始化检查登录状态
checkLoginStatus();
