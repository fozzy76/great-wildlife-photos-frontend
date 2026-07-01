import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();
const MERCHONE_API_BASE = 'https://api.merchone.com/v1';

// Submit order to Merchone
router.post('/submit-order', async (req, res) => {
  const { photo_ids, sizes, print_types, quantities, customer_shipping_address, order_id } = req.body;

  if (!photo_ids || !sizes || !print_types || !quantities || !customer_shipping_address || !order_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const payload = {
    order_id,
    items: photo_ids.map((photoId, index) => ({
      photo_id: photoId,
      size: sizes[index],
      print_type: print_types[index],
      quantity: quantities[index],
    })),
    shipping_address: customer_shipping_address,
  };

  const response = await fetch(`${MERCHONE_API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MERCHONE_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Merchone API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  res.json({
    merchone_order_id: data.order_id,
    status: data.status,
  });
});

// Get shipping rates
router.get('/shipping-rates', async (req, res) => {
  const { destination_country, order_details } = req.query;

  if (!destination_country || !order_details) {
    return res.status(400).json({ error: 'Missing required query parameters: destination_country, order_details' });
  }

  const response = await fetch(`${MERCHONE_API_BASE}/shipping-rates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MERCHONE_API_KEY}`,
    },
    body: JSON.stringify({
      destination_country,
      order_details: JSON.parse(order_details),
    }),
  });

  if (!response.ok) {
    throw new Error(`Merchone API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  res.json({
    shipping_cost: data.shipping_cost,
    estimated_days: data.estimated_days,
  });
});

// Get order status
router.get('/order-status/:merchone_order_id', async (req, res) => {
  const { merchone_order_id } = req.params;

  if (!merchone_order_id) {
    return res.status(400).json({ error: 'Merchone order ID is required' });
  }

  const response = await fetch(`${MERCHONE_API_BASE}/orders/${merchone_order_id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.MERCHONE_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Merchone API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  res.json({
    status: data.status,
    tracking_number: data.tracking_number,
    tracking_carrier: data.tracking_carrier,
    estimated_delivery: data.estimated_delivery,
  });
});

export default router;