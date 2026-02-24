import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

// Handle 401/403 responses (expired/invalid token)
// Only redirect if the user was previously logged in (prevents guest redirect loops)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isLoginOrRegister = requestUrl === '/auth/login' || requestUrl === '/auth/register';
    const wasLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoginOrRegister && wasLoggedIn && (error.response?.status === 403 || error.response?.status === 401)) {
      localStorage.removeItem('authToken');
      localStorage.setItem('isLoggedIn', 'false');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User API
export const userApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData: any) => api.put('/auth/profile', profileData),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
  
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
  getItem: (id: string) => api.get(`/items/${id}`),
  getItems: (filters: any) => api.get('/items', { params: filters }),
  getMyItems: (params?: Record<string, string>) => api.get('/items/mine', { params }),
};

// Orders API
export const ordersApi = {
  createOrder: (order: any) => api.post('/orders', order),
  getOrders: () => api.get('/orders'),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
};

// Admin API
export const adminApi = {
  getPendingSellers: () => api.get('/admin/sellers/pending'),
  verifySeller: (id: string) => api.put(`/admin/sellers/${id}/verify`),
  rejectSeller: (id: string) => api.put(`/admin/sellers/${id}/reject`),
  getUsers: (params?: Record<string, string>) => api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { userType: role }),
  resetPassword: (id: string) => api.put(`/admin/users/${id}/reset-password`),
  suspendUser: (id: string) => api.put(`/admin/users/${id}/suspend`),
  reactivateUser: (id: string) => api.put(`/admin/users/${id}/reactivate`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

export default api;