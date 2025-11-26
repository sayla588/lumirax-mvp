const chatbox = document.getElementById("chatbox");
const inputBox = document.getElementById("inputBox");
const sendBtn = document.getElementById("sendBtn");

// 自动调整输入框高度
inputBox.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    // 限制最大高度 (在CSS中也设置了max-height，这里是双重保险)
    if (this.scrollHeight > 120) {
        this.style.overflowY = 'auto';
    } else {
        this.style.overflowY = 'hidden';
    }
});

// 重置输入框高度
function resetInputHeight() {
    inputBox.style.height = 'auto';
    inputBox.style.overflowY = 'hidden';
}


/**
 * 添加消息到聊天界面
 * @param {string} type - 消息类型: 'user', 'ai', 或 'system'
 * @param {string} text - 消息内容
 */
function addMessage(type, text) {
    // 1. 创建外层容器 (用于确定左右对齐)
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message");
    
    // 根据类型添加对应的类名
    if (type === "你") {
        messageWrapper.classList.add("user-message");
    } else if (type === "system") {
        messageWrapper.classList.add("system-message");
    } else {
        messageWrapper.classList.add("ai-message");
    }

    // 2. 创建气泡 (用于包裹内容和设置背景色)
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    
    // 使用 textContent 安全地设置文本 (防 XSS)，CSS 已设置 white-space: pre-wrap 处理换行
    bubble.textContent = text;

    // 3. 组装并添加到界面
    messageWrapper.appendChild(bubble);
    chatbox.appendChild(messageWrapper);
    
    // 滚动到底部
    scrollToBottom();
}

function scrollToBottom() {
    chatbox.scrollTo({
        top: chatbox.scrollHeight,
        behavior: 'smooth'
    });
}


async function send() {
    const message = inputBox.value.trim();
    if (!message) return;

    // 发送 UI 状态更新
    addMessage("你", message);
    inputBox.value = "";
    resetInputHeight(); // 重置高度
    inputBox.disabled = true;
    sendBtn.disabled = true;
    // 可以在这里添加一个 "AI正在输入..." 的加载动画

    try {
        // 假设你的后端API路径仍然是 /api/chat
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
        // 恢复 UI 状态
        inputBox.disabled = false;
        sendBtn.disabled = false;
        inputBox.focus();
    }
}

sendBtn.onclick = send;

inputBox.addEventListener("keydown", e => {
    // Enter 发送, Shift+Enter 换行
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // 阻止默认的换行行为
        send();
    }
});

// 页面加载时聚焦输入框
window.onload = () => inputBox.focus();
