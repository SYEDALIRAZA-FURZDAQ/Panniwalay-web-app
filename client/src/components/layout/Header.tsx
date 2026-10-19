import React from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Coins,
  Building2,
  Radio,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency, CurrencyCode } from '@/context/CurrencyContext';

interface HeaderProps {
  onMenuToggle?: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, title }) => {
  const { isDark, setTheme, theme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="h-16 px-4 md:px-6 bg-white/80 dark:bg-[#111927]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <h2 className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">
            {title}
          </h2>
        )}

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Plant #4 • Karachi</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
          <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
          <span>Fleet Live</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <Coins className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden pr-2 cursor-pointer"
          >
            <option value="PKR">PKR (₨)</option>
            <option value="USD">USD ($)</option>
            <option value="AED">AED</option>
            <option value="SAR">SAR</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-sky-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900"></span>
        </button>
      </div>
    </header>
  );
};
