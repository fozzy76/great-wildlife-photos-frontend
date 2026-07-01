import 'dotenv/config';
import pb from './pocketbaseClient.js';
import logger from './logger.js';

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@greatwildlifephotos.com';

/**
 * Send tracking email to customer
 * Note: Email is sent via PocketBase hooks
 */
export async function sendEmail(order, trackingUrl, trackingNumber) {
  try {
    // Create email record in PocketBase
    // The PocketBase hook will handle actual email sending
    await pb.collection('emails').create({
      to: order.customer_email,
      subject: `Your Order ${order.id.substring(0, 8).toUpperCase()} Has Shipped!`,
      template: 'order_shipped',
      order_id: order.id,
      tracking_url: trackingUrl,
      tracking_number: trackingNumber,
    });

    logger.info(`Tracking email queued for ${order.customer_email}`);
  } catch (error) {
    logger.error(`Failed to queue tracking email: ${error.message}`);
  }
}

export default sendEmail;