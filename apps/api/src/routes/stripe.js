import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
router.post('/create-checkout', async (req, res) => {
  const { amount, productName, successUrl, cancelUrl } = req.body;

  if (!amount || !productName || !successUrl || !cancelUrl) {
    return res.status(400).json({ error: 'Missing required fields: amount, productName, successUrl, cancelUrl' });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  res.json({ url: session.url });
});

// Retrieve Checkout Session
router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  res.json({
    id: session.id,
    status: session.payment_status,
    amountTotal: session.amount_total,
    customerEmail: session.customer_details?.email,
  });
});

export default router;