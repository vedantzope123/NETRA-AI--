import { create } from 'zustand';
import { api, UserProfile } from '../api/client';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('netra_user') || 'null'),
  token: localStorage.getItem('netra_token'),
  isAuthenticated: !!localStorage.getItem('netra_token'),
  isLoading: false,

  login: async (email: string, pass: string) => {
    set({ isLoading: true });
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('netra_token', res.access_token);
      
      const userProfile: UserProfile = {
        id: 1,
        email: res.email,
        full_name: res.full_name,
        role: res.role,
        is_active: true,
      };
      localStorage.setItem('netra_user', JSON.stringify(userProfile));
      
      set({
        token: res.access_token,
        user: userProfile,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('netra_token');
    localStorage.removeItem('netra_user');
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  fetchProfile: async () => {
    try {
      const user = await api.getMe();
      localStorage.setItem('netra_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      const existingUser = localStorage.getItem('netra_user');
      const token = localStorage.getItem('netra_token');
      if (existingUser && token) {
        set({ user: JSON.parse(existingUser), isAuthenticated: true });
      } else {
        localStorage.removeItem('netra_token');
        localStorage.removeItem('netra_user');
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));
