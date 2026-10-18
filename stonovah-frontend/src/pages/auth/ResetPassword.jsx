// src/pages/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiKey, FiCheck } from 'react-icons/fi';
import AuthShell from './AuthShell';
import { passwordRules } from '../organizer/steps/AccountCredentials';
import { authApi } from '../../api/organizer';
import { apiErrorMessage } from '../../api/apiClient';
import { ROUTES } from '../../config/routes';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const rules = passwordRules(password);
  const valid = rules.every((r) => r.ok) && password === confirm;

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      navigate(ROUTES.login, { replace: true, state: { message: 'Password updated. Sign in with your new password.' } });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not reset your password.'));
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Reset Link Invalid" intro="This reset link is missing its token. Request a new one.">
        <Link to="/forgot-password" className="text-[11px] text-[#FFBF00] font-bold hover:underline">Request a new link →</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set New Password" intro="Choose a strong password for your account.">
      <form onSubmit={submit} className="space-y-4">
        {[['New password', password, setPassword], ['Confirm new password', confirm, setConfirm]].map(([label, val, set]) => (
          <div key={label}>
            <label className="block text-[10px] text-neutral-400 mb-1">{label} *</label>
            <div className="relative">
              <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="password" autoComplete="new-password" value={val} onChange={(e) => set(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-[#FFBF00]" />
            </div>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {rules.map((r) => (
            <span key={r.label} className={`flex items-center gap-1.5 ${r.ok ? 'text-white' : 'text-neutral-500'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] shrink-0 ${r.ok ? 'bg-emerald-500 text-black' : 'bg-neutral-800'}`}>{r.ok && <FiCheck />}</span>
              {r.label}
            </span>
          ))}
        </div>
        {confirm && password !== confirm && <p className="text-[10px] text-red-400">Passwords do not match</p>}
        {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={loading || !valid}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </AuthShell>
  );
}