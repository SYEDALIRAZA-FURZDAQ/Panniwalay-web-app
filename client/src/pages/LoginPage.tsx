import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Droplets, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('admin@panniwalay.pk');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  // If already authenticated, redirect to app
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await login(email, password);
    if (res.success) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient water glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-sky-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 bg-slate-900/90 border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-cyan-300 flex items-center justify-center mx-auto text-slate-950 shadow-lg shadow-sky-500/25">
            <Droplets className="w-7 h-7 fill-slate-950/20" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              Panniwalay
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                ERP
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Mineral Water Plant Management & Fleet Logistics
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1 text-slate-300">Staff / Plant Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@plant.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-sky-500 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Password</label>
              <span className="text-[11px] text-slate-500">Min 6 characters</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-sky-500 text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Operations Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Quick Fill Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@panniwalay.pk');
                setPassword('Admin@123');
              }}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-[11px] text-slate-300 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold block text-white">Plant #4 Admin</span>
              <span className="text-[10px] text-slate-400">Tariq Mansoor</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('dispatch@panniwalay.pk');
                setPassword('Admin@123');
              }}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-[11px] text-slate-300 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold block text-white">Dispatcher</span>
              <span className="text-[10px] text-slate-400">Fleet Operations</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Session • Multi-Tenant Karachi Plant Node</span>
        </div>
      </div>
    </div>
  );
};
