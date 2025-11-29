export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { address } = req.body;

    if (!address) {
        return res.status(400).json({ error: "地址不能为空" });
    }

    try {
        // GoPlus Address Security API (Chain ID 8453 for Base, but address reputation involves multi-chain mostly)
        // 这里的 chain_id 可以是 1 (ETH) 或 8453 (Base)，通常黑客库是通用的
        const apiUrl = `https://api.gopluslabs.io/api/v1/address_security/${address}?chain_id=8453`;
        
        const r = await fetch(apiUrl);
        const data = await r.json();

        if (data.code !== 1 || !data.result) {
            // 如果 API 没返回数据，假设是无记录的“白板”地址
            return res.status(200).json({
                success: true,
                data: {
                    riskLevel: "SAFE",
                    details: {
                        is_contract: "0",
                        phishing_activities: "0",
                        blackmail_activities: "0",
                        stealing_attack: "0",
                        fake_kyc: "0",
                        malicious_mining_activities: "0",
                        mixer: "0"
                    }
                }
            });
        }

        const resData = data.result;
        
        // 计算风险等级
        let riskLevel = "SAFE";
        
        // 只要沾上这几个，直接判定为高危
        if (resData.phishing_activities === "1" || 
            resData.stealing_attack === "1" || 
            resData.blackmail_activities === "1" ||
            resData.fake_kyc === "1") {
            riskLevel = "CRITICAL";
        } 
        // 混币器或者其他轻微风险算警告
        else if (resData.mixer === "1" || resData.malicious_mining_activities === "1") {
            riskLevel = "WARNING";
        }

        return res.status(200).json({
            success: true,
            data: {
                riskLevel,
                details: resData
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "安全数据源连接失败" });
    }
}
