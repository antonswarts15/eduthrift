import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isLoggedIn } from '../utils/auth';
import { useAuthPromptStore } from './authPromptStore';

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
  quantity?: number;         // stock available
  selectedQuantity?: number; // how many the buyer wants (defaults to 1)
  sellerId?: string;
  sellerAlias?: string;
  largeItem?: boolean;
  addedAt?: number; // timestamp for cart expiry
}

interface CartStore {
  cartItems: CartItem[];
  addToCart: (item: CartItem, showToast?: (message: string, color?: 'success' | 'warning' | 'danger') => void) => void;
  updateQuantity: (id: string, selectedQuantity: number) => void;
  removeFromCart: (id: string, onInventoryUpdate?: (id: string) => void) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],

  addToCart: (item: CartItem, showToast?: (message: string, color?: 'success' | 'warning' | 'danger') => void) => {
    if (!isLoggedIn()) {
      useAuthPromptStore.getState().showPrompt('add items to your cart');
      return;
    }

    const { cartItems } = get();

    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      const newQty = item.selectedQuantity ?? 1;
      set({
        cartItems: cartItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, selectedQuantity: newQty }
            : cartItem
        )
      });
      showToast?.(`${item.name} quantity updated to ${newQty}!`, 'success');
      return;
    }

    set({ cartItems: [...cartItems, { ...item, selectedQuantity: item.selectedQuantity ?? 1 }] });
    showToast?.(`${item.name} added to cart!`, 'success');
  },

  updateQuantity: (id: string, selectedQuantity: number) => {
    set((state) => ({
      cartItems: state.cartItems.map(item =>
        item.id === id ? { ...item, selectedQuantity } : item
      )
    }));
  },

  removeFromCart: (id: string, onInventoryUpdate?: (id: string) => void) => {
    set((state) => ({
      cartItems: state.cartItems.filter(item => item.id !== id)
    }));
    onInventoryUpdate?.(id);
  },

  clearCart: () => set({ cartItems: [] }),

  getCartItemCount: () => get().cartItems.reduce((sum, item) => sum + (item.selectedQuantity ?? 1), 0)
    }),
    {
      name: 'eduthrift-cart', // localStorage key
    }
  )
);
