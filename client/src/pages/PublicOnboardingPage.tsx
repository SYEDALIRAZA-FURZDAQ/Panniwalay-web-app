import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Droplets,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Building,
  ArrowRight,
} from 'lucide-react';

export const PublicOnboardingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  // 3-step streamlined flow: 1: Profile -> 2: Location -> 3: Quota & Pricing -> 4: Success
  const [step, setStep] = useState(1);

  // Form State
  const [accountType, setAccountType] = useState<'residential' | 'corporate'>('residential');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');

  // Address State
  const [zoneId, setZoneId] = useState(1);
  const [zoneName, setZoneName] = useState('Clifton & Sea View (Z-01)');
  const [availableZones, setAvailableZones] = useState<Array<{ id: number; name: string; code: string; sector?: string }>>([
    { id: 1, name: 'Clifton & Sea View', code: 'Z-01', sector: 'South' },
    { id: 2, name: 'DHA Phase 5 & 6', code: 'Z-02', sector: 'South' },
    { id: 3, name: 'Gulshan-e-Iqbal Block 1-7', code: 'Z-03', sector: 'East' },
    { id: 4, name: 'PECHS & Tariq Road', code: 'Z-04', sector: 'East' },
    { id: 5, name: 'North Nazimabad Block A-D', code: 'Z-05', sector: 'Central' },
    { id: 6, name: 'Korangi Industrial Area', code: 'Z-06', sector: 'Korangi' },
  ]);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  // Bottle & Delivery Schedule
  const [jarQuota, setJarQuota] = useState(2);
  const [refillCycle, setRefillCycle] = useState<'weekly' | 'twice_weekly' | 'on_call'>('weekly');

  // Submitting / Result
  const [submitting, setSubmitting] = useState(false);
  const [assignedCode, setAssignedCode] = useState('');

  // Dynamic pricing — loaded from settings, NOT hardcoded
  const [standardDepositPerJar, setStandardDepositPerJar] = useState(0); // start at 0, will load dynamically
  const [refillPricePerJar, setRefillPricePerJar] = useState(220);
  const [pricingLoaded, setPricingLoaded] = useState(false);

  // Fetch live zones
  useEffect(() => {
    fetch('/api/zones')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableZones(data);
          // If current zoneId does not exist in active zones, select the first active zone
          setZoneId((prevId) => {
            const current = data.find((z) => z.id === prevId);
            if (current) {
              setZoneName(`${current.name} (${current.code})`);
              return prevId;
            }
            setZoneName(`${data[0].name} (${data[0].code})`);
            return data[0].id;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Fetch dynamic pricing from public settings endpoint
  useEffect(() => {
    fetch('/api/settings/public')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data['pricing.standardDeposit'] != null) setStandardDepositPerJar(Number(data['pricing.standardDeposit']));
          if (data['pricing.standardRefill'] != null) setRefillPricePerJar(Number(data['pricing.standardRefill']));
          setPricingLoaded(true);
        }
      })
      .catch(() => {
        // Fallback: try localStorage
        try {
          const cached = localStorage.getItem('panniwalay_settings');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.bottleSettings) {
              setStandardDepositPerJar(parsed.bottleSettings.standardDeposit ?? 0);
              setRefillPricePerJar(parsed.bottleSettings.standardRefill ?? 220);
            }
          }
        } catch {}
        setPricingLoaded(true);
      });
  }, []);

  // Pre-fetch invite defaults if available (also carries pricing and tenant information)
  const tenantFromUrl = searchParams.get('tenant');
  const [resolvedTenantId, setResolvedTenantId] = useState<string | null>(tenantFromUrl);

  useEffect(() => {
    const query = new URLSearchParams();
    if (token) query.set('token', token);
    if (tenantFromUrl) query.set('tenant', tenantFromUrl);

    fetch(`/api/onboarding/verify?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.valid) {
          if (data.tenantId) setResolvedTenantId(data.tenantId);
          if (data.preassignedZoneId) setZoneId(data.preassignedZoneId);
          if (data.zoneName) setZoneName(data.zoneName);
          if (data.preassignedCategory) setAccountType(data.preassignedCategory);
          if (data.preassignedJarQuota) setJarQuota(data.preassignedJarQuota);
          // Update pricing from verify response (server-authoritative)
          if (data.standardDepositPerJar != null) setStandardDepositPerJar(Number(data.standardDepositPerJar));
          if (data.refillPricePerJar != null) setRefillPricePerJar(Number(data.refillPricePerJar));
          setPricingLoaded(true);
        }
      })
      .catch(() => {});
  }, [token, tenantFromUrl]);

  // Pricing calculations (dynamic — driven by settings)
  const totalDepositEscrow = jarQuota * standardDepositPerJar;
  const initialRefillTotal = jarQuota * refillPricePerJar;
  const grandTotalOnFirstDelivery = totalDepositEscrow + initialRefillTotal;

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let customerCode = `CUST-KHI-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveTenant = resolvedTenantId || tenantFromUrl || 'plant_default';
    let returnedCustId = Date.now();

    const matchedZone = availableZones.find((z) => z.id === Number(zoneId));
    const effectiveZoneName = matchedZone ? `${matchedZone.name} (${matchedZone.code})` : zoneName;

    try {
      const res = await fetch('/api/onboarding/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token || undefined,
          tenantId: effectiveTenant,
          fullName,
          phone,
          email: email || undefined,
          type: accountType,
          zoneId: Number(zoneId),
          zoneName: effectiveZoneName,
          jarQuota,
          address,
          landmark: landmark || undefined,
          deliveryNote: deliveryNote || undefined,
          refillCycle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.customerCode) {
          customerCode = data.customerCode;
        }
        if (data.customerId) {
          returnedCustId = data.customerId;
        }
        if (data.tenantId) {
          setResolvedTenantId(data.tenantId);
        }
      }
    } catch (e) {
      console.warn('API registration call fallback:', e);
    }

    // Persist to admin/tenant-specific customer store so it shows immediately on the specific admin's Customers Page
    const targetTenantKey = effectiveTenant !== 'plant_default' ? `panniwalay_customers_${effectiveTenant}` : 'panniwalay_new_customers';
    const newEntry = {
      id: returnedCustId,
      customerCode,
      fullName,
      phone,
      email,
      type: accountType,
      zoneName: effectiveZoneName,
      jarQuota,
      jarsInCirculation: 0,
      depositHeld: totalDepositEscrow,
      refillCycle: refillCycle === 'weekly' ? 'Weekly' : refillCycle === 'twice_weekly' ? 'Twice Weekly' : 'On Call',
      status: 'active',
      address,
      tenantId: effectiveTenant,
    };

    try {
      const existing = JSON.parse(localStorage.getItem(targetTenantKey) || '[]');
      existing.unshift(newEntry);
      localStorage.setItem(targetTenantKey, JSON.stringify(existing));

      // Also notify any open customer pages via custom event and storage event
      window.dispatchEvent(
        new CustomEvent('customer_registered', {
          detail: { tenantId: effectiveTenant, customer: newEntry },
        })
      );
      window.dispatchEvent(new Event('storage'));
    } catch (storageErr) {
      console.warn('LocalStorage save error:', storageErr);
    }

    setAssignedCode(customerCode);
    setStep(4);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/20">
            <Droplets className="w-5 h-5 fill-slate-950/20 text-slate-950" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              Panniwalay
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Official
              </span>
            </span>
            <p className="text-[10px] text-slate-400">Karachi Plant #4 • Customer Onboarding</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">PSQCA & ISO 9001 Certified Mineral Water</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 z-10 space-y-6">
        {step < 4 && (
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-semibold inline-block">
              Doorstep Mineral Water Subscription
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Direct-to-Door Delivery Signup
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Pure, 7-stage ozonated mineral water in tamper-sealed 19-litre food-grade bottles delivered to your doorstep in Karachi.
            </p>

            {/* Stepper Progress */}
            <div className="flex items-center justify-center gap-3 pt-4">
              {[
                { s: 1, label: 'Profile' },
                { s: 2, label: 'Location' },
                { s: 3, label: 'Quota & Confirmation' },
              ].map((item) => (
                <div key={item.s} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      step >= item.s
                        ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {item.s}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      step >= item.s ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.s < 3 && <div className="w-8 h-0.5 bg-slate-800"></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Personal & Account Profile */}
        {step === 1 && (
          <div className="rounded-2xl p-6 bg-slate-800/80 border border-slate-700/80 backdrop-blur-md shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              <span>Step 1: Account Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType('residential')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  accountType === 'residential'
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="font-bold block text-sm">Residential Home</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Family & Apartments</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('corporate')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  accountType === 'corporate'
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="font-bold block text-sm">Corporate / Commercial</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Offices, Clinics & B2B</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  {accountType === 'corporate' ? 'Company / Business Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={accountType === 'corporate' ? 'e.g. Al-Fatah Enterprises' : 'e.g. Tariq Mansoor'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Mobile Phone Number (For Delivery Confirmation)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-sky-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    CNIC # (For Security Deposit)
                  </label>
                  <input
                    type="text"
                    placeholder="42201-XXXXXXX-X"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-sky-500 text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-sky-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => {
                  if (!fullName.trim() || !phone.trim()) {
                    alert('Please enter your full name and mobile phone number');
                    return;
                  }
                  setStep(2);
                }}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Delivery Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Delivery Address & Karachi Sector */}
        {step === 2 && (
          <div className="rounded-2xl p-6 bg-slate-800/80 border border-slate-700/80 backdrop-blur-md shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Step 2: Karachi Delivery Address</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Select Karachi Sector / Delivery Zone
                </label>
                <select
                  value={zoneId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setZoneId(id);
                    const found = availableZones.find((z) => z.id === id);
                    if (found) {
                      setZoneName(`${found.name} (${found.code})`);
                    } else {
                      setZoneName(e.target.options[e.target.selectedIndex].text);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-sky-500 text-sm"
                >
                  {availableZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code}) {z.sector ? `— ${z.sector}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Complete Street Address (House / Plot / Building / Flat #)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Flat 402, Al-Noor Heights, 26th Street..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-sky-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    Nearest Prominent Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Sultan Masjid"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-sky-500 text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    Gate / Rider Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave with gate guard"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-sky-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!address.trim()) {
                    alert('Please enter your complete street address');
                    return;
                  }
                  setStep(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Bottle Quota</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Bottle Quota & Transparent Escrow Breakdown */}
        {step === 3 && (
          <form onSubmit={handleSubmitRegistration} className="rounded-2xl p-6 bg-slate-800/80 border border-slate-700/80 backdrop-blur-md shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>Step 3: Bottle Quota & Pricing Confirmation</span>
            </h3>

            {/* Quota Selector */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block text-sm">Initial 19L Bottle Quota</span>
                <span className="text-xs text-slate-400">Total bottles maintained at your premises</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setJarQuota(Math.max(1, jarQuota - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-base cursor-pointer"
                >
                  -
                </button>
                <span className="text-lg font-bold text-sky-400 w-8 text-center">{jarQuota}</span>
                <button
                  type="button"
                  onClick={() => setJarQuota(jarQuota + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-base cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Refill Cycle */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold block text-slate-300">Preferred Refill Schedule</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'weekly', label: 'Once a Week' },
                  { id: 'twice_weekly', label: 'Twice a Week' },
                  { id: 'on_call', label: 'On Call (As Needed)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRefillCycle(item.id as any)}
                    className={`py-2 px-2 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                      refillCycle === item.id
                        ? 'border-sky-500 bg-sky-500/10 text-white'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transparent Escrow Breakdown */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>
                  Refundable Bottle Escrow ({jarQuota} x PKR {standardDepositPerJar.toLocaleString()}):
                </span>
                <span className="font-semibold text-white">
                  {totalDepositEscrow === 0 ? (
                    <span className="text-emerald-400 font-bold">WAIVED</span>
                  ) : (
                    `PKR ${totalDepositEscrow.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>First Filled 19L Bottles ({jarQuota} x PKR {refillPricePerJar.toLocaleString()}):</span>
                <span className="font-semibold text-white">PKR {initialRefillTotal.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm font-bold">
                <span className="text-white">Payable on First Delivery (Cash on Delivery):</span>
                <span className="text-sky-400 font-extrabold text-base">
                  PKR {grandTotalOnFirstDelivery.toLocaleString()}
                </span>
              </div>
              {totalDepositEscrow > 0 ? (
                <p className="text-[11px] text-slate-400 pt-1">
                  * The PKR {totalDepositEscrow.toLocaleString()} bottle security deposit is 100% refundable upon account closing and return of bottles.
                </p>
              ) : (
                <p className="text-[11px] text-emerald-400/80 pt-1">
                  ✓ No bottle security deposit required — deposit has been waived by plant administration.
                </p>
              )}
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                {submitting ? 'Registering Account...' : 'Confirm Subscription & Activate'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Success & Confirmation */}
        {step === 4 && (
          <div className="rounded-2xl p-8 bg-slate-800/90 border border-emerald-500/30 backdrop-blur-md shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">
                Subscription Successfully Activated!
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Welcome to Panniwalay Mineral Water Plant #4 Karachi. Your customer account has been registered in our database:
              </p>
              <div className="inline-block px-4 py-2 rounded-xl bg-slate-900 border border-sky-500/40 text-sky-400 font-mono text-lg font-bold">
                {assignedCode}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Name:</span>
                <span className="font-semibold text-white">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact Number:</span>
                <span className="font-semibold text-white">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Zone:</span>
                <span className="font-semibold text-white">{zoneName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bottle Quota:</span>
                <span className="font-semibold text-white">{jarQuota} Jars (19-Litre)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">First Delivery Cash:</span>
                <span className="font-bold text-emerald-400">PKR {grandTotalOnFirstDelivery.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Our fleet dispatch rider will deliver your initial batch within 24 hours. A confirmation has been logged for {phone}.
            </p>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => navigate('/customers')}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
              >
                View Customer in ERP Registry
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 Panniwalay Mineral Water (Pvt) Ltd • Plant #4 Korangi Industrial Area, Karachi • Helpdesk: +92-300-8291444
      </footer>
    </div>
  );
};
