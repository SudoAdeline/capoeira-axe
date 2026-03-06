import { Router } from 'express';
import Stripe from 'stripe';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Block all Stripe routes if not configured
router.use((req, res, next) => {
  if (!stripe) return res.status(503).json({ error: 'Payments not configured yet' });
  next();
});

// Create a Stripe Checkout Session
router.post('/create-checkout', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = result.rows[0];
    const { priceId } = req.body;

    if (!priceId) return res.status(400).json({ error: 'priceId required' });

    // Create or reuse Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: String(user.id) }
      });
      customerId = customer.id;
      await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, user.id]);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}?upgraded=true`,
      cancel_url: process.env.APP_URL,
      metadata: { userId: String(user.id) }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe Webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const subscriptionId = session.subscription;
      await query('UPDATE users SET is_premium = true, stripe_subscription_id = $1 WHERE id = $2', [subscriptionId, userId]);
      console.log(`User ${userId} upgraded to premium`);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await query('UPDATE users SET is_premium = false, stripe_subscription_id = NULL WHERE stripe_subscription_id = $1', [sub.id]);
      console.log(`Subscription ${sub.id} cancelled`);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.log(`Payment failed for customer ${invoice.customer}`);
      break;
    }
  }

  res.json({ received: true });
});

// Create Stripe Customer Portal session
router.post('/portal', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.user.userId]);
    const user = result.rows[0];
    if (!user || !user.stripe_customer_id) return res.status(400).json({ error: 'No subscription found' });

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: process.env.APP_URL,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err.message);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

export default router;
