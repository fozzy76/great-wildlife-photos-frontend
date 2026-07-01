import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Edit, Trash2, RefreshCw, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [photoFormData, setPhotoFormData] = useState({
    title: '',
    category: 'Safari',
    description: '',
    price: '',
    merchone_image_id: '',
    photo: null
  });

  useEffect(() => {
    fetchPhotos();
    fetchOrders();
  }, []);

  const fetchPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const result = await pb.collection('photos').getList(1, 50, {
        sort: '-created',
        $autoCancel: false
      });
      setPhotos(result.items);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const result = await pb.collection('orders').getList(1, 50, {
        sort: '-created',
        $autoCancel: false
      });
      setOrders(result.items);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handlePhotoFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setPhotoFormData(prev => ({ ...prev, photo: files[0] }));
    } else {
      setPhotoFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('photo', photoFormData.photo);
      formData.append('title', photoFormData.title);
      formData.append('category', photoFormData.category);
      formData.append('description', photoFormData.description);
      formData.append('merchone_image_id', photoFormData.merchone_image_id);

      const response = await apiServerClient.fetch('/photos/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Create photo record in PocketBase
      await pb.collection('photos').create({
        title: photoFormData.title,
        category: photoFormData.category,
        description: photoFormData.description,
        price: parseFloat(photoFormData.price),
        merchone_image_id: photoFormData.merchone_image_id,
        photo_url: data.photo_url
      }, { $autoCancel: false });

      toast.success('Photo uploaded successfully');
      setUploadModalOpen(false);
      setPhotoFormData({
        title: '',
        category: 'Safari',
        description: '',
        price: '',
        merchone_image_id: '',
        photo: null
      });
      fetchPhotos();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return;

    try {
      await pb.collection('photos').delete(photoId, { $autoCancel: false });
      toast.success('Photo deleted');
      fetchPhotos();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    }
  };

  const handleCheckOrderStatus = async (orderId) => {
    try {
      const response = await apiServerClient.fetch(`/orders-admin/check-status/${orderId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to check status');
      }

      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Status check error:', error);
      toast.error('Failed to check order status');
    }
  };

  const handleExportOrders = async () => {
    try {
      const response = await apiServerClient.fetch('/orders-admin/export');

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Orders exported');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders');
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Great Wildlife Photos</title>
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage photos and orders</p>
        </div>

        {/* Photo Management */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Photo management</h2>
            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="mr-2 w-4 h-4" />
                  Upload new photo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload new photo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUploadPhoto} className="space-y-4">
                  <div>
                    <Label htmlFor="photo">Photo file</Label>
                    <Input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFormChange}
                      required
                      className="mt-2"
                      disabled={uploadLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      value={photoFormData.title}
                      onChange={handlePhotoFormChange}
                      required
                      className="mt-2 bg-white text-gray-900 placeholder:text-gray-500"
                      disabled={uploadLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={photoFormData.category}
                      onValueChange={(value) => setPhotoFormData(prev => ({ ...prev, category: value }))}
                      disabled={uploadLoading}
                    >
                      <SelectTrigger className="mt-2 bg-white text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Safari">Safari</SelectItem>
                        <SelectItem value="Birds">Birds</SelectItem>
                        <SelectItem value="Marine">Marine</SelectItem>
                        <SelectItem value="Landscapes">Landscapes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={photoFormData.price}
                      onChange={handlePhotoFormChange}
                      required
                      className="mt-2 bg-white text-gray-900 placeholder:text-gray-500"
                      disabled={uploadLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="merchone_image_id">MerchOne image ID</Label>
                    <Input
                      id="merchone_image_id"
                      name="merchone_image_id"
                      type="text"
                      value={photoFormData.merchone_image_id}
                      onChange={handlePhotoFormChange}
                      className="mt-2 bg-white text-gray-900 placeholder:text-gray-500"
                      disabled={uploadLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={photoFormData.description}
                      onChange={handlePhotoFormChange}
                      rows={4}
                      className="mt-2 bg-white text-gray-900 placeholder:text-gray-500"
                      disabled={uploadLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={uploadLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload photo'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingPhotos ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Photo</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {photos.map(photo => (
                      <tr key={photo.id}>
                        <td className="px-6 py-4">
                          <img
                            src={photo.photo_url || 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'}
                            alt={photo.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium">{photo.title}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{photo.category}</td>
                        <td className="px-6 py-4 font-semibold text-primary">${photo.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Order Management */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Order management</h2>
            <Button
              onClick={handleExportOrders}
              variant="outline"
              className="transition-all duration-200"
            >
              <Download className="mr-2 w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Order #</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 font-medium">{order.external_id || order.id.slice(0, 8)}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary">
                          ${order.total?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(order.created).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCheckOrderStatus(order.id)}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default AdminDashboard;