import jwt from 'jsonwebtoken';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

export async function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }

  // Check if session exists and is not expired
  const sessions = await pb.collection('admin_sessions').getFullList({
    filter: `token = "${token}" && admin_id = "${decoded.adminId}"`,
  });

  if (sessions.length === 0) {
    throw new Error('Session not found or expired');
  }

  const session = sessions[0];
  const expiresAt = new Date(session.expiresAt);

  if (expiresAt < new Date()) {
    throw new Error('Session has expired');
  }

  // Attach admin info to request
  req.admin = {
    id: decoded.adminId,
    email: decoded.email,
    role: decoded.role,
  };

  next();
}