import { create } from 'zustand';
import api from '../services/api';

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
  isLoading: boolean;
  error: string | null;
  addListing: (listing: Omit<Listing, 'expiryDate'>, checkWishlist?: (listing: Listing) => void) => Promise<void>;
  fetchListings: (userLocation?: string) => Promise<void>;
  updateListing: (id: string, listing: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  getListingById: (id: string) => Listing | undefined;
  relistItem: (id: string) => void;
  getExpiredListings: () => Listing[];
  getListingsNearExpiry: () => Listing[];
  getDaysUntilExpiry: (listing: Listing) => number;
}

const initialListings: Listing[] = [
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
  },
  {
    id: '14',
    name: 'Club T-Shirt',
    description: 'Tennis club t-shirt in excellent condition',
    price: 95,
    condition: 2,
    school: 'Parkview Tennis Club',
    size: 'M',
    gender: 'Unisex',
    category: 'Club clothing',
    subcategory: 'Club clothing',
    frontPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEU0NEFEIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DbHViIFNoaXJ0PC90ZXh0Pjwvc3ZnPg==',
    backPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEU0NEFEIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DbHViIFNoaXJ0PC90ZXh0Pjwvc3ZnPg==',
    dateCreated: '2024-01-02',
    quantity: 2,
    expiryDate: '2024-02-02'
  },
  {
    id: '15',
    name: 'Running Shoes',
    description: 'Nike running shoes, lightly used',
    price: 450,
    condition: 2,
    school: '',
    size: '9',
    gender: 'Unisex',
    category: 'Training wear',
    subcategory: 'Training wear',
    frontPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjM5QzEyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaG9lcyBGcm9udDwvdGV4dD48L3N2Zz4=',
    backPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjM5QzEyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaG9lcyBCYWNrPC90ZXh0Pjwvc3ZnPg==',
    dateCreated: '2024-01-01',
    quantity: 1,
    expiryDate: '2024-02-01'
  },
  {
    id: '16',
    name: 'School Backpack',
    description: 'Durable school backpack with multiple compartments',
    price: 280,
    condition: 3,
    school: '',
    size: 'Large',
    gender: 'Unisex',
    category: 'Belts, bags & shoes',
    subcategory: 'Bags',
    frontPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUFCQzlDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYWNrcGFjayBGcm9udDwvdGV4dD48L3N2Zz4=',
    backPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUFCQzlDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYWNrcGFjayBCYWNrPC90ZXh0Pjwvc3ZnPg==',
    dateCreated: '2023-12-30',
    quantity: 1,
    expiryDate: '2024-01-30'
  },
  {
    id: '17',
    name: 'Grade 10 Mathematics Textbook',
    description: 'CAPS curriculum mathematics textbook, like new',
    price: 180,
    condition: 2,
    school: '',
    size: 'Standard',
    gender: 'Unisex',
    category: 'Textbooks',
    subcategory: 'FET Phase',
    frontPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjk4MEI5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NYXRocyBCb29rPC90ZXh0Pjwvc3ZnPg==',
    backPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjk4MEI5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NYXRocyBCb29rPC90ZXh0Pjwvc3ZnPg==',
    dateCreated: '2023-12-29',
    quantity: 2,
    expiryDate: '2024-01-29'
  },
  {
    id: '18',
    name: 'Matric Dance Suit',
    description: 'Elegant black suit for matric dance, worn once',
    price: 850,
    condition: 1,
    school: '',
    size: 'L',
    gender: 'Boy',
    category: 'Matric dance clothing',
    subcategory: 'Matric dance clothing',
    frontPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUMwQjQzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TdWl0IEZyb250PC90ZXh0Pjwvc3ZnPg==',
    backPhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUMwQjQzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TdWl0IEJhY2s8L3RleHQ+PC9zdmc+',
    dateCreated: '2023-12-28',
    quantity: 1,
    expiryDate: '2024-01-28'
  }
];

export const useListingsStore = create<ListingsStore>((set, get) => ({
  listings: initialListings,
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

      // Convert backend format to frontend format
      const listings: Listing[] = items.map((item: any) => ({
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
        frontPhoto: item.front_photo || '',
        backPhoto: item.back_photo || '',
        dateCreated: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        quantity: item.quantity || 1,
        soldOut: item.sold_out || item.quantity === 0 || item.status === 'sold',
        expiryDate: item.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isExpired: item.is_expired || false,
        // Location info for display
        sellerLocation: item.seller_town && item.seller_province ? `${item.seller_town}, ${item.seller_province}` : undefined,
        locationPriority: item.location_priority || 3
      }));

      set({ listings, isLoading: false });
    } catch (error) {
      console.error('Error fetching listings:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch listings', isLoading: false });
    }
  },

  addListing: async (listing: Omit<Listing, 'expiryDate'>, checkWishlist?: (listing: Listing) => void) => {
    try {
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
        front_photo: listing.frontPhoto,
        back_photo: listing.backPhoto,
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
          expiryDate: expiryDate.toISOString().split('T')[0]
        };

        // Add to local state
        set((state) => ({ listings: [listingWithExpiry, ...state.listings] }));

        // Check for wishlist matches
        if (checkWishlist) {
          checkWishlist(listingWithExpiry);
        }

        console.log('Item successfully added to backend:', response.data);
      }
    } catch (error) {
      console.error('Error adding listing to backend:', error);

      // Fallback: add to local state even if backend fails
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      const listingWithExpiry: Listing = {
        ...listing,
        expiryDate: expiryDate.toISOString().split('T')[0]
      };

      set((state) => ({ listings: [listingWithExpiry, ...state.listings] }));

      if (checkWishlist) {
        checkWishlist(listingWithExpiry);
      }
    }
  },

  updateListing: (id: string, updatedListing: Partial<Listing>) => {
    set((state) => ({
      listings: state.listings.map(listing =>
        listing.id === id ? { ...listing, ...updatedListing } : listing
      )
    }));
  },

  deleteListing: (id: string) => {
    set((state) => ({
      listings: state.listings.filter(listing => listing.id !== id)
    }));
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
    const listings = get().listings;
    return listings.filter(listing => {
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
