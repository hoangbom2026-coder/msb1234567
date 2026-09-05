import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

// Định nghĩa kiểu cho thông tin người dùng
export interface User {
  id: string;
  phone: string;
  money: number;
  balance?: number;
  role: 'user' | 'admin';
  status: number;
  username?: string;
  fullName?: string;
  avatar?: string;
  level?: number;
  vip?: number;
  inviteCode?: string;
  todayBet?: number;
  todayWin?: number;
  todayProfit?: number;
}

// Định nghĩa kiểu cho trạng thái của auth store
interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (phone: any, password: any) => Promise<void>;
  // Update register to accept invite code, fullName, and username
  register: (phone: any, password: any, invite?: string, fullName?: string, username?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateMoney: (money: number) => void;
}

// Tạo auth store với persist middleware để lưu trạng thái vào localStorage
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      // Hàm cập nhật thông tin người dùng và trạng thái đăng nhập
      setUser: (user) => set({ user, isLoggedIn: !!user }),

      // Hàm cập nhật token
      setToken: (token) => set({ token }),

      updateMoney: (money: number) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, money } });
        }
      },

      fetchUser: async () => {
        try {
          const res = await api.get('/user/profile');
          if (res.data && res.data.status) {
            const userData = res.data.data;
            // Ensure compatibility between money and balance if needed
            if (userData.money === undefined && userData.balance !== undefined) {
              userData.money = userData.balance;
            }
            set({ user: userData });
          }
        } catch (error) {
          console.error("Fetch user failed:", error);
        }
      },

      login: async (phone, password) => {
        try {
          const response = await api.post('/auth/login', { phone, password });
          const { token, user } = response.data;
          
          set({ user, token, isLoggedIn: true });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          localStorage.setItem('auth_token', token);

        } catch (error: any) {
          console.error("Login failed:", error.response?.data?.message || error.message);
          throw new Error(error.response?.data?.message || 'Đã có lỗi xảy ra khi đăng nhập.');
        }
      },

      // Update register to accept invite code, fullName, and username
      register: async (phone, password, invite, fullName, username) => {
        try {
          const registrationData: { phone: string; password: string; invite?: string; fullName?: string; username?: string } = { phone, password };
          if (invite) registrationData.invite = invite;
          if (fullName) registrationData.fullName = fullName;
          if (username) registrationData.username = username;
          
          await api.post('/auth/register', registrationData);
        } catch (error: any) {
          console.error("Registration failed:", error.response?.data?.message || error.message);
          throw new Error(error.response?.data?.message || 'Đã có lỗi xảy ra khi đăng ký.');
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isLoggedIn: state.isLoggedIn }),
    }
  )
);

// AuthContext cho trường hợp cần dùng Context API thay vì Zustand trực tiếp
const AuthContext = createContext<{ user: User | null; isLoggedIn: boolean } | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, token, fetchUser, updateMoney } = useAuth();
  const [mounted, setMounted] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setMounted(true);
    const localToken = localStorage.getItem('auth_token');
    if (localToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${localToken}`;
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && token) {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
      
      if (!socketRef.current) {
        const socket = io(SOCKET_URL, {
          auth: { token },
          transports: ['polling', 'websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });
        socketRef.current = socket;

        socket.on('connect', () => {
             console.log('Global socket connected for balance updates');
        });

        socket.on('balanceUpdate', (data: any) => {
          console.log('Realtime Balance Update:', data);
          if (data.money !== undefined) {
             updateMoney(parseFloat(data.money));
          } else {
             fetchUser();
          }
        });

        socket.on('forceLogout', (data: any) => {
          console.warn('Forced logout:', data.reason);
          useAuth.getState().logout();
          window.location.href = '/login';
        });
      }
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    return () => {
      // socket disconnect handled in the block above
    };
  }, [isLoggedIn, token, fetchUser, updateMoney]);

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

export const getStoredToken = () => localStorage.getItem('auth_token');
export const getStoredUser = () => {
  const storage = localStorage.getItem('auth-storage');
  if (storage) {
    try {
      return JSON.parse(storage).state?.user as User;
    } catch (e) {
      return null;
    }
  }
  return null;
};
