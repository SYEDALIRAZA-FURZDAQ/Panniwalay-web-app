import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { RouteDispatchPage } from './pages/RouteDispatchPage';
import { RidersPage } from './pages/RidersPage';
import { InventoryPage } from './pages/InventoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { BillingPage } from './pages/BillingPage';
import { AccountsPage } from './pages/AccountsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicOnboardingPage } from './pages/PublicOnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPortalPage } from './pages/AdminPortalPage';

export function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Standalone Public Pages */}
              <Route path="/register" element={<PublicOnboardingPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Secret Super Admin Portal for multi-tenant user creation */}
              <Route path="/0334admin" element={<AdminPortalPage />} />

              {/* Protected ERP Application Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="routes" element={<RouteDispatchPage />} />
                <Route path="riders" element={<RidersPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all: Unauthenticated users are redirected to /login by ProtectedRoute, others to / */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
