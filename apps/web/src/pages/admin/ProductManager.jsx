import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, GripVertical, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import AsyncProductImage from '@/components/AsyncProductImage.jsx';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Image Upload State
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    collection: '',
    description: '',
    imageFileId: '',
    merchoneImageId: '',
    base_price: 0,
    isVisible: true,
    featured: false,
    displayOrder: 0
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch up to 500 products directly from PocketBase as requested
      const records = await pb.collection('products').getList(1, 500, {
        expand: 'collection',
        sort: 'displayOrder,-created',
        $autoCancel: false
      });
      setProducts(records.items);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products from the database.');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      const records = await pb.collection('collections').getFullList({ sort: 'name', $autoCancel: false });
      setCollections(records);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, [fetchProducts, fetchCollections]);

  const handleOpenModal = (product = null) => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploading(false);

    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title || '',
        slug: product.slug || '',
        collection: product.collection || '',
        description: product.description || '',
        imageFileId: product.imageFileId || '',
        merchoneImageId: product.merchoneImageId || '',
        base_price: product.base_price || 0,
        isVisible: product.isVisible !== false,
        featured: !!product.featured,
        displayOrder: product.displayOrder || 0
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        slug: '',
        collection: '',
        description: '',
        imageFileId: '',
        merchoneImageId: '',
        base_price: 0,
        isVisible: true,
        featured: false,
        displayOrder: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid format. Please use JPG, PNG, or WEBP.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      let finalFileId = formData.imageFileId;

      // Handle file upload if a new file is selected
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);

        const res = await apiServerClient.fetch('/admin/products/upload', {
          method: 'POST',
          body: uploadData
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to upload image');
        }

        const data = await res.json();
        finalFileId = data.fileId;
      }

      const dataToSave = { 
        ...formData, 
        imageFileId: finalFileId,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };

      if (editingProduct) {
        await pb.collection('products').update(editingProduct.id, dataToSave, { $autoCancel: false });
        toast.success('Product updated successfully');
      } else {
        await pb.collection('products').create(dataToSave, { $autoCancel: false });
        toast.success('Product created successfully');
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await pb.collection('products').delete(id, { $autoCancel: false });
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      await pb.collection('products').update(id, { isVisible: !currentStatus }, { $autoCancel: false });
      setProducts(products.map(p => p.id === id ? { ...p, isVisible: !currentStatus } : p));
      toast.success(`Product ${!currentStatus ? 'visible' : 'hidden'}`);
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    try {
      await pb.collection('products').update(id, { featured: !currentStatus }, { $autoCancel: false });
      setProducts(products.map(p => p.id === id ? { ...p, featured: !currentStatus } : p));
      toast.success(`Product ${!currentStatus ? 'featured' : 'unfeatured'}`);
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Products Database</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchProducts} className="flex items-center gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title, slug, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3 border border-destructive/20">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Image</TableHead>
                <TableHead>ID / Slug</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                      <p>Loading products from database...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    No products found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell><GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-move group-hover:text-muted-foreground" /></TableCell>
                    <TableCell>
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-muted relative border border-border">
                        <AsyncProductImage 
                          fileId={product.imageFileId} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-muted-foreground">{product.id}</span>
                        <span className="text-sm font-medium">{product.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={product.title}>
                      {product.title}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        {product.expand?.collection?.name || 'Uncategorized'}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums font-medium">${product.base_price}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{product.displayOrder || 0}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={product.isVisible !== false} 
                        onCheckedChange={() => toggleVisibility(product.id, product.isVisible !== false)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={!!product.featured} 
                        onCheckedChange={() => toggleFeatured(product.id, !!product.featured)} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)} className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">{editingProduct ? 'Edit Product Record' : 'Create New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Product Title</Label>
                <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Majestic Lion" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input id="slug" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. majestic-lion" />
                <p className="text-xs text-muted-foreground">Leave blank to auto-generate from title</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="collection">Collection</Label>
                <Select value={formData.collection} onValueChange={val => setFormData({...formData, collection: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="base_price">Base Price ($)</Label>
                <Input id="base_price" type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: parseFloat(e.target.value) || 0})} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input id="displayOrder" type="number" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value, 10) || 0})} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="imageFile">Product Image</Label>
                <Input 
                  id="imageFile" 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.webp" 
                  onChange={handleFileChange} 
                />
                <p className="text-xs text-muted-foreground">Max size: 5MB. Formats: JPG, PNG, WEBP.</p>
                
                {filePreview ? (
                  <div className="mt-2 h-40 w-full rounded-xl overflow-hidden border border-border bg-muted">
                    <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                ) : formData.imageFileId ? (
                  <div className="mt-2 h-40 w-full rounded-xl overflow-hidden border border-border bg-muted relative">
                    <AsyncProductImage fileId={formData.imageFileId} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="mt-2 h-40 w-full rounded-xl border border-dashed border-border bg-muted/50 flex items-center justify-center text-muted-foreground text-sm">
                    No image selected
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="merchoneImageId">Merchone Image ID (Optional)</Label>
                <Input id="merchoneImageId" value={formData.merchoneImageId} onChange={e => setFormData({...formData, merchoneImageId: e.target.value})} />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detailed description of the artwork..." />
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-6 pt-4 border-t border-border">
              <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg flex-1">
                <Switch id="isVisible" checked={formData.isVisible} onCheckedChange={val => setFormData({...formData, isVisible: val})} />
                <div className="grid gap-0.5">
                  <Label htmlFor="isVisible" className="cursor-pointer text-base">Visible in Store</Label>
                  <p className="text-xs text-muted-foreground">Allow customers to see and purchase</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg flex-1">
                <Switch id="featured" checked={formData.featured} onCheckedChange={val => setFormData({...formData, featured: val})} />
                <div className="grid gap-0.5">
                  <Label htmlFor="featured" className="cursor-pointer text-base">Featured Product</Label>
                  <p className="text-xs text-muted-foreground">Highlight on homepage and collections</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={uploading}>Cancel</Button>
            <Button onClick={handleSave} disabled={uploading} className="flex items-center gap-2 min-w-[140px]">
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                'Save Product Record'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;