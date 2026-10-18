import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiShield, FiLock, FiMail, FiKey, FiEye, FiEyeOff, FiArrowRight, FiActivity, FiCreditCard, FiGrid, FiCheckCircle } from 'react-icons/fi';
import { useAdmin } from '../AdminProvider';
import { fadeUp } from '../ui';
import Footer from '../../../components/Footer/Footer';
import Navbar from '../../../components/Navbar/Navbar';

const modules = [
  { icon: FiActivity, t: 'Live Gate Telemetry', d: 'Real-time attendee check-in scans, physical turnstile throughput & NFC wristband credentials.' },
  { icon: FiCreditCard, t: 'Escrow Settlements', d: 'Next-day T+0 multi-currency ticket payouts, sovereign split contracts, and automated statutory tax holding.' },
  { icon: FiGrid, t: 'Ticket Pass Architect', d: 'Customise holographic Apple & Google Wallet passes with dynamic anti-scalping rotating QR algorithms.' },
];

export default function AdminLogin() {
  const { session, login } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [trust, setTrust] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/admin" replace />;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password, { trust });
      const from = location.state?.from;
      navigate(from?.startsWith('/admin') ? from : '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFBF00] text-black font-sans flex flex-col selection:bg-black selection:text-[#FFBF00]">
      <Navbar/>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono font-bold uppercase tracking-wider border-b-2 border-black/20 pb-3">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> Node: live // Gateway cluster EMEA-LOS-01</span>
          <span className="flex items-center gap-2">Environment: <span className="bg-black text-[#FFBF00] px-2 py-1 rounded">Production sovereign</span> Port: 443 / WSS</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.form onSubmit={submit} initial="hidden" animate="visible" variants={fadeUp}
            className="lg:col-span-7 relative bg-black text-white rounded-2xl shadow-2xl font-mono overflow-hidden">
            <motion.div className="h-1 bg-red-600" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} />
            <div className="p-6 md:p-10 space-y-6">
              <span className="inline-flex items-center gap-2 bg-neutral-900 text-red-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded">
                <FiShield /> Session gateway v4.2 // Organizer console access
              </span>
              <h1 className="text-4xl md:text-6xl font-black font-sans tracking-tight leading-none">Sign In to Admin Console</h1>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                Enter your verified executive credentials to access turnstile gate operations, event ticketing
                manifests, and sovereign escrow settlements.
              </p>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <label htmlFor="email">Work / Executive Email Address *</label>
                  <span className="text-emerald-400 font-bold">{emailOk && '• FORMAT VALID'}</span>
                </div>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="director.ops@stonovah.com"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-[#FFBF00]" />
                </div>
              </div>

              <div>
                <label htmlFor="pw" className="block text-[10px] text-neutral-400 mb-1">Password *</label>
                <div className="relative">
                  <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input id="pw" type={show ? 'text' : 'password'} autoComplete="current-password" value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-[#FFBF00]" />
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer">
                    {show ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 text-xs text-neutral-300 cursor-pointer">
                <input type="checkbox" checked={trust} onChange={(e) => setTrust(e.target.checked)} className="mt-0.5 w-4 h-4 accent-red-600" />
                <span><b className="text-white">Trust this workstation for 30 days.</b> Hardware cryptographic binding will pair this browser profile to your security license.</span>
              </label>

              {error && <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</motion.p>}

              <motion.button type="submit" disabled={loading || !emailOk || password.length < 8}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Authenticating…' : <>Authenticate & Enter Console <FiArrowRight /></>}
              </motion.button>
            </div>
          </motion.form>

          <div className="lg:col-span-5 bg-black text-white rounded-2xl shadow-2xl font-mono p-6 space-y-4 self-start">
            <h2 className="text-lg font-black font-sans uppercase flex items-center gap-2"><FiShield className="text-red-500" /> Active Console Modules</h2>
            {modules.map((m, i) => (
              <motion.div key={m.t} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15 }}
                className="bg-neutral-900 rounded-xl p-4 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-950 text-red-400 flex items-center justify-center shrink-0"><m.icon /></div>
                <div>
                  <span className="font-bold font-sans block">{m.t}</span>
                  <span className="text-[11px] text-neutral-400 leading-snug block mt-0.5">{m.d}</span>
                </div>
              </motion.div>
            ))}
            <p className="text-[10px] text-neutral-500 flex items-center gap-2"><FiCheckCircle className="text-emerald-400" /> All sessions are logged to the immutable audit trail.</p>
          </div>
        </div>
      </main>

      <Footer/>
    </div>
  );
}