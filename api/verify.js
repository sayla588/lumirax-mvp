export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { address } = req.body;

    if (!address) {
        return res.status(400).json({ error: "地址不能为空" });
    }

    try {
        // DexScreener API: 支持多链，直接输地址即可
        const apiUrl = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
        const r = await fetch(apiUrl);
        const data = await r.json();

        // 检查是否有交易对
        if (!data.pairs || data.pairs.length === 0) {
            return res.status(404).json({ error: "未找到该代币的交易对数据，可能是无效地址或极新项目" });
        }

        // 取流动性最大的那个交易对作为主要数据
        const pair = data.pairs.sort((a, b) => b.liquidity.usd - a.liquidity.usd)[0];

        // --- 简单的真伪/风险评估逻辑 ---
        let trustLevel = "HIGH"; // 默认为高
        let trustScoreText = "✨ 看起来不错";
        
        const liquidity = pair.liquidity.usd;
        const volume24h = pair.volume.h24;
        const priceChange = pair.priceChange.h24;

        // 1. 流动性过低警告
        if (liquidity < 1000) {
            trustLevel = "SCAM";
            trustScoreText = "💀 极度危险 (流动性 < $1k)";
        } else if (liquidity < 10000) {
            trustLevel = "LOW";
            trustScoreText = "⚠️ 风险高 (流动性不足)";
        }

        // 2. 只有单边行情 (Rug pull 后遗症)
        if (priceChange < -90) {
            trustLevel = "SCAM";
            trustScoreText = "📉 归零盘 (跌幅 > 90%)";
        }

        // 3. 社交媒体缺失检查
        const hasSocials = pair.info && pair.info.websites && pair.info.websites.length > 0;
        if (!hasSocials && trustLevel !== "SCAM") {
             trustLevel = "MEDIUM";
             trustScoreText = "⚠️ 存疑 (无官方链接)";
        }

        return res.status(200).json({
            success: true,
            data: {
                name: pair.baseToken.name,
                symbol: pair.baseToken.symbol,
                price: `$${pair.priceUsd}`,
                logo: pair.info?.imageUrl,
                liquidity: `$${parseInt(liquidity).toLocaleString()}`,
                volume: `$${parseInt(volume24h).toLocaleString()}`,
                change: `${priceChange}%`,
                dexId: pair.dexId, // 例如 uniswap, pancakeswap
                trustLevel,
                trustScoreText,
                websites: pair.info?.websites || [],
                socials: pair.info?.socials || []
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "数据源连接失败" });
    }
}
