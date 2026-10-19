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

export const RouteDispatchPage: React.FC = () => {
  const { formatMoney } = useCurrency();
  const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

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

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedManifestRun, setSelectedManifestRun] = useState<RouteRunItem | null>(null);

  // New Run Form State
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

  const handleCreateRun = (e: React.FormEvent) => {
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

    setRuns([createdRun, ...runs]);
    setShowCreateModal(false);
  };

  const updateStatus = (id: number, nextStatus: RouteRunItem['status']) => {
    setRuns(runs.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)));
  };

  const filteredRuns = runs.filter((r) => {
    if (shiftFilter !== 'all' && r.shift !== shiftFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search && !r.runNumber.toLowerCase().includes(search.toLowerCase()) && !r.riderName.toLowerCase().includes(search.toLowerCase()) && !r.zoneName.toLowerCase().includes(search.toLowerCase())) {
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
            Route Dispatch & Fleet Distribution
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plant #4 loading bays, vehicle departure schedules, and manifest tracking
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Route Run</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Runs Today"
          value={runs.length}
          subtitle="4 Active, 1 Completed"
          icon={Navigation}
        />
        <KpiCard
          title="Total Jars Dispatched"
          value={`${totalJarsOut} Jars`}
          subtitle={`${totalDelivered} delivered so far`}
          icon={Truck}
        />
        <KpiCard
          title="Empty Returns Expected"
          value={`${totalExpectedEmpty} Jars`}
          subtitle={`${totalReturnedEmpty} checked-in at bays`}
          icon={RotateCw}
        />
        <KpiCard
          title="Cash in Hand Fleet"
          value={formatMoney(runs.reduce((a, b) => a + b.cashCollected, 0))}
          subtitle="Awaiting dock handover"
          icon={CheckCircle2}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Shift Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setShiftFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                shiftFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Shifts
            </button>
            <button
              onClick={() => setShiftFilter('morning')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                shiftFilter === 'morning'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Morning (07:00)
            </button>
            <button
              onClick={() => setShiftFilter('afternoon')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                shiftFilter === 'afternoon'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Afternoon (13:30)
            </button>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search run, rider, or zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-sky-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Route Runs Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRuns.map((run) => {
          const jarPct = Math.round((run.deliveredJars / (run.totalJars || 1)) * 100);
          const stopPct = Math.round((run.completedStops / (run.totalStops || 1)) * 100);

          return (
            <div
              key={run.id}
              className="glass-panel rounded-2xl p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Header */}
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

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {run.loadingDockBay}
                  </span>
                  <span className="text-[11px] text-slate-400">{run.departureTime}</span>
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
                      className={`h-full rounded-full transition-all duration-300 ${jarPct === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                      style={{ width: `${jarPct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                  <span className="text-slate-500">
                    Stops: <b className="text-slate-800 dark:text-slate-200">{run.completedStops}/{run.totalStops}</b>
                  </span>
                  <span className="text-slate-500">
                    Empty Ret: <b className="text-slate-800 dark:text-slate-200">{run.emptyJarsReturned}/{run.emptyJarsExpected}</b>
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
                      Reconciled
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Route Run Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 space-y-5 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Dispatch New Route Run
                </h3>
                <p className="text-xs text-slate-500">Configure vehicle load & zone assignment</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRun} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Target Zone & Sector
                </label>
                <select
                  value={newRun.zoneName}
                  onChange={(e) => setNewRun({ ...newRun, zoneName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Clifton & Sea View (Z-01)">Clifton & Sea View (Z-01)</option>
                  <option value="DHA Phase 5 & 6 (Z-02)">DHA Phase 5 & 6 (Z-02)</option>
                  <option value="Gulshan-e-Iqbal Block 1-7 (Z-03)">Gulshan-e-Iqbal Block 1-7 (Z-03)</option>
                  <option value="PECHS & Tariq Road (Z-04)">PECHS & Tariq Road (Z-04)</option>
                  <option value="North Nazimabad Block A-D (Z-05)">North Nazimabad Block A-D (Z-05)</option>
                  <option value="Korangi Industrial Area (Z-06)">Korangi Industrial Area (Z-06)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Assigned Rider
                  </label>
                  <select
                    value={newRun.riderName}
                    onChange={(e) => setNewRun({ ...newRun, riderName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Kamran Akmal (RD-04)">Kamran Akmal (RD-04)</option>
                    <option value="Muhammad Bilal (RD-07)">Muhammad Bilal (RD-07)</option>
                    <option value="Zubair Ahmed (RD-02)">Zubair Ahmed (RD-02)</option>
                    <option value="Rashid Khan (RD-11)">Rashid Khan (RD-11)</option>
                    <option value="Farhan Ali (RD-09)">Farhan Ali (RD-09)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Fleet Vehicle
                  </label>
                  <select
                    value={newRun.vehicleReg}
                    onChange={(e) => setNewRun({ ...newRun, vehicleReg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="KC-9821 (Suzuki Bolan)">KC-9821 (Suzuki Bolan 120 cap)</option>
                    <option value="KW-4412 (Hyundai Shehzore)">KW-4412 (Hyundai Shehzore 250 cap)</option>
                    <option value="KR-1092 (Suzuki Ravi)">KR-1092 (Suzuki Ravi 100 cap)</option>
                    <option value="KF-3184 (FAW Carrier)">KF-3184 (FAW Carrier 160 cap)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Shift</label>
                  <select
                    value={newRun.shift}
                    onChange={(e) => setNewRun({ ...newRun, shift: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Bay #</label>
                  <select
                    value={newRun.loadingDockBay}
                    onChange={(e) => setNewRun({ ...newRun, loadingDockBay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Bay #1">Bay #1 (High Volume)</option>
                    <option value="Bay #2">Bay #2</option>
                    <option value="Bay #3">Bay #3</option>
                    <option value="Bay #4">Bay #4</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Departure</label>
                  <input
                    type="text"
                    value={newRun.departureTime}
                    onChange={(e) => setNewRun({ ...newRun, departureTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Total Loaded 19L Jars
                  </label>
                  <input
                    type="number"
                    value={newRun.totalJars}
                    onChange={(e) => setNewRun({ ...newRun, totalJars: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Cash Target (PKR)
                  </label>
                  <input
                    type="number"
                    value={newRun.cashToCollect}
                    onChange={(e) => setNewRun({ ...newRun, cashToCollect: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                >
                  Confirm & Print Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Manifest Modal (Printable) */}
      {selectedManifestRun && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-2xl w-full p-6 space-y-5 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delivery Manifest & Loading Slip — {selectedManifestRun.runNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Manifest</span>
                </button>
                <button
                  onClick={() => setSelectedManifestRun(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Manifest Content */}
            <div className="space-y-4 text-xs border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    PANNIWALAY MINERAL WATER
                  </h4>
                  <p className="text-slate-500">Plant #4 • Korangi Industrial Area, Karachi</p>
                  <p className="text-slate-500">Emergency Dispatch: +92-300-8291444</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Manifest #{selectedManifestRun.runNumber}
                  </span>
                  <span className="text-slate-500 block">Date: {selectedManifestRun.runDate}</span>
                  <span className="text-slate-500 block">Bay: {selectedManifestRun.loadingDockBay}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver / Rider</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedManifestRun.riderName}</span>
                  <span className="text-slate-500 block">{selectedManifestRun.riderPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle Assigned</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedManifestRun.vehicleReg}</span>
                  <span className="text-slate-500 block">{selectedManifestRun.vehicleType}</span>
                </div>
              </div>

              {/* Sample Customer Stops */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Sequential Manifest Stops ({selectedManifestRun.totalStops} Stops)
                </span>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase font-bold">
                      <th className="py-1.5">#</th>
                      <th className="py-1.5">Client</th>
                      <th className="py-1.5">Address</th>
                      <th className="py-1.5">Deliver</th>
                      <th className="py-1.5">Empty</th>
                      <th className="py-1.5 text-right">Cash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-2 font-bold">1</td>
                      <td className="py-2 font-semibold">Shaikh Petroleum Corp</td>
                      <td className="py-2 text-slate-500">Suite 602, Clifton Tower</td>
                      <td className="py-2 font-bold text-sky-600">18 Jars</td>
                      <td className="py-2 text-amber-600">18 Empty</td>
                      <td className="py-2 text-right font-bold">PKR 3,960</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold">2</td>
                      <td className="py-2 font-semibold">Begum Yasmeen Abbasi</td>
                      <td className="py-2 text-slate-500">House 44/2, 17th St DHA</td>
                      <td className="py-2 font-bold text-sky-600">3 Jars</td>
                      <td className="py-2 text-amber-600">3 Empty</td>
                      <td className="py-2 text-right font-bold">PKR 660</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold">3</td>
                      <td className="py-2 font-semibold">Engro Polymers HQ</td>
                      <td className="py-2 text-slate-500">Plot 12, Sector 15 Korangi</td>
                      <td className="py-2 font-bold text-sky-600">45 Jars</td>
                      <td className="py-2 text-amber-600">40 Empty</td>
                      <td className="py-2 text-right font-bold">PKR 9,900</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold">4</td>
                      <td className="py-2 font-semibold">Farooq Medical Center</td>
                      <td className="py-2 text-slate-500">B-12, Block 4 Gulshan</td>
                      <td className="py-2 font-bold text-sky-600">5 Jars</td>
                      <td className="py-2 text-amber-600">5 Empty</td>
                      <td className="py-2 text-right font-bold">PKR 1,100</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Manifest Summary */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold">
                <span>Total Loaded: {selectedManifestRun.totalJars} Jars</span>
                <span className="text-sky-600 dark:text-sky-400">Total Due: {formatMoney(selectedManifestRun.cashToCollect)}</span>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">
                <div className="border-t border-slate-400 dark:border-slate-600 pt-1">
                  <span>Dock Dispatcher Signature</span>
                </div>
                <div className="border-t border-slate-400 dark:border-slate-600 pt-1">
                  <span>Rider / Driver Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
