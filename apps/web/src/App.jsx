import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HomePage from '@/pages/HomePage.jsx';
import GalleryPage from '@/pages/GalleryPage.jsx';
import PhotoDetailPage from '@/pages/PhotoDetailPage.jsx';
import CartPage from '@/pages/CartPage.jsx';
import CheckoutPage from '@/pages/CheckoutPage.jsx';
import OrderReceiptPage from '@/pages/OrderReceiptPage.jsx';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage.jsx';
import ContactPage from '@/pages/ContactPage.jsx';
import AboutPage from '@/pages/AboutPage.jsx';
import FAQPage from '@/pages/FAQPage.jsx';
import PrivacyPage from '@/pages/PrivacyPage.jsx';
import TermsPage from '@/pages/TermsPage.jsx';
import BlogPage from '@/pages/BlogPage.jsx';
import BlogPostPage from '@/pages/BlogPostPage.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { CartProvider } from '@/contexts/CartContext.jsx';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Toaster richColors position="bottom-right" />
          <Routes>
            {/* Standalone routes (no header/footer) */}
            <Route path="/order-receipt" element={<OrderReceiptPage />} />
            {/* Customer Routes */}
            <Route path="*" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex-grow pt-[140px]">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/photo/:slug" element={<PhotoDetailPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/confirmation/:orderId" element={<OrderConfirmationPage />} />
                    <Route path="/order-success" element={<OrderConfirmationPage />} />
                    <Route path="/order-receipt" element={<OrderReceiptPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="*" element={<HomePage />} />
                  </Routes>
                </div>
                <Footer />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;