import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Navigation,
  Bike,
  Package,
  Users,
  CreditCard,
  FileSpreadsheet,
  Settings,
  LogOut,
  Droplets,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Operations Hub', href: '/', icon: LayoutDashboard },
  { name: 'Route Dispatch', href: '/routes', icon: Navigation, badge: 'Live' },
  { name: 'Fleet Riders', href: '/riders', icon: Bike },
  { name: 'Inventory & Stock', href: '/inventory', icon: Package },
  { name: 'Customer Accounts', href: '/customers', icon: Users },
  { name: 'Billing & Deposits', href: '/billing', icon: CreditCard },
  { name: 'Accounts & P&L', href: '/accounts', icon: FileSpreadsheet },
  { name: 'System Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = true,
  onClose,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        'w-64 bg-white dark:bg-[#111927] border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 z-30 transition-transform duration-200',
        'fixed inset-y-0 left-0 lg:static',
        !isOpen && '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Droplets className="w-5 h-5 fill-white/20" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              Panniwalay
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
                ERP
              </span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate max-w-[150px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0"></span>
              <span className="truncate">{user?.plantName || 'Plant #4 • Karachi'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Main Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 shadow-sm border border-sky-100 dark:border-sky-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <ChevronRight className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0d1424]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.fullName || 'Tariq Mansoor'}
              </p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                  {user?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
