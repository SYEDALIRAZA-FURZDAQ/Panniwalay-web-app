import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Panniwalay ERP...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login while preserving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
