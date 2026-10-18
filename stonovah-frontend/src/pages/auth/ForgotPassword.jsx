// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import AuthShell from './AuthShell';
import { authApi } from '../../api/organizer';
import { apiErrorMessage } from '../../api/apiClient';
import { ROUTES } from '../../config/routes';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true); // same message whether or not the account exists
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not send the reset link.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Forgot Password" intro="Enter the email on your account and we will send you a link to set a new password.">
      {sent ? (
        <p className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded-lg px-3 py-3 leading-relaxed">
          If that email belongs to an account, a reset link is on its way. The link is valid for 1 hour.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-[#FFBF00]" />
          </div>
          {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading || !emailOk}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}
      <Link to={ROUTES.login} className="text-[11px] text-[#FFBF00] font-bold hover:underline block">← Back to sign in</Link>
    </AuthShell>
  );
}