import express from 'express';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Generate password reset token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Request password reset
router.post('/password-reset', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check if customer exists
  const customers = await pb.collection('customers').getFullList({
    filter: `email = "${email}"`,
  });

  if (customers.length === 0) {
    // Return success even if email doesn't exist (security best practice)
    return res.json({ message: 'Reset link sent' });
  }

  const customer = customers[0];
  const resetToken = generateResetToken();
  const expiryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  // Store reset token in temporary collection
  await pb.collection('password_reset_tokens').create({
    email,
    token: resetToken,
    customer_id: customer.id,
    expires_at: expiryTime.toISOString(),
  });

  // Note: Email sending is handled by PocketBase hooks
  // The hook should be triggered on password_reset_tokens.create
  logger.info(`Password reset token created for ${email}`);

  res.json({ message: 'Reset link sent' });
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    return res.status(400).json({ error: 'Token and new_password are required' });
  }

  // Find and verify token
  const resetTokens = await pb.collection('password_reset_tokens').getFullList({
    filter: `token = "${token}"`,
  });

  if (resetTokens.length === 0) {
    throw new Error('Invalid or expired reset token');
  }

  const resetRecord = resetTokens[0];
  const expiryTime = new Date(resetRecord.expires_at);

  if (expiryTime < new Date()) {
    throw new Error('Reset token has expired');
  }

  // Update customer password
  const customer = await pb.collection('customers').getOne(resetRecord.customer_id);
  await pb.collection('customers').update(resetRecord.customer_id, {
    password: new_password,
    passwordConfirm: new_password,
  });

  // Delete the reset token
  await pb.collection('password_reset_tokens').delete(resetRecord.id);

  logger.info(`Password reset successful for customer ${resetRecord.customer_id}`);

  res.json({ message: 'Password reset successful' });
});

export default router;