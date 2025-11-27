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
    scanBtn.addEventListener('click', () => {
        const address = contractInput.value.trim();
        if (!address) {
            alert("请输入合约地址");
            return;
        }

        // UI 变为加载状态
        scanBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> 扫描中...`;
        scanBtn.disabled = true;
        scanPlaceholder.classList.add('hidden');
        scanResult.classList.add('hidden');

        // 模拟 API 请求延迟 (2秒)
        setTimeout(() => {
            // 恢复按钮
            scanBtn.innerHTML = "开始扫描";
            scanBtn.disabled = false;

            // 显示结果 UI
            scanResult.classList.remove('hidden');
            
            // 这里以后会替换为真实的 API 数据填充
            console.log("扫描完成: " + address);
            
            // 可以在这里加个简单的逻辑，把输入的地址显示在界面上
            document.querySelector('.token-info h3').textContent = "Token [" + address.substring(0,6) + "..." + "]";
        }, 1500);
    });
}
