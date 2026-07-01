import React, { useState, useEffect } from 'react';
import { Save, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import DataMigrationModal from '@/components/DataMigrationModal.jsx';

const SettingsPage = () => {
  const { currentAdmin } = useAdminAuth();
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  
  const [accountData, setAccountData] = useState({
    email: '',
    oldPassword: '',
    password: '',
    passwordConfirm: ''
  });

  const [storeData, setStoreData] = useState({
    adminEmail: '',
    stripePublishableKey: '',
    stripeSecretKey: '',
    merchoneApiKey: '',
    freeShippingThreshold: 200,
    notifyNewOrders: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const records = await pb.collection('settings').getFullList({ $autoCancel: false });
        if (records.length > 0) {
          const s = records[0];
          setSettingsId(s.id);
          setStoreData({
            adminEmail: s.adminEmail || '',
            stripePublishableKey: s.stripePublishableKey || '',
            stripeSecretKey: s.stripeSecretKey ? '••••••••••••••••••••••••' : '',
            merchoneApiKey: s.merchoneApiKey ? '••••••••••••••••••••••••' : '',
            freeShippingThreshold: s.freeShippingThreshold || 200,
            notifyNewOrders: s.notifyNewOrders !== false
          });
        }
        
        if (currentAdmin) {
          setAccountData(prev => ({ ...prev, email: currentAdmin.email }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [currentAdmin]);

  const handleAccountSave = async (e) => {
    e.preventDefault();
    if (accountData.password && accountData.password !== accountData.passwordConfirm) {
      return toast.error('Passwords do not match');
    }
    
    setSaving(true);
    try {
      const updateData = { email: accountData.email };
      if (accountData.password) {
        updateData.oldPassword = accountData.oldPassword;
        updateData.password = accountData.password;
        updateData.passwordConfirm = accountData.passwordConfirm;
      }
      
      await pb.collection('admins').update(currentAdmin.id, updateData, { $autoCancel: false });
      toast.success('Account updated successfully');
      setAccountData(prev => ({ ...prev, oldPassword: '', password: '', passwordConfirm: '' }));
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account. Check current password.');
    } finally {
      setSaving(false);
    }
  };

  const handleStoreSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = { ...storeData };
      // Don't send masked values back
      if (updateData.stripeSecretKey === '••••••••••••••••••••••••') delete updateData.stripeSecretKey;
      if (updateData.merchoneApiKey === '••••••••••••••••••••••••') delete updateData.merchoneApiKey;

      if (settingsId) {
        await pb.collection('settings').update(settingsId, updateData, { $autoCancel: false });
      } else {
        const newSettings = await pb.collection('settings').create(updateData, { $autoCancel: false });
        setSettingsId(newSettings.id);
      }
      toast.success('Store settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Admin Account</CardTitle>
          <CardDescription>Update your login credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccountSave} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={accountData.email} onChange={e => setAccountData({...accountData, email: e.target.value})} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="oldPassword">Current Password (required for changes)</Label>
              <Input id="oldPassword" type="password" value={accountData.oldPassword} onChange={e => setAccountData({...accountData, oldPassword: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" value={accountData.password} onChange={e => setAccountData({...accountData, password: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="passwordConfirm">Confirm New Password</Label>
                <Input id="passwordConfirm" type="password" value={accountData.passwordConfirm} onChange={e => setAccountData({...accountData, passwordConfirm: e.target.value})} />
              </div>
            </div>
            <Button type="submit" disabled={saving} className="mt-2">
              <Save className="h-4 w-4 mr-2" /> Save Account
            </Button>
          </form>
        </CardContent>
      </Card>

      <form onSubmit={handleStoreSave} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Store Configuration</CardTitle>
            <CardDescription>General settings for your storefront</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="adminEmail">Order Notification Email</Label>
              <Input id="adminEmail" type="email" value={storeData.adminEmail} onChange={e => setStoreData({...storeData, adminEmail: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
              <Input id="freeShippingThreshold" type="number" value={storeData.freeShippingThreshold} onChange={e => setStoreData({...storeData, freeShippingThreshold: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="notifyNewOrders" className="cursor-pointer font-medium">Receive email notifications for new orders</Label>
              <Switch id="notifyNewOrders" checked={storeData.notifyNewOrders} onCheckedChange={val => setStoreData({...storeData, notifyNewOrders: val})} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>API keys for payment and fulfillment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
              <Input id="stripePublishableKey" value={storeData.stripePublishableKey} onChange={e => setStoreData({...storeData, stripePublishableKey: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
              <Input id="stripeSecretKey" type="password" value={storeData.stripeSecretKey} onChange={e => setStoreData({...storeData, stripeSecretKey: e.target.value})} placeholder="Leave blank to keep existing" />
            </div>
            <div className="grid gap-2 pt-4 border-t border-border">
              <Label htmlFor="merchoneApiKey">Merchone API Key</Label>
              <Input id="merchoneApiKey" type="password" value={storeData.merchoneApiKey} onChange={e => setStoreData({...storeData, merchoneApiKey: e.target.value})} placeholder="Leave blank to keep existing" />
            </div>
            <Button type="submit" disabled={saving} className="mt-4">
              <Save className="h-4 w-4 mr-2" /> Save Store Settings
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Migration
          </CardTitle>
          <CardDescription>Synchronize database records and files from the testing environment to production</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">Sync Test to Live</p>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                Pulls all collections, records, and files from the test environment and safely upserts them into the live database.
              </p>
            </div>
            <Button onClick={() => setIsMigrationModalOpen(true)} variant="secondary" className="shrink-0 font-medium">
              Open Migration Tool
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataMigrationModal 
        isOpen={isMigrationModalOpen} 
        onOpenChange={setIsMigrationModalOpen} 
      />
    </div>
  );
};

export default SettingsPage;