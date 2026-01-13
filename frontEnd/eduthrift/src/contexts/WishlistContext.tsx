import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationContext';
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

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'dateAdded'>) => void;
  removeFromWishlist: (id: string) => void;
  checkForMatches: (newListing: any) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
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
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const addToWishlist = async (item: Omit<WishlistItem, 'id' | 'dateAdded'>) => {
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
      setWishlistItems(prev => [...prev, newItem]);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (id: string) => {
    try {
      await wishlistApi.removeFromWishlist(id);
      setWishlistItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  };

  const checkForMatches = (newListing: any) => {
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
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      checkForMatches
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};