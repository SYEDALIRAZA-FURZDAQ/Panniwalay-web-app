import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  MapPin,
  Bike,
  Truck,
  RotateCw,
  Search,
  Filter,
  X,
  FileText,
  AlertCircle,
  Trash2,
  Layers,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { KpiCard } from '@/components/common/KpiCard';
import { useCurrency } from '@/context/CurrencyContext';

interface RouteStop {
  id: number;
  stopOrder: number;
  customerName: string;
  phone: string;
  address: string;
  jarsToDeliver: number;
  emptyJarsCollected: number;
  cashAmount: number;
  status: string;
}

interface RouteRunItem {
  id: number;
  runNumber: string;
  zoneId: number;
  zoneName: string;
  riderName: string;
  riderPhone: string;
  vehicleReg: string;
  vehicleType: string;
  shift: 'morning' | 'afternoon';
  departureTime: string;
  loadingDockBay: string;
  totalJars: number;
  deliveredJars: number;
  emptyJarsExpected: number;
  emptyJarsReturned: number;
  cashToCollect: number;
  cashCollected: number;
  status: 'pending' | 'dispatched' | 'in_transit' | 'completed';
  totalStops: number;
  completedStops: number;
  runDate: string;
}

interface TargetRouteItem {
  id: number;
  routeCode: string;
  name: string;
  zoneId: number;
  zoneName?: string;
  riderId?: number | null;
  riderName?: string;
  riderPhone?: string;
  vehicleId?: number | null;
  vehicleReg?: string;
  vehicleType?: string;
  shift: 'morning' | 'afternoon';
  departureTime: string;
  loadingDockBay: string;
  targetJars: number;
  targetCash: number;
  estStops: number;
  description?: string;
  isActive?: boolean;
}

interface ZoneItem {
  id: number;
  name: string;
  code: string;
  city: string;
  sector?: string;
  totalStops?: number;
  isActive?: boolean;
}

export const RouteDispatchPage: React.FC = () => {
  const { formatMoney } = useCurrency();

  // Active Tab: 'runs' | 'target_routes' | 'zones'
  const [activeTab, setActiveTab] = useState<'runs' | 'target_routes' | 'zones'>('runs');

  const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // ─── STATE: RUNS ───────────────────────────────────────────────
  const [runs, setRuns] = useState<RouteRunItem[]>([
    {
      id: 1,
      runNumber: 'R-101',
      zoneId: 1,
      zoneName: 'Clifton & Sea View (Z-01)',
      riderName: 'Kamran Akmal',
      riderPhone: '+92-301-2345678',
      vehicleReg: 'KC-9821',
      vehicleType: 'Suzuki Bolan Pickup',
      shift: 'morning',
      departureTime: '07:30 AM',
      loadingDockBay: 'Bay #2',
      totalJars: 120,
      deliveredJars: 84,
      emptyJarsExpected: 110,
      emptyJarsReturned: 72,
      cashToCollect: 26400,
      cashCollected: 18480,
      status: 'in_transit',
      totalStops: 24,
      completedStops: 18,
      runDate: '2026-10-19',
    },
    {
      id: 2,
      runNumber: 'R-102',
      zoneId: 2,
      zoneName: 'DHA Phase 5 & 6 (Z-02)',
      riderName: 'Muhammad Bilal',
      riderPhone: '+92-312-3456789',
      vehicleReg: 'KW-4412',
      vehicleType: 'Hyundai Shehzore H-100',
      shift: 'morning',
      departureTime: '08:00 AM',
      loadingDockBay: 'Bay #1',
      totalJars: 240,
      deliveredJars: 176,
      emptyJarsExpected: 220,
      emptyJarsReturned: 160,
      cashToCollect: 52800,
      cashCollected: 38720,
      status: 'in_transit',
      totalStops: 42,
      completedStops: 32,
      runDate: '2026-10-19',
    },
    {
      id: 3,
      runNumber: 'R-103',
      zoneId: 3,
      zoneName: 'Gulshan-e-Iqbal Block 1-7 (Z-03)',
      riderName: 'Zubair Ahmed',
      riderPhone: '+92-333-4567890',
      vehicleReg: 'KR-1092',
      vehicleType: 'Suzuki Ravi Loader',
      shift: 'morning',
      departureTime: '07:15 AM',
      loadingDockBay: 'Bay #3',
      totalJars: 100,
      deliveredJars: 98,
      emptyJarsExpected: 95,
      emptyJarsReturned: 92,
      cashToCollect: 22000,
      cashCollected: 21560,
      status: 'completed',
      totalStops: 20,
      completedStops: 20,
      runDate: '2026-10-19',
    },
    {
      id: 4,
      runNumber: 'R-104',
      zoneId: 6,
      zoneName: 'Korangi Industrial Area (Z-06)',
      riderName: 'Rashid Khan',
      riderPhone: '+92-345-5678901',
      vehicleReg: 'KF-3184',
      vehicleType: 'FAW Carrier',
      shift: 'afternoon',
      departureTime: '13:30 PM',
      loadingDockBay: 'Bay #4',
      totalJars: 160,
      deliveredJars: 45,
      emptyJarsExpected: 140,
      emptyJarsReturned: 40,
      cashToCollect: 35200,
      cashCollected: 9900,
      status: 'dispatched',
      totalStops: 28,
      completedStops: 6,
      runDate: '2026-10-19',
    },
  ]);

  // ─── STATE: TARGET ROUTES ───────────────────────────────────────
  const [targetRoutesList, setTargetRoutesList] = useState<TargetRouteItem[]>([
    {
      id: 1,
      routeCode: 'TR-101',
      name: 'Clifton & Sea View Express',
      zoneId: 1,
      zoneName: 'Clifton & Sea View (Z-01)',
      riderName: 'Kamran Akmal (RD-04)',
      vehicleReg: 'KC-9821 (Suzuki Bolan)',
      shift: 'morning',
      departureTime: '07:30 AM',
      loadingDockBay: 'Bay #2',
      targetJars: 120,
      targetCash: 26400,
      estStops: 24,
      description: 'Daily morning residential supply for Clifton Block 1-5 and Sea View apartments',
      isActive: true,
    },
    {
      id: 2,
      routeCode: 'TR-102',
      name: 'DHA Phase 5 & 6 Heavy Commercial',
      zoneId: 2,
      zoneName: 'DHA Phase 5 & 6 (Z-02)',
      riderName: 'Muhammad Bilal (RD-07)',
      vehicleReg: 'KW-4412 (Hyundai Shehzore)',
      shift: 'morning',
      departureTime: '08:00 AM',
      loadingDockBay: 'Bay #1',
      targetJars: 240,
      targetCash: 52800,
      estStops: 42,
      description: 'Corporate towers, restaurants and high-volume residential compounds in DHA Phase 5/6',
      isActive: true,
    },
    {
      id: 3,
      routeCode: 'TR-103',
      name: 'Gulshan-e-Iqbal Block 1-7 Retail & Homes',
      zoneId: 3,
      zoneName: 'Gulshan-e-Iqbal Block 1-7 (Z-03)',
      riderName: 'Zubair Ahmed (RD-02)',
      vehicleReg: 'KR-1092 (Suzuki Ravi)',
      shift: 'morning',
      departureTime: '07:15 AM',
      loadingDockBay: 'Bay #3',
      targetJars: 100,
      targetCash: 22000,
      estStops: 20,
      description: 'University Road and Gulshan Block 1-7 family residential route',
      isActive: true,
    },
    {
      id: 4,
      routeCode: 'TR-104',
      name: 'Korangi Industrial Bulk Shift',
      zoneId: 6,
      zoneName: 'Korangi Industrial Area (Z-06)',
      riderName: 'Rashid Khan (RD-11)',
      vehicleReg: 'KF-3184 (FAW Carrier)',
      shift: 'afternoon',
      departureTime: '01:30 PM',
      loadingDockBay: 'Bay #4',
      targetJars: 160,
      targetCash: 35200,
      estStops: 28,
      description: 'Industrial textile mills, factories and packaging units afternoon refill',
      isActive: true,
    },
  ]);

  // ─── STATE: DELIVERY ZONES ─────────────────────────────────────
  const [zonesList, setZonesList] = useState<ZoneItem[]>([
    { id: 1, name: 'Clifton & Sea View', code: 'Z-01', city: 'Karachi', sector: 'South', totalStops: 42, isActive: true },
    { id: 2, name: 'DHA Phase 5 & 6', code: 'Z-02', city: 'Karachi', sector: 'South', totalStops: 58, isActive: true },
    { id: 3, name: 'Gulshan-e-Iqbal Block 1-7', code: 'Z-03', city: 'Karachi', sector: 'East', totalStops: 36, isActive: true },
    { id: 4, name: 'PECHS & Tariq Road', code: 'Z-04', city: 'Karachi', sector: 'East', totalStops: 29, isActive: true },
    { id: 5, name: 'North Nazimabad Block A-D', code: 'Z-05', city: 'Karachi', sector: 'Central', totalStops: 34, isActive: true },
    { id: 6, name: 'Korangi Industrial Area', code: 'Z-06', city: 'Karachi', sector: 'Korangi', totalStops: 48, isActive: true },
  ]);

  // Load from API on mount
  useEffect(() => {
    // 1. Fetch Zones
    fetch('/api/zones')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setZonesList(data);
        }
      })
      .catch(() => {});

    // 2. Fetch Target Routes
    fetch('/api/routes/target-routes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTargetRoutesList(data);
        }
      })
      .catch(() => {});

    // 3. Fetch Runs
    fetch('/api/routes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRuns(data);
        }
      })
      .catch(() => {});
  }, []);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddTargetRouteModal, setShowAddTargetRouteModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [selectedManifestRun, setSelectedManifestRun] = useState<RouteRunItem | null>(null);

  // Forms
  const [newRun, setNewRun] = useState({
    zoneName: 'PECHS & Tariq Road (Z-04)',
    riderName: 'Farhan Ali (RD-09)',
    vehicleReg: 'KC-9821 (Suzuki Bolan)',
    shift: 'morning' as 'morning' | 'afternoon',
    departureTime: '08:30 AM',
    loadingDockBay: 'Bay #2',
    totalJars: 110,
    cashToCollect: 24200,
  });

  const [newTargetRoute, setNewTargetRoute] = useState({
    routeCode: '',
    name: '',
    zoneId: 1,
    riderName: 'Farhan Ali (RD-09)',
    vehicleReg: 'KC-9821 (Suzuki Bolan)',
    shift: 'morning' as 'morning' | 'afternoon',
    departureTime: '08:00 AM',
    loadingDockBay: 'Bay #1',
    targetJars: 120,
    targetCash: 26400,
    estStops: 25,
    description: '',
  });

  const [newZone, setNewZone] = useState({
    name: '',
    code: '',
    city: 'Karachi',
    sector: 'East',
    totalStops: 25,
  });

  // ─── HANDLERS: RUNS ──────────────────────────────────────────
  const handleCreateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdRun: RouteRunItem = {
      id: Date.now(),
      runNumber: `R-${105 + runs.length}`,
      zoneId: 4,
      zoneName: newRun.zoneName,
      riderName: newRun.riderName,
      riderPhone: '+92-321-4567890',
      vehicleReg: newRun.vehicleReg.split(' ')[0],
      vehicleType: 'Suzuki Bolan Pickup',
      shift: newRun.shift,
      departureTime: newRun.departureTime,
      loadingDockBay: newRun.loadingDockBay,
      totalJars: Number(newRun.totalJars),
      deliveredJars: 0,
      emptyJarsExpected: Math.round(Number(newRun.totalJars) * 0.9),
      emptyJarsReturned: 0,
      cashToCollect: Number(newRun.cashToCollect),
      cashCollected: 0,
      status: 'dispatched',
      totalStops: 22,
      completedStops: 0,
      runDate: new Date().toISOString().split('T')[0],
    };

    try {
      await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          runNumber: createdRun.runNumber,
          zoneId: createdRun.zoneId,
          shift: createdRun.shift,
          departureTime: createdRun.departureTime,
          loadingDockBay: createdRun.loadingDockBay,
          totalJars: createdRun.totalJars,
          runDate: createdRun.runDate,
        }),
      });
    } catch (err) {}

    setRuns([createdRun, ...runs]);
    setShowCreateModal(false);
  };

  const handleDeleteRun = async (id: number, runNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete delivery run ${runNumber}?`)) {
      return;
    }
    try {
      await fetch(`/api/routes/${id}`, { method: 'DELETE', credentials: 'include' });
    } catch (err) {}
    setRuns(runs.filter((r) => r.id !== id));
  };

  const updateStatus = (id: number, nextStatus: RouteRunItem['status']) => {
    fetch(`/api/routes/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: nextStatus }),
    }).catch(() => {});
    setRuns(runs.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)));
  };

  // ─── HANDLERS: TARGET ROUTES ─────────────────────────────────
  const handleAddTargetRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetRoute.name || !newTargetRoute.routeCode) {
      alert('Please fill in Route Code and Name');
      return;
    }

    const selectedZone = zonesList.find((z) => z.id === Number(newTargetRoute.zoneId));
    const createdRoute: TargetRouteItem = {
      id: Date.now(),
      routeCode: newTargetRoute.routeCode.toUpperCase(),
      name: newTargetRoute.name,
      zoneId: Number(newTargetRoute.zoneId),
      zoneName: selectedZone ? `${selectedZone.name} (${selectedZone.code})` : 'Karachi Zone',
      riderName: newTargetRoute.riderName,
      vehicleReg: newTargetRoute.vehicleReg,
      shift: newTargetRoute.shift,
      departureTime: newTargetRoute.departureTime,
      loadingDockBay: newTargetRoute.loadingDockBay,
      targetJars: Number(newTargetRoute.targetJars),
      targetCash: Number(newTargetRoute.targetCash),
      estStops: Number(newTargetRoute.estStops),
      description: newTargetRoute.description,
      isActive: true,
    };

    try {
      const res = await fetch('/api/routes/target-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          routeCode: createdRoute.routeCode,
          name: createdRoute.name,
          zoneId: createdRoute.zoneId,
          shift: createdRoute.shift,
          departureTime: createdRoute.departureTime,
          loadingDockBay: createdRoute.loadingDockBay,
          targetJars: createdRoute.targetJars,
          targetCash: createdRoute.targetCash,
          estStops: createdRoute.estStops,
          description: createdRoute.description,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        createdRoute.id = saved.id || createdRoute.id;
      }
    } catch (err) {}

    setTargetRoutesList([createdRoute, ...targetRoutesList]);
    setShowAddTargetRouteModal(false);
    setNewTargetRoute({
      routeCode: '',
      name: '',
      zoneId: zonesList[0]?.id || 1,
      riderName: 'Farhan Ali (RD-09)',
      vehicleReg: 'KC-9821 (Suzuki Bolan)',
      shift: 'morning',
      departureTime: '08:00 AM',
      loadingDockBay: 'Bay #1',
      targetJars: 120,
      targetCash: 26400,
      estStops: 25,
      description: '',
    });
  };

  const handleDeleteTargetRoute = async (id: number, routeCode: string) => {
    if (!window.confirm(`Are you sure you want to delete Target Route ${routeCode}?`)) {
      return;
    }
    try {
      await fetch(`/api/routes/target-routes/${id}`, { method: 'DELETE', credentials: 'include' });
    } catch (err) {}
    setTargetRoutesList(targetRoutesList.filter((r) => r.id !== id));
  };

  const handleLaunchTargetRouteRun = (route: TargetRouteItem) => {
    const launchedRun: RouteRunItem = {
      id: Date.now(),
      runNumber: `R-${100 + runs.length + 1}`,
      zoneId: route.zoneId,
      zoneName: route.zoneName || 'Karachi Sector',
      riderName: route.riderName || 'Assigned Driver',
      riderPhone: route.riderPhone || '+92-300-1234567',
      vehicleReg: (route.vehicleReg || 'KC-9821').split(' ')[0],
      vehicleType: 'Fleet Delivery Unit',
      shift: route.shift,
      departureTime: route.departureTime,
      loadingDockBay: route.loadingDockBay,
      totalJars: route.targetJars,
      deliveredJars: 0,
      emptyJarsExpected: Math.round(route.targetJars * 0.9),
      emptyJarsReturned: 0,
      cashToCollect: route.targetCash,
      cashCollected: 0,
      status: 'dispatched',
      totalStops: route.estStops,
      completedStops: 0,
      runDate: new Date().toISOString().split('T')[0],
    };

    setRuns([launchedRun, ...runs]);
    setActiveTab('runs');
    alert(`Target Route ${route.routeCode} launched as Live Run ${launchedRun.runNumber}!`);
  };

  // ─── HANDLERS: ZONES ─────────────────────────────────────────
  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.name || !newZone.code) {
      alert('Please fill in Zone Name and Code');
      return;
    }

    const createdZone: ZoneItem = {
      id: Date.now(),
      name: newZone.name,
      code: newZone.code.toUpperCase(),
      city: newZone.city || 'Karachi',
      sector: newZone.sector || 'Central',
      totalStops: Number(newZone.totalStops) || 20,
      isActive: true,
    };

    try {
      const res = await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createdZone),
      });
      if (res.ok) {
        const saved = await res.json();
        createdZone.id = saved.id || createdZone.id;
      }
    } catch (err) {}

    setZonesList([...zonesList, createdZone]);
    setShowAddZoneModal(false);
    setNewZone({
      name: '',
      code: '',
      city: 'Karachi',
      sector: 'East',
      totalStops: 25,
    });
  };

  const handleDeleteZone = async (id: number, zoneName: string) => {
    if (!window.confirm(`Are you sure you want to delete delivery zone "${zoneName}"?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('panniwalay_token');
      const res = await fetch(`/api/zones/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Delete failed' }));
        alert(`Failed to delete zone: ${data.error || res.statusText}`);
        return;
      }
      setZonesList(zonesList.filter((z) => z.id !== id));
    } catch (err) {
      alert('Network error: could not delete zone. Please try again.');
    }
  };

  // Filtered runs
  const filteredRuns = runs.filter((r) => {
    if (shiftFilter !== 'all' && r.shift !== shiftFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (
      search &&
      !r.runNumber.toLowerCase().includes(search.toLowerCase()) &&
      !r.riderName.toLowerCase().includes(search.toLowerCase()) &&
      !r.zoneName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filtered target routes
  const filteredTargetRoutes = targetRoutesList.filter((r) => {
    if (shiftFilter !== 'all' && r.shift !== shiftFilter) return false;
    if (
      search &&
      !r.routeCode.toLowerCase().includes(search.toLowerCase()) &&
      !r.name.toLowerCase().includes(search.toLowerCase()) &&
      !(r.zoneName || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filtered zones
  const filteredZones = zonesList.filter((z) => {
    if (
      search &&
      !z.name.toLowerCase().includes(search.toLowerCase()) &&
      !z.code.toLowerCase().includes(search.toLowerCase()) &&
      !(z.sector || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Calculate totals
  const totalJarsOut = runs.reduce((a, b) => a + b.totalJars, 0);
  const totalDelivered = runs.reduce((a, b) => a + b.deliveredJars, 0);
  const totalExpectedEmpty = runs.reduce((a, b) => a + b.emptyJarsExpected, 0);
  const totalReturnedEmpty = runs.reduce((a, b) => a + b.emptyJarsReturned, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Route Dispatch & Fleet Area Distribution
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plant #4 loading bays, vehicle departure schedules, target route planning & territory matrix
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddZoneModal(true)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>Add Zone</span>
          </button>

          <button
            onClick={() => setShowAddTargetRouteModal(true)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-sky-500" />
            <span>Add Target Route</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch New Run</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Runs Today"
          value={runs.length}
          subtitle={`${runs.filter((r) => r.status === 'in_transit').length} In Transit • 100% Scheduled`}
          icon={Truck}
        />
        <KpiCard
          title="Jars Out for Delivery"
          value={totalJarsOut}
          subtitle={`${totalDelivered} delivered so far`}
          icon={RotateCw}
        />
        <KpiCard
          title="Target Routes"
          value={targetRoutesList.length}
          subtitle={`${zonesList.length} active delivery zones`}
          icon={Compass}
        />
        <KpiCard
          title="Empty Returns Due"
          value={totalExpectedEmpty}
          subtitle={`${totalReturnedEmpty} shells back at dock`}
          icon={CheckCircle2}
        />
      </div>

      {/* VIEW TABS NAVIGATION */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('runs')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'runs'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Active Runs & Live Matrix</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              {runs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('target_routes')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'target_routes'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Target Routes (Master Planner)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {targetRoutesList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('zones')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'zones'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Zones & Karachi Sectors</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {zonesList.length}
            </span>
          </button>
        </div>

        {/* Global Search inside active tab */}
        <div className="relative hidden md:block pb-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'runs'
                ? 'Search run, driver, or zone...'
                : activeTab === 'target_routes'
                ? 'Search target routes...'
                : 'Search zones or sectors...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-sky-500 w-64"
          />
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: ACTIVE RUNS & FLEET MATRIX                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'runs' && (
        <div className="space-y-4">
          {/* Shift & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl glass-panel">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Shift:</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setShiftFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    shiftFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  All ({runs.length})
                </button>
                <button
                  onClick={() => setShiftFilter('morning')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    shiftFilter === 'morning'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Morning (Shift 01)
                </button>
                <button
                  onClick={() => setShiftFilter('afternoon')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    shiftFilter === 'afternoon'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Afternoon (Shift 02)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="dispatched">Dispatched</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* RUNS CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRuns.map((run) => {
              const jarPct = run.totalJars > 0 ? Math.round((run.deliveredJars / run.totalJars) * 100) : 0;

              return (
                <div
                  key={run.id}
                  className="glass-panel p-5 rounded-2xl space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all border border-slate-200/80 dark:border-slate-800 relative group"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          {run.runNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {run.shift}
                        </span>
                        {run.status === 'in_transit' && <Badge variant="cyan">In Transit</Badge>}
                        {run.status === 'dispatched' && <Badge variant="info">Dispatched</Badge>}
                        {run.status === 'completed' && <Badge variant="success">Completed</Badge>}
                        {run.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                      </div>
                      <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{run.zoneName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {run.loadingDockBay}
                        </span>
                        <span className="text-[11px] text-slate-400">{run.departureTime}</span>
                      </div>
                      {/* Delete Run Button */}
                      <button
                        onClick={() => handleDeleteRun(run.id, run.runNumber)}
                        title="Delete Run"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rider & Vehicle Details */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Rider / Driver</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{run.riderName}</span>
                      <span className="text-slate-400 text-[11px] block">{run.riderPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle Unit</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{run.vehicleReg}</span>
                      <span className="text-slate-400 text-[11px] block truncate">{run.vehicleType}</span>
                    </div>
                  </div>

                  {/* Progress Gauges */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-500 font-medium">Jars Delivered</span>
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                          {run.deliveredJars} / {run.totalJars} ({jarPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            jarPct === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${jarPct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                      <span className="text-slate-500">
                        Stops:{' '}
                        <b className="text-slate-800 dark:text-slate-200">
                          {run.completedStops}/{run.totalStops}
                        </b>
                      </span>
                      <span className="text-slate-500">
                        Empty Ret:{' '}
                        <b className="text-slate-800 dark:text-slate-200">
                          {run.emptyJarsReturned}/{run.emptyJarsExpected}
                        </b>
                      </span>
                      <span className="text-slate-500">
                        Cash Due: <b className="text-slate-900 dark:text-white">{formatMoney(run.cashToCollect)}</b>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setSelectedManifestRun(run)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                      <span>View Manifest</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {run.status === 'dispatched' && (
                        <button
                          onClick={() => updateStatus(run.id, 'in_transit')}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
                        >
                          Mark In-Transit
                        </button>
                      )}
                      {run.status === 'in_transit' && (
                        <button
                          onClick={() => updateStatus(run.id, 'completed')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                        >
                          Complete Run & Dock
                        </button>
                      )}
                      {run.status === 'completed' && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Reconciled</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRuns.length === 0 && (
            <div className="p-8 text-center glass-panel rounded-2xl">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No route runs found</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting filters or click Dispatch New Run.</p>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: TARGET DELIVERY ROUTES (MASTER ROSTER)                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'target_routes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-500" />
                <span>Target Routes Registry</span>
              </h2>
              <p className="text-xs text-slate-500">
                Master delivery routes templates. Add recurring routes, configure bottle target loads, or delete inactive routes.
              </p>
            </div>
            <button
              onClick={() => setShowAddTargetRouteModal(true)}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Target Route</span>
            </button>
          </div>

          {/* Target Routes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTargetRoutes.map((route) => (
              <div
                key={route.id}
                className="glass-panel p-5 rounded-2xl space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all border border-slate-200/80 dark:border-slate-800 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 flex flex-col items-center justify-center text-sky-600 dark:text-sky-400">
                      <span className="text-[10px] font-black uppercase tracking-wider">ROUTE</span>
                      <span className="text-xs font-black">{route.routeCode}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{route.name}</h3>
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" />
                        <span>{route.zoneName || 'Assigned Zone'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {route.shift}
                    </span>
                    <button
                      onClick={() => handleDeleteTargetRoute(route.id, route.routeCode)}
                      title="Delete Target Route"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {route.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    {route.description}
                  </p>
                )}

                {/* Route Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Target Jars</span>
                    <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {route.targetJars} Jars
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Cash Quota</span>
                    <span className="font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
                      {formatMoney(route.targetCash)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Slot & Bay</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {route.departureTime} • {route.loadingDockBay}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Planned Stops</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                      {route.estStops} Drop Points
                    </span>
                  </div>
                </div>

                {/* Rider & Unit Assignment */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="text-slate-500">
                    Rider: <b className="text-slate-800 dark:text-slate-200">{route.riderName || 'Unassigned'}</b>
                    <span className="mx-2">•</span>
                    Unit: <b className="text-slate-800 dark:text-slate-200">{route.vehicleReg || 'Unassigned'}</b>
                  </div>

                  <button
                    onClick={() => handleLaunchTargetRouteRun(route)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Launch Run</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTargetRoutes.length === 0 && (
            <div className="p-8 text-center glass-panel rounded-2xl">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Target Routes Found</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Target Route" to configure your first delivery target route.</p>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: DELIVERY ZONES & KARACHI SECTORS                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Delivery Zones & Karachi Sectors</span>
              </h2>
              <p className="text-xs text-slate-500">
                Organize plant delivery sectors. Adding a zone automatically makes it available in customer registration, route dispatch, and rider territory assignment.
              </p>
            </div>
            <button
              onClick={() => setShowAddZoneModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Zone</span>
            </button>
          </div>

          {/* Zones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.map((zone) => (
              <div
                key={zone.id}
                className="glass-panel p-5 rounded-2xl space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all border border-slate-200/80 dark:border-slate-800 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <span className="text-[10px] font-black uppercase">ZONE</span>
                      <span className="text-xs font-black">{zone.code}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{zone.name}</h3>
                      <p className="text-xs text-slate-500">{zone.city || 'Karachi'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteZone(zone.id, zone.name)}
                    title="Delete Zone"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Sector: {zone.sector || 'Central'}
                    </span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {zone.totalStops || 0} Planned Stops
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredZones.length === 0 && (
            <div className="p-8 text-center glass-panel rounded-2xl">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Zones Found</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add New Zone" to add a new Karachi delivery territory.</p>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: DISPATCH NEW RUN                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 space-y-5 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Dispatch New Delivery Run
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRun} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Target Zone & Sector
                </label>
                <select
                  value={newRun.zoneName}
                  onChange={(e) => setNewRun({ ...newRun, zoneName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  {zonesList.map((z) => (
                    <option key={z.id} value={`${z.name} (${z.code})`}>
                      {z.name} ({z.code}) — {z.sector || 'Sector'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Assigned Rider / Driver
                  </label>
                  <select
                    value={newRun.riderName}
                    onChange={(e) => setNewRun({ ...newRun, riderName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="Kamran Akmal (RD-04)">Kamran Akmal (RD-04)</option>
                    <option value="Muhammad Bilal (RD-07)">Muhammad Bilal (RD-07)</option>
                    <option value="Zubair Ahmed (RD-02)">Zubair Ahmed (RD-02)</option>
                    <option value="Farhan Ali (RD-09)">Farhan Ali (RD-09)</option>
                    <option value="Rashid Khan (RD-11)">Rashid Khan (RD-11)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Vehicle Fleet Unit
                  </label>
                  <select
                    value={newRun.vehicleReg}
                    onChange={(e) => setNewRun({ ...newRun, vehicleReg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="KC-9821 (Suzuki Bolan)">KC-9821 (Suzuki Bolan)</option>
                    <option value="KW-4412 (Hyundai Shehzore)">KW-4412 (Hyundai Shehzore)</option>
                    <option value="KR-1092 (Suzuki Ravi)">KR-1092 (Suzuki Ravi)</option>
                    <option value="KF-3184 (FAW Carrier)">KF-3184 (FAW Carrier)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Delivery Shift
                  </label>
                  <select
                    value={newRun.shift}
                    onChange={(e) => setNewRun({ ...newRun, shift: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="morning">Morning Shift (07:00 - 13:00)</option>
                    <option value="afternoon">Afternoon Shift (13:30 - 19:30)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Loading Bay
                  </label>
                  <select
                    value={newRun.loadingDockBay}
                    onChange={(e) => setNewRun({ ...newRun, loadingDockBay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="Bay #1">Bay #1 (Shehzore Heavy)</option>
                    <option value="Bay #2">Bay #2 (Suzuki Bolan)</option>
                    <option value="Bay #3">Bay #3 (Suzuki Ravi)</option>
                    <option value="Bay #4">Bay #4 (FAW Carrier)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Departure Slot
                  </label>
                  <input
                    type="text"
                    value={newRun.departureTime}
                    onChange={(e) => setNewRun({ ...newRun, departureTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    placeholder="08:30 AM"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Total 19L Jars
                  </label>
                  <input
                    type="number"
                    value={newRun.totalJars}
                    onChange={(e) => setNewRun({ ...newRun, totalJars: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Cash Target (PKR)
                  </label>
                  <input
                    type="number"
                    value={newRun.cashToCollect}
                    onChange={(e) => setNewRun({ ...newRun, cashToCollect: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sky-600"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-[11px] text-sky-800 dark:text-sky-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Authorizing this run updates Plant #4 loading inventory and marks the rider as on-route.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: ADD TARGET ROUTE                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showAddTargetRouteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 space-y-5 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add New Target Route
                </h3>
              </div>
              <button
                onClick={() => setShowAddTargetRouteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTargetRoute} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Route Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTargetRoute.routeCode}
                    onChange={(e) => setNewTargetRoute({ ...newTargetRoute, routeCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold uppercase"
                    placeholder="TR-105"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Target Route Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTargetRoute.name}
                    onChange={(e) => setNewTargetRoute({ ...newTargetRoute, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    placeholder="e.g. Malir Cantt Residential Express"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Target Zone & Sector *
                </label>
                <select
                  value={newTargetRoute.zoneId}
                  onChange={(e) => setNewTargetRoute({ ...newTargetRoute, zoneId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  {zonesList.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code}) — {z.sector || 'Sector'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Default Rider / Driver
                  </label>
                  <select
                    value={newTargetRoute.riderName}
                    onChange={(e) => setNewTargetRoute({ ...newTargetRoute, riderName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="Kamran Akmal (RD-04)">Kamran Akmal (RD-04)</option>
                    <option value="Muhammad Bilal (RD-07)">Muhammad Bilal (RD-07)</option>
                    <option value="Zubair Ahmed (RD-02)">Zubair Ahmed (RD-02)</option>
                    <option value="Farhan Ali (RD-09)">Farhan Ali (RD-09)</option>
                    <option value="Rashid Khan (RD-11)">Rashid Khan (RD-11)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Default Vehicle Unit
                  </label>
                  <select
                    value={newTargetRoute.vehicleReg}
                    onChange={(e) => setNewTargetRoute({ ...newTargetRoute, vehicleReg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="KC-9821 (Suzuki Bolan)">KC-9821 (Suzuki Bolan)</option>
                    <option value="KW-4412 (Hyundai Shehzore)">KW-4412 (Hyundai Shehzore)</option>
                    <option value="KR-1092 (Suzuki Ravi)">KR-1092 (Suzuki Ravi)</option>
                    <option value="KF-3184 (FAW Carrier)">KF-3184 (FAW Carrier)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Shift
                  </label>
                  <select
                    value={newTargetRoute.shift}
                    onChange={(e) => setNewTargetRoute({ ...newTargetRoute, shift: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Departure Slot
                  </label>
                  <input
                    type="text"
                    value={newTargetRoute.departureTime}
                    onChange={(e) => setNewTargetRoute({ ...newTargetRoute, departureTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    placeholder="08:00 AM"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Loading Bay
                  </label>
                  <input
                    type="text"
                    value={newTargetRoute.loadingDockBay}
                    onChange={(e) => setNewTargetRoute({ ...newTargetRoute, loadingDockBay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    placeholder="Bay #1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Target Jars Quota
                  </label>
                  <input
                    type="number"
                    value={newTargetRoute.targetJars}
                    onChange={(e) => setNewTargetRoute({ ...newTargetRoute, targetJars: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Cash Target (PKR)
                  </label>
                  <input
                    type="number"
                    value={newTargetRoute.targetCash}
                    onChange={(e) => setNewTargetRoute({ ...newTargetRoute, targetCash: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Est. Stops
                  </label>
                  <input
                    type="number"
                    value={newTargetRoute.estStops}
                    onChange={(e) => setNewTargetRoute({ ...newTargetRoute, estStops: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Route Description / Delivery Area Notes
                </label>
                <textarea
                  rows={2}
                  value={newTargetRoute.description}
                  onChange={(e) => setNewTargetRoute({ ...newTargetRoute, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  placeholder="e.g. Major residential and corporate accounts along Main Boulevard..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTargetRouteModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Save Target Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: ADD DELIVERY ZONE                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showAddZoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 space-y-5 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Delivery Zone & Sector
                </h3>
              </div>
              <button
                onClick={() => setShowAddZoneModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddZone} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Zone Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newZone.code}
                    onChange={(e) => setNewZone({ ...newZone, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold uppercase"
                    placeholder="Z-07"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newZone.name}
                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    placeholder="e.g. Malir Cantt & Model Colony"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Karachi Sector
                  </label>
                  <select
                    value={newZone.sector}
                    onChange={(e) => setNewZone({ ...newZone, sector: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="South">South (Clifton/DHA)</option>
                    <option value="East">East (Gulshan/PECHS)</option>
                    <option value="Central">Central (Nazimabad)</option>
                    <option value="Korangi">Korangi Industrial</option>
                    <option value="Malir">Malir & Cantt</option>
                    <option value="West">West (Site)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    City
                  </label>
                  <input
                    type="text"
                    value={newZone.city}
                    onChange={(e) => setNewZone({ ...newZone, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    placeholder="Karachi"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Target / Estimated Delivery Stops
                </label>
                <input
                  type="number"
                  value={newZone.totalStops}
                  onChange={(e) => setNewZone({ ...newZone, totalStops: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  placeholder="30"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  Adding this zone instantly updates the public customer registration portal and delivery territory dropdowns.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 4: PRINTABLE MANIFEST                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedManifestRun && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131c31] text-slate-900 dark:text-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-sky-600 dark:text-sky-400">
                    PANNIWALAY PURE WATER
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 uppercase">
                    Plant #4 Fleet
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                  OFFICIAL DELIVERY RUN MANIFEST — {selectedManifestRun.runNumber}
                </h4>
                <p className="text-xs text-slate-400">
                  Date: {selectedManifestRun.runDate} • Shift: {selectedManifestRun.shift.toUpperCase()} • Bay:{' '}
                  {selectedManifestRun.loadingDockBay}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
                <button
                  onClick={() => setSelectedManifestRun(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Run Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Rider / Phone</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedManifestRun.riderName}</span>
                <span className="text-slate-400 block text-[11px]">{selectedManifestRun.riderPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle Unit</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedManifestRun.vehicleReg}</span>
                <span className="text-slate-400 block text-[11px]">{selectedManifestRun.vehicleType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Jars Loaded</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedManifestRun.totalJars} Jars</span>
                <span className="text-slate-400 block text-[11px]">Exp Returns: {selectedManifestRun.emptyJarsExpected}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cash Target</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{formatMoney(selectedManifestRun.cashToCollect)}</span>
                <span className="text-slate-400 block text-[11px]">Due on Dock Return</span>
              </div>
            </div>

            {/* Simulated Stops List */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Planned Customer Drop Stops ({selectedManifestRun.totalStops} Stops)
              </h5>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                <div className="grid grid-cols-12 gap-2 p-2.5 bg-slate-100/70 dark:bg-slate-800/80 font-bold text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="col-span-1">#</span>
                  <span className="col-span-5">Client & Address</span>
                  <span className="col-span-2 text-center">Deliver</span>
                  <span className="col-span-2 text-center">Empty Ret</span>
                  <span className="col-span-2 text-right">Cash Due</span>
                </div>
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="grid grid-cols-12 gap-2 p-2.5 items-center">
                    <span className="col-span-1 font-bold text-slate-400">0{s}</span>
                    <div className="col-span-5">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {s === 1
                          ? 'Shaikh Petroleum HQ'
                          : s === 2
                          ? 'Begum Yasmeen Abbasi'
                          : s === 3
                          ? 'Engro Polymers Regional'
                          : s === 4
                          ? 'Dr. Tariq Farooq Clinic'
                          : 'Ocean Mall Tower Drop'}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {selectedManifestRun.zoneName}
                      </span>
                    </div>
                    <span className="col-span-2 text-center font-bold text-slate-800 dark:text-slate-200">
                      {s * 4} Jars
                    </span>
                    <span className="col-span-2 text-center font-bold text-slate-500">
                      {s * 3} Jars
                    </span>
                    <span className="col-span-2 text-right font-bold text-slate-900 dark:text-white">
                      {formatMoney(s * 880)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dock Signatures */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px]">
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center">
                <span className="text-slate-400 block mb-4">Dispatcher Dock Sign-off</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Farhan Danish (Fleet Lead)</span>
              </div>
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center">
                <span className="text-slate-400 block mb-4">Rider / Driver Signature</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedManifestRun.riderName}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
