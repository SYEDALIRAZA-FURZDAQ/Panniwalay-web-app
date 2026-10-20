import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  fullName: string;
  email: string;
  plantName?: string;
  tenantId?: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (targetUser: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('panniwalay_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse cached user:', e);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('panniwalay_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('panniwalay_user');
      localStorage.removeItem('panniwalay_token');
    }
  }, [user]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        if (data.accessToken) {
          localStorage.setItem('panniwalay_token', data.accessToken);
        }
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: data.error || 'Invalid email or password' };
      }
    } catch (e: any) {
      console.warn('Network error during login:', e);
      setLoading(false);
      return { success: false, error: 'Cannot connect to server. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('panniwalay_user');
    localStorage.removeItem('panniwalay_token');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const switchUser = (targetUser: User) => {
    setUser(targetUser);
    localStorage.setItem('panniwalay_user', JSON.stringify(targetUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
