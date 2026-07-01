import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Create order after Stripe payment confirmation
router.post('/', async (req, res) => {
  const { customer_id, stripe_payment_id, line_items, shipping_address } = req.body;

  if (!customer_id || !stripe_payment_id || !line_items || !shipping_address) {
    return res.status(400).json({ error: 'Missing required fields: customer_id, stripe_payment_id, line_items, shipping_address' });
  }

  // Create order record in PocketBase
  const order = await pb.collection('orders').create({
    customer_id,
    stripe_payment_id,
    line_items: JSON.stringify(line_items),
    shipping_address: JSON.stringify(shipping_address),
    status: 'pending',
    created_at: new Date().toISOString(),
  });

  logger.info(`Order created: ${order.id}`);

  // Prepare data for Merchone submission
  const photo_ids = line_items.map(item => item.photo_id);
  const sizes = line_items.map(item => item.size);
  const print_types = line_items.map(item => item.print_type);
  const quantities = line_items.map(item => item.quantity);

  // Call Merchone submit-order endpoint
  const merchoneResponse = await fetch('http://localhost:3001/hcgi/api/merchone/submit-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      photo_ids,
      sizes,
      print_types,
      quantities,
      customer_shipping_address: shipping_address,
      order_id: order.id,
    }),
  });

  if (!merchoneResponse.ok) {
    throw new Error(`Failed to submit order to Merchone: ${merchoneResponse.status}`);
  }

  const merchoneData = await merchoneResponse.json();

  // Update order with Merchone order ID
  await pb.collection('orders').update(order.id, {
    merchone_order_id: merchoneData.merchone_order_id,
    status: 'submitted_to_production',
  });

  logger.info(`Order submitted to Merchone: ${merchoneData.merchone_order_id}`);

  // Note: Order confirmation email is triggered by PocketBase hook on orders.create
  // The hook should send email to customer with order details

  res.json({
    order_id: order.id,
    order_number: order.id.substring(0, 8).toUpperCase(),
  });
});

export default router;