import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  UserPlus,
  Users,
  Building2,
  Lock,
  Mail,
  Phone,
  KeyRound,
  CheckCircle2,
  Trash2,
  LogIn,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/common/Badge';

interface RegisteredUser {
  id: number;
  email: string;
  fullName: string;
  plantName: string;
  tenantId: string;
  role: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export const AdminPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchUser } = useAuth();

  // Master passcode gate (Default: '0334' or unlocked)
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');

  // User creation form
  const [plantName, setPlantName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'dispatcher' | 'accountant'>('admin');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Users list
  const [usersList, setUsersList] = useState<RegisteredUser[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.warn('Failed to load users:', e);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchUsers();
    }
  }, [isUnlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '0334' || pin === 'admin' || pin === 'Admin@123') {
      setIsUnlocked(true);
      setPinError('');
    } else {
      setPinError('Incorrect master access PIN. (Hint: 0334)');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          plantName,
          email,
          password,
          phone,
          role,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(
          `Tenant User "${data.user.fullName}" created for "${data.user.plantName}" with clean isolated workspace!`
        );
        setPlantName('');
        setFullName('');
        setEmail('');
        setPassword('');
        setPhone('');
        fetchUsers();
      } else {
        setErrorMsg(data.error || 'Failed to create user');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (id === 1) {
      alert('Cannot delete the root super admin account.');
      return;
    }
    if (!confirm('Are you sure you want to deactivate this tenant user?')) return;

    try {
      const res = await fetch(`/api/auth/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {}
  };

  const handleImpersonateLogin = (u: RegisteredUser) => {
    switchUser({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      plantName: u.plantName,
      tenantId: u.tenantId,
      role: u.role,
      phone: u.phone,
    });
    navigate('/');
  };

  // PIN Unlock Screen if locked
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative font-sans">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full glass-panel rounded-3xl p-8 bg-slate-900/95 border border-rose-900/40 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                RESTRICTED ROUTE • /0334admin
              </span>
              <h1 className="text-xl font-black text-white tracking-tight mt-2">
                Super Admin Gatekeeper
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter Master Authorization Key to manage multi-tenant user accounts
              </p>
            </div>
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {pinError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="font-semibold block mb-1 text-slate-300 text-xs">
                Master Security Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter 0334"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-rose-500 text-sm font-mono tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Unlock Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-500">
              Default Master Key: <code className="text-rose-400 font-bold">0334</code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b101b] text-slate-100 p-4 md:p-8 font-sans space-y-8">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Super Admin Master Console
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                /0334admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Provision independent user accounts, assign water plant tenants, and isolate database workspaces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open Main ERP</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Sign In Page</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Create User Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-3xl p-6 bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserPlus className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-bold text-white">Create New Tenant User</h2>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Business / Water Plant Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. AquaPure Karachi Plant 2"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-sky-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Manager / User Full Name
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Farhan Siddiqui"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-sky-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Official Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      required
                      type="email"
                      placeholder="farhan@plant.pk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-sky-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="0300-1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-sky-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      required
                      type="password"
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-sky-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">User Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-sky-500 text-xs font-medium cursor-pointer"
                  >
                    <option value="admin">Plant Admin (Full Access)</option>
                    <option value="manager">Operations Manager</option>
                    <option value="dispatcher">Fleet Dispatcher</option>
                    <option value="accountant">Accounts & Ledger</option>
                  </select>
                </div>
              </div>

              {/* Multi-Tenant Workspace Notice */}
              <div className="p-3 rounded-2xl bg-sky-950/30 border border-sky-800/50 space-y-1.5 text-[11px] text-sky-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Automatic Clean Workspace Isolation</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  When this user logs in, they will receive their own separate, clean view with 0 customers, fresh stock, and separate ledger—ready for their independent operations.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Register User & Clean Workspace'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Users & Workspaces */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-3xl p-6 bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  Active Multi-Tenant Accounts ({usersList.length})
                </h2>
              </div>
              <button
                onClick={fetchUsers}
                className="text-xs text-sky-400 hover:underline cursor-pointer"
              >
                Refresh List
              </button>
            </div>

            {fetchingUsers ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading accounts...</div>
            ) : usersList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No users found.</div>
            ) : (
              <div className="space-y-3">
                {usersList.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{u.fullName}</span>
                        <Badge variant={u.id === 1 ? 'cyan' : 'default'}>{u.role}</Badge>
                        {u.id === 1 && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                            ROOT ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-300">{u.plantName}</span>
                        <span>•</span>
                        <span>{u.email}</span>
                        {u.phone && (
                          <>
                            <span>•</span>
                            <span>{u.phone}</span>
                          </>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-sky-400">
                        Workspace ID: {u.tenantId || (u.id === 1 ? 'plant_default' : `tenant_${u.id}`)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleImpersonateLogin(u)}
                        title="Direct switch to this workspace"
                        className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Switch Workspace</span>
                      </button>

                      {u.id !== 1 && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          title="Remove user"
                          className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
