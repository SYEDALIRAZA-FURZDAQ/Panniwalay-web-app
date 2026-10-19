import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Palette,
  Coins,
  Droplets,
  Save,
  Check,
  ShieldCheck,
  Phone,
  MapPin,
  Moon,
  Sun,
  Monitor,
  Compass,
  Trash2,
  Plus,
  X,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency, CurrencyCode } from '@/context/CurrencyContext';

const BRAND_TINTS = [
  { name: 'Oceanic Sky (Default)', hex: '#0284c7' },
  { name: 'Emerald Spring', hex: '#059669' },
  { name: 'Crystalline Cyan', hex: '#0891b2' },
  { name: 'Cobalt Pure', hex: '#2563eb' },
  { name: 'Indigo Marine', hex: '#4f46e5' },
];

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, brandTint, setBrandTint } = useTheme();
  const { currency, setCurrency, rates } = useCurrency();
  const [activeTab, setActiveTab] = useState<'plant' | 'theme' | 'currency' | 'bottles' | 'zones'>('plant');
  const [saved, setSaved] = useState(false);

  // Delivery Zones State
  const [zonesList, setZonesList] = useState<Array<{ id: number; name: string; code: string; sector?: string; city?: string; totalStops?: number }>>([
    { id: 1, name: 'Clifton & Sea View', code: 'Z-01', city: 'Karachi', sector: 'South', totalStops: 42 },
    { id: 2, name: 'DHA Phase 5 & 6', code: 'Z-02', city: 'Karachi', sector: 'South', totalStops: 58 },
    { id: 3, name: 'Gulshan-e-Iqbal Block 1-7', code: 'Z-03', city: 'Karachi', sector: 'East', totalStops: 36 },
    { id: 4, name: 'PECHS & Tariq Road', code: 'Z-04', city: 'Karachi', sector: 'East', totalStops: 29 },
    { id: 5, name: 'North Nazimabad Block A-D', code: 'Z-05', city: 'Karachi', sector: 'Central', totalStops: 34 },
    { id: 6, name: 'Korangi Industrial Area', code: 'Z-06', city: 'Karachi', sector: 'Korangi', totalStops: 48 },
  ]);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [newZone, setNewZone] = useState({ name: '', code: '', sector: 'East', city: 'Karachi', totalStops: 25 });

  React.useEffect(() => {
    fetch('/api/zones')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setZonesList(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.name || !newZone.code) return;
    const created = { id: Date.now(), ...newZone, code: newZone.code.toUpperCase() };
    try {
      const res = await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
      if (res.ok) {
        const savedZone = await res.json();
        created.id = savedZone.id || created.id;
      }
    } catch (e) {}
    setZonesList([...zonesList, created]);
    setShowAddZoneModal(false);
    setNewZone({ name: '', code: '', sector: 'East', city: 'Karachi', totalStops: 25 });
  };

  const handleDeleteZone = async (id: number, name: string) => {
    if (!window.confirm(`Delete delivery zone "${name}"?`)) return;
    try {
      await fetch(`/api/zones/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setZonesList(zonesList.filter((z) => z.id !== id));
  };

  // Form State
  const [plantSettings, setPlantSettings] = useState({
    name: 'Plant #4 — Karachi Industrial Area',
    address: 'Plot 42-B, Sector 15, Korangi Industrial Area, Karachi, Pakistan',
    phone: '+92-21-35061234',
    emergencyPhone: '+92-300-8291444',
    managerName: 'Tariq Mansoor',
    operatingHours: '06:00 AM - 08:00 PM (Monday - Saturday)',
  });

  const [bottleSettings, setBottleSettings] = useState({
    standardDeposit: 1000,
    standardRefill: 220,
    dispenserDeposit: 8500,
    dispenserSale: 21500,
    maxRunCapacity: 120,
    damagePenalty: 850,
  });

  const [fxRates, setFxRates] = useState<Record<string, number>>({
    USD: rates.USD || 0.0036,
    AED: rates.AED || 0.0132,
    SAR: rates.SAR || 0.0135,
    EUR: rates.EUR || 0.0033,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            System & Brand Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plant configuration, visual appearance, multi-currency conversion, and bottle escrow defaults
          </p>
        </div>

        <button
          onClick={handleSave}
          className={`px-4 py-2.5 rounded-xl text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
            saved ? 'bg-emerald-600' : 'bg-sky-600 hover:bg-sky-500'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Changes Saved!' : 'Save System Settings'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-panel rounded-2xl p-2 flex space-x-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('plant')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'plant'
              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Plant & Operations Info</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Brand Styling & Theme</span>
        </button>

        <button
          onClick={() => setActiveTab('currency')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'currency'
              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Multi-Currency & FX</span>
        </button>

        <button
          onClick={() => setActiveTab('bottles')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'bottles'
              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Bottle & Escrow Defaults</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'zones'
              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Territory & Delivery Zones</span>
        </button>
      </div>

      {/* Tab 1: Plant & Operations Info */}
      {activeTab === 'plant' && (
        <form onSubmit={handleSave} className="glass-panel rounded-2xl p-6 space-y-5 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Karachi Bottling Plant Profile
            </h3>
            <p className="text-xs text-slate-400">
              Printed on delivery manifests, customer receipts, and system notifications
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Facility & Plant Identification
              </label>
              <input
                type="text"
                value={plantSettings.name}
                onChange={(e) => setPlantSettings({ ...plantSettings, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Physical Plant Address
              </label>
              <textarea
                rows={2}
                value={plantSettings.address}
                onChange={(e) => setPlantSettings({ ...plantSettings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Landline Dispatch Desk
                </label>
                <input
                  type="text"
                  value={plantSettings.phone}
                  onChange={(e) => setPlantSettings({ ...plantSettings, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  24/7 Fleet Emergency Line
                </label>
                <input
                  type="text"
                  value={plantSettings.emergencyPhone}
                  onChange={(e) => setPlantSettings({ ...plantSettings, emergencyPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Plant Manager on Duty
                </label>
                <input
                  type="text"
                  value={plantSettings.managerName}
                  onChange={(e) => setPlantSettings({ ...plantSettings, managerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Operational Dispatch Shifts
                </label>
                <input
                  type="text"
                  value={plantSettings.operatingHours}
                  onChange={(e) => setPlantSettings({ ...plantSettings, operatingHours: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Theme & Brand Styling */}
      {activeTab === 'theme' && (
        <div className="glass-panel rounded-2xl p-6 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Visual Appearance & Theme Mode
            </h3>
            <p className="text-xs text-slate-400">
              Customize contrast and primary accent tint matching Panniwalay visual identity
            </p>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Theme Interface Mode
            </span>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light Clean', icon: Sun },
                { id: 'dark', label: 'Dark Sleek', icon: Moon },
                { id: 'system', label: 'System Default', icon: Monitor },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Primary Brand Color Accent
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BRAND_TINTS.map((t) => {
                const isSelected = brandTint === t.hex;
                return (
                  <button
                    key={t.hex}
                    type="button"
                    onClick={() => setBrandTint(t.hex)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 dark:border-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: t.hex }}></div>
                      <span className="font-semibold text-slate-900 dark:text-white">{t.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Multi-Currency & FX */}
      {activeTab === 'currency' && (
        <div className="glass-panel rounded-2xl p-6 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Multi-Currency Configuration & FX Conversion
            </h3>
            <p className="text-xs text-slate-400">
              Base operational ledger is Pakistani Rupee (PKR). Live display converts seamlessly across supported foreign currencies.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Active Display Currency</span>
                <span className="text-slate-500">Currently selected globally across all pages</span>
              </div>
              <div className="flex gap-2">
                {(['PKR', 'USD', 'AED', 'SAR', 'EUR'] as CurrencyCode[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                      currency === c
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="font-bold uppercase tracking-wider text-slate-400 block text-[11px]">
                Exchange Rates (PKR Base)
              </span>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(fxRates).map(([curr, rate]) => (
                  <div key={curr} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">1 PKR = {rate} {curr}</span>
                    <span className="text-[11px] text-slate-400 block">
                      (Approx. 1 {curr} = {Math.round(1 / rate).toLocaleString()} PKR)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Bottle & Escrow Defaults */}
      {activeTab === 'bottles' && (
        <form onSubmit={handleSave} className="glass-panel rounded-2xl p-6 space-y-5 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bottle Collateral & Escrow Pricing Parameters
            </h3>
            <p className="text-xs text-slate-400">
              Default billing rates applied during customer onboarding and delivery run calculations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                19-Litre Bottle Security Deposit (PKR)
              </label>
              <input
                type="number"
                value={bottleSettings.standardDeposit}
                onChange={(e) => setBottleSettings({ ...bottleSettings, standardDeposit: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">100% refundable upon account closing</span>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                19-Litre Refill Standard Price (PKR)
              </label>
              <input
                type="number"
                value={bottleSettings.standardRefill}
                onChange={(e) => setBottleSettings({ ...bottleSettings, standardRefill: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Includes delivery to doorstep</span>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Hot & Cold Dispenser Collateral Deposit (PKR)
              </label>
              <input
                type="number"
                value={bottleSettings.dispenserDeposit}
                onChange={(e) => setBottleSettings({ ...bottleSettings, dispenserDeposit: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Damaged / Lost Shell Replacement Penalty (PKR)
              </label>
              <input
                type="number"
                value={bottleSettings.damagePenalty}
                onChange={(e) => setBottleSettings({ ...bottleSettings, damagePenalty: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </form>
      )}

      {/* Tab 5: Territory & Delivery Zones */}
      {activeTab === 'zones' && (
        <div className="space-y-4 max-w-4xl">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                  <span>Karachi Delivery Zones & Coverage Sectors</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage active delivery territories. Adding or removing zones immediately updates customer sign-up forms, rider allocations, and route dispatch.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddZoneModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Zone</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {zonesList.map((z) => (
                <div
                  key={z.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {z.code}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{z.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Sector: {z.sector || 'Central'} • {z.city || 'Karachi'}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                      {z.totalStops || 25} Planned Stops
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteZone(z.id, z.name)}
                    title="Delete Zone"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Zone Modal */}
          {showAddZoneModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="glass-panel rounded-2xl max-w-md w-full p-6 space-y-4 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>Add Delivery Zone</span>
                  </h3>
                  <button onClick={() => setShowAddZoneModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddZone} className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold block mb-1">Zone Code *</label>
                      <input
                        required
                        type="text"
                        placeholder="Z-07"
                        value={newZone.code}
                        onChange={(e) => setNewZone({ ...newZone, code: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold uppercase"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="font-semibold block mb-1">Zone Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Malir Cantt"
                        value={newZone.name}
                        onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1">Sector</label>
                      <select
                        value={newZone.sector}
                        onChange={(e) => setNewZone({ ...newZone, sector: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="South">South (Clifton/DHA)</option>
                        <option value="East">East (Gulshan/PECHS)</option>
                        <option value="Central">Central (Nazimabad)</option>
                        <option value="Korangi">Korangi Industrial</option>
                        <option value="Malir">Malir & Cantt</option>
                        <option value="West">West</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Planned Stops</label>
                      <input
                        type="number"
                        value={newZone.totalStops}
                        onChange={(e) => setNewZone({ ...newZone, totalStops: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                      />
                    </div>
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
        </div>
      )}
    </div>
  );
};
