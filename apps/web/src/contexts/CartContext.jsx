import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('gwp_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('gwp_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        i => i.photoId === item.photoId &&
             i.variantId === item.variantId
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity
        };
        return updated;
      } else {
        return [...prev, { ...item, id: Date.now().toString() }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShipping = () => {
    // Use real MerchOne shipping from first item
    // Additional items add $2.90 each per MerchOne pricing
    if (cartItems.length === 0) return 0;
    const firstItem = cartItems[0];
    const firstShipping = firstItem.shipping || 15.90;
    const additionalItems = cartItems.reduce((total, item, index) => {
      if (index === 0) return total + (item.quantity - 1) * 2.90;
      return total + item.quantity * 2.90;
    }, 0);
    return firstShipping + additionalItems;
  };

  const getTotal = () => {
    return getSubtotal() + getShipping();
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getShipping,
    getTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};