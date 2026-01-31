"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, DEMO_USERS, getUserInitials, getRoleLabel, getRoleColor } from './auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (role: UserRole) => void;
  loginWithCredentials: (email: string, password: string) => boolean;
  logout: () => void;
  getUserInitials: (name: string) => string;
  getRoleLabel: (role: UserRole) => string;
  getRoleColor: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'medius_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
  };

  const loginWithCredentials = (email: string, _password: string): boolean => {
    const found = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (found) {
      setUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithCredentials,
        logout,
        getUserInitials,
        getRoleLabel,
        getRoleColor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
