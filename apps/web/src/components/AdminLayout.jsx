import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Layers, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Button } from '@/components/ui/button';

const AdminLayout = () => {
  const { logout, currentAdmin } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Collections', path: '/admin/collections', icon: Layers },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-[hsl(var(--admin-sidebar-foreground))]">Admin Panel</h2>
        <p className="text-sm text-[hsl(var(--admin-sidebar-foreground))]/60 mt-1">{currentAdmin?.name || 'Administrator'}</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-[hsl(var(--admin-sidebar-foreground))]/80 hover:bg-white/10 hover:text-[hsl(var(--admin-sidebar-foreground))]'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-[hsl(var(--admin-sidebar-foreground))]/80 hover:bg-white/10 hover:text-[hsl(var(--admin-sidebar-foreground))] transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[hsl(var(--admin-background))] admin-layout font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[hsl(var(--admin-sidebar))] shadow-xl z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[hsl(var(--admin-sidebar))] flex items-center justify-between px-4 z-30">
        <h2 className="text-lg font-bold text-[hsl(var(--admin-sidebar-foreground))]">Admin Panel</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-[hsl(var(--admin-sidebar-foreground))]">
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-[hsl(var(--admin-sidebar))] pt-16">
          <SidebarContent />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0 bg-white text-slate-900">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;