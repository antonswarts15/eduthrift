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
  quantity?: number;
}

interface CartStore {
  cartItems: CartItem[];
  addToCart: (item: CartItem, showToast?: (message: string, color?: 'success' | 'warning' | 'danger') => void) => void;
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

    // Check if item already exists in cart
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      showToast?.(`${item.name} is already in your cart!`, 'warning');
      return;
    }

    set({ cartItems: [...cartItems, item] });
    showToast?.(`${item.name} is added to cart!`, 'success');
  },

  removeFromCart: (id: string, onInventoryUpdate?: (id: string) => void) => {
    set((state) => ({
      cartItems: state.cartItems.filter(item => item.id !== id)
    }));
    onInventoryUpdate?.(id);
  },

  clearCart: () => set({ cartItems: [] }),

  getCartItemCount: () => get().cartItems.length
    }),
    {
      name: 'eduthrift-cart', // localStorage key
    }
  )
);
