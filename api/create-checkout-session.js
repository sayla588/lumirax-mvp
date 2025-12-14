// api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
    month: 'price_1SeBYlGBv3hNH631tGjEGVOd', // 在 Stripe Dashboard 创建产品后获取
    year:  'price_1SeBaXGBv3hNH631jB5k9rCh'
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { plan, username } = req.body;

    if (!['month', 'year'].includes(plan) || !username) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],  // 只显示信用卡（支持订阅完美）
            mode: 'subscription',
            line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
            success_url: `${req.headers.origin}/?payment=success`,
            cancel_url: `${req.headers.origin}/?payment=cancel`,
            client_reference_id: username,
            metadata: { username }
        });

        res.status(200).json({ sessionId: session.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
