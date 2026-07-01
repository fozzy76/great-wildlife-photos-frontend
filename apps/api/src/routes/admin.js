import express from 'express';
import jwt from 'jsonwebtoken';
import { format } from 'fast-csv';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { adminAuth } from '../middleware/admin-auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.join(__dirname, '../../storage/products');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ============ AUTH ENDPOINTS ============

// POST /admin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  let admin;
  try {
    admin = await pb.collection('admins').authWithPassword(email, password);
  } catch (error) {
    throw new Error('Invalid email or password');
  }

  const adminRecord = admin.record;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const token = jwt.sign(
    {
      adminId: adminRecord.id,
      email: adminRecord.email,
      role: adminRecord.role || 'admin',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Store session in admin_sessions collection
  await pb.collection('admin_sessions').create({
    admin_id: adminRecord.id,
    token,
    expiresAt: expiresAt.toISOString(),
  });

  logger.info(`Admin logged in: ${email}`);

  res.json({
    token,
    admin: {
      id: adminRecord.id,
      email: adminRecord.email,
      name: adminRecord.name,
      role: adminRecord.role || 'admin',
    },
  });
});

// POST /admin/logout
router.post('/logout', adminAuth, async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.substring(7);

  // Delete session from admin_sessions collection
  const sessions = await pb.collection('admin_sessions').getFullList({
    filter: `token = "${token}"`,
  });

  if (sessions.length > 0) {
    await pb.collection('admin_sessions').delete(sessions[0].id);
  }

  logger.info(`Admin logged out: ${req.admin.email}`);

  res.json({ success: true });
});

// GET /admin/me
router.get('/me', adminAuth, async (req, res) => {
  const admin = await pb.collection('admins').getOne(req.admin.id);

  res.json({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role || 'admin',
  });
});

// ============ DASHBOARD ENDPOINTS ============

// GET /admin/dashboard/stats
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  // Total orders count
  const allOrders = await pb.collection('orders').getFullList();
  const totalOrders = allOrders.length;

  // Orders this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const ordersThisMonth = await pb.collection('orders').getFullList({
    filter: `created_at >= "${monthStart}"`,
  });

  // Total revenue (sum of all order amounts)
  let totalRevenue = 0;
  for (const order of allOrders) {
    if (order.total_amount) {
      totalRevenue += order.total_amount;
    }
  }

  // Pending fulfillment
  const pendingOrders = await pb.collection('orders').getFullList({
    filter: `fulfillmentStatus != "fulfilled" && fulfillmentStatus != "cancelled"`,
  });

  res.json({
    totalOrders,
    ordersThisMonth: ordersThisMonth.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    pendingFulfillment: pendingOrders.length,
  });
});

// ============ ORDERS ENDPOINTS ============

// GET /admin/orders
router.get('/orders', adminAuth, async (req, res) => {
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
    sort: '-created_at',
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

// GET /admin/orders/:orderId
router.get('/orders/:orderId', adminAuth, async (req, res) => {
  const { orderId } = req.params;

  const order = await pb.collection('orders').getOne(orderId);

  res.json(order);
});

// PATCH /admin/orders/:orderId
router.patch('/orders/:orderId', adminAuth, async (req, res) => {
  const { orderId } = req.params;
  const { fulfillmentStatus, notes } = req.body;

  const updateData = {};
  if (fulfillmentStatus) updateData.fulfillmentStatus = fulfillmentStatus;
  if (notes) updateData.notes = notes;

  const updatedOrder = await pb.collection('orders').update(orderId, updateData);

  logger.info(`Order updated: ${orderId}`);

  res.json(updatedOrder);
});

// ============ PRODUCTS ENDPOINTS ============

// GET /admin/products
router.get('/products', adminAuth, async (req, res) => {
  const { page = 1, limit = 20, sort = 'title', search } = req.query;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  let filter = '';
  let sortBy = sort === 'basePrice' ? 'basePrice' : sort === 'collection' ? 'collectionId' : 'title';

  if (search) {
    filter = `title ~ "${search}"`;
  }

  const products = await pb.collection('products').getFullList({
    filter: filter || undefined,
    sort: sortBy,
    skip,
    requestKey: null,
  });

  const totalProducts = await pb.collection('products').getFullList({
    filter: filter || undefined,
  });

  res.json({
    products: products.slice(0, limitNum),
    total: totalProducts.length,
    page: pageNum,
    limit: limitNum,
  });
});

// POST /admin/products
router.post('/products', adminAuth, async (req, res) => {
  const { title, collectionId, description, imageFileId, merchoneImageId, pricing, isVisible } = req.body;

  if (!title || !collectionId) {
    return res.status(400).json({ error: 'Title and collectionId are required' });
  }

  const product = await pb.collection('products').create({
    title,
    collectionId,
    description: description || '',
    imageFileId: imageFileId || '',
    merchoneImageId: merchoneImageId || '',
    pricing: pricing || {},
    isVisible: isVisible !== false,
  });

  logger.info(`Product created: ${product.id}`);

  res.json(product);
});

// PATCH /admin/products/:productId
router.patch('/products/:productId', adminAuth, async (req, res) => {
  const { productId } = req.params;
  const { title, collectionId, description, imageFileId, merchoneImageId, pricing, isVisible } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (collectionId !== undefined) updateData.collectionId = collectionId;
  if (description !== undefined) updateData.description = description;
  if (imageFileId !== undefined) updateData.imageFileId = imageFileId;
  if (merchoneImageId !== undefined) updateData.merchoneImageId = merchoneImageId;
  if (pricing !== undefined) updateData.pricing = pricing;
  if (isVisible !== undefined) updateData.isVisible = isVisible;

  const updatedProduct = await pb.collection('products').update(productId, updateData);

  logger.info(`Product updated: ${productId}`);

  res.json(updatedProduct);
});

// DELETE /admin/products/:productId
router.delete('/products/:productId', adminAuth, async (req, res) => {
  const { productId } = req.params;

  await pb.collection('products').delete(productId);

  logger.info(`Product deleted: ${productId}`);

  res.json({ success: true });
});

// PATCH /admin/products/reorder
router.patch('/products/reorder', adminAuth, async (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'Products must be an array' });
  }

  for (const item of products) {
    await pb.collection('products').update(item.id, {
      displayOrder: item.displayOrder,
    });
  }

  logger.info(`Products reordered: ${products.length} items`);

  res.json({ success: true });
});

// ============ PRODUCT IMAGE UPLOAD ENDPOINTS ============

// POST /admin/products/upload
router.post('/upload', adminAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const file = req.file;
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  // Validate MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only jpg, png, and webp are allowed');
  }

  // Validate file size
  if (file.size > maxFileSize) {
    throw new Error('File size exceeds 5MB limit');
  }

  // Get file extension from original filename
  const originalExt = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(originalExt)) {
    throw new Error('Invalid file extension. Only jpg, png, and webp are allowed');
  }

  // Generate unique filename
  const fileId = crypto.randomBytes(16).toString('hex') + originalExt;
  const filePath = path.join(STORAGE_DIR, fileId);

  // Write file to storage
  fs.writeFileSync(filePath, file.buffer);

  logger.info(`Product image uploaded: ${fileId}`);

  res.json({ fileId });
});

// GET /admin/products/image/:fileId
router.get('/image/:fileId', adminAuth, async (req, res) => {
  const { fileId } = req.params;

  const filePath = path.join(STORAGE_DIR, fileId);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Determine content type based on file extension
  const ext = path.extname(fileId).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.jpg' || ext === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (ext === '.png') {
    contentType = 'image/png';
  } else if (ext === '.webp') {
    contentType = 'image/webp';
  }

  res.setHeader('Content-Type', contentType);

  // Read and send file
  const fileBuffer = fs.readFileSync(filePath);
  res.send(fileBuffer);
});

// ============ COLLECTIONS ENDPOINTS ============

// GET /admin/collections
router.get('/collections', adminAuth, async (req, res) => {
  const collections = await pb.collection('collections').getFullList();

  res.json(collections);
});

// PATCH /admin/collections/:collectionId
router.patch('/collections/:collectionId', adminAuth, async (req, res) => {
  const { collectionId } = req.params;
  const { name, heroImage, description, isVisible } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (heroImage !== undefined) updateData.heroImage = heroImage;
  if (description !== undefined) updateData.description = description;
  if (isVisible !== undefined) updateData.isVisible = isVisible;

  const updatedCollection = await pb.collection('collections').update(collectionId, updateData);

  logger.info(`Collection updated: ${collectionId}`);

  res.json(updatedCollection);
});

// DELETE /admin/collections/:collectionId
router.delete('/collections/:collectionId', adminAuth, async (req, res) => {
  const { collectionId } = req.params;

  await pb.collection('collections').delete(collectionId);

  logger.info(`Collection deleted: ${collectionId}`);

  res.json({ success: true });
});

// ============ SETTINGS ENDPOINTS ============

// GET /admin/settings
router.get('/settings', adminAuth, async (req, res) => {
  const settings = await pb.collection('settings').getFullList();

  if (settings.length === 0) {
    return res.json({});
  }

  const setting = settings[0];

  // Mask secret keys
  const maskedSetting = { ...setting };
  if (maskedSetting.stripeSecretKey) {
    maskedSetting.stripeSecretKey = maskedSetting.stripeSecretKey.substring(0, 10) + '***';
  }
  if (maskedSetting.merchoneApiKey) {
    maskedSetting.merchoneApiKey = maskedSetting.merchoneApiKey.substring(0, 10) + '***';
  }

  res.json(maskedSetting);
});

// PATCH /admin/settings
router.patch('/settings', adminAuth, async (req, res) => {
  const { adminEmail, stripePublishableKey, stripeSecretKey, merchoneApiKey, freeShippingThreshold, notifyNewOrders } = req.body;

  const settings = await pb.collection('settings').getFullList();

  const updateData = {};
  if (adminEmail !== undefined) updateData.adminEmail = adminEmail;
  if (stripePublishableKey !== undefined) updateData.stripePublishableKey = stripePublishableKey;
  if (stripeSecretKey !== undefined) updateData.stripeSecretKey = stripeSecretKey;
  if (merchoneApiKey !== undefined) updateData.merchoneApiKey = merchoneApiKey;
  if (freeShippingThreshold !== undefined) updateData.freeShippingThreshold = freeShippingThreshold;
  if (notifyNewOrders !== undefined) updateData.notifyNewOrders = notifyNewOrders;

  let updatedSetting;
  if (settings.length === 0) {
    updatedSetting = await pb.collection('settings').create(updateData);
  } else {
    updatedSetting = await pb.collection('settings').update(settings[0].id, updateData);
  }

  logger.info('Settings updated');

  // Mask secret keys in response
  const maskedSetting = { ...updatedSetting };
  if (maskedSetting.stripeSecretKey) {
    maskedSetting.stripeSecretKey = maskedSetting.stripeSecretKey.substring(0, 10) + '***';
  }
  if (maskedSetting.merchoneApiKey) {
    maskedSetting.merchoneApiKey = maskedSetting.merchoneApiKey.substring(0, 10) + '***';
  }

  res.json(maskedSetting);
});

// ============ ACCOUNT ENDPOINTS ============

// PATCH /admin/account
router.patch('/account', adminAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  // Verify current password
  try {
    await pb.collection('admins').authWithPassword(req.admin.email, currentPassword);
  } catch (error) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  await pb.collection('admins').update(req.admin.id, {
    password: newPassword,
    passwordConfirm: newPassword,
  });

  logger.info(`Admin password updated: ${req.admin.email}`);

  res.json({ success: true });
});

// ============ EXPORT ENDPOINTS ============

// GET /admin/orders/export
router.get('/orders/export', adminAuth, async (req, res) => {
  const { status, dateRange } = req.query;

  let filter = '';

  if (status) {
    filter += `fulfillmentStatus = "${status}"`;
  }

  if (dateRange) {
    const [startDate, endDate] = dateRange.split(',');
    if (startDate && endDate) {
      const dateFilter = `created_at >= "${startDate}" && created_at <= "${endDate}"`;
      filter = filter ? `${filter} && ${dateFilter}` : dateFilter;
    }
  }

  const orders = await pb.collection('orders').getFullList({
    filter: filter || undefined,
    sort: '-created_at',
  });

  // Prepare data for CSV export
  const csvRows = orders.map(order => ({
    'Order #': order.id.substring(0, 8).toUpperCase(),
    'Date': new Date(order.created_at).toLocaleDateString(),
    'Customer Name': order.customer_name || '',
    'Email': order.customer_email || '',
    'Items': order.line_items ? JSON.parse(order.line_items).length : 0,
    'Total': order.total_amount || 0,
    'Status': order.fulfillmentStatus || 'pending',
    'Stripe ID': order.stripe_payment_id || '',
    'Merchone ID': order.merchone_order_id || '',
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