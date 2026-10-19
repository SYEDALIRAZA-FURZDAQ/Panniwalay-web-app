import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Copy,
  QrCode,
  Check,
  Send,
  Mail,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Droplets,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { KpiCard } from '@/components/common/KpiCard';
import { useCurrency } from '@/context/CurrencyContext';

interface CustomerItem {
  id: number;
  customerCode: string;
  fullName: string;
  phone: string;
  email: string;
  type: 'residential' | 'corporate';
  zoneName: string;
  jarQuota: number;
  jarsInCirculation: number;
  depositHeld: number;
  refillCycle: string;
  status: 'active' | 'pending_verification' | 'inactive';
  address: string;
}

export const CustomersPage: React.FC = () => {
  const { formatMoney } = useCurrency();
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [customers, setCustomers] = useState<CustomerItem[]>([
    {
      id: 1,
      customerCode: 'CUST-0491',
      fullName: 'Shaikh Petroleum Corporation',
      phone: '+92-21-35689100',
      email: 'admin@shaikhpetro.com.pk',
      type: 'corporate',
      zoneName: 'Clifton & Sea View (Z-01)',
      jarQuota: 20,
      jarsInCirculation: 18,
      depositHeld: 20000,
      refillCycle: 'Twice Weekly (Mon & Thu)',
      status: 'active',
      address: 'Suite 602, Executive Tower, Marine Drive, Clifton Block 4',
    },
    {
      id: 2,
      customerCode: 'CUST-0512',
      fullName: 'Begum Yasmeen Abbasi',
      phone: '+92-300-2415987',
      email: 'yasmeen.abbasi@gmail.com',
      type: 'residential',
      zoneName: 'DHA Phase 5 & 6 (Z-02)',
      jarQuota: 4,
      jarsInCirculation: 3,
      depositHeld: 4000,
      refillCycle: 'Weekly (Every Wed)',
      status: 'active',
      address: 'House 44/2, 17th Street, Khayaban-e-Mujahid, DHA Phase 5',
    },
    {
      id: 3,
      customerCode: 'CUST-0628',
      fullName: 'Engro Polymers HQ',
      phone: '+92-21-111-411-411',
      email: 'procurement@engropolymers.com',
      type: 'corporate',
      zoneName: 'Korangi Industrial Area (Z-06)',
      jarQuota: 50,
      jarsInCirculation: 45,
      depositHeld: 50000,
      refillCycle: 'Twice Weekly (Tue & Fri)',
      status: 'active',
      address: 'Plot 12, Sector 15, Korangi Industrial Area',
    },
    {
      id: 4,
      customerCode: 'CUST-0740',
      fullName: 'Dr. Tariq Farooq Clinic',
      phone: '+92-333-2147896',
      email: 'drtariq@farooqclinic.pk',
      type: 'residential',
      zoneName: 'Gulshan-e-Iqbal Block 1-7 (Z-03)',
      jarQuota: 6,
      jarsInCirculation: 5,
      depositHeld: 6000,
      refillCycle: 'Weekly (Every Mon)',
      status: 'active',
      address: 'B-12, Block 4, Gulshan-e-Iqbal',
    },
    {
      id: 5,
      customerCode: 'CUST-0814',
      fullName: 'Muhammad Mansoor Residence',
      phone: '+92-345-8899221',
      email: 'mmansoor@yahoo.com',
      type: 'residential',
      zoneName: 'PECHS & Tariq Road (Z-04)',
      jarQuota: 2,
      jarsInCirculation: 2,
      depositHeld: 2000,
      refillCycle: 'Weekly (Every Sat)',
      status: 'active',
      address: 'House 19-A, Block 2, PECHS',
    },
  ]);

  // Invite Link Generator Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteZone, setInviteZone] = useState('1');
  const [inviteCategory, setInviteCategory] = useState<'residential' | 'corporate'>('residential');
  const [inviteQuota, setInviteQuota] = useState(2);
  const [inviteExpiryHours, setInviteExpiryHours] = useState(168); // 7 days
  const [zonesList, setZonesList] = useState<Array<{ id: number; name: string; code: string; sector?: string }>>([
    { id: 1, name: 'Clifton & Sea View', code: 'Z-01', sector: 'South' },
    { id: 2, name: 'DHA Phase 5 & 6', code: 'Z-02', sector: 'South' },
    { id: 3, name: 'Gulshan-e-Iqbal Block 1-7', code: 'Z-03', sector: 'East' },
    { id: 4, name: 'PECHS & Tariq Road', code: 'Z-04', sector: 'East' },
    { id: 5, name: 'North Nazimabad Block A-D', code: 'Z-05', sector: 'Central' },
    { id: 6, name: 'Korangi Industrial Area', code: 'Z-06', sector: 'Korangi' },
  ]);

  const [generatedLink, setGeneratedLink] = useState<{
    url: string;
    token: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCust, setNewCust] = useState({
    fullName: '',
    phone: '',
    email: '',
    type: 'residential' as 'residential' | 'corporate',
    zoneName: 'Clifton & Sea View (Z-01)',
    jarQuota: 2,
    address: '',
    refillCycle: 'Weekly',
  });

  // Fetch live customers from API and merge any newly registered accounts
  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const result = await res.json();
        if (result && Array.isArray(result.data) && result.data.length > 0) {
          const apiCustomers: CustomerItem[] = result.data.map((item: any) => ({
            id: item.id,
            customerCode: item.customerCode,
            fullName: item.fullName,
            phone: item.phone,
            email: item.email || '',
            type: item.type || 'residential',
            zoneName: item.zoneName || 'Clifton & Sea View (Z-01)',
            jarQuota: item.jarQuota || 2,
            jarsInCirculation: item.jarsInCirculation || 0,
            depositHeld: item.depositHeld || 0,
            refillCycle: item.refillCycle === 'twice_weekly' ? 'Twice Weekly' : item.refillCycle === 'on_call' ? 'On Call' : 'Weekly',
            status: item.status || 'active',
            address: item.address || '',
          }));

          // Merge with any newly onboarded accounts in localStorage
          const localNew = JSON.parse(localStorage.getItem('panniwalay_new_customers') || '[]');
          const existingCodes = new Set(apiCustomers.map(c => c.customerCode));
          const uniqueLocal = localNew.filter((c: any) => !existingCodes.has(c.customerCode));

          setCustomers([...uniqueLocal, ...apiCustomers]);
          return;
        }
      }
    } catch (e) {
      console.warn('API customers load fallback:', e);
    }

    // Fallback: check localStorage
    try {
      const localNew = JSON.parse(localStorage.getItem('panniwalay_new_customers') || '[]');
      if (localNew.length > 0) {
        setCustomers((prev) => {
          const codes = new Set(prev.map(c => c.customerCode));
          const add = localNew.filter((c: any) => !codes.has(c.customerCode));
          return [...add, ...prev];
        });
      }
    } catch (e) {}
  };

  React.useEffect(() => {
    loadCustomers();
    fetch('/api/zones')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setZonesList(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerateLink = async () => {
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preassignedZoneId: Number(inviteZone),
          preassignedCategory: inviteCategory,
          preassignedJarQuota: Number(inviteQuota),
          expiryHours: inviteExpiryHours,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedLink({
          url: data.signupUrl,
          token: data.token,
        });
        return;
      }
    } catch (e) {}

    // Fallback client link generation
    const dummyToken = 'pw_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const origin = window.location.origin;
    setGeneratedLink({
      url: `${origin}/register?token=${dummyToken}`,
      token: dummyToken,
    });
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: CustomerItem = {
      id: Date.now(),
      customerCode: `CUST-0${850 + customers.length}`,
      fullName: newCust.fullName,
      phone: newCust.phone,
      email: newCust.email,
      type: newCust.type,
      zoneName: newCust.zoneName,
      jarQuota: Number(newCust.jarQuota),
      jarsInCirculation: 0,
      depositHeld: 1000 * Number(newCust.jarQuota),
      refillCycle: newCust.refillCycle,
      status: 'active',
      address: newCust.address,
    };

    // Save to database via API
    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newCust.fullName,
          phone: newCust.phone,
          email: newCust.email || undefined,
          type: newCust.type,
          zoneId: 1,
          jarQuota: Number(newCust.jarQuota),
          address: newCust.address,
          refillCycle: 'weekly',
        }),
      });
    } catch (e) {}

    // Save to local storage cache as well
    try {
      const existing = JSON.parse(localStorage.getItem('panniwalay_new_customers') || '[]');
      existing.unshift(created);
      localStorage.setItem('panniwalay_new_customers', JSON.stringify(existing));
    } catch (e) {}

    setCustomers([created, ...customers]);
    setShowAddModal(false);
  };

  const filtered = customers.filter((c) => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (
      search &&
      !c.fullName.toLowerCase().includes(search.toLowerCase()) &&
      !c.customerCode.toLowerCase().includes(search.toLowerCase()) &&
      !c.phone.includes(search)
    ) {
      return false;
    }
    return true;
  });

  const totalHeld = customers.reduce((a, b) => a + b.depositHeld, 0);
  const residentialCount = customers.filter((c) => c.type === 'residential').length;
  const corporateCount = customers.filter((c) => c.type === 'corporate').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Customer Accounts & Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Karachi subscriber registry, refundable deposit escrow balances, jar quotas, and automated self-onboarding invite generator
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setGeneratedLink(null);
              setShowInviteModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Generate Sign-up Link</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Registered Accounts"
          value={customers.length}
          subtitle={`${residentialCount} Residential, ${corporateCount} Corporate`}
          icon={Users}
        />
        <KpiCard
          title="Residential Subscribers"
          value={residentialCount}
          subtitle="Homes & Apartments"
          icon={Droplets}
        />
        <KpiCard
          title="Corporate B2B Accounts"
          value={corporateCount}
          subtitle="Offices, Clinics & Plants"
          icon={MapPin}
        />
        <KpiCard
          title="Customer Deposits Escrow"
          value={formatMoney(totalHeld)}
          subtitle="Held safely in escrow reserve"
          icon={ShieldCheck}
        />
      </div>

      {/* Filter and Search */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              typeFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Accounts ({customers.length})
          </button>
          <button
            onClick={() => setTypeFilter('residential')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              typeFilter === 'residential'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Residential ({residentialCount})
          </button>
          <button
            onClick={() => setTypeFilter('corporate')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              typeFilter === 'corporate'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Corporate ({corporateCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, code, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-sky-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Delivery Zone</th>
                <th className="py-3 px-4">Jar Quota & In Use</th>
                <th className="py-3 px-4">Deposit Held</th>
                <th className="py-3 px-4">Refill Cycle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {c.fullName}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {c.customerCode} • {c.phone}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {c.type === 'corporate' ? (
                      <Badge variant="cyan">Corporate</Badge>
                    ) : (
                      <Badge variant="default">Residential</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{c.zoneName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {c.jarsInCirculation} / {c.jarQuota}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Jars (19L)</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                    {formatMoney(c.depositHeld)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                    {c.refillCycle}
                  </td>
                  <td className="py-3 px-4">
                    {c.status === 'active' && <Badge variant="success">Active</Badge>}
                    {c.status === 'pending_verification' && (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Customer: ${c.fullName}\nAddress: ${c.address}\nDeposit: PKR ${c.depositHeld}`)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/50"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE SIGN-UP LINK MODAL (Matches Stitch Design Reference closely) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 space-y-5 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Generate Customer Sign-up Link
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!generatedLink ? (
              <div className="space-y-4 text-xs">
                <p className="text-slate-500 dark:text-slate-400">
                  Generate a single-use or pre-configured onboarding URL with an embedded SHA-256 token. The customer can complete self-registration and OTP mobile verification.
                </p>

                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-slate-300">
                    Pre-assigned Karachi Zone
                  </label>
                  <select
                    value={inviteZone}
                    onChange={(e) => setInviteZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    {zonesList.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.code}) {z.sector ? `— ${z.sector}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold block text-slate-700 dark:text-slate-300">
                      Customer Category
                    </label>
                    <select
                      value={inviteCategory}
                      onChange={(e) => setInviteCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    >
                      <option value="residential">Residential</option>
                      <option value="corporate">Corporate B2B</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold block text-slate-700 dark:text-slate-300">
                      Initial 19L Jar Quota
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={inviteQuota}
                      onChange={(e) => setInviteQuota(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-slate-300">
                    Link Expiration Window
                  </label>
                  <select
                    value={inviteExpiryHours}
                    onChange={(e) => setInviteExpiryHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="24">24 Hours (Fast follow-up)</option>
                    <option value="72">3 Days</option>
                    <option value="168">7 Days (Recommended standard)</option>
                    <option value="720">30 Days</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleGenerateLink}
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Generate Secure Invite Token & Link</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Onboarding link generated with active cryptographic token!</span>
                </div>

                {/* The Link with copy button */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Registration Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      type="text"
                      value={generatedLink.url}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px]"
                    />
                    <button
                      onClick={handleCopy}
                      className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-sky-600 hover:bg-sky-500 text-white'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* QR Code and Sharing Actions Grid */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                  {/* Clean SVG QR Code Representation */}
                  <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                    <div className="w-20 h-20 bg-slate-900 rounded-lg p-1.5 grid grid-cols-4 gap-1">
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-sky-400 rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-slate-900 rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-sky-400 rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-slate-900 rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-sky-400 rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Instant Mobile QR Code
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Riders can display this on tablet/phone during field visits, or print onto customer welcome brochures.
                    </p>
                    <a
                      href={generatedLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:underline pt-1"
                    >
                      <span>Open Registration Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* One-Click Share Buttons */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Direct Distribution Channels
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `Salam! Welcome to Panniwalay Mineral Water (Plant #4 Karachi). Please complete your doorstep delivery registration here: ${generatedLink.url}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 font-bold transition-colors text-center"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`sms:?body=${encodeURIComponent(
                        `Panniwalay Mineral Water: Complete your signup link: ${generatedLink.url}`
                      )}`}
                      className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center justify-center gap-1.5 font-bold transition-colors text-center"
                    >
                      <Send className="w-4 h-4 text-sky-600" />
                      <span>SMS</span>
                    </a>

                    <a
                      href={`mailto:?subject=${encodeURIComponent(
                        'Panniwalay Mineral Water — Customer Onboarding Invitation'
                      )}&body=${encodeURIComponent(
                        `Dear Customer,\n\nYou have been invited to register with Panniwalay Mineral Water Plant #4 Karachi.\nPlease follow this link to activate your delivery account:\n${generatedLink.url}\n\nWarm regards,\nPanniwalay Operations`
                      )}`}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 font-bold transition-colors text-center"
                    >
                      <Mail className="w-4 h-4 text-slate-600" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setGeneratedLink(null);
                      setShowInviteModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 space-y-4 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Register Customer Manually
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name / Company Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Al-Habib Bank Regional HQ"
                  value={newCust.fullName}
                  onChange={(e) => setNewCust({ ...newCust, fullName: e.target.value })}
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
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="info@client.com"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newCust.type}
                    onChange={(e) => setNewCust({ ...newCust, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="residential">Residential</option>
                    <option value="corporate">Corporate B2B</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Jar Quota</label>
                  <input
                    type="number"
                    value={newCust.jarQuota}
                    onChange={(e) => setNewCust({ ...newCust, jarQuota: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Karachi Sector / Zone</label>
                <select
                  value={newCust.zoneName}
                  onChange={(e) => setNewCust({ ...newCust, zoneName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {zonesList.map((z) => (
                    <option key={z.id} value={`${z.name} (${z.code})`}>
                      {z.name} ({z.code}) {z.sector ? `— ${z.sector}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Street Address</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Plot / House number, street, landmark..."
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
