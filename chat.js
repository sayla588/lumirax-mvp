const chatbox = document.getElementById("chatbox");
const inputBox = document.getElementById("inputBox");
const sendBtn = document.getElementById("sendBtn");

function addMessage(from, text) {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${from}:</strong> ${text}`;
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
        addMessage("AI", data.reply);
    } catch (err) {
        addMessage("系统", "请求失败，请稍后再试");
    }
}

sendBtn.onclick = send;
inputBox.addEventListener("keydown", e => {
    if (e.key === "Enter") send();
});
