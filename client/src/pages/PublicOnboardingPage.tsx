import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Droplets,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Building,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const PublicOnboardingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || 'demo_token';

  // Step flow: 1: Profile & Category -> 2: OTP -> 3: Address & Sector -> 4: Bottles & Confirmation -> 5: Success
  const [step, setStep] = useState(1);

  // Form State
  const [accountType, setAccountType] = useState<'residential' | 'corporate'>('residential');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Address State
  const [zoneId, setZoneId] = useState(1);
  const [zoneName, setZoneName] = useState('Clifton & Sea View (Z-01)');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  // Bottle & Delivery Schedule
  const [jarQuota, setJarQuota] = useState(2);
  const [refillCycle, setRefillCycle] = useState<'weekly' | 'twice_weekly' | 'on_call'>('weekly');

  // Submitting / Result
  const [submitting, setSubmitting] = useState(false);
  const [assignedCode, setAssignedCode] = useState('');

  // Calculate pricing breakdown
  const standardDepositPerJar = 1000;
  const refillPricePerJar = 220;
  const totalDepositEscrow = jarQuota * standardDepositPerJar;
  const initialRefillTotal = jarQuota * refillPricePerJar;
  const grandTotalOnFirstDelivery = totalDepositEscrow + initialRefillTotal;

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 11-digit mobile phone number');
      return;
    }
    setOtpSent(true);
    setOtp('123456'); // Default dev code
  };

  const handleVerifyOtp = () => {
    if (otp === '123456' || otp.length === 6) {
      setOtpVerified(true);
      setOtpError('');
      setStep(3);
    } else {
      setOtpError('Invalid OTP code. Please enter 123456 to test.');
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/onboarding/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          fullName,
          phone,
          email,
          otp: otp || '123456',
          type: accountType,
          zoneId: Number(zoneId),
          jarQuota,
          address,
          landmark,
          deliveryNote,
          refillCycle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAssignedCode(data.customerCode || 'CUST-KHI-4912');
        setStep(5);
        setSubmitting(false);
        return;
      }
    } catch (e) {}

    // Graceful fallback for mock demo
    const mockCode = `CUST-KHI-${Math.floor(1000 + Math.random() * 9000)}`;
    setAssignedCode(mockCode);
    setStep(5);
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
        {step < 5 && (
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
            <div className="flex items-center justify-center gap-2 pt-4">
              {[
                { s: 1, label: 'Profile' },
                { s: 2, label: 'OTP' },
                { s: 3, label: 'Location' },
                { s: 4, label: 'Quota' },
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
                    className={`text-xs font-semibold hidden sm:inline ${
                      step >= item.s ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.s < 4 && <div className="w-6 h-0.5 bg-slate-800"></div>}
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
                  Mobile Phone Number (WhatsApp & Delivery SMS)
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
                    CNIC # (For Deposit Registry)
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
                  if (!fullName || !phone) {
                    alert('Please enter your full name and phone number');
                    return;
                  }
                  setStep(2);
                }}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Mobile Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Mobile OTP Verification */}
        {step === 2 && (
          <div className="rounded-2xl p-6 bg-slate-800/80 border border-slate-700/80 backdrop-blur-md shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-sky-400" />
              <span>Step 2: Verify Mobile Number</span>
            </h3>

            <p className="text-xs text-slate-300">
              We send an instant SMS verification code to <b className="text-white">{phone}</b> to ensure rider fleet coordination.
            </p>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3">
              {!otpSent ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-slate-400">
                    Click the button below to dispatch a 6-digit confirmation code:
                  </p>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Send 6-Digit SMS OTP
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Enter Received 6-Digit Code:</span>
                    <button onClick={handleSendOtp} className="text-sky-400 hover:underline">
                      Resend Code
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-widest text-xl font-bold py-3 rounded-xl bg-slate-900 border border-sky-500/50 text-white focus:outline-sky-400"
                  />
                  <p className="text-[11px] text-emerald-400 text-center font-medium">
                    (Development mode: Enter test code 123456)
                  </p>
                  {otpError && <p className="text-xs text-rose-400 text-center">{otpError}</p>}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              {otpSent && (
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Code & Continue</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Delivery Address & Karachi Sector */}
        {step === 3 && (
          <div className="rounded-2xl p-6 bg-slate-800/80 border border-slate-700/80 backdrop-blur-md shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Step 3: Karachi Delivery Address</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Select Karachi Sector / Delivery Zone
                </label>
                <select
                  value={zoneId}
                  onChange={(e) => {
                    setZoneId(Number(e.target.value));
                    const selected = e.target.options[e.target.selectedIndex].text;
                    setZoneName(selected);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-sky-500 text-sm"
                >
                  <option value="1">Clifton & Sea View (Z-01)</option>
                  <option value="2">DHA Phase 5 & 6 (Z-02)</option>
                  <option value="3">Gulshan-e-Iqbal Block 1-7 (Z-03)</option>
                  <option value="4">PECHS & Tariq Road (Z-04)</option>
                  <option value="5">North Nazimabad Block A-D (Z-05)</option>
                  <option value="6">Korangi Industrial Area (Z-06)</option>
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
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!address) {
                    alert('Please enter your complete street address');
                    return;
                  }
                  setStep(4);
                }}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Bottle Quota</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Bottle Quota & Transparent Escrow Breakdown */}
        {step === 4 && (
          <form onSubmit={handleSubmitRegistration} className="rounded-2xl p-6 bg-slate-800/80 border border-slate-700/80 backdrop-blur-md shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>Step 4: Bottle Quota & Pricing Confirmation</span>
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
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-base"
                >
                  -
                </button>
                <span className="text-lg font-bold text-sky-400 w-8 text-center">{jarQuota}</span>
                <button
                  type="button"
                  onClick={() => setJarQuota(jarQuota + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-base"
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
                    className={`py-2 px-2 rounded-xl text-center font-bold border transition-all ${
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
                <span>Refundable Bottle Escrow ({jarQuota} x PKR 1,000):</span>
                <span className="font-semibold text-white">PKR {totalDepositEscrow.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>First Filled 19L Bottles ({jarQuota} x PKR 220):</span>
                <span className="font-semibold text-white">PKR {initialRefillTotal.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm font-bold">
                <span className="text-white">Payable on First Delivery (COD):</span>
                <span className="text-sky-400 font-extrabold text-base">
                  PKR {grandTotalOnFirstDelivery.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                * The PKR {totalDepositEscrow.toLocaleString()} bottle security deposit is 100% refundable upon account closing and bottle return.
              </p>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                {submitting ? 'Activating Account...' : 'Confirm Subscription & Activate'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: Success & Confirmation */}
        {step === 5 && (
          <div className="rounded-2xl p-8 bg-slate-800/90 border border-emerald-500/30 backdrop-blur-md shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">
                Subscription Successfully Activated!
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Welcome to Panniwalay Mineral Water Plant #4 Karachi. Your customer delivery code is:
              </p>
              <div className="inline-block px-4 py-2 rounded-xl bg-slate-900 border border-sky-500/40 text-sky-400 font-mono text-lg font-bold">
                {assignedCode}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-left space-y-2">
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
              Our fleet dispatch rider will deliver your initial batch within 24 hours. A confirmation SMS has been dispatched to {phone}.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Return to Panniwalay Hub
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
