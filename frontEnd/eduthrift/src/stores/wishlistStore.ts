import { create } from 'zustand';
import { wishlistApi } from '../services/api';

export interface WishlistItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  sport?: string;
  school?: string;
  size?: string;
  gender?: string;
  maxPrice?: number;
  dateAdded: string;
  notifyWhenAvailable: boolean;
}

interface WishlistStore {
  wishlistItems: WishlistItem[];
  loadWishlist: () => Promise<void>;
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'dateAdded'>) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  checkForMatches: (newListing: any, addNotification: (title: string, message: string) => void) => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  wishlistItems: [],

  loadWishlist: async () => {
    try {
      const response = await wishlistApi.getWishlist();
      const items = response.data.map((item: any) => ({
        id: item.id.toString(),
        name: item.item_name,
        category: item.category,
        subcategory: item.subcategory,
        sport: item.sport,
        school: item.school_name,
        size: item.size,
        gender: item.gender,
        maxPrice: item.max_price,
        dateAdded: item.created_at,
        notifyWhenAvailable: item.notify_when_available
      }));
      set({ wishlistItems: items });
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  },

  addToWishlist: async (item: Omit<WishlistItem, 'id' | 'dateAdded'>) => {
    try {
      const response = await wishlistApi.addToWishlist({
        item_name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        sport: item.sport,
        school_name: item.school,
        size: item.size,
        gender: item.gender,
        max_price: item.maxPrice,
        notify_when_available: item.notifyWhenAvailable
      });

      const newItem: WishlistItem = {
        ...item,
        id: response.data.id.toString(),
        dateAdded: new Date().toISOString()
      };
      set((state) => ({ wishlistItems: [...state.wishlistItems, newItem] }));
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  },

  removeFromWishlist: async (id: string) => {
    try {
      await wishlistApi.removeFromWishlist(id);
      set((state) => ({
        wishlistItems: state.wishlistItems.filter(item => item.id !== id)
      }));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  },

  checkForMatches: (newListing: any, addNotification: (title: string, message: string) => void) => {
    const { wishlistItems } = get();
    wishlistItems.forEach(wishItem => {
      if (!wishItem.notifyWhenAvailable) return;

      const matches =
        wishItem.name.toLowerCase() === newListing.name.toLowerCase() &&
        wishItem.category === newListing.category &&
        (!wishItem.subcategory || wishItem.subcategory === newListing.subcategory) &&
        (!wishItem.sport || wishItem.sport === newListing.sport) &&
        (!wishItem.school || wishItem.school === newListing.school) &&
        (!wishItem.size || wishItem.size === newListing.size) &&
        (!wishItem.gender || wishItem.gender === newListing.gender) &&
        (!wishItem.maxPrice || newListing.price <= wishItem.maxPrice);

      if (matches) {
        addNotification(
          'Wishlist Item Available!',
          `${newListing.name} is now available for R${newListing.price}`
        );
      }
    });
  }
}));
