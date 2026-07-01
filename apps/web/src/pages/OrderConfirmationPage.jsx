import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import pb from '@/lib/pocketbaseClient.js';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await pb.collection('orders').getOne(orderId, {
          expand: 'order_items_via_order_id,order_items_via_order_id.photo_id',
          $autoCancel: false
        });
        setOrder(orderData);
        setOrderItems(orderData.expand?.order_items_via_order_id || []);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <Helmet>
        <title>Order Confirmation - Great Wildlife Photos</title>
        <meta name="description" content="Your order has been confirmed. Thank you for your purchase." />
      </Helmet>

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
                <p className="text-lg font-semibold">{order.external_id || order.id}</p>
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
                <p className="text-2xl font-bold text-primary">${order.total?.toFixed(2) || '0.00'}</p>
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
                    {item.expand?.photo_id && (
                      <img
                        src={item.expand.photo_id.photo_url || 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'}
                        alt={item.expand.photo_id.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.expand?.photo_id?.title || 'Photo'}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.material} • {item.size} • Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        ${item.price.toFixed(2)}
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

          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
            >
              <Link to="/gallery">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;