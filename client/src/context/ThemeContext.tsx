import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  brandTint: string;
  setBrandTint: (tint: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('panniwalay_theme') as Theme) || 'light';
  });

  const [brandTint, setBrandTintState] = useState<string>(() => {
    return localStorage.getItem('panniwalay_brand_tint') || '#0284c7';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('panniwalay_theme') as Theme;
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const applyTheme = (targetTheme: Theme) => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const activeDark = targetTheme === 'dark' || (targetTheme === 'system' && mediaQuery.matches);

    setIsDark(activeDark);

    if (activeDark) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('panniwalay_theme', newTheme);
    applyTheme(newTheme);
  };

  const setBrandTint = (tint: string) => {
    setBrandTintState(tint);
    document.documentElement.style.setProperty('--brand-primary', tint);
    localStorage.setItem('panniwalay_brand_tint', tint);
  };

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const current = localStorage.getItem('panniwalay_theme') as Theme;
      if (current === 'system' || !current) {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', brandTint);
  }, [brandTint]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, brandTint, setBrandTint }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
