import { createContext, useContext, useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface User {
  id: string;
  phone: string;
  money: number;
  role: string;
  status: number;
  username?: string;
  balance?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (phone: any, password: any) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      setUser: (user) => set({ user, isLoggedIn: !!user }),

      setToken: (token) => set({ token }),

      login: async (phone, password) => {
        try {
          const response = await api.post('/auth/login', { phone, password });
          const { token, user } = response.data;
          
          set({ user, token, isLoggedIn: true });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          localStorage.setItem('admin_auth_token', token);

        } catch (error: any) {
          console.error("Login failed:", error.response?.data?.message || error.message);
          throw new Error(error.response?.data?.message || 'Đã có lỗi xảy ra khi đăng nhập.');
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('admin_auth_token');
        set({ user: null, token: null, isLoggedIn: false });
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isLoggedIn: state.isLoggedIn }),
    }
  )
);

const AuthContext = createContext<{ user: User | null; isLoggedIn: boolean } | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('admin_auth_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};

export const getStoredToken = () => localStorage.getItem('admin_auth_token');
export const getStoredUser = () => {
  const storage = localStorage.getItem('admin-auth-storage');
  if (storage) {
    try {
      return JSON.parse(storage).state?.user as User;
    } catch (e) {
      return null;
    }
  }
  return null;
};
