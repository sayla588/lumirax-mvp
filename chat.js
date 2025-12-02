/* =========================================
   UI Navigation Controller
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    const navLinks = document.querySelectorAll('.nav-link');
    const menuItems = document.querySelectorAll('.menu-item');
    const views = document.querySelectorAll('.view-section');

    function switchView(targetId) {
        // 1. 隐藏所有视图
        views.forEach(view => view.classList.remove('active'));
        
        // 2. 显示目标视图
        const targetView = document.getElementById(targetId);
        if(targetView) {
            targetView.classList.add('active');
        }

        // 3. 更新顶部导航
        navLinks.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
            }
        });

        // 4. 更新左侧菜单 (处理特殊样式)
        menuItems.forEach(item => {
            // 移除普通激活状态
            item.classList.remove('active');
            // 移除特殊激活状态 (针对 AI 助手按钮)
            item.classList.remove('special-active');

            if(item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
                // 如果是 AI 助手按钮，额外添加特殊样式类
                if(targetId === 'chat-view') {
                    item.classList.add('special-active');
                }
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            if(target) switchView(target);
        });
    });

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            if(target) switchView(target);
        });
    });

});

/* =========================================
   Chat & Tool Logic
   ========================================= */
// 通用函数：处理按钮加载状态
function setLoading(btnId, isLoading, text = "分析中...") {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (isLoading) {
        btn.dataset.originalText = btn.innerText;
        btn.innerText = text;
        btn.style.opacity = "0.7";
        btn.disabled = true;
    } else {
        btn.innerText = btn.dataset.originalText || "开始";
        btn.style.opacity = "1";
        btn.disabled = false;
    }
}

// 通用函数：显示结果
function showResult(containerId, htmlContent) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.remove('hidden');
        container.innerHTML = htmlContent;
    }
}

// 1. 智能合约扫描 (调用 /api/scan)
const scanBtn = document.getElementById('scanBtn');
if (scanBtn) {
    scanBtn.addEventListener('click', async () => {
        const input = document.getElementById('contractInput');
        const address = input.value.trim();
        if (!address) return alert("请输入合约地址");

        setLoading('scanBtn', true);
        try {
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chain: 'base', address: address }) // 默认用 Base 链
            });
            const json = await res.json();
            
            if (!json.success) throw new Error(json.error || "扫描失败");

            // 构建风险列表 HTML
            const risksHtml = json.data.risks.map(r => 
                `<div style="color: ${r.type === 'danger' ? '#ef4444' : '#fbbf24'}; margin-bottom:4px;">
                    • ${r.text}
                 </div>`
            ).join('');

            const html = `
                <div style="margin-top:20px; padding:20px; background:rgba(20,20,40,0.6); border:1px solid rgba(124,58,237,0.3); border-radius:12px;">
                    <h3 style="color:#fff; margin-bottom:10px;">${json.data.name} (${json.data.symbol})</h3>
                    <div style="font-size:2rem; font-weight:bold; color:${json.data.score < 60 ? '#ef4444' : '#4ade80'}">
                        安全分: ${json.data.score}
                    </div>
                    <div style="margin-top:15px; font-size:0.9rem;">
                        ${risksHtml}
                    </div>
                    <p style="margin-top:10px; font-size:0.8rem; opacity:0.6;">${json.data.details}</p>
                </div>
            `;
            showResult('scanResult', html);

        } catch (err) {
            showResult('scanResult', `<div style="color:#ef4444; margin-top:10px;">错误: ${err.message}</div>`);
        } finally {
            setLoading('scanBtn', false);
        }
    });
}

// 2. 钱包风险透视 (调用 /api/wallet)
const walletBtn = document.getElementById('walletBtn');
if (walletBtn) {
    walletBtn.addEventListener('click', async () => {
        const input = document.getElementById('walletInput');
        const address = input.value.trim();
        if (!address) return alert("请输入钱包地址");

        setLoading('walletBtn', true);
        try {
            const res = await fetch('/api/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });
            const json = await res.json();

            if (!json.success) throw new Error(json.error || "检测失败");

            const levelColor = json.data.riskLevel === 'SAFE' ? '#4ade80' : '#ef4444';
            const html = `
                <div style="margin-top:20px; padding:20px; background:rgba(20,20,40,0.6); border:1px solid ${levelColor}; border-radius:12px;">
                    <h4 style="color:${levelColor}; font-size:1.2rem; margin-bottom:10px;">
                        风险等级: ${json.data.riskLevel}
                    </h4>
                    <ul style="list-style:none; font-size:0.9rem; color:#ccc;">
                        <li>钓鱼活动: ${json.data.details.phishing_activities === "1" ? "⚠️ 是" : "否"}</li>
                        <li>偷窃行为: ${json.data.details.stealing_attack === "1" ? "⚠️ 是" : "否"}</li>
                        <li>混币器使用: ${json.data.details.mixer === "1" ? "⚠️ 是" : "否"}</li>
                    </ul>
                </div>
            `;
            showResult('walletResult', html);

        } catch (err) {
            showResult('walletResult', `<div style="color:#ef4444; margin-top:10px;">错误: ${err.message}</div>`);
        } finally {
            setLoading('walletBtn', false);
        }
    });
}

// 3. 项目真伪验证 (调用 /api/verify)
const verifyBtn = document.getElementById('verifyBtn');
if (verifyBtn) {
    verifyBtn.addEventListener('click', async () => {
        const input = document.getElementById('verifyInput');
        const address = input.value.trim();
        if (!address) return alert("请输入代币地址");

        setLoading('verifyBtn', true);
        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });
            const json = await res.json(); // 注意：verify.js 有时可能返回 404

            if (res.status !== 200) throw new Error(json.error || "未找到代币");

            const data = json.data;
            const trustColor = data.trustLevel === 'HIGH' ? '#4ade80' : (data.trustLevel === 'SCAM' ? '#ef4444' : '#fbbf24');

            const html = `
                <div style="margin-top:20px; padding:20px; background:rgba(20,20,40,0.6); border:1px solid ${trustColor}; border-radius:12px;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                        ${data.logo ? `<img src="${data.logo}" style="width:30px;height:30px;border-radius:50%;">` : ''}
                        <h3 style="color:#fff;">${data.name} (${data.symbol})</h3>
                    </div>
                    <div style="font-size:1.1rem; color:${trustColor}; font-weight:bold; margin-bottom:10px;">
                        ${data.trustScoreText}
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.9rem; color:#ccc;">
                        <div>价格: ${data.price}</div>
                        <div>变化: ${data.change}</div>
                        <div>流动性: ${data.liquidity}</div>
                        <div>24H量: ${data.volume}</div>
                    </div>
                </div>
            `;
            showResult('verifyResult', html);

        } catch (err) {
            showResult('verifyResult', `<div style="color:#ef4444; margin-top:10px;">${err.message}</div>`);
        } finally {
            setLoading('verifyBtn', false);
        }
    });
}
