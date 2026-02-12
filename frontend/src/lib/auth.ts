// Authentication storage utilities for demo mode
// In demo mode, this just stores session data in localStorage without real authentication

const TOKEN_KEY = 'mentori_auth';
const USER_KEY = 'mentori_user';

export const authStorage = {
  // Save authentication token
  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Get authentication token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // Save user data
  saveUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // Get user data
  getUser(): any | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_KEY);
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  // Clear all authentication data
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  // Check if user is authenticated (has token)
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },
};
