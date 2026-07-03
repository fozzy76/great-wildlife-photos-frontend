import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';

const OrderReceiptPage = () => {
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
          setTimeout(() => fetchOrder(retryCount + 1), 2000);
          return;
        }
        if (!response.ok) {
          if (response.status === 404 && retryCount < 10) {
            setTimeout(() => fetchOrder(retryCount + 1), 2000);
            return;
          }
          setLoading(false);
          return;
        }
        const data = await response.json();
        setOrder(data);
        setOrderItems(data.items || []);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'Georgia, serif', background: '#fff', minHeight: '100vh' }}>
        <p>Loading receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'Georgia, serif', background: '#fff', minHeight: '100vh' }}>
        <p>Order not found.</p>
        <Button asChild><Link to="/">Return home</Link></Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px', fontFamily: 'Georgia, serif', color: '#1a1a1a', background: '#fff', minHeight: '100vh' }}>
      {/* Close button — hidden when printing */}
      <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.close()}
          style={{ background: '#fff', border: '1px solid #ccc' }}
        >
          ✕ Close
        </Button>
      </div>

      {/* Header with logo and company name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '2px solid #1a1a1a', paddingBottom: '20px', marginBottom: '32px' }}>
        <img
          src="https://images.greatwildlifephotos.com/branding/gwp-logo.png"
          alt="Great Wildlife Photos"
          style={{ height: '60px', width: 'auto' }}
        />
        <div>
          <h1 style={{ fontSize: '24px', margin: '0', fontWeight: 'bold', color: '#1a1a1a' }}>Great Wildlife Photos</h1>
          <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Award-winning North American wildlife photography by Lynn Starnes</p>
        </div>
      </div>

      {/* Receipt title */}
      <h2 style={{ fontSize: '20px', textAlign: 'center', margin: '0 0 32px 0', letterSpacing: '2px', textTransform: 'uppercase', color: '#1a1a1a' }}>
        Order Receipt
      </h2>

      {/* Order details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#999', margin: '0 0 4px 0' }}>Order Number</p>
          <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#1a1a1a' }}>{order.orderNumber || order.id}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#999', margin: '0 0 4px 0' }}>Date</p>
          <p style={{ fontSize: '16px', margin: '0', color: '#1a1a1a' }}>{new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#999', margin: '0 0 4px 0' }}>Customer</p>
          <p style={{ fontSize: '16px', margin: '0', color: '#1a1a1a' }}>{order.customer_name}</p>
          <p style={{ fontSize: '14px', color: '#666', margin: '2px 0 0 0' }}>{order.customer_email}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#999', margin: '0 0 4px 0' }}>Status</p>
          <p style={{ fontSize: '16px', margin: '0', color: '#1a1a1a' }}>{order.status}</p>
        </div>
      </div>

      {/* Order items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
            <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '11px', textTransform: 'uppercase', color: '#999' }}>Item</th>
            <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '11px', textTransform: 'uppercase', color: '#999' }}>Details</th>
            <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '11px', textTransform: 'uppercase', color: '#999' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '11px', textTransform: 'uppercase', color: '#999' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '12px 0', fontSize: '14px', color: '#1a1a1a' }}>{item.photo_title || 'Photo'}</td>
              <td style={{ padding: '12px 0', fontSize: '14px', color: '#666' }}>{item.material} &bull; {item.size}</td>
              <td style={{ padding: '12px 0', fontSize: '14px', textAlign: 'right', color: '#1a1a1a' }}>{item.quantity}</td>
              <td style={{ padding: '12px 0', fontSize: '14px', textAlign: 'right', color: '#1a1a1a' }}>${Number(item.unit_price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', color: '#1a1a1a' }}>Total:</td>
            <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '18px', color: '#1a1a1a' }}>${Number(order.total || 0).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Thank you note */}
      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e5e5' }}>
        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
          Thank you for your purchase. Every photograph is captured in the wild. All shots are natural, wild. Never AI-generated.
        </p>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          &copy; {new Date().getFullYear()} Lynn Starnes / Great Wildlife Photos. All photographs are trademarked and may not be reproduced without written permission.
        </p>
      </div>

      {/* Print button — hidden when printing */}
      <div className="no-print" style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button onClick={() => window.print()} variant="outline" size="lg" style={{ background: '#fff', border: '1px solid #ccc' }}>
          Print Receipt
        </Button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default OrderReceiptPage;
