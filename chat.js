/* =========================================
   第一部分：基础聊天功能 (Chat UI)
   ========================================= */
const chatbox = document.getElementById("chatbox");
const inputBox = document.getElementById("inputBox");
const sendBtn = document.getElementById("sendBtn");

// 自动调整输入框高度
if (inputBox) {
    inputBox.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.scrollHeight > 120) {
            this.style.overflowY = 'auto';
        } else {
            this.style.overflowY = 'hidden';
        }
    });
}

function resetInputHeight() {
    if (inputBox) {
        inputBox.style.height = 'auto';
        inputBox.style.overflowY = 'hidden';
    }
}

function addMessage(type, text) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message");
    
    if (type === "你") {
        messageWrapper.classList.add("user-message");
    } else if (type === "system") {
        messageWrapper.classList.add("system-message");
    } else {
        messageWrapper.classList.add("ai-message");
    }

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.textContent = text;

    messageWrapper.appendChild(bubble);
    chatbox.appendChild(messageWrapper);
    
    // 滚动到底部
    chatbox.scrollTo({
        top: chatbox.scrollHeight,
        behavior: 'smooth'
    });
}

async function send() {
    const message = inputBox.value.trim();
    if (!message) return;

    addMessage("你", message);
    inputBox.value = "";
    resetInputHeight();
    inputBox.disabled = true;
    sendBtn.disabled = true;

    try {
        const r = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await r.json();
        
        if (r.status !== 200) {
            addMessage("system", data.error || data.reply || "发生错误");
        } else {
            addMessage("AI", data.reply);
        }
    } catch (err) {
        addMessage("system", "网络请求失败，请检查连接");
        console.error(err);
    } finally {
        inputBox.disabled = false;
        sendBtn.disabled = false;
        inputBox.focus();
    }
}

// 绑定发送事件
if (sendBtn) sendBtn.onclick = send;
if (inputBox) {
    inputBox.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    });
}

/* =========================================
   第二部分：LumiraX 平台导航与扫描逻辑
   ========================================= */

// 1. 侧边栏导航切换
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 如果按钮被禁用，不执行
        if (btn.hasAttribute('disabled')) return;

        // 移除所有激活状态
        navBtns.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        // 激活当前按钮
        btn.classList.add('active');

        // 显示对应的视图
        const targetId = btn.getAttribute('data-target');
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add('active');
        }
    });
});

// 2. 智能合约扫描逻辑
const scanBtn = document.getElementById('scanBtn');
const scanResult = document.getElementById('scanResult');
const scanPlaceholder = document.getElementById('scanPlaceholder');
const contractInput = document.getElementById('contractInput');

if(scanBtn) {
    scanBtn.addEventListener('click', async () => {
        const address = contractInput.value.trim();
        const chainSelect = document.getElementById('chainSelect');
        const chain = chainSelect ? chainSelect.value : 'base'; // 默认 fallback 到 base

        if (!address) {
            alert("请输入合约地址");
            return;
        }

        // UI 变为加载状态
        const originalBtnText = scanBtn.innerHTML; // 保存原始按钮内容
        scanBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> 扫描中...`;
        scanBtn.disabled = true;
        
        // 隐藏之前的结果
        if (scanPlaceholder) scanPlaceholder.classList.add('hidden');
        if (scanResult) scanResult.classList.add('hidden');

        try {
            // 调用 API
            const r = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chain, address })
            });
            
            const resp = await r.json();

            if (r.status !== 200) {
                alert(resp.error || "扫描失败");
                if (scanPlaceholder) scanPlaceholder.classList.remove('hidden'); // 出错显示回占位符
            } else {
                // 渲染数据
                updateScanUI(resp.data);
                if (scanResult) scanResult.classList.remove('hidden');
            }

        } catch (err) {
            console.error(err);
            alert("网络请求失败");
            if (scanPlaceholder) scanPlaceholder.classList.remove('hidden');
        } finally {
            scanBtn.innerHTML = "开始扫描"; // 或者恢复 originalBtnText
            scanBtn.disabled = false;
        }
    });
}

// 辅助函数：更新 UI
function updateScanUI(data) {
    // 1. 更新分数圆环
    const scoreCircle = document.querySelector('.score-circle');
    const scoreNumber = document.querySelector('.score-number');
    
    if (scoreCircle && scoreNumber) {
        scoreCircle.style.setProperty('--score', data.score);
        scoreNumber.textContent = data.score;
        
        // 颜色变化逻辑
        const color = data.score >= 80 ? '#10b981' : (data.score >= 50 ? '#f59e0b' : '#ef4444');
        scoreNumber.style.color = color; // 直接设置数字颜色
        
        // 可选：如果你想让圆环进度条颜色也变，需要在 CSS 里把 conic-gradient 的颜色改成 var(--score-color)
        // 这里我们简单处理，让文字变色即可
    }

    // 2. 更新代币信息
    const tokenTitle = document.querySelector('.token-info h3');
    const tokenDesc = document.querySelector('.token-info p');
    if (tokenTitle) tokenTitle.textContent = `${data.name} (${data.symbol})`;
    if (tokenDesc) tokenDesc.textContent = data.details;

    // 3. 更新风险列表
    const grid = document.querySelector('.risk-grid');
    if (grid) {
        grid.innerHTML = ''; // 清空旧数据
        
        data.risks.forEach(risk => {
            const div = document.createElement('div');
            div.className = `risk-item ${risk.type}`;
            
            let icon = 'ri-question-line';
            if (risk.type === 'danger') icon = 'ri-alarm-warning-line';
            if (risk.type === 'warning') icon = 'ri-error-warning-line';
            if (risk.type === 'success') icon = 'ri-check-double-line';

            div.innerHTML = `<i class="${icon}"></i><span>${risk.text}</span>`;
            grid.appendChild(div);
        });
    }

    // 4. 更新底部报告文字
    const reportText = document.querySelector('.detail-box p');
    if(reportText) {
        const isRisky = data.risks.some(r => r.type === 'danger');
        reportText.textContent = `基于 GoPlus 检测结果：该代币安全分为 ${data.score}。${isRisky ? '⚠️ 存在高风险项，请极度谨慎！' : '✅ 核心指标检测通过，但仍需注意市场风险。'}`;
    }
}

// 页面加载完成时
window.onload = () => {
    if (inputBox) inputBox.focus();
};

/* =========================================
   新增：项目真伪验证逻辑 (Verify Module)
   ========================================= */

const verifyBtn = document.getElementById('verifyBtn');
const verifyResult = document.getElementById('verifyResult');
const verifyPlaceholder = document.getElementById('verifyPlaceholder');
const verifyInput = document.getElementById('verifyInput');

if(verifyBtn) {
    verifyBtn.addEventListener('click', async () => {
        const address = verifyInput.value.trim();

        if (!address) {
            alert("请输入代币地址");
            return;
        }

        // UI 加载状态
        verifyBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> 分析中...`;
        verifyBtn.disabled = true;
        verifyPlaceholder.classList.add('hidden');
        verifyResult.classList.add('hidden');

        try {
            const r = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address })
            });
            
            const resp = await r.json();

            if (r.status !== 200) {
                alert(resp.error || "验证失败");
                verifyPlaceholder.classList.remove('hidden');
            } else {
                updateVerifyUI(resp.data);
                verifyResult.classList.remove('hidden');
            }

        } catch (err) {
            console.error(err);
            alert("网络请求失败");
            verifyPlaceholder.classList.remove('hidden');
        } finally {
            verifyBtn.innerHTML = "启动验证";
            verifyBtn.disabled = false;
        }
    });
}

function updateVerifyUI(data) {
    // 1. 基础信息
    document.getElementById('pName').textContent = `${data.name} (${data.symbol})`;
    document.getElementById('pPrice').textContent = data.price;
    document.getElementById('pLiquidity').textContent = data.liquidity;
    document.getElementById('pVolume').textContent = data.volume;
    
    // 涨跌幅颜色
    const pChange = document.getElementById('pChange');
    pChange.textContent = (parseFloat(data.change) > 0 ? '+' : '') + data.change;
    pChange.style.color = parseFloat(data.change) >= 0 ? '#10b981' : '#ef4444';

    // Logo 处理
    const logoDiv = document.getElementById('pLogo');
    if (data.logo) {
        logoDiv.innerHTML = `<img src="${data.logo}" alt="logo">`;
    } else {
        logoDiv.innerHTML = data.symbol[0];
    }

    // 2. 可信度徽章
    const trustBadge = document.getElementById('trustScore');
    const trustValue = trustBadge.querySelector('.value');
    trustValue.textContent = data.trustScoreText;
    
    // 重置颜色类
    trustBadge.classList.remove('high', 'medium', 'low');
    if (data.trustLevel === 'HIGH') trustBadge.classList.add('high');
    else if (data.trustLevel === 'MEDIUM') trustBadge.classList.add('medium');
    else trustBadge.classList.add('low');

    // 3. 社交链接渲染
    const linksContainer = document.getElementById('socialLinks');
    linksContainer.innerHTML = ''; // 清空

    // 合并 websites 和 socials
    const allLinks = [...data.websites, ...data.socials];

    if (allLinks.length === 0) {
        linksContainer.innerHTML = `<span style="color:var(--text-light);font-size:0.9rem;">🚫 未检测到官方链接 (高危信号)</span>`;
    } else {
        allLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = "_blank";
            a.className = "social-tag";
            
            // 简单的图标映射
            let icon = "ri-link";
            if(link.type === 'twitter') icon = "ri-twitter-x-line";
            if(link.type === 'telegram') icon = "ri-telegram-line";
            if(link.type === 'discord') icon = "ri-discord-line";
            if(link.label === 'Website') icon = "ri-global-line";

            a.innerHTML = `<i class="${icon}"></i> ${link.label || link.type}`;
            linksContainer.appendChild(a);
        });
    }
}

/* =========================================
   新增：钱包安全扫描逻辑 (Wallet Module)
   ========================================= */

const walletBtn = document.getElementById('walletBtn');
const walletResult = document.getElementById('walletResult');
const walletPlaceholder = document.getElementById('walletPlaceholder');
const walletInput = document.getElementById('walletInput');

if(walletBtn) {
    walletBtn.addEventListener('click', async () => {
        const address = walletInput.value.trim();

        if (!address) {
            alert("请输入钱包地址");
            return;
        }

        // UI 加载状态
        walletBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> 检测中...`;
        walletBtn.disabled = true;
        walletPlaceholder.classList.add('hidden');
        walletResult.classList.add('hidden');

        try {
            const r = await fetch("/api/wallet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address })
            });
            
            const resp = await r.json();

            if (r.status !== 200) {
                alert(resp.error || "检测失败");
                walletPlaceholder.classList.remove('hidden');
            } else {
                updateWalletUI(resp.data);
                walletResult.classList.remove('hidden');
            }

        } catch (err) {
            console.error(err);
            alert("网络请求失败");
            walletPlaceholder.classList.remove('hidden');
        } finally {
            walletBtn.innerHTML = "深度检测";
            walletBtn.disabled = false;
        }
    });
}

function updateWalletUI(data) {
    const card = document.getElementById('walletStatusCard');
    const icon = document.getElementById('wStatusIcon');
    const title = document.getElementById('wRiskLevel');
    const desc = document.getElementById('wRiskDesc');

    // 重置样式
    card.classList.remove('safe', 'warning', 'danger');

    // 1. 设置主卡片状态
    if (data.riskLevel === 'CRITICAL') {
        card.classList.add('danger');
        icon.className = 'ri-alarm-warning-fill';
        title.textContent = '极度危险 (CRITICAL)';
        desc.textContent = '警告：该地址涉及严重的链上恶意活动！';
    } else if (data.riskLevel === 'WARNING') {
        card.classList.add('warning');
        icon.className = 'ri-error-warning-fill';
        title.textContent = '存在风险 (WARNING)';
        desc.textContent = '检测到可疑行为或混币器交互，请谨慎。';
    } else {
        card.classList.add('safe');
        icon.className = 'ri-shield-check-fill';
        title.textContent = '状态良好 (SAFE)';
        desc.textContent = '在已知的恶意数据库中未找到该地址的记录。';
    }

    // 2. 更新下方的小项检测
    updateRiskItem('chkPhishing', data.details.phishing_activities, '网络钓鱼');
    updateRiskItem('chkBlacklist', data.details.blackmail_activities, '黑名单/勒索'); // 这里 GoPlus 字段比较多，暂用 blackmail 代替黑名单演示
    updateRiskItem('chkStealing', data.details.stealing_attack, '盗窃/黑客');
    updateRiskItem('chkMixer', data.details.mixer, '混币器(Tornado等)');
}

function updateRiskItem(elementId, isRisk, labelText) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (isRisk === "1") {
        // 有风险
        el.className = 'risk-item danger';
        el.innerHTML = `<i class="ri-close-circle-fill"></i> <span>${labelText}: <strong>检出</strong></span>`;
    } else {
        // 无风险
        el.className = 'risk-item success'; // 复用之前的 success 样式
        el.innerHTML = `<i class="ri-checkbox-circle-line"></i> <span>${labelText}: 未检出</span>`;
    }
}
