import 'dotenv/config';
import express from 'express';
import { format } from 'fast-csv';
import axios from 'axios';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { adminAuth } from '../middleware/admin-auth.js';

const router = express.Router();

const MERCHONE_API_BASE = 'https://api.merchone.com';
const MERCHONE_USERNAME = process.env.MERCHONE_USERNAME || 'great-wildlife-photos';
const MERCHONE_PASSWORD = process.env.MERCHONE_PASSWORD || '56aec7e78fea0a6d93632adeafeaf231';

// GET /orders-admin - List all orders (admin only)
router.get('/', adminAuth, async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  let filter = '';

  if (status) {
    filter += `fulfillmentStatus = "${status}"`;
  }

  if (search) {
    const searchFilter = `(id ~ "${search}" || customer_name ~ "${search}" || customer_email ~ "${search}")`;
    filter = filter ? `${filter} && ${searchFilter}` : searchFilter;
  }

  const orders = await pb.collection('orders').getFullList({
    filter: filter || undefined,
    sort: '-created',
    skip,
    requestKey: null,
  });

  const totalOrders = await pb.collection('orders').getFullList({
    filter: filter || undefined,
  });

  res.json({
    orders: orders.slice(0, limitNum),
    total: totalOrders.length,
    page: pageNum,
    limit: limitNum,
  });
});

// POST /orders-admin/check-status/:orderId - Check order status from MerchOne (admin only)
router.post('/check-status/:orderId', adminAuth, async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  // Get order from PocketBase
  const order = await pb.collection('orders').getOne(orderId);

  if (!order.merchone_order_id) {
    return res.status(400).json({ error: 'Order does not have a MerchOne order ID' });
  }

  // Fetch order status from MerchOne
  let merchoneOrder;
  try {
    const response = await axios.get(`${MERCHONE_API_BASE}/orders/${order.merchone_order_id}`, {
      auth: {
        username: MERCHONE_USERNAME,
        password: MERCHONE_PASSWORD,
      },
    });
    merchoneOrder = response.data;
  } catch (error) {
    logger.error(`Failed to fetch order status from MerchOne: ${error.message}`);
    throw new Error(`Failed to fetch order status from MerchOne: ${error.message}`);
  }

  // Map MerchOne status to our fulfillmentStatus
  const statusMap = {
    'pending': 'pending',
    'processing': 'processing',
    'shipped': 'shipped',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
  };

  const newStatus = statusMap[merchoneOrder.status] || merchoneOrder.status;

  // Update order in PocketBase
  const updatedOrder = await pb.collection('orders').update(orderId, {
    fulfillmentStatus: newStatus,
    tracking_url: merchoneOrder.tracking_url || '',
    tracking_number: merchoneOrder.tracking_number || '',
  });

  logger.info(`Order status updated: ${orderId} -> ${newStatus}`);

  res.json(updatedOrder);
});

// GET /orders-admin/export - Export orders as CSV (admin only)
router.get('/export', adminAuth, async (req, res) => {
  const { status, dateRange } = req.query;

  let filter = '';

  if (status) {
    filter += `fulfillmentStatus = "${status}"`;
  }

  if (dateRange) {
    const [startDate, endDate] = dateRange.split(',');
    if (startDate && endDate) {
      const dateFilter = `created >= "${startDate}" && created <= "${endDate}"`;
      filter = filter ? `${filter} && ${dateFilter}` : dateFilter;
    }
  }

  const orders = await pb.collection('orders').getFullList({
    filter: filter || undefined,
    sort: '-created',
  });

  // Prepare data for CSV export
  const csvRows = orders.map(order => ({
    'Order Number': order.id.substring(0, 8).toUpperCase(),
    'Customer Name': order.customer_name || '',
    'Customer Email': order.customer_email || '',
    'Status': order.fulfillmentStatus || 'pending',
    'Total': order.total_amount || 0,
    'Created': new Date(order.created).toLocaleDateString(),
    'Tracking URL': order.tracking_url || '',
  }));

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="orders-export.csv"');

  // Use fast-csv format to generate CSV and pipe to response
  format({ headers: true })
    .write(csvRows)
    .pipe(res);
});

export default router;