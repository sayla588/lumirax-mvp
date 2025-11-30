/* =========================================
   Global Navigation Logic (App Router)
   ========================================= */
const homeView = document.getElementById('home-view');
const sidebar = document.getElementById('appSidebar');
const navBtns = document.querySelectorAll('.nav-btn'); // Sidebar buttons
const navTriggers = document.querySelectorAll('.nav-trigger'); // Homepage buttons
const views = document.querySelectorAll('.view-section');
const homeTrigger = document.querySelector('.home-trigger'); // Logo in sidebar

// 函数：切换到指定视图
function switchView(targetId) {
    // 1. 处理 Sidebar 显示状态
    if (targetId === 'home-view') {
        sidebar.classList.remove('visible'); // 首页隐藏 Sidebar
    } else {
        sidebar.classList.add('visible'); // 功能页显示 Sidebar
    }

    // 2. 切换 View 显示
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');

    // 3. 更新 Sidebar 按钮激活状态
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-target') === targetId) {
            btn.classList.add('active');
        }
    });
}

// 绑定首页上的按钮 (Start Chat, Cards, etc.)
navTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // 防止冒泡 (如果卡片里有其他链接)
        // e.stopPropagation(); 
        const target = btn.getAttribute('data-target');
        switchView(target);
    });
});

// 绑定侧边栏按钮
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        switchView(target);
    });
});

// 绑定侧边栏 Logo (返回首页)
if (homeTrigger) {
    homeTrigger.addEventListener('click', () => {
        switchView('home-view');
    });
}


/* =========================================
   Feature 1: AI Chat Logic
   ========================================= */
const chatbox = document.getElementById("chatbox");
const inputBox = document.getElementById("inputBox");
const sendBtn = document.getElementById("sendBtn");

function resetInputHeight() {
    if (inputBox) {
        inputBox.style.height = 'auto';
        inputBox.style.overflowY = 'hidden';
    }
}

function addMessage(type, text) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message");
    
    if (type === "你") messageWrapper.classList.add("user-message");
    else if (type === "system") messageWrapper.classList.add("system-message");
    else messageWrapper.classList.add("ai-message");

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.textContent = text;

    messageWrapper.appendChild(bubble);
    chatbox.appendChild(messageWrapper);
    
    chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: 'smooth' });
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
        if (r.status !== 200) addMessage("system", data.error || "Error");
        else addMessage("AI", data.reply);
    } catch (err) {
        addMessage("system", "Network Error");
    } finally {
        inputBox.disabled = false;
        sendBtn.disabled = false;
        inputBox.focus();
    }
}

if (sendBtn) sendBtn.onclick = send;
if (inputBox) {
    inputBox.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });
    inputBox.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}


/* =========================================
   Feature 2: Contract Scanner
   ========================================= */
const scanBtn = document.getElementById('scanBtn');
const scanResult = document.getElementById('scanResult');
const contractInput = document.getElementById('contractInput');

if(scanBtn) {
    scanBtn.addEventListener('click', async () => {
        const address = contractInput.value.trim();
        const chain = document.getElementById('chainSelect').value;
        if (!address) return alert("Please enter address");

        scanBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Scanning...`;
        scanBtn.disabled = true;
        scanResult.classList.add('hidden');

        try {
            const r = await fetch("/api/scan", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chain, address })
            });
            const resp = await r.json();
            if (r.status === 200) {
                updateScanUI(resp.data);
                scanResult.classList.remove('hidden');
            } else {
                alert(resp.error || "Scan failed");
            }
        } catch (e) { alert("Network Error"); } 
        finally { scanBtn.innerHTML = "Scan Now"; scanBtn.disabled = false; }
    });
}

function updateScanUI(data) {
    document.querySelector('.score-circle').style.setProperty('--score', data.score);
    document.querySelector('.score-number').textContent = data.score;
    // Set color based on score
    const color = data.score > 80 ? '#10b981' : (data.score > 50 ? '#f59e0b' : '#ef4444');
    document.querySelector('.score-number').style.color = color;
    
    document.querySelector('.token-info h3').textContent = `${data.name} (${data.symbol})`;
    document.querySelector('.detail-box p').textContent = data.details;

    const grid = document.querySelector('.risk-grid');
    grid.innerHTML = '';
    data.risks.forEach(risk => {
        const div = document.createElement('div');
        div.className = `risk-item ${risk.type}`;
        div.innerHTML = `<i class="${risk.type==='danger'?'ri-alarm-warning-line':'ri-check-line'}"></i><span>${risk.text}</span>`;
        grid.appendChild(div);
    });
}


/* =========================================
   Feature 3: Wallet Scanner
   ========================================= */
const walletBtn = document.getElementById('walletBtn');
const walletResult = document.getElementById('walletResult');
const walletInput = document.getElementById('walletInput');

if(walletBtn) {
    walletBtn.addEventListener('click', async () => {
        const address = walletInput.value.trim();
        if (!address) return alert("Enter wallet address");
        
        walletBtn.innerHTML = "Checking...";
        walletBtn.disabled = true;
        walletResult.classList.add('hidden');

        try {
            const r = await fetch("/api/wallet", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address })
            });
            const resp = await r.json();
            if (r.status === 200) {
                updateWalletUI(resp.data);
                walletResult.classList.remove('hidden');
            } else alert("Failed");
        } catch (e) { alert("Network Error"); }
        finally { walletBtn.innerHTML = "Check Risk"; walletBtn.disabled = false; }
    });
}

function updateWalletUI(data) {
    const card = document.getElementById('walletStatusCard');
    const icon = document.getElementById('wStatusIcon');
    const title = document.getElementById('wRiskLevel');
    
    card.className = 'wallet-status-card'; // reset
    if (data.riskLevel === 'CRITICAL') {
        card.classList.add('danger');
        icon.className = 'ri-skull-line';
        title.textContent = 'Critical Risk';
    } else if (data.riskLevel === 'WARNING') {
        card.classList.add('warning');
        icon.className = 'ri-error-warning-line';
        title.textContent = 'Warning';
    } else {
        card.classList.add('safe');
        icon.className = 'ri-shield-check-line';
        title.textContent = 'Safe';
    }
    
    // Simple toggle for risk items (demo)
    const setItem = (id, val) => {
        const el = document.getElementById(id);
        if(val === "1") { el.className = "risk-item danger"; el.innerHTML = `<span>Detected!</span>`; }
        else { el.className = "risk-item success"; el.innerHTML = `<span>Clean</span>`; }
    };
    setItem('chkPhishing', data.details.phishing_activities);
    setItem('chkStealing', data.details.stealing_attack);
}


/* =========================================
   Feature 4: Project Verification
   ========================================= */
const verifyBtn = document.getElementById('verifyBtn');
const verifyResult = document.getElementById('verifyResult');
const verifyInput = document.getElementById('verifyInput');

if(verifyBtn) {
    verifyBtn.addEventListener('click', async () => {
        const address = verifyInput.value.trim();
        if(!address) return alert("Enter address");
        
        verifyBtn.innerHTML = "Verifying...";
        verifyBtn.disabled = true;
        verifyResult.classList.add('hidden');

        try {
            const r = await fetch("/api/verify", {
                method: "POST", headers: {"Content-Type":"application/json"},
                body: JSON.stringify({address})
            });
            const resp = await r.json();
            if(r.status === 200) {
                updateVerifyUI(resp.data);
                verifyResult.classList.remove('hidden');
            } else alert("Failed");
        } catch(e) { alert("Error"); }
        finally { verifyBtn.innerHTML = "Verify Project"; verifyBtn.disabled = false; }
    });
}

function updateVerifyUI(data) {
    document.getElementById('pName').textContent = data.symbol;
    document.getElementById('pPrice').textContent = data.price;
    document.getElementById('pLiquidity').textContent = data.liquidity;
    document.getElementById('pVolume').textContent = data.volume;
    document.getElementById('pChange').textContent = data.change + "%";
    
    const ts = document.getElementById('trustScore');
    ts.querySelector('.value').textContent = data.trustLevel;
    ts.className = `trust-badge ${data.trustLevel === 'HIGH' ? 'high' : 'low'}`;
    
    const links = document.getElementById('socialLinks');
    links.innerHTML = '';
    [...data.websites, ...data.socials].forEach(l => {
        const a = document.createElement('a');
        a.href = l.url; a.target="_blank"; a.className="social-tag";
        a.textContent = l.label || l.type;
        links.appendChild(a);
    });
}
