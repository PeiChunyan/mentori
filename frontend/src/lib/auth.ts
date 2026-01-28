// frontend/src/lib/auth.ts
// Auth state management utilities

export interface AuthUser {
  id: string;
  email: string;
  role: 'mentor' | 'mentee';
  created_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const AUTH_STORAGE_KEY = 'mentori_auth';
const USER_STORAGE_KEY = 'mentori_user';

export const authStorage = {
  saveToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, token);
    }
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_STORAGE_KEY);
    }
    return null;
  },

  clearToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  saveUser: (user: AuthUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_STORAGE_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  clear: () => {
    authStorage.clearToken();
    authStorage.clearUser();
  },
};
