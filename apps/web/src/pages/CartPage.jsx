import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, Printer, Package, Camera, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useCart } from '@/contexts/CartContext.jsx';
import SEO from '@/components/SEO.jsx';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getSubtotal, getShipping, getTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <>
        <SEO
          title="Shopping Cart - Great Wildlife Photos"
          description="Your shopping cart for Great Wildlife Photos wildlife photography prints."
          path="/cart"
          robots="noindex,nofollow"
        />
        <div className="min-h-screen bg-background pt-24 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Start exploring our gallery to find beautiful wildlife prints.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/gallery">Browse gallery</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Shopping Cart - Great Wildlife Photos"
        description="Review your selected wildlife photography prints and proceed to checkout."
        path="/cart"
        robots="noindex,nofollow"
      />

      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Shopping cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-card rounded-xl p-6 shadow-lg" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex gap-6">
                    <img
                      src={item.photo_url || 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'}
                      alt={item.title}
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'; }}
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {item.material.charAt(0).toUpperCase() + item.material.slice(1)} • {item.size}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Shipping: ${item.shipping ? item.shipping.toFixed(2) : ', '}
                      </p>
                      <p className="text-lg font-semibold text-primary mb-4">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-lg sticky top-24" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 className="text-xl font-semibold mb-6">Order summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">${getShipping().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/checkout')}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Proceed to checkout
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full mt-3">
                  <Link to="/gallery">Continue shopping</Link>
                </Button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '48px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '40px' }}>
            <h3 style={{ textAlign: 'center', color: 'white', fontSize: '1rem', fontWeight: 600, marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Why buy from Great Wildlife Photos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(var(--primary-rgb, 234,179,8),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Printer size={22} color="rgb(234,179,8)" />
                </div>
                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '8px' }}>Museum-quality printing</h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.6' }}>Every print is produced on premium canvas, metal, or acrylic by MerchOne, a professional fine art print fulfillment partner.</p>
              </div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(var(--primary-rgb, 234,179,8),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Package size={22} color="rgb(234,179,8)" />
                </div>
                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '8px' }}>Carefully packaged</h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.6' }}>Your print ships in protective packaging designed to arrive in perfect condition. Tracking provided on every order.</p>
              </div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(var(--primary-rgb, 234,179,8),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Camera size={22} color="rgb(234,179,8)" />
                </div>
                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '8px' }}>100% authentic</h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.6' }}>Every photograph was captured in the wild by Lynn Starnes. All shots are natural, wild. Never AI-generated. Named Top 25 by the Smithsonian Institution, 2018.</p>
              </div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(var(--primary-rgb, 234,179,8),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CreditCard size={22} color="rgb(234,179,8)" />
                </div>
                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '8px' }}>Secure checkout</h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.6' }}>Payments processed securely by Stripe. Your card details are never stored on our servers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
