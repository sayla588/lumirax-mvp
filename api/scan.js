export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { chain, address } = req.body;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({ error: "无效的合约地址" });
    }

    // 映射前端的网络选择到 GoPlus 的 Chain ID
    const chainMap = {
        'base': '8453',
        'eth': '1',
        'bsc': '56'
    };
    
    const chainId = chainMap[chain] || '8453'; // 默认 Base

    try {
        // 调用 GoPlus Token Security API (无需 Key，公开可用，但在生产环境建议申请 Key)
        const apiUrl = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${address}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        // 检查 API 是否返回了有效数据
        if (data.code !== 1 || !data.result || !data.result[address.toLowerCase()]) {
            // 如果查不到（可能是新盘子），返回一个模拟的“未知风险”状态，或者模拟数据用于演示
            return res.status(200).json(mockResponse(address));
        }

        const tokenData = data.result[address.toLowerCase()];

        // 计算一个简单的安全分 (仅供参考)
        let score = 100;
        const risks = [];

        // 1. 检查是否貔貅 (Honeypot)
        if (tokenData.is_honeypot === "1") {
            score -= 100;
            risks.push({ type: 'danger', text: '检测到貔貅 (无法卖出)' });
        } else {
            risks.push({ type: 'success', text: '非貔貅代码' });
        }

        // 2. 检查交易税 (Tax)
        const buyTax = parseFloat(tokenData.buy_tax || 0);
        const sellTax = parseFloat(tokenData.sell_tax || 0);
        
        if (buyTax > 50 || sellTax > 50) {
            score -= 40;
            risks.push({ type: 'danger', text: `超高税率 (买${buyTax}%/卖${sellTax}%)` });
        } else if (buyTax > 10 || sellTax > 10) {
            score -= 10;
            risks.push({ type: 'warning', text: `税率偏高 (买${buyTax}%/卖${sellTax}%)` });
        } else {
            risks.push({ type: 'success', text: `税率正常 (买${buyTax}%/卖${sellTax}%)` });
        }

        // 3. 检查合约开源
        if (tokenData.is_open_source === "0") {
            score -= 20;
            risks.push({ type: 'warning', text: '合约未开源' });
        }

        // 4. 检查所有权
        if (tokenData.owner_address === "") {
             risks.push({ type: 'success', text: '所有权已放弃' });
        } else {
            score -= 5;
            risks.push({ type: 'warning', text: '所有权未放弃' });
        }

        // 确保分数不小于 0
        score = Math.max(0, score);

        return res.status(200).json({
            success: true,
            data: {
                name: tokenData.token_name || "Unknown Token",
                symbol: tokenData.token_symbol || "???",
                score: score,
                risks: risks,
                details: `持有者人数: ${tokenData.holder_count || '未知'} | 这里的分析基于 GoPlus 数据。`
            }
        });

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: "扫描服务暂时不可用" });
    }
}

// 这是一个备用的模拟数据函数，防止 API 挂了或者查不到新币时界面空白
function mockResponse(address) {
    return {
        success: true,
        data: {
            name: "Test Token (API无数据)",
            symbol: "TEST",
            score: 60,
            risks: [
                { type: 'warning', text: '未在数据库中找到此代币' },
                { type: 'danger', text: '请谨慎交互，可能是新合约' }
            ],
            details: `地址: ${address.substring(0,6)}...`
        }
    };
}
