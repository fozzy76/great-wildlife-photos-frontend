import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { adminAuth } from '../middleware/admin-auth.js';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.join(__dirname, '../../storage/photos');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// POST /photos/upload - Upload photo (admin only)
router.post('/upload', adminAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const { title, category, description, merchone_image_id } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required' });
  }

  const file = req.file;
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Validate MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only jpg, png, and webp are allowed');
  }

  // Validate file size
  if (file.size > maxFileSize) {
    throw new Error('File size exceeds 10MB limit');
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

  // Create photo record in PocketBase
  const photo = await pb.collection('photos').create({
    title,
    category,
    description: description || '',
    merchone_image_id: merchone_image_id || '',
    file_id: fileId,
    file_size: file.size,
    mime_type: file.mimetype,
  });

  logger.info(`Photo uploaded: ${photo.id}`);

  res.json({
    id: photo.id,
    title: photo.title,
    photo_url: `/hcgi/api/photos/image/${fileId}`,
  });
});

// GET /photos - List all photos (admin only)
router.get('/', adminAuth, async (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  let filter = '';

  if (category) {
    filter += `category = "${category}"`;
  }

  if (search) {
    const searchFilter = `title ~ "${search}"`;
    filter = filter ? `${filter} && ${searchFilter}` : searchFilter;
  }

  const photos = await pb.collection('photos').getFullList({
    filter: filter || undefined,
    sort: '-created',
    skip,
    requestKey: null,
  });

  const totalPhotos = await pb.collection('photos').getFullList({
    filter: filter || undefined,
  });

  // Add photo_url to each photo
  const photosWithUrls = photos.slice(0, limitNum).map(photo => ({
    ...photo,
    photo_url: `/hcgi/api/photos/image/${photo.file_id}`,
  }));

  res.json({
    photos: photosWithUrls,
    total: totalPhotos.length,
    page: pageNum,
    limit: limitNum,
  });
});

// GET /photos/image/:fileId - Serve photo image
router.get('/image/:fileId', async (req, res) => {
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

export default router;