import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Download,
  DollarSign,
  TrendingUp,
  Receipt,
  FileCheck,
  Building,
  Calendar,
  X,
  CreditCard,
  PieChart,
  Percent,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { KpiCard } from '@/components/common/KpiCard';
import { useCurrency } from '@/context/CurrencyContext';

interface ExpenseVoucherItem {
  id: number;
  voucherNumber: string;
  headName: string;
  category: 'cogs' | 'opex' | 'capex';
  amount: number;
  paymentAccount: string;
  expenseDate: string;
  vendor: string;
  taxNote: string;
  status: 'approved' | 'pending';
}

export const AccountsPage: React.FC = () => {
  const { formatMoney } = useCurrency();
  const [activeTab, setActiveTab] = useState<'pnl' | 'vouchers'>('pnl');

  // P&L Metrics
  const revenueTotal = 1280000;
  const cogsTotal = 438000;
  const grossProfit = revenueTotal - cogsTotal;
  const grossMargin = ((grossProfit / revenueTotal) * 100).toFixed(1);

  const opexTotal = 348000;
  const ebitda = grossProfit - opexTotal;
  const ebitdaMargin = ((ebitda / revenueTotal) * 100).toFixed(1);

  // Vouchers
  const [vouchers, setVouchers] = useState<ExpenseVoucherItem[]>([
    {
      id: 1,
      voucherNumber: 'EV-261001',
      headName: 'Water Treatment & Minerals (Ozone/RO Salts)',
      category: 'cogs',
      amount: 45000,
      paymentAccount: 'Meezan Bank Ltd (A/C: 0102030405)',
      expenseDate: '2026-10-18',
      vendor: 'AquaChem Technologies Pakistan',
      taxNote: 'Withholding Tax 4.5% deducted',
      status: 'approved',
    },
    {
      id: 2,
      voucherNumber: 'EV-261002',
      headName: 'Fleet Fuel (Diesel & Petrol Refills)',
      category: 'opex',
      amount: 68500,
      paymentAccount: 'Corporate Fuel Fleet Card (PSO)',
      expenseDate: '2026-10-18',
      vendor: 'Pakistan State Oil — Clifton Station',
      taxNote: 'Standard sales tax invoice',
      status: 'approved',
    },
    {
      id: 3,
      voucherNumber: 'EV-261003',
      headName: 'Bottle Caps & Tamper Seals',
      category: 'cogs',
      amount: 28000,
      paymentAccount: 'Cash In Hand Petty Cash',
      expenseDate: '2026-10-17',
      vendor: 'Crown Plastic Closures Karachi',
      taxNote: 'Cash receipt #8812',
      status: 'approved',
    },
    {
      id: 4,
      voucherNumber: 'EV-261004',
      headName: 'Rider Commissions & Allowances',
      category: 'opex',
      amount: 125000,
      paymentAccount: 'Meezan Bank Ltd (A/C: 0102030405)',
      expenseDate: '2026-10-15',
      vendor: 'Fleet Riders Disbursal',
      taxNote: 'Direct internal payroll voucher',
      status: 'approved',
    },
    {
      id: 5,
      voucherNumber: 'EV-261005',
      headName: 'Plant Industrial Electricity (K-Electric)',
      category: 'cogs',
      amount: 210000,
      paymentAccount: 'Meezan Bank Ltd (A/C: 0102030405)',
      expenseDate: '2026-10-12',
      vendor: 'K-Electric Karachi Industrial',
      taxNote: 'Industrial B3 Tariff',
      status: 'approved',
    },
  ]);

  // Modal State
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    headName: 'Fleet Fuel (Diesel & Petrol Refills)',
    category: 'opex' as 'cogs' | 'opex' | 'capex',
    amount: 15000,
    paymentAccount: 'Corporate Fuel Fleet Card (PSO)',
    expenseDate: new Date().toISOString().split('T')[0],
    vendor: '',
    taxNote: 'Standard tax invoice',
    notes: '',
  });

  const handleRecordVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ExpenseVoucherItem = {
      id: Date.now(),
      voucherNumber: `EV-${Date.now().toString().slice(-6)}`,
      headName: newVoucher.headName,
      category: newVoucher.category,
      amount: Number(newVoucher.amount),
      paymentAccount: newVoucher.paymentAccount,
      expenseDate: newVoucher.expenseDate,
      vendor: newVoucher.vendor || 'Authorized Supplier',
      taxNote: newVoucher.taxNote,
      status: 'approved',
    };

    setVouchers([created, ...vouchers]);
    setShowVoucherModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Accounts & Profit and Loss Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plant #4 financial ledger, EBITDA profitability statement, and expense voucher approvals
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.open('/api/accounts/export/vouchers/csv', '_blank')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowVoucherModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense Voucher</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Gross Revenue (MTD)"
          value={formatMoney(revenueTotal)}
          subtitle="Refills, Dispensers & Accessories"
          trend={{ value: '+14% vs last mo', isPositive: true }}
          icon={TrendingUp}
        />
        <KpiCard
          title="Gross Profit"
          value={formatMoney(grossProfit)}
          subtitle={`${grossMargin}% Gross Margin`}
          icon={Percent}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
        />
        <KpiCard
          title="Operating Expenses (OPEX)"
          value={formatMoney(opexTotal)}
          subtitle="Fleet fuel, commissions & maint"
          icon={Receipt}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-950/60"
        />
        <KpiCard
          title="EBITDA / Net Operating Profit"
          value={formatMoney(ebitda)}
          subtitle={`${ebitdaMargin}% Operational EBITDA`}
          icon={DollarSign}
          iconColor="text-sky-500"
          iconBg="bg-sky-50 dark:bg-sky-950/60"
        />
      </div>

      {/* Tabs */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pnl')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'pnl'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            P&L Breakdown Statement
          </button>
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'vouchers'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Expense Vouchers ({vouchers.length})
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Accounting Period: Current Fiscal Month (October 2026)
        </span>
      </div>

      {/* P&L Detailed Statement */}
      {activeTab === 'pnl' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & COGS Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Revenue Streams & Cost of Goods (COGS)
              </h3>
              <p className="text-xs text-slate-400">Bottling production economics & gross spread</p>
            </div>

            {/* Revenue breakdown */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                Revenue Breakdown (PKR 1,280,000)
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300">19-Litre Water Refills (4,189 Jars)</span>
                  <span className="font-bold text-slate-900 dark:text-white">PKR 921,600 (72%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full w-[72%]"></div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-700 dark:text-slate-300">Water Dispensers Sold & Leased</span>
                  <span className="font-bold text-slate-900 dark:text-white">PKR 230,400 (18%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[18%]"></div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-700 dark:text-slate-300">Manual Pumps, Bottle Stands & Accessories</span>
                  <span className="font-bold text-slate-900 dark:text-white">PKR 128,000 (10%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full w-[10%]"></div>
                </div>
              </div>
            </div>

            {/* COGS items */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                Cost of Goods Sold — COGS (PKR 438,000)
              </span>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span>Plant Industrial Electricity (K-Electric) & Backup Genset</span>
                  <span className="font-bold text-slate-900 dark:text-white">PKR 261,000</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span>Mineral Salts, Remineralization & Ozone Treatment</span>
                  <span className="font-bold text-slate-900 dark:text-white">PKR 112,000</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span>55mm Non-Spill Bottle Closures & Heat Shrink Neck Seals</span>
                  <span className="font-bold text-slate-900 dark:text-white">PKR 65,000</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">Gross Production Profit:</span>
              <span className="font-extrabold text-emerald-600 text-sm">{formatMoney(grossProfit)} ({grossMargin}%)</span>
            </div>
          </div>

          {/* OPEX & Net Profit Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Operating Expenses & Net EBITDA Summary
              </h3>
              <p className="text-xs text-slate-400">Fleet distribution, driver commissions, and plant overhead</p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Operating Expenses Breakdown — OPEX (PKR 348,000)
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span>Fleet Diesel & Petrol (4 active delivery trucks/vans)</span>
                  <span className="font-bold text-slate-900 dark:text-white">PKR 142,000</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span>Rider Per-Jar Delivery Commissions & Allowances</span>
                  <span className="font-bold text-slate-900 dark:text-white">PKR 125,000</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span>Vehicle Routine Service, Tires & Lubricants</span>
                  <span className="font-bold text-slate-900 dark:text-white">PKR 45,000</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span>Plant Dock Support, Administration & Disposables</span>
                  <span className="font-bold text-slate-900 dark:text-white">PKR 36,000</span>
                </div>
              </div>
            </div>

            {/* Bottom Bottom Line Card */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Gross Profit:</span>
                <span>{formatMoney(grossProfit)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Total OPEX Deductions:</span>
                <span className="text-rose-400">- {formatMoney(opexTotal)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="font-bold text-sm">Operating EBITDA:</span>
                <span className="font-extrabold text-sky-400 text-lg">{formatMoney(ebitda)}</span>
              </div>
              <p className="text-[11px] text-slate-400 text-right">
                Net operational profit margin: <b className="text-emerald-400">{ebitdaMargin}%</b>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expense Vouchers Table */}
      {activeTab === 'vouchers' && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Voucher #</th>
                  <th className="py-3 px-4">Expense Head</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Vendor / Payee</th>
                  <th className="py-3 px-4">Payment Account</th>
                  <th className="py-3 px-4">Tax Note</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {vouchers.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {v.voucherNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {v.headName}
                    </td>
                    <td className="py-3 px-4">
                      {v.category === 'cogs' && <Badge variant="warning">COGS</Badge>}
                      {v.category === 'opex' && <Badge variant="info">OPEX</Badge>}
                      {v.category === 'capex' && <Badge variant="cyan">CAPEX</Badge>}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {formatMoney(v.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {v.vendor}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {v.paymentAccount}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {v.taxNote}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {v.expenseDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="success">Approved</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Expense Voucher Modal (MATCHING STITCH DESIGN REFERENCE) */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 space-y-4 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record Expense Voucher
              </h3>
              <button onClick={() => setShowVoucherModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordVoucher} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Expense Account Head</label>
                <select
                  value={newVoucher.headName}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cat = val.includes('Fuel') || val.includes('Commission') || val.includes('Service') ? 'opex' : 'cogs';
                    setNewVoucher({ ...newVoucher, headName: val, category: cat as any });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Water Treatment & Minerals (Ozone/RO Salts)">Water Treatment & Minerals (COGS)</option>
                  <option value="Bottle Caps & Tamper Seals">Bottle Caps & Tamper Seals (COGS)</option>
                  <option value="Plant Industrial Electricity (K-Electric)">Plant Industrial Electricity (COGS)</option>
                  <option value="Fleet Fuel (Diesel & Petrol Refills)">Fleet Fuel (Diesel/Petrol) (OPEX)</option>
                  <option value="Rider Commissions & Allowances">Rider Commissions & Bonuses (OPEX)</option>
                  <option value="Vehicle Routine Service & Tires">Vehicle Routine Maintenance (OPEX)</option>
                  <option value="RO Plant Membrane Replacement">RO Plant Membrane Upgrade (CAPEX)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    value={newVoucher.amount}
                    onChange={(e) => setNewVoucher({ ...newVoucher, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Voucher Date</label>
                  <input
                    type="date"
                    value={newVoucher.expenseDate}
                    onChange={(e) => setNewVoucher({ ...newVoucher, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Payment Source / Bank Account</label>
                <select
                  value={newVoucher.paymentAccount}
                  onChange={(e) => setNewVoucher({ ...newVoucher, paymentAccount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Meezan Bank Ltd (A/C: 0102030405)">Meezan Bank Ltd (A/C: 0102030405)</option>
                  <option value="Corporate Fuel Fleet Card (PSO)">Corporate Fuel Fleet Card (PSO)</option>
                  <option value="Cash In Hand Petty Cash">Plant Petty Cash</option>
                  <option value="Habib Bank Ltd Corporate">Habib Bank Ltd Corporate</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Vendor / Payee Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pakistan State Oil"
                  value={newVoucher.vendor}
                  onChange={(e) => setNewVoucher({ ...newVoucher, vendor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Tax Note / WHT Withheld</label>
                <input
                  type="text"
                  value={newVoucher.taxNote}
                  onChange={(e) => setNewVoucher({ ...newVoucher, taxNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Approve & Record Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
