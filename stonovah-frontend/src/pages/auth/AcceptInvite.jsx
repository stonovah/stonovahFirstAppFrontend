// src/pages/auth/AcceptInvite.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheck, FiKey, FiUser } from 'react-icons/fi';
import AuthShell from './AuthShell';
import { passwordRules } from '../organizer/steps/AccountCredentials';
import { teamApi } from '../../api/team';
import { apiErrorMessage } from '../../api/apiClient';
import { ROUTES } from '../../config/routes';

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setLoadError('This invitation link is incomplete.'); return; }
    teamApi.inviteInfo(token).then(setInfo).catch((e) => setLoadError(apiErrorMessage(e, 'This invitation is invalid or has expired.')));
  }, [token]);

  const rules = passwordRules(password);
  const valid = name.trim().length >= 2 && rules.every((r) => r.ok) && password === confirm;

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await teamApi.accept({ token, name: name.trim(), password });
      navigate(ROUTES.login, { replace: true, state: { message: `Account created. Sign in with ${info.email}.` } });
    } catch (err) { setError(apiErrorMessage(err, 'Could not create your account.')); setBusy(false); }
  };

  if (loadError) {
    return (
      <AuthShell title="Invitation unavailable" intro={loadError}>
        <p className="text-xs text-neutral-400">Ask the account owner to send you a new invitation.</p>
        <Link to={ROUTES.login} className="text-[11px] text-[#FFBF00] font-bold hover:underline block">Go to sign in</Link>
      </AuthShell>
    );
  }
  if (!info) return <AuthShell title="Loading invitation…" />;

  return (
    <AuthShell title="Join the team" intro={`${info.organization} invited you as ${info.role}. Choose a password to create your account.`}>
      <form onSubmit={submit} className="space-y-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs"><span className="text-neutral-500 block text-[10px] uppercase">Email</span><b>{info.email}</b></div>

        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" maxLength={80}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-[#FFBF00]" />
        </div>
        {[['Password', password, setPassword], ['Confirm password', confirm, setConfirm]].map(([label, val, set]) => (
          <div key={label} className="relative">
            <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input type="password" autoComplete="new-password" value={val} onChange={(e) => set(e.target.value)} placeholder={label}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-[#FFBF00]" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {rules.map((r) => (
            <span key={r.label} className={`flex items-center gap-1.5 ${r.ok ? 'text-white' : 'text-neutral-500'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] shrink-0 ${r.ok ? 'bg-emerald-500 text-black' : 'bg-neutral-800'}`}>{r.ok && <FiCheck />}</span>{r.label}
            </span>
          ))}
        </div>
        {confirm && password !== confirm && <p className="text-[10px] text-red-400">Passwords do not match</p>}
        {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={!valid || busy} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}