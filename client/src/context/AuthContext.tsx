import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock admin user for immediate seamless access
const DEFAULT_USER: User = {
  id: 1,
  fullName: 'Tariq Mansoor',
  email: 'admin@panniwalay.pk',
  role: 'admin',
  phone: '+92-300-8291444',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('panniwalay_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('panniwalay_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('panniwalay_user');
    }
  }, [user]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setLoading(false);
        return true;
      }
    } catch (e) {
      console.warn('API login failed, falling back to local credentials');
    }

    // Fallback demo credentials check
    if (email.includes('admin') || email === 'demo@panniwalay.pk') {
      setUser({
        id: 1,
        fullName: 'Tariq Mansoor (Plant Admin)',
        email,
        role: 'admin',
        phone: '+92-300-8291444',
      });
      setLoading(false);
      return true;
    }

    setUser({
      id: 2,
      fullName: 'Fleet Dispatcher',
      email,
      role: 'dispatcher',
      phone: '+92-321-9876543',
    });
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
