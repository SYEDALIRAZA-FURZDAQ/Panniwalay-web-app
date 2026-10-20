import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Droplets,
  AlertTriangle,
  RotateCw,
  Warehouse,
  Boxes,
  TrendingDown,
  X,
  ArrowUpDown,
  CheckCircle2,
  Trash2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { KpiCard } from '@/components/common/KpiCard';
import { useCurrency } from '@/context/CurrencyContext';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: 'bottled_water' | 'dispensers_coolers' | 'caps_seals_accessories' | 'accessories';
  inPlantQty: number;
  withClientsQty: number;
  unitCost: number;
  salePrice: number;
  refundableDeposit: number;
  batchLot: string;
  bay: string;
  minThreshold: number;
  stockStatus: 'full_stock' | 'moderate' | 'low_stock' | 'reorder';
}

export const InventoryPage: React.FC = () => {
  const { formatMoney } = useCurrency();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: 1,
      name: '19-Litre Mineral Water Jar (Filled)',
      sku: 'WTR-19L-FIL',
      category: 'bottled_water',
      inPlantQty: 1840,
      withClientsQty: 4320,
      unitCost: 65,
      salePrice: 220,
      refundableDeposit: 1000,
      batchLot: 'LOT-2610-A',
      bay: 'Bay 4A',
      minThreshold: 400,
      stockStatus: 'full_stock',
    },
    {
      id: 2,
      name: 'Empty 19-Litre PC Bottle Shell (Ozonated Wash)',
      sku: 'WTR-19L-EMP',
      category: 'bottled_water',
      inPlantQty: 620,
      withClientsQty: 4320,
      unitCost: 850,
      salePrice: 1000,
      refundableDeposit: 1000,
      batchLot: 'PLT-4-RTN',
      bay: 'Bay 1Wash',
      minThreshold: 300,
      stockStatus: 'moderate',
    },
    {
      id: 3,
      name: 'Hot & Cold Water Dispenser (Compressor)',
      sku: 'DSP-ELEC-HC',
      category: 'dispensers_coolers',
      inPlantQty: 45,
      withClientsQty: 185,
      unitCost: 14500,
      salePrice: 21500,
      refundableDeposit: 8500,
      batchLot: 'DSP-2026',
      bay: 'Aisle 3',
      minThreshold: 15,
      stockStatus: 'full_stock',
    },
    {
      id: 4,
      name: 'Manual Hand Suction Pump',
      sku: 'ACC-PMP-MAN',
      category: 'accessories',
      inPlantQty: 320,
      withClientsQty: 750,
      unitCost: 280,
      salePrice: 550,
      refundableDeposit: 0,
      batchLot: 'PMP-Q4',
      bay: 'Bin 12',
      minThreshold: 50,
      stockStatus: 'full_stock',
    },
    {
      id: 5,
      name: 'Tabletop Chrome Bottle Cradle / Stand',
      sku: 'ACC-STND-MET',
      category: 'accessories',
      inPlantQty: 85,
      withClientsQty: 210,
      unitCost: 750,
      salePrice: 1400,
      refundableDeposit: 0,
      batchLot: 'STN-2026',
      bay: 'Bin 14',
      minThreshold: 20,
      stockStatus: 'full_stock',
    },
    {
      id: 6,
      name: '55mm Non-Spill Snap-On Caps (Pack of 100)',
      sku: 'CAP-55MM-100',
      category: 'caps_seals_accessories',
      inPlantQty: 120,
      withClientsQty: 0,
      unitCost: 350,
      salePrice: 500,
      refundableDeposit: 0,
      batchLot: 'CAP-OCT26',
      bay: 'Store Rm 2',
      minThreshold: 30,
      stockStatus: 'full_stock',
    },
    {
      id: 7,
      name: 'Tamper Evident Heat Shrink Neck Sleeves (1000 pcs)',
      sku: 'SEAL-SHR-1K',
      category: 'caps_seals_accessories',
      inPlantQty: 18,
      withClientsQty: 0,
      unitCost: 1200,
      salePrice: 1800,
      refundableDeposit: 0,
      batchLot: 'SLV-2610',
      bay: 'Store Rm 2',
      minThreshold: 25,
      stockStatus: 'low_stock',
    },
  ]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');

  // Delete with password
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const handleDeleteWithPassword = async () => {
    if (!deleteItem || !deletePassword.trim()) {
      setDeleteError('Please enter your password');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      // Verify the logged-in user's password
      const verifyRes = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: deletePassword }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        setDeleteError(verifyData.error || 'Incorrect password. Access denied.');
        setDeleteLoading(false);
        return;
      }

      // Password verified — remove the item
      setItems(items.filter((i) => i.id !== deleteItem.id));
      setDeleteItem(null);
      setDeletePassword('');
      setDeleteError('');
      setShowDeletePassword(false);
    } catch (err) {
      setDeleteError('Verification failed. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: 'bottled_water' as InventoryItem['category'],
    inPlantQty: 100,
    unitCost: 100,
    salePrice: 200,
    refundableDeposit: 0,
    bay: 'Bay #1',
    minThreshold: 20,
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const created: InventoryItem = {
      id: Date.now(),
      name: newItem.name,
      sku: newItem.sku || `SKU-${Date.now().toString().slice(-4)}`,
      category: newItem.category,
      inPlantQty: Number(newItem.inPlantQty),
      withClientsQty: 0,
      unitCost: Number(newItem.unitCost),
      salePrice: Number(newItem.salePrice),
      refundableDeposit: Number(newItem.refundableDeposit),
      batchLot: 'LOT-NEW',
      bay: newItem.bay,
      minThreshold: Number(newItem.minThreshold),
      stockStatus: 'full_stock',
    };

    setItems([...items, created]);
    setShowAddModal(false);
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;

    setItems(
      items.map((item) => {
        if (item.id === adjustItem.id) {
          const delta = adjustType === 'in' ? Number(adjustQty) : -Number(adjustQty);
          const newQty = Math.max(0, item.inPlantQty + delta);
          return {
            ...item,
            inPlantQty: newQty,
            stockStatus: newQty < item.minThreshold ? 'low_stock' : 'full_stock',
          };
        }
        return item;
      })
    );
    setAdjustItem(null);
  };

  const filteredItems = items.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (
      search &&
      !item.name.toLowerCase().includes(search.toLowerCase()) &&
      !item.sku.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // KPI Calculations
  const inPlantJars = items
    .filter((i) => i.category === 'bottled_water')
    .reduce((a, b) => a + b.inPlantQty, 0);

  const clientJars = items
    .filter((i) => i.category === 'bottled_water')
    .reduce((a, b) => a + b.withClientsQty, 0);

  const assetValuation = items.reduce(
    (a, b) => a + (b.inPlantQty + b.withClientsQty) * b.unitCost,
    0
  );

  const lowStockCount = items.filter((i) => i.stockStatus === 'low_stock').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plant #4 mineral water bottling line, carboy asset tracking, dispensers, and packaging consumables
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.open('/api/inventory/export/csv', '_blank')}
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
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="In-Plant 19L Bottles"
          value={`${inPlantJars} Jars`}
          subtitle="1,840 Filled + 620 Empty Shells"
          icon={Droplets}
        />
        <KpiCard
          title="Bottles in Circulation"
          value={`${clientJars} Jars`}
          subtitle="With residential & corporate clients"
          icon={Boxes}
        />
        <KpiCard
          title="Inventory Asset Valuation"
          value={formatMoney(assetValuation)}
          subtitle="At plant cost basis"
          icon={Warehouse}
        />
        <KpiCard
          title="Consumable Stock Health"
          value={lowStockCount > 0 ? `${lowStockCount} Reorder Alert` : 'All Optimal'}
          subtitle="Neck heat shrink sleeves low"
          icon={AlertTriangle}
          iconColor={lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'}
          iconBg={lowStockCount > 0 ? 'bg-amber-50 dark:bg-amber-950/60' : 'bg-emerald-50 dark:bg-emerald-950/60'}
        />
      </div>

      {/* Tabs and Search */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Stock ({items.length})
          </button>
          <button
            onClick={() => setActiveCategory('bottled_water')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCategory === 'bottled_water'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            19L Water & Shells
          </button>
          <button
            onClick={() => setActiveCategory('dispensers_coolers')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCategory === 'dispensers_coolers'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Dispensers
          </button>
          <button
            onClick={() => setActiveCategory('caps_seals_accessories')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCategory === 'caps_seals_accessories'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Caps & Tamper Seals
          </button>
          <button
            onClick={() => setActiveCategory('accessories')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCategory === 'accessories'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pumps & Stands
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU or item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-sky-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Bay Location</th>
                <th className="py-3 px-4">In-Plant Qty</th>
                <th className="py-3 px-4">With Clients</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Sale Price</th>
                <th className="py-3 px-4">Refundable Deposit</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {item.sku}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                      {item.bay}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white tabular-nums">
                    {item.inPlantQty.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                    {item.withClientsQty.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 tabular-nums">
                    {formatMoney(item.unitCost)}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatMoney(item.salePrice)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                    {item.refundableDeposit > 0 ? formatMoney(item.refundableDeposit) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {item.stockStatus === 'full_stock' && <Badge variant="success">Full Stock</Badge>}
                    {item.stockStatus === 'moderate' && <Badge variant="info">Moderate</Badge>}
                    {item.stockStatus === 'low_stock' && <Badge variant="warning">Low Stock</Badge>}
                    {item.stockStatus === 'reorder' && <Badge variant="danger">Reorder Now</Badge>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setAdjustItem(item);
                          setAdjustQty(10);
                          setAdjustType('in');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-300 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Stock Adjust
                      </button>
                      <button
                        onClick={() => {
                          setDeleteItem(item);
                          setDeletePassword('');
                          setDeleteError('');
                          setShowDeletePassword(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-400 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 space-y-4 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Inventory Item
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Item Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 5-Gallon Polycarbonate Carboy"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="bottled_water">Bottled Water</option>
                    <option value="dispensers_coolers">Dispensers</option>
                    <option value="accessories">Accessories</option>
                    <option value="caps_seals_accessories">Caps & Seals</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Bay Location</label>
                  <input
                    type="text"
                    value={newItem.bay}
                    onChange={(e) => setNewItem({ ...newItem, bay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">In-Plant Qty</label>
                  <input
                    type="number"
                    value={newItem.inPlantQty}
                    onChange={(e) => setNewItem({ ...newItem, inPlantQty: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Unit Cost</label>
                  <input
                    type="number"
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({ ...newItem, unitCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Sale Price</label>
                  <input
                    type="number"
                    value={newItem.salePrice}
                    onChange={(e) => setNewItem({ ...newItem, salePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Refundable Escrow Deposit (PKR)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000 for standard bottle"
                  value={newItem.refundableDeposit}
                  onChange={(e) => setNewItem({ ...newItem, refundableDeposit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
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
                  Add to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-sm w-full p-6 space-y-4 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Stock Adjustment
              </h3>
              <button onClick={() => setAdjustItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjust} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">{adjustItem.name}</span>
                <p className="text-slate-500">Current In-Plant Stock: <b className="text-slate-900 dark:text-white">{adjustItem.inPlantQty} units</b></p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('in')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    adjustType === 'in'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  + Inward (Restock)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('out')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    adjustType === 'out'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  - Outward (Loss/Break)
                </button>
              </div>

              <div>
                <label className="font-semibold block mb-1">Quantity Units</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Record Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Inventory Item — Password Protected Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-sm w-full p-6 space-y-4 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Admin Delete — Password Required
              </h3>
              <button
                onClick={() => {
                  setDeleteItem(null);
                  setDeletePassword('');
                  setDeleteError('');
                  setShowDeletePassword(false);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item details */}
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 space-y-2 text-xs">
              <p className="text-slate-700 dark:text-slate-300">
                You are about to permanently delete:
              </p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {deleteItem.name}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                SKU: {deleteItem.sku} &bull; In-Plant: {deleteItem.inPlantQty.toLocaleString()} &bull; With Clients: {deleteItem.withClientsQty.toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-amber-600 dark:text-amber-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>This action cannot be undone. Enter your login password to confirm.</span>
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="font-semibold text-xs block text-slate-700 dark:text-slate-300">
                Your Login Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  placeholder="Enter your password to authorize..."
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDeleteWithPassword();
                  }}
                  autoFocus
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-rose-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {deleteError && (
                <p className="text-rose-500 text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {deleteError}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDeleteItem(null);
                  setDeletePassword('');
                  setDeleteError('');
                  setShowDeletePassword(false);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading || !deletePassword.trim()}
                onClick={handleDeleteWithPassword}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
                  deleteLoading || !deletePassword.trim()
                    ? 'bg-rose-400 cursor-not-allowed opacity-60'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {deleteLoading ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {deleteLoading ? 'Verifying...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
