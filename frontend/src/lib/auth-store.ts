
import { api } from './api';

/**
 * Quản lý trạng thái xác thực và thông tin người dùng đồng bộ với Backend MySQL
 */

export interface User {
  id: string;
  phone: string;
  email?: string;
  created_at?: string;
  money: number;
  role: 'user' | 'admin';
  status: number;
  username?: string;
  fullName?: string;
  avatar?: string;
  level?: number;
  todayBet?: number;
  todayWin?: number;
  todayProfit?: number;
}

export interface BetRecord {
  id: string;
  user_id: string;
  session_id: string;
  bet_type: string;
  bet_amount: number;
  odds: number;
  result: 'win' | 'lose' | 'pending';
  win_amount: number;
  created_at: string;
}

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('auth_user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const updateStoredUser = (user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const logoutUser = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('bet_history');
};

// Hàm fetch profile từ API để cập nhật số dư thực tế
export const refreshUserProfile = async () => {
  try {
    const res = await api.get('/user/profile');
    if (res.data && res.data.status) {
      const userData = res.data.data;
      updateStoredUser(userData);
      return userData;
    }
  } catch (error) {
    console.error("Lỗi cập nhật thông tin user:", error);
  }
  return null;
};

export const getBetHistory = (): BetRecord[] => {
  if (typeof window === 'undefined') return [];
  const history = localStorage.getItem('bet_history');
  return history ? JSON.parse(history) : [];
};

export const addBetRecord = (record: BetRecord) => {
  if (typeof window === 'undefined') return;
  const history = getBetHistory();
  localStorage.setItem('bet_history', JSON.stringify([record, ...history]));
};
