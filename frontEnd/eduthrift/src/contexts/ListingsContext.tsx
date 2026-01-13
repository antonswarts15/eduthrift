import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

interface ListingsContextType {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'expiryDate'>, checkWishlist?: (listing: Listing) => void) => void;
  updateListing: (id: string, listing: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  getListingById: (id: string) => Listing | undefined;
  relistItem: (id: string) => void;
  getExpiredListings: () => Listing[];
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
};

interface ListingsProviderProps {
  children: ReactNode;
}

export const ListingsProvider: React.FC<ListingsProviderProps> = ({ children }) => {
  const [listings, setListings] = useState<Listing[]>([
    {
      id: '1',
      name: 'School Uniform Long Sleeve Shirt',
      description: 'White long sleeve school shirt in excellent condition',
      price: 85,
      condition: 2,
      school: 'Greenwood Primary School',
      size: 'Medium',
      gender: 'Boy',
      category: 'School & sport uniform',
      subcategory: 'School Uniform',
      frontPhoto: 'Front Photo',
      backPhoto: 'Back Photo',
      dateCreated: '2024-01-15',
      quantity: 3,
      expiryDate: '2024-02-15'
    },
    {
      id: '2',
      name: 'School Uniform Long Sleeve Shirt',
      description: 'White long sleeve school shirt, like new',
      price: 90,
      condition: 2,
      school: 'Riverside High School',
      size: 'Large',
      gender: 'Boy',
      category: 'School & sport uniform',
      subcategory: 'School Uniform',
      frontPhoto: 'Front Photo',
      backPhoto: 'Back Photo',
      dateCreated: '2024-01-14',
      quantity: 1,
      expiryDate: '2024-02-14'
    },
    {
      id: '3',
      name: 'School Uniform Long Sleeve Shirt',
      description: 'White long sleeve school shirt, sold out',
      price: 80,
      condition: 3,
      school: 'Kempton Park High',
      size: 'Small',
      gender: 'Boy',
      category: 'School & sport uniform',
      subcategory: 'School Uniform',
      frontPhoto: 'Front Photo',
      backPhoto: 'Back Photo',
      dateCreated: '2024-01-12',
      quantity: 0,
      soldOut: true,
      expiryDate: '2024-02-12'
    },
    {
      id: '4',
      name: 'Rugby Ball',
      description: 'Official size 5 rugby ball in good condition',
      price: 65,
      condition: 2,
      school: 'Norkem Park Primary',
      size: 'Size 5',
      gender: 'Unisex',
      category: 'Sports equipment',
      subcategory: 'Equipment',
      sport: 'Rugby',
      frontPhoto: 'Front Photo',
      backPhoto: 'Back Photo',
      dateCreated: '2024-01-13',
      quantity: 2,
      expiryDate: '2024-02-13'
    },
    {
      id: '5',
      name: 'Rugby Ball',
      description: 'Official size 4 rugby ball for youth',
      price: 55,
      condition: 1,
      school: 'Edenglen High School',
      size: 'Size 4',
      gender: 'Unisex',
      category: 'Sports equipment',
      subcategory: 'Equipment',
      sport: 'Rugby',
      frontPhoto: 'Front Photo',
      backPhoto: 'Back Photo',
      dateCreated: '2024-01-11',
      quantity: 1,
      expiryDate: '2024-02-11'
    },
    {
      id: '6',
      name: 'Football',
      description: 'Official size 5 football in good condition',
      price: 45,
      condition: 2,
      school: 'Greenwood Primary School',
      size: 'Size 5',
      gender: 'Unisex',
      category: 'Sports equipment',
      subcategory: 'Equipment',
      sport: 'Football',
      frontPhoto: 'Front Photo',
      backPhoto: 'Back Photo',
      dateCreated: '2024-01-10',
      quantity: 2,
      expiryDate: '2024-02-10'
    },
    {
      id: '7',
      name: 'Netball',
      description: 'Official netball in excellent condition',
      price: 40,
      condition: 1,
      school: 'Riverside High School',
      size: 'Standard',
      gender: 'Unisex',
      category: 'Sports equipment',
      subcategory: 'Equipment',
      sport: 'Netball',
      frontPhoto: 'Front Photo',
      backPhoto: 'Back Photo',
      dateCreated: '2024-01-09',
      quantity: 3,
      expiryDate: '2024-02-09'
    },
    {
      id: '8',
      name: 'Hockey Stick',
      description: 'Field hockey stick in good condition',
      price: 150,
      condition: 3,
      school: 'Kempton Park High',
      size: '36 inch',
      gender: 'Unisex',
      category: 'Sports equipment',
      subcategory: 'Equipment',
      sport: 'Hockey',
      frontPhoto: 'Front Photo',
      backPhoto: 'Back Photo',
      dateCreated: '2024-01-08',
      quantity: 1,
      expiryDate: '2024-02-08'
    },
    {
      id: '9',
      name: 'Rugby Jersey',
      description: 'Team rugby jersey in good condition',
      price: 120,
      condition: 2,
      school: 'Greenwood Primary School',
      size: 'M',
      gender: 'Unisex',
      category: 'School & sport uniform',
      subcategory: 'Sports Uniform',
      sport: 'Rugby',
      frontPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM0Y1MUI1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5KZXJzZXkgRnJvbnQ8L3RleHQ+PC9zdmc+',
      backPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM0Y1MUI1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5KZXJzZXkgQmFjazwvdGV4dD48L3N2Zz4=',
      dateCreated: '2024-01-07',
      quantity: 4,
      expiryDate: '2024-02-07'
    },
    {
      id: '10',
      name: 'Rugby Shorts',
      description: 'Team rugby shorts in excellent condition',
      price: 80,
      condition: 1,
      school: 'Greenwood Primary School',
      size: 'L',
      gender: 'Unisex',
      category: 'School & sport uniform',
      subcategory: 'Sports Uniform',
      sport: 'Rugby',
      frontPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTc0QzNDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaG9ydHMgRnJvbnQ8L3RleHQ+PC9zdmc+',
      backPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTc0QzNDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaG9ydHMgQmFjazwvdGV4dD48L3N2Zz4=',
      dateCreated: '2024-01-06',
      quantity: 2,
      expiryDate: '2024-02-06'
    },
    {
      id: '11',
      name: 'Rugby Socks',
      description: 'Team rugby socks, like new',
      price: 25,
      condition: 2,
      school: 'Greenwood Primary School',
      size: 'L',
      gender: 'Unisex',
      category: 'School & sport uniform',
      subcategory: 'Sports Uniform',
      sport: 'Rugby',
      frontPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjdBRTYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Tb2NrcyBGcm9udDwvdGV4dD48L3N2Zz4=',
      backPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjdBRTYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Tb2NrcyBCYWNrPC90ZXh0Pjwvc3ZnPg==',
      dateCreated: '2024-01-05',
      quantity: 6,
      expiryDate: '2024-02-05'
    },
    {
      id: '12',
      name: 'HB Pencils',
      description: 'Pack of HB pencils in good condition',
      price: 15,
      condition: 2,
      school: '',
      size: 'Standard',
      gender: 'Unisex',
      category: 'Stationery',
      subcategory: 'Stationery',
      frontPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM0Y1MUI1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QZW5jaWxzIEZyb250PC90ZXh0Pjwvc3ZnPg==',
      backPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM0Y1MUI1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QZW5jaWxzIEJhY2s8L3RleHQ+PC9zdmc+',
      dateCreated: '2024-01-04',
      quantity: 3,
      expiryDate: '2024-02-04'
    },
    {
      id: '13',
      name: 'A4 exercise books (72-page)',
      description: 'A4 exercise books, brand new',
      price: 25,
      condition: 1,
      school: '',
      size: 'Standard',
      gender: 'Unisex',
      category: 'Stationery',
      subcategory: 'Stationery',
      frontPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTc0QzNDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Cb29rIEZyb250PC90ZXh0Pjwvc3ZnPg==',
      backPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTc0QzNDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Cb29rIEJhY2s8L3RleHQ+PC9zdmc+',
      dateCreated: '2024-01-03',
      quantity: 5,
      expiryDate: '2024-02-03'
    }
  ]);

  const addListing = (listing: Omit<Listing, 'expiryDate'>, checkWishlist?: (listing: Listing) => void) => {
    const listingWithExpiry: Listing = {
      ...listing,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    };
    setListings(prev => [listingWithExpiry, ...prev]);
    
    // Check for wishlist matches
    if (checkWishlist) {
      checkWishlist(listingWithExpiry);
    }
  };

  const updateListing = (id: string, updatedListing: Partial<Listing>) => {
    setListings(prev => prev.map(listing => 
      listing.id === id ? { ...listing, ...updatedListing } : listing
    ));
  };

  const deleteListing = (id: string) => {
    setListings(prev => prev.filter(listing => listing.id !== id));
  };

  const decreaseQuantity = (id: string) => {
    setListings(prev => prev.map(listing => {
      if (listing.id === id && listing.quantity > 0) {
        const newQuantity = listing.quantity - 1;
        return { 
          ...listing, 
          quantity: newQuantity,
          soldOut: newQuantity === 0
        };
      }
      return listing;
    }));
  };

  const getListingById = (id: string) => {
    return listings.find(listing => listing.id === id);
  };

  const relistItem = (id: string) => {
    setListings(prev => prev.map(listing => 
      listing.id === id ? {
        ...listing,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isExpired: false
      } : listing
    ));
  };

  const getExpiredListings = () => {
    const today = new Date().toISOString().split('T')[0];
    return listings.filter(listing => listing.expiryDate < today);
  };

  return (
    <ListingsContext.Provider value={{
      listings,
      addListing,
      updateListing,
      deleteListing,
      decreaseQuantity,
      getListingById,
      relistItem,
      getExpiredListings
    }}>
      {children}
    </ListingsContext.Provider>
  );
};