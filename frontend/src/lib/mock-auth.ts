export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

// In a real app, this would be an API call to a Node/MySQL backend.
// Here we simulate local storage for demo purposes.
export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const logoutUser = () => {
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_token');
};
