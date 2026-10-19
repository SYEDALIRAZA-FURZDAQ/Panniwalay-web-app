import React, { useState, useEffect } from 'react';
import {
  Bike,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  ShieldCheck,
  CreditCard,
  Star,
  CheckCircle2,
  X,
  MapPin,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { KpiCard } from '@/components/common/KpiCard';
import { useCurrency } from '@/context/CurrencyContext';

interface RiderItem {
  id: number;
  riderId: string;
  fullName: string;
  phone: string;
  cnic: string;
  zoneName: string;
  vehicleReg: string;
  depositAmount: number;
  commissionRate: string;
  status: 'on_route' | 'available' | 'rest_day' | 'off_shift';
  dailyJarQuota: number;
  dailyJarsDelivered: number;
  cashInHand: number;
  rating: string;
}

export const RidersPage: React.FC = () => {
  const { formatMoney } = useCurrency();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [riders, setRiders] = useState<RiderItem[]>([
    {
      id: 1,
      riderId: 'RD-04',
      fullName: 'Kamran Akmal',
      phone: '+92-301-2345678',
      cnic: '42201-1234567-1',
      zoneName: 'Clifton & Sea View (Z-01)',
      vehicleReg: 'KC-9821 (Suzuki Bolan)',
      depositAmount: 15000,
      commissionRate: '15.00',
      status: 'on_route',
      dailyJarQuota: 120,
      dailyJarsDelivered: 84,
      cashInHand: 18480,
      rating: '4.85',
    },
    {
      id: 2,
      riderId: 'RD-07',
      fullName: 'Muhammad Bilal',
      phone: '+92-312-3456789',
      cnic: '42101-2345678-3',
      zoneName: 'DHA Phase 5 & 6 (Z-02)',
      vehicleReg: 'KW-4412 (Hyundai Shehzore)',
      depositAmount: 20000,
      commissionRate: '15.00',
      status: 'on_route',
      dailyJarQuota: 200,
      dailyJarsDelivered: 176,
      cashInHand: 38720,
      rating: '4.92',
    },
    {
      id: 3,
      riderId: 'RD-02',
      fullName: 'Zubair Ahmed',
      phone: '+92-333-4567890',
      cnic: '42301-3456789-5',
      zoneName: 'Gulshan-e-Iqbal Block 1-7 (Z-03)',
      vehicleReg: 'KR-1092 (Suzuki Ravi)',
      depositAmount: 15000,
      commissionRate: '14.00',
      status: 'available',
      dailyJarQuota: 100,
      dailyJarsDelivered: 98,
      cashInHand: 0,
      rating: '4.70',
    },
    {
      id: 4,
      riderId: 'RD-11',
      fullName: 'Rashid Khan',
      phone: '+92-345-5678901',
      cnic: '42501-4567890-7',
      zoneName: 'Korangi Industrial Area (Z-06)',
      vehicleReg: 'KF-3184 (FAW Carrier)',
      depositAmount: 18000,
      commissionRate: '16.00',
      status: 'on_route',
      dailyJarQuota: 160,
      dailyJarsDelivered: 45,
      cashInHand: 9900,
      rating: '4.88',
    },
    {
      id: 5,
      riderId: 'RD-09',
      fullName: 'Farhan Ali',
      phone: '+92-321-4567890',
      cnic: '42401-5678901-9',
      zoneName: 'PECHS & Tariq Road (Z-04)',
      vehicleReg: 'KC-9821 (Suzuki Bolan)',
      depositAmount: 15000,
      commissionRate: '15.00',
      status: 'available',
      dailyJarQuota: 110,
      dailyJarsDelivered: 0,
      cashInHand: 0,
      rating: '4.65',
    },
  ]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [handoverRider, setHandoverRider] = useState<RiderItem | null>(null);
  const [handoverAmount, setHandoverAmount] = useState<number>(0);
  const [zonesList, setZonesList] = useState<Array<{ id: number; name: string; code: string; sector?: string }>>([
    { id: 1, name: 'Clifton & Sea View', code: 'Z-01', sector: 'South' },
    { id: 2, name: 'DHA Phase 5 & 6', code: 'Z-02', sector: 'South' },
    { id: 3, name: 'Gulshan-e-Iqbal Block 1-7', code: 'Z-03', sector: 'East' },
    { id: 4, name: 'PECHS & Tariq Road', code: 'Z-04', sector: 'East' },
    { id: 5, name: 'North Nazimabad Block A-D', code: 'Z-05', sector: 'Central' },
    { id: 6, name: 'Korangi Industrial Area', code: 'Z-06', sector: 'Korangi' },
  ]);

  useEffect(() => {
    fetch('/api/zones')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setZonesList(data);
        }
      })
      .catch(() => {});
  }, []);

  // New Rider Form
  const [newRider, setNewRider] = useState({
    fullName: '',
    phone: '',
    cnic: '',
    zoneName: 'Clifton & Sea View (Z-01)',
    vehicleReg: 'KC-9821 (Suzuki Bolan)',
    depositAmount: 15000,
    commissionRate: '15.00',
    dailyJarQuota: 120,
  });

  const handleAddRider = (e: React.FormEvent) => {
    e.preventDefault();
    const created: RiderItem = {
      id: Date.now(),
      riderId: `RD-${String(riders.length + 1).padStart(2, '0')}`,
      fullName: newRider.fullName,
      phone: newRider.phone,
      cnic: newRider.cnic,
      zoneName: newRider.zoneName,
      vehicleReg: newRider.vehicleReg,
      depositAmount: Number(newRider.depositAmount),
      commissionRate: newRider.commissionRate,
      status: 'available',
      dailyJarQuota: Number(newRider.dailyJarQuota),
      dailyJarsDelivered: 0,
      cashInHand: 0,
      rating: '5.00',
    };

    setRiders([...riders, created]);
    setShowAddModal(false);
  };

  const handleRecordHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverRider) return;

    setRiders(
      riders.map((r) =>
        r.id === handoverRider.id
          ? { ...r, cashInHand: Math.max(0, r.cashInHand - Number(handoverAmount)) }
          : r
      )
    );
    setHandoverRider(null);
  };

  const filteredRiders = riders.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (
      search &&
      !r.fullName.toLowerCase().includes(search.toLowerCase()) &&
      !r.riderId.toLowerCase().includes(search.toLowerCase()) &&
      !r.phone.includes(search)
    ) {
      return false;
    }
    return true;
  });

  const totalDeposits = riders.reduce((a, b) => a + b.depositAmount, 0);
  const totalCashFleet = riders.reduce((a, b) => a + b.cashInHand, 0);
  const onRouteCount = riders.filter((r) => r.status === 'on_route').length;
  const availableCount = riders.filter((r) => r.status === 'available').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Fleet Riders & Drivers Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Driver roster, security deposits escrow, daily delivery quotas, and dock cash handovers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              window.open('/api/riders/export/csv', '_blank');
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Rider</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Riders Roster"
          value={riders.length}
          subtitle={`${availableCount} Available, ${onRouteCount} On Route`}
          icon={Bike}
        />
        <KpiCard
          title="Riders Currently On-Route"
          value={onRouteCount}
          subtitle="Delivering in Karachi sectors"
          icon={Truck}
        />
        <KpiCard
          title="Total Cash In Hand Fleet"
          value={formatMoney(totalCashFleet)}
          subtitle="Awaiting evening dock reconciliation"
          icon={CreditCard}
        />
        <KpiCard
          title="Rider Deposits Escrow"
          value={formatMoney(totalDeposits)}
          subtitle="Held as collateral security"
          icon={ShieldCheck}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Riders ({riders.length})
            </button>
            <button
              onClick={() => setStatusFilter('on_route')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'on_route'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              On Route ({onRouteCount})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'available'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Available ({availableCount})
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-sky-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Riders Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4">Contact & CNIC</th>
                <th className="py-3 px-4">Assigned Zone & Vehicle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deliveries Today</th>
                <th className="py-3 px-4">Cash In Hand</th>
                <th className="py-3 px-4">Deposit Held</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredRiders.map((rider) => (
                <tr
                  key={rider.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold flex items-center justify-center text-xs">
                        {rider.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {rider.fullName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          {rider.riderId}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300 block">
                      {rider.phone}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{rider.cnic}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {rider.zoneName}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{rider.vehicleReg}</span>
                  </td>
                  <td className="py-3 px-4">
                    {rider.status === 'on_route' && <Badge variant="cyan">On Route</Badge>}
                    {rider.status === 'available' && <Badge variant="success">Available</Badge>}
                    {rider.status === 'rest_day' && <Badge variant="outline">Rest Day</Badge>}
                    {rider.status === 'off_shift' && <Badge variant="default">Off Shift</Badge>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rider.dailyJarsDelivered} / {rider.dailyJarQuota}
                    </span>
                    <span className="text-[11px] text-slate-400 block">Jars (19L)</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatMoney(rider.cashInHand)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {formatMoney(rider.depositAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{rider.rating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setHandoverRider(rider);
                        setHandoverAmount(rider.cashInHand);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-300 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Cash Handover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Rider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 space-y-4 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Onboard Fleet Rider
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRider} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Tariq Aziz"
                  value={newRider.fullName}
                  onChange={(e) => setNewRider({ ...newRider, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Phone Number</label>
                  <input
                    required
                    type="text"
                    placeholder="+92-300-1234567"
                    value={newRider.phone}
                    onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">CNIC #</label>
                  <input
                    required
                    type="text"
                    placeholder="42201-XXXXXXX-X"
                    value={newRider.cnic}
                    onChange={(e) => setNewRider({ ...newRider, cnic: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Assigned Zone</label>
                <select
                  value={newRider.zoneName}
                  onChange={(e) => setNewRider({ ...newRider, zoneName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {zonesList.map((z) => (
                    <option key={z.id} value={`${z.name} (${z.code})`}>
                      {z.name} ({z.code}) {z.sector ? `— ${z.sector}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Security Deposit (PKR)</label>
                  <input
                    type="number"
                    value={newRider.depositAmount}
                    onChange={(e) => setNewRider({ ...newRider, depositAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Daily Jar Quota</label>
                  <input
                    type="number"
                    value={newRider.dailyJarQuota}
                    onChange={(e) => setNewRider({ ...newRider, dailyJarQuota: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cash Handover Modal */}
      {handoverRider && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-sm w-full p-6 space-y-4 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record Dock Cash Handover
              </h3>
              <button onClick={() => setHandoverRider(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordHandover} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Rider Details</span>
                <p className="font-bold text-slate-900 dark:text-white">{handoverRider.fullName} ({handoverRider.riderId})</p>
                <p className="text-rose-500 font-semibold">Total Due: {formatMoney(handoverRider.cashInHand)}</p>
              </div>

              <div>
                <label className="font-semibold block mb-1">Cash Received at Dock (PKR)</label>
                <input
                  type="number"
                  required
                  value={handoverAmount}
                  onChange={(e) => setHandoverAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setHandoverRider(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
