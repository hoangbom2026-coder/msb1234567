import axios from 'axios';

// Instance axios chuẩn kết nối Backend mới
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Thêm interceptor để gắn token vào header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response (ví dụ: logout khi token hết hạn)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
         localStorage.removeItem('auth_token');
         localStorage.removeItem('auth-storage'); // Also clear Zustand storage
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
