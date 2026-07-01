import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const record = await pb.collection('orders').getOne(orderId, { $autoCancel: false });
        setOrder(record);
        setStatus(record.fulfillmentStatus || 'Pending');
        setNotes(record.notes || '');
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Order not found');
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await pb.collection('orders').update(orderId, {
        fulfillmentStatus: status,
        notes: notes
      }, { $autoCancel: false });
      toast.success('Order updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  if (loading) return <div className="py-10 text-center">Loading order details...</div>;
  if (!order) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/orders"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Order {order.orderId || order.id.substring(0, 8)}</h1>
        <Badge variant="outline" className="ml-auto text-sm">{formatDate(order.created)}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.size} • {item.printType}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 space-y-2 text-right">
                <div className="flex justify-end gap-8 text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="w-24">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-end gap-8 text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span className="w-24">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-end gap-8 font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="w-24">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Contact</p>
                <p>{order.customerName || 'Guest'}</p>
                <p>{order.customerEmail}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Shipping Address</p>
                <p>{order.shippingAddress?.line1 || 'No address provided'}</p>
                <p>{order.shippingAddress?.city} {order.shippingAddress?.state} {order.shippingAddress?.postal_code}</p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fulfillment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Production">In Production</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Internal Notes</label>
                <Textarea 
                  placeholder="Add notes about this order..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full flex items-center gap-2">
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration IDs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Stripe Payment ID</p>
                <p className="font-mono bg-muted p-2 rounded break-all">{order.stripePaymentId || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Merchone Order ID</p>
                <p className="font-mono bg-muted p-2 rounded break-all">{order.merchoneOrderId || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;