import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const TITLE_MAP: Record<string, string> = {
  '/': 'Operations Hub',
  '/routes': 'Route Dispatch & Fleet Logistics',
  '/riders': 'Fleet Riders & Drivers Management',
  '/inventory': 'Inventory & Stock Management',
  '/customers': 'Customer Accounts & Registry',
  '/billing': 'Billing, Invoices & Escrow Deposits',
  '/accounts': 'Accounts, Expense Heads & P&L Statement',
  '/settings': 'System & Brand Settings',
};

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = TITLE_MAP[location.pathname] || 'Panniwalay ERP';

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0b1120] overflow-hidden text-slate-800 dark:text-slate-100">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-20 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} title={currentTitle} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
