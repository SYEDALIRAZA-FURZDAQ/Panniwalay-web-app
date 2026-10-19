import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  RotateCcw,
  X,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { KpiCard } from '@/components/common/KpiCard';
import { useCurrency } from '@/context/CurrencyContext';

interface InvoiceItem {
  id: number;
  invoiceNumber: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'overdue' | 'draft';
  dueDate: string;
  createdAt: string;
}

interface DepositItem {
  id: number;
  customerName: string;
  amount: number;
  type: 'collect' | 'refund';
  method: string;
  referenceNo: string;
  date: string;
}

export const BillingPage: React.FC = () => {
  const { formatMoney } = useCurrency();
  const [activeTab, setActiveTab] = useState<'invoices' | 'deposits'>('invoices');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      id: 1,
      invoiceNumber: 'INV-2026-041',
      customerName: 'Shaikh Petroleum Corporation',
      phone: '+92-21-35689100',
      totalAmount: 39600,
      paidAmount: 39600,
      status: 'paid',
      dueDate: '2026-10-25',
      createdAt: '2026-10-10',
    },
    {
      id: 2,
      invoiceNumber: 'INV-2026-042',
      customerName: 'Engro Polymers HQ',
      phone: '+92-21-111-411-411',
      totalAmount: 99000,
      paidAmount: 65000,
      status: 'partial',
      dueDate: '2026-10-22',
      createdAt: '2026-10-08',
    },
    {
      id: 3,
      invoiceNumber: 'INV-2026-043',
      customerName: 'Begum Yasmeen Abbasi',
      phone: '+92-300-2415987',
      totalAmount: 6600,
      paidAmount: 6600,
      status: 'paid',
      dueDate: '2026-10-15',
      createdAt: '2026-10-01',
    },
    {
      id: 4,
      invoiceNumber: 'INV-2026-044',
      customerName: 'Dr. Tariq Farooq Clinic',
      phone: '+92-333-2147896',
      totalAmount: 11000,
      paidAmount: 0,
      status: 'overdue',
      dueDate: '2026-10-14',
      createdAt: '2026-09-30',
    },
    {
      id: 5,
      invoiceNumber: 'INV-2026-045',
      customerName: 'Al-Noor Textile Mills',
      phone: '+92-321-8899771',
      totalAmount: 48400,
      paidAmount: 48400,
      status: 'paid',
      dueDate: '2026-10-28',
      createdAt: '2026-10-14',
    },
  ]);

  const [deposits, setDeposits] = useState<DepositItem[]>([
    {
      id: 1,
      customerName: 'Shaikh Petroleum Corporation',
      amount: 20000,
      type: 'collect',
      method: 'Bank Transfer (Meezan)',
      referenceNo: 'TXN-998124',
      date: '2026-08-12',
    },
    {
      id: 2,
      customerName: 'Engro Polymers HQ',
      amount: 50000,
      type: 'collect',
      method: 'Cheque (HBL)',
      referenceNo: 'CHQ-449102',
      date: '2026-07-05',
    },
    {
      id: 3,
      customerName: 'Begum Yasmeen Abbasi',
      amount: 4000,
      type: 'collect',
      method: 'Cash via Rider RD-04',
      referenceNo: 'CSH-0491',
      date: '2026-09-01',
    },
    {
      id: 4,
      customerName: 'Ali Raza Flat 10-B',
      amount: 2000,
      type: 'refund',
      method: 'Cash at Plant Office',
      referenceNo: 'REF-0104',
      date: '2026-10-15',
    },
  ]);

  // Modal States
  const [payingInvoice, setPayingInvoice] = useState<InvoiceItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [newDeposit, setNewDeposit] = useState({
    customerName: '',
    amount: 2000,
    type: 'collect' as 'collect' | 'refund',
    method: 'Cash',
    referenceNo: '',
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setInvoices(
      invoices.map((inv) => {
        if (inv.id === payingInvoice.id) {
          const newPaid = inv.paidAmount + Number(paymentAmount);
          const nextStatus = newPaid >= inv.totalAmount ? 'paid' : 'partial';
          return { ...inv, paidAmount: newPaid, status: nextStatus };
        }
        return inv;
      })
    );
    setPayingInvoice(null);
  };

  const handleRecordDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: DepositItem = {
      id: Date.now(),
      customerName: newDeposit.customerName,
      amount: Number(newDeposit.amount),
      type: newDeposit.type,
      method: newDeposit.method,
      referenceNo: newDeposit.referenceNo || `DEP-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
    };

    setDeposits([created, ...deposits]);
    setShowDepositModal(false);
  };

  const totalInvoiced = invoices.reduce((a, b) => a + b.totalAmount, 0);
  const totalPaid = invoices.reduce((a, b) => a + b.paidAmount, 0);
  const totalReceivables = totalInvoiced - totalPaid;
  const totalEscrowHeld = deposits.reduce(
    (a, b) => (b.type === 'collect' ? a + b.amount : a - b.amount),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Billing, Invoices & Deposits Escrow
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Accounts receivable, monthly bottle delivery invoices, payment receipts, and customer bottle collateral ledger
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.open('/api/billing/export/invoices/csv', '_blank')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowDepositModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Deposit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Invoiced"
          value={formatMoney(totalInvoiced)}
          subtitle="All current cycle invoices"
          icon={Receipt}
        />
        <KpiCard
          title="Total Paid & Reconciled"
          value={formatMoney(totalPaid)}
          subtitle={`${Math.round((totalPaid / totalInvoiced) * 100)}% recovery rate`}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
        />
        <KpiCard
          title="Pending Receivables"
          value={formatMoney(totalReceivables)}
          subtitle="Due from corporate & residential"
          icon={CreditCard}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-950/60"
        />
        <KpiCard
          title="Total Escrow Deposits"
          value={formatMoney(totalEscrowHeld)}
          subtitle="Segregated bottle collateral"
          icon={ShieldCheck}
          iconColor="text-sky-500"
          iconBg="bg-sky-50 dark:bg-sky-950/60"
        />
      </div>

      {/* Tabs */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'invoices'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Invoices & Receivables ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'deposits'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Escrow Deposits Ledger ({deposits.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-sky-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Invoices Table */}
      {activeTab === 'invoices' && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Invoice Amount</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Outstanding</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {invoices.map((inv) => {
                  const outstanding = inv.totalAmount - inv.paidAmount;
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {inv.customerName}
                        </span>
                        <span className="text-[11px] text-slate-400">{inv.phone}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatMoney(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatMoney(inv.paidAmount)}
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        {formatMoney(outstanding)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {inv.dueDate}
                      </td>
                      <td className="py-3 px-4">
                        {inv.status === 'paid' && <Badge variant="success">Paid</Badge>}
                        {inv.status === 'partial' && <Badge variant="warning">Partial</Badge>}
                        {inv.status === 'overdue' && <Badge variant="danger">Overdue</Badge>}
                        {inv.status === 'draft' && <Badge variant="default">Draft</Badge>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv.status !== 'paid' ? (
                          <button
                            onClick={() => {
                              setPayingInvoice(inv);
                              setPaymentAmount(outstanding);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-300 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Record Payment
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Escrow Deposits Ledger Table */}
      {activeTab === 'deposits' && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Collateral Amount</th>
                  <th className="py-3 px-4">Payment Channel</th>
                  <th className="py-3 px-4">Date Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {deposits.map((dep) => (
                  <tr
                    key={dep.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {dep.referenceNo}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {dep.customerName}
                    </td>
                    <td className="py-3 px-4">
                      {dep.type === 'collect' ? (
                        <Badge variant="cyan">Deposit Received</Badge>
                      ) : (
                        <Badge variant="danger">Deposit Refunded</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {dep.type === 'collect' ? '+' : '-'} {formatMoney(dep.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {dep.method}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {dep.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-sm w-full p-6 space-y-4 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record Invoice Payment
              </h3>
              <button onClick={() => setPayingInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">{payingInvoice.customerName}</span>
                <p className="text-slate-500">Invoice: {payingInvoice.invoiceNumber}</p>
                <p className="text-rose-500 font-bold">Outstanding: {formatMoney(payingInvoice.totalAmount - payingInvoice.paidAmount)}</p>
              </div>

              <div>
                <label className="font-semibold block mb-1">Amount Paid (PKR)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-sm w-full p-6 space-y-4 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record Bottle Escrow Collateral
              </h3>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordDeposit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Customer / Subscriber</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farooq Medical Center"
                  value={newDeposit.customerName}
                  onChange={(e) => setNewDeposit({ ...newDeposit, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewDeposit({ ...newDeposit, type: 'collect' })}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    newDeposit.type === 'collect'
                      ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700'
                  }`}
                >
                  + Collect Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setNewDeposit({ ...newDeposit, type: 'refund' })}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    newDeposit.type === 'refund'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700'
                  }`}
                >
                  - Refund Deposit
                </button>
              </div>

              <div>
                <label className="font-semibold block mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  required
                  value={newDeposit.amount}
                  onChange={(e) => setNewDeposit({ ...newDeposit, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Channel / Payment Method</label>
                <select
                  value={newDeposit.method}
                  onChange={(e) => setNewDeposit({ ...newDeposit, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Cash at Dock">Cash at Dock</option>
                  <option value="Bank Transfer (Meezan Bank)">Bank Transfer (Meezan Bank)</option>
                  <option value="Online Raast / JazzCash">Online Raast / JazzCash</option>
                  <option value="Cheque">Crossed Cheque</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
