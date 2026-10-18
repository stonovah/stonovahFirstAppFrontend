// src/pages/auth/Login.jsx — one login for organizers and admins
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { FiShield, FiMail, FiKey, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { apiErrorMessage } from '../../api/apiClient';
import { ROUTES, homeFor } from '../../config/routes';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Login() {
  const { user, status, login } = useAuth();
  const location = useLocation();
  const from = location.state?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already signed in (or just signed in): go where this role belongs
  if (status === 'authed' && user) return <Navigate to={homeFor(user, from)} replace />;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password); // state update triggers the redirect above
    } catch (err) {
      setError(err.response?.status === 400 ? 'Enter a valid email and a password of at least 8 characters.' : apiErrorMessage(err, 'Could not sign in.'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFBF00] text-black font-sans flex flex-col selection:bg-black selection:text-[#FFBF00]">
      <Navbar />
      <main className="flex-1 w-full max-w-xl mx-auto p-4 md:p-8 flex items-center">
        <motion.form
          onSubmit={submit} initial="hidden" animate="visible" variants={fadeUp}
          className="w-full bg-black text-white rounded-2xl shadow-2xl font-mono overflow-hidden"
        >
          <motion.div className="h-1 bg-red-600" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} />
          <div className="p-6 md:p-10 space-y-6">
            <span className="inline-flex items-center gap-2 bg-neutral-900 text-red-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded">
              <FiShield /> Secure sign in
            </span>
            <h1 className="text-4xl font-black font-sans tracking-tight leading-none">Sign In</h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Organizers and Stonovah administrators sign in here. You will be taken to the right console automatically.
            </p>

            {location.state?.message && (
            <p className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded-lg px-3 py-2">{location.state.message}</p>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] text-neutral-400 mb-1">Email Address *</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
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

              <div className="text-right">
                <Link to="/forgot-password" className="text-[11px] text-[#FFBF00] font-bold hover:underline">Forgot password?</Link>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</motion.p>
            )}

            <motion.button
              type="submit" disabled={loading || !emailOk || password.length < 8}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : <>Sign In <FiArrowRight /></>}
            </motion.button>

            <p className="text-[11px] text-neutral-400">
              New organizer?{' '}
              <Link to={ROUTES.organizerRegister} className="text-[#FFBF00] font-bold hover:underline">Create an organizer account</Link>
            </p>
          </div>
        </motion.form>
      </main>
      <Footer />
    </div>
  );
}