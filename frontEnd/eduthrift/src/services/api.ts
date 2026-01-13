import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User API
export const userApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData: any) => api.put('/auth/profile', profileData),
  
  uploadIdDocument: (file: File) => {
    const formData = new FormData();
    formData.append('idDocument', file);
    return api.post('/auth/upload-id-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadProofOfResidence: (file: File) => {
    const formData = new FormData();
    formData.append('proofOfResidence', file);
    return api.post('/auth/upload-proof-of-residence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (item: any) => api.post('/wishlist', item),
  removeFromWishlist: (id: string) => api.delete(`/wishlist/${id}`),
};

// Notifications API
export const notificationsApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

// Items API
export const itemsApi = {
  createItem: (item: any) => api.post('/items', item),
  updateItem: (id: string, item: any) => api.put(`/items/${id}`, item),
  deleteItem: (id: string) => api.delete(`/items/${id}`),
  getItems: (filters: any) => api.get('/items', { params: filters }),
};

// Orders API
export const ordersApi = {
  createOrder: (order: any) => api.post('/orders', order),
  getOrders: () => api.get('/orders'),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
};

export default api;