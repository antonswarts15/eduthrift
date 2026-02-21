import { create } from 'zustand';
import api, { itemsApi } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface Listing {
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
  dateCreated: string;
  quantity: number;
  soldOut?: boolean;
  expiryDate: string;
  isExpired?: boolean;
  // Location-based fields
  sellerLocation?: string;
  locationPriority?: number;
  // Anti-theft verification documents
  sellerIdDocument?: string;
  sellerProofOfAddress?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

interface ListingsStore {
  listings: Listing[];
  myListings: Listing[];
  isLoading: boolean;
  error: string | null;
  addListing: (listing: Omit<Listing, 'expiryDate'>, checkWishlist?: (listing: Listing) => void) => Promise<void>;
  fetchListings: (userLocation?: string) => Promise<void>;
  fetchMyListings: () => Promise<void>;
  fetchListingById: (id: string) => Promise<Listing | null>;
  updateListing: (id: string, listing: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  decreaseQuantity: (id: string) => void;
  getListingById: (id: string) => Listing | undefined;
  relistItem: (id: string) => void;
  getExpiredListings: () => Listing[];
  getListingsNearExpiry: () => Listing[];
  getDaysUntilExpiry: (listing: Listing) => number;
}

const mapBackendItem = (item: any): Listing => ({
  id: item.id.toString(),
  name: item.item_name || item.name || 'Unknown Item',
  description: item.description || '',
  price: parseFloat(item.price),
  condition: item.condition_grade || 3,
  school: item.school_name || item.club_name || '',
  size: item.size || 'Standard',
  gender: item.gender || 'Unisex',
  category: item.category || '',
  subcategory: item.subcategory || undefined,
  sport: item.sport || undefined,
  frontPhoto: item.front_photo ? (item.front_photo.startsWith('http') || item.front_photo.startsWith('data:') ? item.front_photo : `${API_BASE_URL}${item.front_photo}`) : '',
  backPhoto: item.back_photo ? (item.back_photo.startsWith('http') || item.back_photo.startsWith('data:') ? item.back_photo : `${API_BASE_URL}${item.back_photo}`) : '',
  dateCreated: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
  quantity: item.quantity || 1,
  soldOut: item.sold_out || item.quantity === 0 || item.status === 'sold',
  expiryDate: item.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  isExpired: item.is_expired || false,
  sellerLocation: item.seller_town && item.seller_province ? `${item.seller_town}, ${item.seller_province}` : undefined,
  locationPriority: item.location_priority || 3
});

export const useListingsStore = create<ListingsStore>((set, get) => ({
  listings: [],
  myListings: [],
  isLoading: false,
  error: null,

  // Fetch all listings from backend with location-based search
  fetchListings: async (userLocation?: string) => {
    try {
      set({ isLoading: true, error: null });

      let url = `${API_BASE_URL}/items`;
      if (userLocation) {
        url += `?userLocation=${encodeURIComponent(userLocation)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const items = await response.json();
      const listings: Listing[] = items.map(mapBackendItem);

      set({ listings, isLoading: false });
    } catch (error) {
      console.error('Error fetching listings:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch listings', isLoading: false });
    }
  },

  // Fetch only the current seller's items
  fetchMyListings: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await itemsApi.getMyItems();
      const myListings: Listing[] = response.data.map(mapBackendItem);
      set({ myListings, isLoading: false });
    } catch (error) {
      console.error('Error fetching my listings:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch my listings', isLoading: false });
    }
  },

  // Fetch a single listing from the backend by ID
  fetchListingById: async (id: string) => {
    try {
      const response = await itemsApi.getItem(id);
      const listing = mapBackendItem(response.data);
      // Add to listings array if not already there
      set((state) => {
        const exists = state.listings.some(l => l.id === listing.id);
        return exists ? state : { listings: [...state.listings, listing] };
      });
      return listing;
    } catch (error) {
      console.error('Error fetching listing by ID:', error);
      return null;
    }
  },

  addListing: async (listing: Omit<Listing, 'expiryDate'>, checkWishlist?: (listing: Listing) => void) => {
    try {
      // Upload images first if they are base64 data URLs
      let frontPhotoUrl = listing.frontPhoto;
      let backPhotoUrl = listing.backPhoto;

      if (listing.frontPhoto?.startsWith('data:') || listing.backPhoto?.startsWith('data:')) {
        const formData = new FormData();

        if (listing.frontPhoto?.startsWith('data:')) {
          const frontResp = await fetch(listing.frontPhoto);
          const frontBlob = await frontResp.blob();
          formData.append('images', new File([frontBlob], 'front.jpg', { type: 'image/jpeg' }));
        }
        if (listing.backPhoto?.startsWith('data:')) {
          const backResp = await fetch(listing.backPhoto);
          const backBlob = await backResp.blob();
          formData.append('images', new File([backBlob], 'back.jpg', { type: 'image/jpeg' }));
        }

        const uploadResponse = await api.post('/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const uploadedFiles = uploadResponse.data.files || [];
        if (listing.frontPhoto?.startsWith('data:') && uploadedFiles[0]) {
          frontPhotoUrl = uploadedFiles[0].url;
        }
        if (listing.backPhoto?.startsWith('data:')) {
          const backIndex = listing.frontPhoto?.startsWith('data:') ? 1 : 0;
          if (uploadedFiles[backIndex]) {
            backPhotoUrl = uploadedFiles[backIndex].url;
          }
        }
      }

      // Prepare data for backend
      const itemData = {
        item_name: listing.name,
        name: listing.name,
        category: listing.category,
        subcategory: listing.subcategory,
        sport: listing.sport,
        school_name: listing.school,
        school: listing.school,
        size: listing.size,
        gender: listing.gender,
        condition_grade: listing.condition,
        price: listing.price,
        front_photo: frontPhotoUrl,
        back_photo: backPhotoUrl,
        description: listing.description,
        quantity: listing.quantity || 1
      };

      // Call backend API
      const response = await api.post('/items', itemData);

      if (response.data && response.data.id) {
        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        const listingWithExpiry: Listing = {
          ...listing,
          id: response.data.id.toString(),
          frontPhoto: frontPhotoUrl,
          backPhoto: backPhotoUrl,
          expiryDate: expiryDate.toISOString().split('T')[0]
        };

        // Add to both local state arrays
        set((state) => ({
          listings: [listingWithExpiry, ...state.listings],
          myListings: [listingWithExpiry, ...state.myListings]
        }));

        // Check for wishlist matches
        if (checkWishlist) {
          checkWishlist(listingWithExpiry);
        }
      }
    } catch (error: any) {
      console.error('Error adding listing to backend:', error);
      const message = error.response?.data?.error || 'Failed to list item';
      throw new Error(message);
    }
  },

  updateListing: async (id: string, updatedListing: Partial<Listing>) => {
    try {
      // Map frontend field names to backend field names
      const backendData: Record<string, any> = {};
      if (updatedListing.name !== undefined) backendData.item_name = updatedListing.name;
      if (updatedListing.school !== undefined) backendData.school_name = updatedListing.school;
      if (updatedListing.condition !== undefined) backendData.condition_grade = updatedListing.condition;
      if (updatedListing.price !== undefined) backendData.price = updatedListing.price;
      if (updatedListing.description !== undefined) backendData.description = updatedListing.description;
      if (updatedListing.size !== undefined) backendData.size = updatedListing.size;
      if (updatedListing.gender !== undefined) backendData.gender = updatedListing.gender;
      if (updatedListing.quantity !== undefined) backendData.quantity = updatedListing.quantity;

      await itemsApi.updateItem(id, backendData);

      set((state) => ({
        listings: state.listings.map(listing =>
          listing.id === id ? { ...listing, ...updatedListing } : listing
        ),
        myListings: state.myListings.map(listing =>
          listing.id === id ? { ...listing, ...updatedListing } : listing
        )
      }));
    } catch (error: any) {
      console.error('Error updating listing:', error);
      throw new Error(error.response?.data?.error || 'Failed to update listing');
    }
  },

  deleteListing: async (id: string) => {
    try {
      await itemsApi.deleteItem(id);

      set((state) => ({
        listings: state.listings.filter(listing => listing.id !== id),
        myListings: state.myListings.filter(listing => listing.id !== id)
      }));
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete listing');
    }
  },

  decreaseQuantity: (id: string) => {
    set((state) => ({
      listings: state.listings.map(listing => {
        if (listing.id === id && listing.quantity > 0) {
          const newQuantity = listing.quantity - 1;
          return {
            ...listing,
            quantity: newQuantity,
            soldOut: newQuantity === 0
          };
        }
        return listing;
      })
    }));
  },

  getListingById: (id: string) => {
    return get().listings.find(listing => listing.id === id);
  },

  relistItem: (id: string) => {
    set((state) => ({
      listings: state.listings.map(listing =>
        listing.id === id ? {
          ...listing,
          expiryDate: (() => {
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            return expiryDate.toISOString().split('T')[0];
          })(),
          isExpired: false
        } : listing
      )
    }));
  },

  getExpiredListings: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().listings.filter(listing => listing.expiryDate < today);
  },

  getListingsNearExpiry: () => {
    const myListings = get().myListings;
    return myListings.filter(listing => {
      const daysUntilExpiry = get().getDaysUntilExpiry(listing);
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 20 && !listing.soldOut;
    });
  },

  getDaysUntilExpiry: (listing: Listing) => {
    const today = new Date();
    const expiryDate = new Date(listing.expiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}));
