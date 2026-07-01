import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import logger from '../utils/logger.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://gwp.76ds.host';

router.post('/create-session', async function(req, res) {
  const items = req.body.items;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'items array is required' });
  }

  try {
    const lineItems = [];
    const metaItems = [];

    for (const item of items) {
      const { photoId, variantId, material, quantity = 1 } = item;

      // Note: This route references db and getVariantById which are not available
      // These dependencies need to be implemented or imported
      // Placeholder logic shown below - adjust based on actual implementation
      
      // const photos = await db.query('SELECT * FROM photos WHERE id=? AND published=1', [photoId]);
      // if (!photos || photos.length === 0) {
      //   return res.status(404).json({ success: false, error: 'Photo not found: ' + photoId });
      // }
      // const photo = photos[0];

      // const variant = getVariantById(variantId);
      // if (!variant) {
      //   return res.status(400).json({ success: false, error: 'Invalid variant ID: ' + variantId });
      // }

      // const basePrice = parseFloat(photo.base_price);
      // const finalPrice = Math.round((basePrice + variant.wholesale) * 100);
      // const shippingPrice = Math.round(variant.shipping * 100);

      // lineItems.push({
      //   price_data: {
      //     currency: 'usd',
      //     product_data: {
      //       name: photo.title + ' - ' + variant.name + ' ' + variant.material.charAt(0).toUpperCase() + variant.material.slice(1),
      //       description: 'Fine art wildlife print on ' + variant.material,
      //       images: [photo.r2_url || photo.photo_url],
      //       tax_code: 'txcd_99999999'
      //     },
      //     unit_amount: finalPrice
      //   },
      //   quantity: quantity
      // });

      // lineItems.push({
      //   price_data: {
      //     currency: 'usd',
      //     product_data: {
      //       name: 'Shipping & Handling - ' + photo.title,
      //       tax_code: 'txcd_92010001'
      //     },
      //     unit_amount: shippingPrice
      //   },
      //   quantity: 1
      // });

      // metaItems.push({
      //   photo_id: String(photoId),
      //   variant_id: String(variantId),
      //   material: variant.material,
      //   blueprint_id: String(variant.blueprintId),
      //   quantity: String(quantity),
      //   merchone_image_id: photo.merchone_image_id
      // });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      automatic_tax: { enabled: true },
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      success_url: FRONTEND_URL + '/order-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: FRONTEND_URL + '/cart',
      metadata: {
        items: JSON.stringify(metaItems)
      }
    });

    logger.info('Stripe session created: ' + session.id + ' items: ' + items.length);
    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error('Checkout session failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/payment-intent', async function(req, res) {
  const items = req.body.items;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'items array is required' });
  }

  try {
    const metaItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const { photoId, variantId, material, quantity = 1 } = item;

      // Note: This route references db and getVariantById which are not available
      // These dependencies need to be implemented or imported
      // Placeholder logic shown below - adjust based on actual implementation
      
      // const photos = await db.query('SELECT * FROM photos WHERE id=? AND published=1', [photoId]);
      // if (!photos || photos.length === 0) {
      //   return res.status(404).json({ success: false, error: 'Photo not found: ' + photoId });
      // }
      // const photo = photos[0];

      // const variant = getVariantById(variantId);
      // if (!variant) {
      //   return res.status(400).json({ success: false, error: 'Invalid variant ID: ' + variantId });
      // }

      // const basePrice = parseFloat(photo.base_price);
      // const finalPrice = Math.round((basePrice + variant.wholesale) * 100);
      // const shippingPrice = Math.round(variant.shipping * 100);

      // totalAmount += (finalPrice * quantity) + shippingPrice;

      // metaItems.push({
      //   photo_id: String(photoId),
      //   variant_id: String(variantId),
      //   material: variant.material,
      //   blueprint_id: String(variant.blueprintId),
      //   quantity: String(quantity),
      //   merchone_image_id: photo.merchone_image_id,
      //   photo_title: photo.title,
      //   variant_name: variant.name,
      //   unit_price: finalPrice,
      //   shipping: shippingPrice
      // });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: JSON.stringify(metaItems)
      }
    });

    logger.info('PaymentIntent created: ' + paymentIntent.id + ' amount: ' + totalAmount);
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      totalAmount: totalAmount / 100,
      items: metaItems
    });
  } catch (error) {
    logger.error('Payment intent failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;