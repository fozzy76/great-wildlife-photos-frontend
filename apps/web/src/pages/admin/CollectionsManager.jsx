import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const CollectionsManager = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    heroImage: '',
    isVisible: true
  });

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('collections').getFullList({ sort: 'name', $autoCancel: false });
      setCollections(records);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleOpenModal = (collection = null) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        name: collection.name || '',
        description: collection.description || '',
        heroImage: collection.heroImage || '',
        isVisible: collection.isVisible !== false
      });
    } else {
      setEditingCollection(null);
      setFormData({
        name: '',
        description: '',
        heroImage: '',
        isVisible: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingCollection) {
        await pb.collection('collections').update(editingCollection.id, formData, { $autoCancel: false });
        toast.success('Collection updated successfully');
      } else {
        await pb.collection('collections').create({
          ...formData,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }, { $autoCancel: false });
        toast.success('Collection created successfully');
      }
      setIsModalOpen(false);
      fetchCollections();
    } catch (error) {
      console.error('Error saving collection:', error);
      toast.error('Failed to save collection');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this collection? Products in this collection will lose their category.')) {
      try {
        await pb.collection('collections').delete(id, { $autoCancel: false });
        toast.success('Collection deleted');
        fetchCollections();
      } catch (error) {
        console.error('Error deleting collection:', error);
        toast.error('Failed to delete collection');
      }
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      await pb.collection('collections').update(id, { isVisible: !currentStatus }, { $autoCancel: false });
      setCollections(collections.map(c => c.id === id ? { ...c, isVisible: !currentStatus } : c));
      toast.success(`Collection ${!currentStatus ? 'visible' : 'hidden'}`);
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Collection
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hero Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : collections.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">No collections found.</TableCell></TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>
                    <div className="h-12 w-20 rounded overflow-hidden bg-muted">
                      {collection.heroImage ? (
                        <img src={collection.heroImage} alt={collection.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{collection.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{collection.description}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={collection.isVisible !== false} 
                      onCheckedChange={() => toggleVisibility(collection.id, collection.isVisible !== false)} 
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(collection)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(collection.id)}>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCollection ? 'Edit Collection' : 'Add New Collection'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="heroImage">Hero Image URL (Unsplash)</Label>
              <Input id="heroImage" value={formData.heroImage} onChange={e => setFormData({...formData, heroImage: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="isVisible" className="cursor-pointer">Visible in Store</Label>
              <Switch id="isVisible" checked={formData.isVisible} onCheckedChange={val => setFormData({...formData, isVisible: val})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionsManager;