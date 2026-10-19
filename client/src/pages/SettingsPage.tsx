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
  const [activeTab, setActiveTab] = useState<'plant' | 'theme' | 'currency' | 'bottles'>('plant');
  const [saved, setSaved] = useState(false);

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
    </div>
  );
};
