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
const chatbox = document.getElementById("chatbox");
const inputBox = document.getElementById("inputBox");
const sendBtn = document.getElementById("sendBtn");

function addMessage(type, text) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(type === "你" ? "user-message" : "ai-message");
    
    // 如果是 AI 回复，可以随机加个装饰图标 (可选)
    const decoration = type !== "你" ? '' : '';

    div.innerHTML = `<div class="bubble">${text}${decoration}</div>`;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function send() {
    const message = inputBox.value.trim();
    if (!message) return;

    addMessage("你", message);
    inputBox.value = "";
    
    try {
        const r = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        const data = await r.json();
        addMessage("AI", data.reply || "Error");
    } catch (e) {
        addMessage("AI", "网络请求失败，请检查连接。");
    }
}

if(sendBtn) sendBtn.onclick = send;
if(inputBox) inputBox.addEventListener("keydown", e => { if(e.key==="Enter") send(); });

// 模拟工具按钮点击效果
['scanBtn', 'walletBtn', 'verifyBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if(btn) {
        btn.addEventListener('click', () => {
            const originalText = btn.innerText;
            btn.innerText = "分析中...";
            btn.style.opacity = "0.7";
            btn.disabled = true;
            
            setTimeout(() => {
                const resDiv = btn.parentElement.nextElementSibling;
                resDiv.classList.remove('hidden');
                resDiv.innerHTML = `
                    <div style="margin-top:20px; padding:20px; background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.3); border-radius:12px; color:#4ade80;">
                        <h4 style="margin-bottom:10px; display:flex; align-items:center; gap:10px;">
                            <i class="ri-checkbox-circle-fill"></i> 分析完成
                        </h4>
                        <p style="font-size:0.9rem; opacity:0.9;">这里将显示 API 返回的详细数据 (当前为演示模式)</p>
                    </div>
                `;
                btn.innerText = originalText;
                btn.style.opacity = "1";
                btn.disabled = false;
            }, 1500);
        });
    }
});
