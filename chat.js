/* =========================================
   UI Navigation Controller
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // 获取所有导航项 (顶部 + 左侧)
    const navLinks = document.querySelectorAll('.nav-link');
    const menuItems = document.querySelectorAll('.menu-item');
    const views = document.querySelectorAll('.view-section');

    // 统一处理视图切换
    function switchView(targetId) {
        // 1. 隐藏所有视图
        views.forEach(view => view.classList.remove('active'));
        
        // 2. 显示目标视图 (特殊处理 grid 布局类)
        const targetView = document.getElementById(targetId);
        if(targetView) {
            targetView.classList.add('active');
        }

        // 3. 更新顶部导航状态
        navLinks.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
            }
        });

        // 4. 更新左侧边栏状态
        menuItems.forEach(item => {
            item.classList.remove('active');
            if(item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            }
        });
    }

    // 绑定顶部导航点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            switchView(target);
        });
    });

    // 绑定左侧菜单点击事件
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchView(target);
        });
    });

});

/* =========================================
   Chat & Tool Logic (与之前相同)
   ========================================= */
const chatbox = document.getElementById("chatbox");
const inputBox = document.getElementById("inputBox");
const sendBtn = document.getElementById("sendBtn");

function addMessage(type, text) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(type === "你" ? "user-message" : "ai-message");
    
    div.innerHTML = `<div class="bubble">${text}</div>`;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function send() {
    const message = inputBox.value.trim();
    if (!message) return;

    addMessage("你", message);
    inputBox.value = "";
    
    // 模拟 AI 回复
    try {
        const r = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        const data = await r.json();
        addMessage("AI", data.reply || "Error");
    } catch (e) {
        addMessage("AI", "网络请求失败");
    }
}

if(sendBtn) sendBtn.onclick = send;
if(inputBox) inputBox.addEventListener("keydown", e => { if(e.key==="Enter") send(); });

// 简单的其他按钮绑定
['scanBtn', 'walletBtn', 'verifyBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if(btn) {
        btn.addEventListener('click', () => {
            const originalText = btn.innerText;
            btn.innerText = "处理中...";
            btn.disabled = true;
            // 模拟 API 调用
            setTimeout(() => {
                const resDiv = btn.parentElement.nextElementSibling;
                resDiv.classList.remove('hidden');
                resDiv.innerHTML = `<div style="color:#4ade80; padding:15px; background:rgba(74,222,128,0.1); border-radius:8px;">✅ 任务完成 (模拟数据)</div>`;
                btn.innerText = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }
});
