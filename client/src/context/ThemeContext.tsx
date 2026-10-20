import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export interface BrandPalette {
  name: string;
  key: string;
  hex: string;
  colors: Record<string, string>;
}

export const BRAND_PALETTES: Record<string, BrandPalette> = {
  '#0284c7': {
    name: 'Oceanic Sky (Default)',
    key: 'sky',
    hex: '#0284c7',
    colors: {
      '--color-sky-50': 'oklch(97.7% .013 236.62)',
      '--color-sky-100': 'oklch(95.1% .026 236.824)',
      '--color-sky-200': 'oklch(90.1% .058 230.902)',
      '--color-sky-300': 'oklch(82.8% .111 230.318)',
      '--color-sky-400': 'oklch(74.6% .16 232.661)',
      '--color-sky-500': 'oklch(68.5% .169 237.323)',
      '--color-sky-600': 'oklch(58.8% .158 241.966)',
      '--color-sky-700': 'oklch(50% .134 242.749)',
      '--color-sky-800': 'oklch(44.3% .11 240.79)',
      '--color-sky-900': 'oklch(39.1% .09 240.876)',
      '--color-sky-950': 'oklch(29.3% .066 243.157)',
      '--brand-primary': '#0284c7',
      '--brand-primary-hover': '#0369a1',
      '--brand-primary-light': '#e0f2fe',
    },
  },
  '#059669': {
    name: 'Emerald Spring',
    key: 'emerald',
    hex: '#059669',
    colors: {
      '--color-sky-50': 'oklch(97.9% .021 166.113)',
      '--color-sky-100': 'oklch(95% .052 163.051)',
      '--color-sky-200': 'oklch(90.5% .093 164.15)',
      '--color-sky-300': 'oklch(84.5% .143 164.978)',
      '--color-sky-400': 'oklch(76.5% .177 163.223)',
      '--color-sky-500': 'oklch(69.6% .17 162.48)',
      '--color-sky-600': 'oklch(59.6% .145 163.225)',
      '--color-sky-700': 'oklch(50.8% .118 165.612)',
      '--color-sky-800': 'oklch(43.2% .095 166.913)',
      '--color-sky-900': 'oklch(37.8% .077 168.94)',
      '--color-sky-950': 'oklch(26.2% .051 172.552)',
      '--brand-primary': '#059669',
      '--brand-primary-hover': '#047857',
      '--brand-primary-light': '#d1fae5',
    },
  },
  '#0891b2': {
    name: 'Crystalline Cyan',
    key: 'cyan',
    hex: '#0891b2',
    colors: {
      '--color-sky-50': 'oklch(98.4% .014 200.873)',
      '--color-sky-100': 'oklch(95.6% .036 203.388)',
      '--color-sky-200': 'oklch(91.3% .071 205.041)',
      '--color-sky-300': 'oklch(86.5% .127 207.078)',
      '--color-sky-400': 'oklch(78.9% .154 211.53)',
      '--color-sky-500': 'oklch(71.5% .143 215.221)',
      '--color-sky-600': 'oklch(60.9% .126 221.723)',
      '--color-sky-700': 'oklch(51.5% .107 223.828)',
      '--color-sky-800': 'oklch(43.7% .085 224.283)',
      '--color-sky-900': 'oklch(37.8% .067 225.269)',
      '--color-sky-950': 'oklch(26.2% .042 225.438)',
      '--brand-primary': '#0891b2',
      '--brand-primary-hover': '#0e7490',
      '--brand-primary-light': '#cffafe',
    },
  },
  '#2563eb': {
    name: 'Cobalt Pure',
    key: 'blue',
    hex: '#2563eb',
    colors: {
      '--color-sky-50': 'oklch(97% .014 254.604)',
      '--color-sky-100': 'oklch(93.2% .032 255.585)',
      '--color-sky-200': 'oklch(88.2% .059 254.128)',
      '--color-sky-300': 'oklch(80.9% .105 251.813)',
      '--color-sky-400': 'oklch(70.7% .165 254.624)',
      '--color-sky-500': 'oklch(62.3% .214 259.815)',
      '--color-sky-600': 'oklch(54.6% .245 262.881)',
      '--color-sky-700': 'oklch(48.8% .243 264.376)',
      '--color-sky-800': 'oklch(42.4% .199 265.638)',
      '--color-sky-900': 'oklch(37.9% .146 265.522)',
      '--color-sky-950': 'oklch(28.2% .091 267.935)',
      '--brand-primary': '#2563eb',
      '--brand-primary-hover': '#1d4ed8',
      '--brand-primary-light': '#dbeafe',
    },
  },
  '#4f46e5': {
    name: 'Indigo Marine',
    key: 'indigo',
    hex: '#4f46e5',
    colors: {
      '--color-sky-50': 'oklch(96.2% .018 272.314)',
      '--color-sky-100': 'oklch(93% .034 272.788)',
      '--color-sky-200': 'oklch(87% .065 274.039)',
      '--color-sky-300': 'oklch(78.5% .115 274.713)',
      '--color-sky-400': 'oklch(67.3% .182 276.935)',
      '--color-sky-500': 'oklch(58.5% .233 277.117)',
      '--color-sky-600': 'oklch(51.1% .262 276.966)',
      '--color-sky-700': 'oklch(45.7% .24 277.023)',
      '--color-sky-800': 'oklch(39.8% .195 277.366)',
      '--color-sky-900': 'oklch(35.9% .144 278.697)',
      '--color-sky-950': 'oklch(25.7% .09 281.288)',
      '--brand-primary': '#4f46e5',
      '--brand-primary-hover': '#4338ca',
      '--brand-primary-light': '#e0e7ff',
    },
  },
};

export const applyBrandPalette = (tintHex: string) => {
  const root = document.documentElement;
  const palette = BRAND_PALETTES[tintHex] || BRAND_PALETTES['#0284c7'];
  if (!palette) return;

  Object.entries(palette.colors).forEach(([cssVar, value]) => {
    root.style.setProperty(cssVar, value);
  });
};

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
    applyBrandPalette(tint);
    localStorage.setItem('panniwalay_brand_tint', tint);
  };

  useEffect(() => {
    applyTheme(theme);
    applyBrandPalette(brandTint);

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
    applyBrandPalette(brandTint);
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
