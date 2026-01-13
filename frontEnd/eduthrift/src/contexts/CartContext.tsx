import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  condition: number;
  school: string;
  size: string;
  gender: string;
  category: string;
  subcategory?: string;
  sport?: string;
  frontPhoto: string;
  backPhoto: string;
  quantity?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem, showToast?: (message: string, color?: 'success' | 'warning' | 'danger') => void) => void;
  removeFromCart: (id: string, onInventoryUpdate?: (id: string) => void) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem, showToast?: (message: string, color?: 'success' | 'warning' | 'danger') => void) => {
    // Check if item already exists in cart
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      showToast?.(`${item.name} is already in your cart!`, 'warning');
      return;
    }
    
    setCartItems(prev => [...prev, item]);
    showToast?.(`${item.name} is added to cart!`, 'success');
  };

  const removeFromCart = (id: string, onInventoryUpdate?: (id: string) => void) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    onInventoryUpdate?.(id);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartItemCount = () => {
    return cartItems.length;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      getCartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};