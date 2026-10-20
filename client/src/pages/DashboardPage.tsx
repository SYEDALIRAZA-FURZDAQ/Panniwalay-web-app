import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Droplets,
  Bike,
  Package,
  CreditCard,
  Plus,
  Share2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { KpiCard } from '@/components/common/KpiCard';
import { Badge } from '@/components/common/Badge';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';

interface DashboardKpi {
  activeRoutes: number;
  jarsOutForDelivery: number;
  activeRiders: number;
  emptyBottlesExpected: number;
  pendingCash: number;
  totalCustomers: number;
}

interface ActiveRun {
  id: number;
  runNumber: string;
  zoneName: string;
  riderName: string;
  vehicleReg: string;
  totalJars: number;
  deliveredJars: number;
  cashToCollect: number;
  status: 'dispatched' | 'in_transit' | 'completed' | 'pending';
  departureTime: string;
  loadingDockBay: string;
  completedStops: number;
  totalStops: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { formatMoney } = useCurrency();
  const { user } = useAuth();
  const isCleanTenant = !!(user?.tenantId && user.tenantId !== 'plant_default');
  const [loading, setLoading] = useState(!isCleanTenant);

  // Initial state based on active tenant
  const [kpis, setKpis] = useState<DashboardKpi>(() => {
    if (isCleanTenant) {
      let custCount = 0;
      try {
        const saved = JSON.parse(localStorage.getItem(`panniwalay_customers_${user?.tenantId}`) || '[]');
        custCount = saved.length;
      } catch (e) {}
      return {
        activeRoutes: 0,
        jarsOutForDelivery: 0,
        activeRiders: 0,
        emptyBottlesExpected: 0,
        pendingCash: 0,
        totalCustomers: custCount,
      };
    }
    return {
      activeRoutes: 6,
      jarsOutForDelivery: 940,
      activeRiders: 8,
      emptyBottlesExpected: 820,
      pendingCash: 184500,
      totalCustomers: 412,
    };
  });

  const [activeRuns, setActiveRuns] = useState<ActiveRun[]>(() => {
    if (isCleanTenant) return [];
    return [
    {
      id: 1,
      runNumber: 'R-101',
      zoneName: 'Clifton & Sea View (Z-01)',
      riderName: 'Kamran Akmal (RD-04)',
      vehicleReg: 'KC-9821 (Suzuki Bolan)',
      totalJars: 120,
      deliveredJars: 84,
      cashToCollect: 26400,
      status: 'in_transit',
      departureTime: '07:30 AM',
      loadingDockBay: 'Bay #2',
      completedStops: 18,
      totalStops: 24,
    },
    {
      id: 2,
      runNumber: 'R-102',
      zoneName: 'DHA Phase 5 & 6 (Z-02)',
      riderName: 'Muhammad Bilal (RD-07)',
      vehicleReg: 'KW-4412 (Hyundai Shehzore)',
      totalJars: 240,
      deliveredJars: 176,
      cashToCollect: 52800,
      status: 'in_transit',
      departureTime: '08:00 AM',
      loadingDockBay: 'Bay #1',
      completedStops: 32,
      totalStops: 42,
    },
    {
      id: 3,
      runNumber: 'R-103',
      zoneName: 'Gulshan-e-Iqbal Block 1-7 (Z-03)',
      riderName: 'Zubair Ahmed (RD-02)',
      vehicleReg: 'KR-1092 (Suzuki Ravi)',
      totalJars: 100,
      deliveredJars: 98,
      cashToCollect: 22000,
      status: 'completed',
      departureTime: '07:15 AM',
      loadingDockBay: 'Bay #3',
      completedStops: 20,
      totalStops: 20,
    },
    {
      id: 4,
      runNumber: 'R-104',
      zoneName: 'Korangi Industrial Area (Z-06)',
      riderName: 'Rashid Khan (RD-11)',
      vehicleReg: 'KF-3184 (FAW Carrier)',
      totalJars: 160,
      deliveredJars: 45,
      cashToCollect: 35200,
      status: 'dispatched',
      departureTime: '09:00 AM',
      loadingDockBay: 'Bay #4',
      completedStops: 6,
      totalStops: 28,
    },
  ];
});

  useEffect(() => {
    if (isCleanTenant) {
      setLoading(false);
      return;
    }

    // Try fetching live data from API for default plant
    fetch('/api/dashboard/kpis')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.jarsOutForDelivery !== undefined) {
          setKpis({
            activeRoutes: data.activeRoutes || 6,
            jarsOutForDelivery: data.jarsOutForDelivery || 940,
            activeRiders: data.activeRiders || 8,
            emptyBottlesExpected: data.emptyBottlesExpected || 820,
            pendingCash: data.pendingCash || 184500,
            totalCustomers: data.totalCustomers || 412,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/routes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setActiveRuns(data.slice(0, 5));
        }
      })
      .catch(() => {});
  }, [isCleanTenant]);

  return (
    <div className="space-y-6">
      {/* Clean Tenant Workspace Welcome Banner */}
      {isCleanTenant && (
        <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Clean Isolated Workspace: {user?.plantName || 'New Plant'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Logged in as <span className="text-slate-900 dark:text-white font-semibold">{user?.fullName}</span>. All customer accounts, routes, and billing operate independently in this workspace.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/customers')}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              + Register Customer
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer bg-white dark:bg-transparent"
            >
              Configure Plant Pricing
            </button>
          </div>
        </div>
      )}

      {/* Top Banner & Quick Actions */}
      <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-sky-950 dark:to-slate-900 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden shadow-xs">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-400/30 text-xs font-semibold">
                Shift: Morning (07:00 - 15:00)
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                {isCleanTenant ? 'Independent Workspace Node' : 'Live Telemetry Active'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Operations Hub — {user?.plantName || 'Karachi Plant #4'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl font-normal">
              Real-time monitoring of delivery runs, returnable bottle circulation, and route cash handovers across Karachi municipal sectors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/routes')}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm shadow-sky-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Route Run</span>
            </button>
            <button
              onClick={() => navigate('/customers')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white border border-slate-200 dark:border-white/20 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
            >
              <Share2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Generate Sign-up Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Active Route Runs"
          value={kpis.activeRoutes}
          subtitle="4 morning, 2 afternoon"
          trend={{ value: '+2 vs yest', isPositive: true }}
          icon={Navigation}
          iconColor="text-sky-600 dark:text-sky-400"
          iconBg="bg-sky-50 dark:bg-sky-950/60 border-sky-100 dark:border-sky-800"
          onClick={() => navigate('/routes')}
        />
        <KpiCard
          title="Jars Out in Delivery"
          value={`${kpis.jarsOutForDelivery} Jars`}
          subtitle="84% vehicle capacity"
          trend={{ value: 'Full capacity', isPositive: true }}
          icon={Droplets}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-800"
          onClick={() => navigate('/routes')}
        />
        <KpiCard
          title="Active Riders On-Route"
          value={kpis.activeRiders}
          subtitle="2 on rest, 1 standby"
          icon={Bike}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800"
          onClick={() => navigate('/riders')}
        />
        <KpiCard
          title="Empty Bottles Expected"
          value={`${kpis.emptyBottlesExpected} Units`}
          subtitle="Target return rate 88%"
          trend={{ value: '+92% return', isPositive: true }}
          icon={Package}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-800"
          onClick={() => navigate('/inventory')}
        />
        <KpiCard
          title="Pending Route Cash"
          value={formatMoney(kpis.pendingCash)}
          subtitle="Due at dock handover"
          icon={CreditCard}
          iconColor="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-800"
          onClick={() => navigate('/billing')}
        />
      </div>

      {/* Zone Distribution Bar & Progress */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Karachi Delivery Sector Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Payload load distribution across active Karachi zones
            </p>
          </div>
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1 cursor-pointer" onClick={() => navigate('/routes')}>
            <span>View All Zones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { zone: 'Clifton (Z-01)', load: '120 Jars', pct: 90, color: 'bg-sky-500' },
            { zone: 'DHA Phase 5-6 (Z-02)', load: '240 Jars', pct: 96, color: 'bg-emerald-500' },
            { zone: 'Gulshan Block 1-7 (Z-03)', load: '100 Jars', pct: 85, color: 'bg-indigo-500' },
            { zone: 'PECHS / Tariq Rd (Z-04)', load: '90 Jars', pct: 75, color: 'bg-purple-500' },
            { zone: 'N. Nazimabad (Z-05)', load: '110 Jars', pct: 80, color: 'bg-amber-500' },
            { zone: 'Korangi Industrial (Z-06)', load: '160 Jars', pct: 92, color: 'bg-cyan-500' },
          ].map((z, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{z.zone}</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">{z.pct}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className={`${z.color} h-full rounded-full transition-all duration-500`} style={{ width: `${z.pct}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{z.load}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Runs Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Active Delivery Runs
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              {activeRuns.length} Runs in Progress
            </span>
          </div>
          <button
            onClick={() => navigate('/routes')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1"
          >
            <span>Open Dispatch Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Run #</th>
                <th className="py-3 px-4">Zone & Sector</th>
                <th className="py-3 px-4">Assigned Rider</th>
                <th className="py-3 px-4">Vehicle & Bay</th>
                <th className="py-3 px-4">Progress (Jars)</th>
                <th className="py-3 px-4">Cash Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {activeRuns.map((run) => {
                const pct = Math.round((run.deliveredJars / (run.totalJars || 1)) * 100);
                return (
                  <tr key={run.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {run.runNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{run.zoneName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {run.riderName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      <span>{run.vehicleReg}</span>
                      <span className="text-[10px] text-slate-400 block">{run.loadingDockBay}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 w-32">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold">{run.deliveredJars} / {run.totalJars}</span>
                          <span className="text-slate-400">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatMoney(run.cashToCollect)}
                    </td>
                    <td className="py-3.5 px-4">
                      {run.status === 'in_transit' && (
                        <Badge variant="cyan">In Transit</Badge>
                      )}
                      {run.status === 'dispatched' && (
                        <Badge variant="info">Dispatched</Badge>
                      )}
                      {run.status === 'completed' && (
                        <Badge variant="success">Completed</Badge>
                      )}
                      {run.status === 'pending' && (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/routes')}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
