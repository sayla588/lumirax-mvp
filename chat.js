// ... 保留上面所有的 chat 逻辑代码 ...

/* =========================================
   新增：LumiraX 平台功能逻辑
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
        document.getElementById(targetId).classList.add('active');
    });
});

// 2. 智能合约扫描 (前端交互模拟)
const scanBtn = document.getElementById('scanBtn');
const scanResult = document.getElementById('scanResult');
const scanPlaceholder = document.getElementById('scanPlaceholder');
const contractInput = document.getElementById('contractInput');

if(scanBtn) {
    scanBtn.addEventListener('click', async () => {
        const address = contractInput.value.trim();
        const chain = document.getElementById('chainSelect').value;

        if (!address) {
            alert("请输入合约地址");
            return;
        }

        // UI 变为加载状态
        scanBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> 扫描中...`;
        scanBtn.disabled = true;
        scanPlaceholder.classList.add('hidden');
        scanResult.classList.add('hidden');

        try {
            // 调用我们刚才写的后端 API
            const r = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chain, address })
            });
            
            const resp = await r.json();

            if (r.status !== 200) {
                alert(resp.error || "扫描失败");
            } else {
                // 渲染数据
                updateScanUI(resp.data);
                scanResult.classList.remove('hidden');
            }

        } catch (err) {
            console.error(err);
            alert("网络请求失败");
        } finally {
            scanBtn.innerHTML = "开始扫描";
            scanBtn.disabled = false;
        }
    });
}

// 辅助函数：更新 UI
function updateScanUI(data) {
    // 1. 更新分数
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.setProperty('--score', data.score);
    document.querySelector('.score-number').textContent = data.score;
    
    // 颜色变化：分数低变红，高变绿
    const color = data.score > 80 ? '#10b981' : (data.score > 50 ? '#f59e0b' : '#ef4444');
    scoreCircle.style.color = color;

    // 2. 更新代币信息
    document.querySelector('.token-info h3').textContent = `${data.name} (${data.symbol})`;
    document.querySelector('.token-info p').textContent = data.details;

    // 3. 更新风险列表
    const grid = document.querySelector('.risk-grid');
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

    // 4. 更新底部报告文字
    const reportText = document.querySelector('.detail-box p');
    if(reportText) {
        reportText.textContent = `基于 GoPlus 检测结果：该代币安全分为 ${data.score}。${data.risks.some(r=>r.type==='danger') ? '⚠️ 存在高风险项，请极度谨慎！' : '✅ 核心指标检测通过。'}`;
    }
}
