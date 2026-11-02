const GA_MEASUREMENT_ID = 'G-JS8BB5NV28';

function canTrack() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

function event(name, params = {}) {
  if (!canTrack()) return;
  window.gtag('event', name, params);
}

function money(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : 0;
}

function ecommerceItems(items = []) {
  return items.map((item) => ({
    item_id: String(item.photoId || item.photo_id || item.id || item.variantId || ''),
    item_name: item.title || item.photo_title || item.name || 'Wildlife print',
    item_category: item.material || 'Print',
    item_variant: item.size || item.variant_name || item.variantId || item.variant_id || '',
    price: money(item.price ?? item.unit_price),
    quantity: Number(item.quantity || 1)
  }));
}

export function trackPageView(path, title) {
  if (!canTrack()) return;
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title
  });
}

export function trackViewItem(photo, variant, price) {
  if (!photo || !variant) return;
  event('view_item', {
    currency: 'USD',
    value: money(price),
    items: ecommerceItems([{
      photoId: photo.id,
      title: photo.title,
      material: variant.material,
      variantId: variant.id,
      size: variant.name,
      price,
      quantity: 1
    }])
  });
}

export function trackAddToCart(item) {
  event('add_to_cart', {
    currency: 'USD',
    value: money((item.price || 0) * (item.quantity || 1)),
    items: ecommerceItems([item])
  });
}

export function trackViewCart(items, value) {
  event('view_cart', {
    currency: 'USD',
    value: money(value),
    items: ecommerceItems(items)
  });
}

export function trackBeginCheckout(items, value) {
  event('begin_checkout', {
    currency: 'USD',
    value: money(value),
    items: ecommerceItems(items)
  });
}

export function trackAddShippingInfo(items, value, shippingTier = 'Standard') {
  event('add_shipping_info', {
    currency: 'USD',
    value: money(value),
    shipping_tier: shippingTier,
    items: ecommerceItems(items)
  });
}

export function trackAddPaymentInfo(items, value) {
  event('add_payment_info', {
    currency: 'USD',
    value: money(value),
    payment_type: 'Stripe',
    items: ecommerceItems(items)
  });
}

function storageGet(storage, key) {
  try { return typeof window !== 'undefined' && window[storage] ? window[storage].getItem(key) : null; } catch { return null; }
}

function storageSet(storage, key) {
  try { if (typeof window !== 'undefined' && window[storage]) window[storage].setItem(key, '1'); } catch { /* storage blocked */ }
}

// Sent only for an order row the backend returned (GET /checkout/orders/:paymentIntentId answers 200 only once the
// Stripe webhook has saved the paid order). One purchase per order on this browser: localStorage spans tabs, reloads
// and the back button; the sessionStorage key is the one used before, kept so orders already sent are not re-sent.
export function trackPurchase(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) return false;
  const transactionId = String(order.orderNumber || order.id || '');
  if (!transactionId) return false;

  const storageKey = `gwp_purchase_tracked_${transactionId}`;
  if (storageGet('localStorage', storageKey) || storageGet('sessionStorage', storageKey)) {
    return true;
  }
  if (!canTrack()) return false;
  storageSet('localStorage', storageKey);
  storageSet('sessionStorage', storageKey);

  event('purchase', {
    transaction_id: transactionId,
    affiliation: 'Great Wildlife Photos',
    currency: 'USD',
    value: money(order.total),
    items: ecommerceItems(order.items)
  });
  return true;
}

export function trackNewsletterSignup() {
  event('sign_up', {
    method: 'newsletter'
  });
  event('newsletter_signup', {
    method: 'footer'
  });
}

// form_submit is a GA4 key event on this property; it is sent only when the contact API confirms the message.
export function trackFormSubmit() {
  event('form_submit', {
    form_id: 'contact'
  });
}
