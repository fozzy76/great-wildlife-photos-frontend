import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let filterParts = [];
      if (searchTerm) {
        filterParts.push(`(orderId ~ "${searchTerm}" || customerName ~ "${searchTerm}" || customerEmail ~ "${searchTerm}")`);
      }
      if (statusFilter !== 'All') {
        filterParts.push(`fulfillmentStatus = "${statusFilter}"`);
      }
      
      const filter = filterParts.join(' && ');

      const records = await pb.collection('orders').getList(page, 20, {
        filter,
        sort: '-created',
        $autoCancel: false
      });
      setOrders(records.items);
      setTotalPages(records.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, searchTerm, statusFilter]);

  const handleExport = () => {
    if (orders.length === 0) return toast.error('No orders to export');
    
    const headers = ['Order #', 'Date', 'Customer Name', 'Email', 'Items', 'Total', 'Status', 'Stripe ID', 'Merchone ID'];
    const csvRows = [headers.join(',')];
    
    orders.forEach(order => {
      const row = [
        order.orderId || order.id,
        new Date(order.created).toISOString(),
        `"${order.customerName || ''}"`,
        `"${order.customerEmail || ''}"`,
        order.items?.length || 0,
        order.totalAmount || 0,
        order.fulfillmentStatus || 'Pending',
        order.stripePaymentId || '',
        order.merchoneOrderId || ''
      ];
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'In Production': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Shipped': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'Delivered': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const filters = ['All', 'Pending', 'In Production', 'Shipped', 'Delivered'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by order #, name, or email..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <Button 
              key={f} 
              variant={statusFilter === f ? 'default' : 'outline'} 
              size="sm"
              onClick={() => { setStatusFilter(f); setPage(1); }}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">No orders found.</TableCell></TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderId || order.id.substring(0, 8)}</TableCell>
                  <TableCell>{formatDate(order.created)}</TableCell>
                  <TableCell>
                    <div>{order.customerName || 'Guest'}</div>
                    <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                  </TableCell>
                  <TableCell>{order.items?.length || 0}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.fulfillmentStatus)} variant="secondary">
                      {order.fulfillmentStatus || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManager;