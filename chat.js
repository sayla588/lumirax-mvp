const chatbox = document.getElementById("chatbox");
const inputBox = document.getElementById("inputBox");
const sendBtn = document.getElementById("sendBtn");

function addMessage(from, text) {
    const div = document.createElement("div");
    div.style.marginBottom = "10px"; // 增加一点消息间距

    const strong = document.createElement("strong");
    strong.textContent = from + ": ";
    
    const span = document.createElement("span");
    span.textContent = text;
    span.style.whiteSpace = "pre-wrap"; // 允许 AI 回复中的换行符生效

    div.appendChild(strong);
    div.appendChild(span);
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function send() {
    const message = inputBox.value.trim();
    if (!message) return;

    addMessage("你", message);
    inputBox.value = "";
    inputBox.disabled = true; // 发送期间禁用输入框，防止重复提交
    sendBtn.disabled = true;

    try {
        const r = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await r.json();
        
        if (r.status !== 200) {
            addMessage("系统", data.error || data.reply || "发生错误");
        } else {
            addMessage("AI", data.reply);
        }
    } catch (err) {
        addMessage("系统", "网络请求失败");
        console.error(err);
    } finally {
        inputBox.disabled = false;
        sendBtn.disabled = false;
        inputBox.focus();
    }
}

sendBtn.onclick = send;
inputBox.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { // 防止 shift+enter 换行时误发送
        e.preventDefault(); 
        send();
    }
});
