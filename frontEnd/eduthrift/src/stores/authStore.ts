import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('authToken'),
  isAuthenticated: localStorage.getItem('isLoggedIn') === 'true',

  login: (token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('isLoggedIn', 'true');
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.setItem('isLoggedIn', 'false');
    set({ token: null, isAuthenticated: false });
  }
}));
