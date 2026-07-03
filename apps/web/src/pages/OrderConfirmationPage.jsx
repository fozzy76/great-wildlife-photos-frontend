import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import SEO from '@/components/SEO.jsx';

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async (retryCount = 0) => {
      if (!paymentIntentId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('https://api.greatwildlifephotos.com/checkout/orders/' + paymentIntentId);
        if (response.status === 202 && retryCount < 10) {
          // Order is still being processed — webhook hasn't completed yet
          setTimeout(() => fetchOrder(retryCount + 1), 2000);
          return;
        }
        if (!response.ok) {
          if (response.status === 404 && retryCount < 10) {
            // Order may not be saved yet — Stripe webhook still processing
            // Don't setLoading(false) — keep showing skeleton during retries
            setTimeout(() => fetchOrder(retryCount + 1), 2000);
            return;
          }
          console.error('Order fetch failed:', response.status);
          setLoading(false);
          return;
        }
        const data = await response.json();
        setOrder(data);
        setOrderItems(data.items || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">Processing your order...</h2>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we confirm your payment.</p>
          </div>
          <Skeleton className="h-12 w-3/4 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Order not found</h1>
          <Button asChild>
            <Link to="/">Return home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <>
      <SEO
        title="Order Confirmation - Great Wildlife Photos"
        description="Your Great Wildlife Photos order has been confirmed."
        path="/order-success"
        robots="noindex,nofollow"
      />

      <style>{`
        @media print {
          header, footer, nav, button, [class*="btn"], a[href="/gallery"], .lucide-shopping-cart { display: none !important; }
          .fixed { position: static !important; }
          body, .min-h-screen { background: white !important; }
          .shadow-lg, .rounded-xl { box-shadow: none !important; }
          .bg-card, .bg-muted { background: white !important; border: 1px solid #ccc !important; }
          .text-primary { color: black !important; }
          .text-muted-foreground { color: #333 !important; }
          .max-w-4xl { max-width: 100% !important; }
          .py-12 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .mb-12, .mb-8 { margin-bottom: 1rem !important; }
        }
      `}</style>

      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Order confirmed</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">Order number</h2>
                <p className="text-lg font-semibold">{order.orderNumber || order.id}</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">Order status</h2>
                <p className="text-lg font-semibold capitalize">{order.status}</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">Customer</h2>
                <p className="text-lg">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">Total</h2>
                <p className="text-2xl font-bold text-primary">${Number(order.total || 0).toFixed(2)}</p>
              </div>
            </div>

            {order.tracking_url && (
              <div className="pt-6 border-t border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-semibold">Tracking information</h2>
                </div>
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Track your order
                </a>
              </div>
            )}
          </div>

          {orderItems.length > 0 && (
            <div className="bg-card rounded-xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Order items</h2>
              </div>
              <div className="space-y-4">
                {orderItems.map(item => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                    {item.photo_url && (
                      <img
                        src={item.photo_url || 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'}
                        alt={item.photo_title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.photo_title || 'Photo'}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.material} • {item.size} • Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        ${Number(item.unit_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">What happens next?</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">1.</span>
                <span>Your order is being processed and will be sent to our printing partner.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">2.</span>
                <span>You'll receive an email confirmation with your order details.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">3.</span>
                <span>Once shipped, you'll receive tracking information via email.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">4.</span>
                <span>Estimated delivery: {estimatedDelivery.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </li>
            </ul>
          </div>

          <div className="text-center flex gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
            >
              <Link to="/gallery">Continue shopping</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="transition-all duration-200"
            >
              <a href={`/order-receipt?payment_intent=${paymentIntentId}`} target="_blank" rel="noopener noreferrer">Print Receipt</a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;
