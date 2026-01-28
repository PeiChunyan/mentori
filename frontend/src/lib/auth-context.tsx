// frontend/src/lib/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authStorage, AuthUser, AuthState } from './auth';

interface AuthContextType extends AuthState {
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const token = authStorage.getToken();
    const user = authStorage.getUser();

    if (token && user) {
      setState({
        user,
        token,
        isAuthenticated: true,
      });
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    // This would be called after successful authentication
    // The actual login is handled by LoginPage component
  };

  const logout = () => {
    authStorage.clear();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  };

  // Update state when user/token changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const token = authStorage.getToken();
      const user = authStorage.getUser();

      if (token && user) {
        setState({
          user,
          token,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
