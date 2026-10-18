// src/pages/organizer/pages/OrganizerSettings.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUser, FiCreditCard, FiSliders, FiBell, FiLock, FiUsers, FiSave, FiRotateCcw, FiShield, FiCheck, FiUpload, FiTrash2 } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader } from '../../admin/ui';
import { Toggle, FormField, inputCls } from '../../admin/ui2';
import TeamTab from '../TeamTab';
import SettlementPane from '../SettlementPane';
import { passwordRules } from '../steps/AccountCredentials';
import { useFeeRate } from '../../steps/helpers';
import { settingsApi } from '../../../api/settings';
import { authApi } from '../../../api/organizer';
import { templatesApi, uploadsApi } from '../../../api/events';
import { apiErrorMessage } from '../../../api/apiClient';
import { useCan } from '../../../context/AuthContext';
import SessionsCard from '../SessionsCard';

const tabs = [['profile', 'Profile', FiUser], ['settlement', 'Settlement', FiCreditCard], ['defaults', 'Event Defaults', FiSliders], ['notifications', 'Notifications', FiBell], ['security', 'Security', FiLock], ['team', 'Team', FiUsers]];
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const urlOk = (u) => { try { return ['http:', 'https:'].includes(new URL(u).protocol); } catch { return false; } };
const notifLabels = {
  newOrder: ['New order received', 'When someone buys tickets for one of your events'],
  refundUpdates: ['Refund request updates', 'When Stonovah approves or declines a refund request'],
  payoutSent: ['Payout sent', 'When an advance or settlement is transferred to your account'],
  eventDecision: ['Event approved or rejected', 'When Stonovah reviews an event you submitted'],
  lowInventory: ['Low inventory alert', 'When a ticket type reaches your low-stock level'],
};

function LogoField({ url, onChange, disabled }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return toast.error('Use a PNG, JPG or WebP image.');
    if (file.size > 5 * 1024 * 1024) return toast.error('The logo must be 5 MB or smaller.');
    setBusy(true);
    try { onChange(await uploadsApi.image(file)); } catch (e) { toast.error(apiErrorMessage(e, 'Upload failed.')); } finally { setBusy(false); }
  };
  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center text-[9px] text-neutral-500 shrink-0">
        {url ? <img src={url} alt="Logo" className="w-full h-full object-cover" /> : 'NO LOGO'}
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
      <div className="space-y-2">
        <Btn variant="soft" disabled={disabled || busy} onClick={() => ref.current?.click()}><FiUpload /> {busy ? 'Uploading…' : url ? 'Replace logo' : 'Upload logo'}</Btn>
        {url && !disabled && <button type="button" onClick={() => onChange(null)} className="text-[11px] text-neutral-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"><FiTrash2 /> Remove</button>}
        <p className="text-[10px] text-neutral-500">PNG, JPG or WebP up to 5MB</p>
      </div>
    </div>
  );
}

export default function OrganizerSettings() {
  const can = useCan();
  const canEdit = can('settings.write');
  const feeRate = useFeeRate();
  const pct = Number((feeRate * 100).toFixed(2));

  const [params, setParams] = useSearchParams();
  const visibleTabs = tabs.filter(([k]) => (k !== 'team' || can('team.manage')) && (k !== 'settlement' || can('finance.read')));
  const tab = visibleTabs.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'profile';

  const [saved, setSaved] = useState(null);
  const [d, setD] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get().then((s) => { setSaved(s); setD(s); }).catch((e) => setError(apiErrorMessage(e, 'Could not load your settings.')));
    templatesApi.list().then(setTemplates).catch(() => {});
  }, []);

  if (!d) return error ? <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{error}</p> : <p className="font-mono text-xs font-bold">LOADING SETTINGS…</p>;

  const p = d.profile;
  const dirty = JSON.stringify(d) !== JSON.stringify(saved);
  const setSec = (sec, k, v) => setD((x) => ({ ...x, [sec]: { ...x[sec], [k]: v } }));

  const err = {
    displayName: p.displayName.trim().length < 2 && 'Enter a public name',
    publicEmail: p.publicEmail && !emailOk(p.publicEmail) && 'Enter a valid email',
    website: p.website && !urlOk(p.website) && 'Use a full URL such as https://example.com',
    publicPhone: p.publicPhone && p.publicPhone.replace(/\D/g, '').length < 7 && 'Enter a valid phone number',
    lowStockPct: !(d.defaults.lowStockPct >= 50 && d.defaults.lowStockPct <= 100) && 'Enter 50 to 100',
  };
  const valid = !Object.values(err).some(Boolean);
  const show = (k) => (dirty ? err[k] : '');

  const save = async () => {
    setSaving(true);
    try {
      const r = await settingsApi.update({
        profile: { displayName: p.displayName, publicEmail: p.publicEmail, publicPhone: p.publicPhone, website: p.website, about: p.about, logoUrl: p.logoUrl },
        defaults: { feeHandling: d.defaults.feeHandling, defaultTemplateId: d.defaults.defaultTemplateId || null, lowStockPct: d.defaults.lowStockPct },
        notifications: d.notifications,
      });
      setSaved(r); setD(r);
      toast.success('Settings saved');
    } catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader eyebrow="ORGANIZER PORTAL / ACCOUNT" title="Settings" desc="Manage your public profile, settlement account, event defaults, alerts, security and team." />
      <div className="flex flex-wrap gap-2">
        {visibleTabs.map(([k, l, Icon]) => (
          <button key={k} type="button" onClick={() => setParams({ tab: k })} className={`text-xs font-mono font-bold px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-2 ${tab === k ? 'bg-black text-white ring-2 ring-red-600' : 'bg-black/10 hover:bg-black/20'}`}><Icon /> {l}</button>
        ))}
      </div>

      {!canEdit && ['profile', 'defaults', 'notifications'].includes(tab) && (
        <p className="font-mono text-xs font-bold bg-black text-[#FFBF00] rounded-xl p-3">View only: your role cannot change these settings.</p>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
          {tab === 'profile' && (
            <fieldset disabled={!canEdit} className="contents">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <Card className="xl:col-span-8 p-6 space-y-4">
                  <div><h2 className="text-xl font-black font-sans">Public profile</h2><p className="text-[11px] text-neutral-400">Shown to buyers on your event pages.</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Public organizer name" required error={show('displayName')}><input value={p.displayName} onChange={(e) => setSec('profile', 'displayName', e.target.value)} className={inputCls} /></FormField>
                    <FormField label="Public contact email" error={show('publicEmail')}><input value={p.publicEmail} onChange={(e) => setSec('profile', 'publicEmail', e.target.value)} className={inputCls} /></FormField>
                    <FormField label="Phone" error={show('publicPhone')}><input value={p.publicPhone} onChange={(e) => setSec('profile', 'publicPhone', e.target.value)} className={inputCls} /></FormField>
                    <FormField label="Website" error={show('website')}><input value={p.website} onChange={(e) => setSec('profile', 'website', e.target.value)} className={inputCls} /></FormField>
                  </div>
                  <FormField label="About your organization" right={<span className="normal-case text-neutral-500">{p.about.length}/500</span>}><textarea rows={4} maxLength={500} value={p.about} onChange={(e) => setSec('profile', 'about', e.target.value)} className={inputCls} /></FormField>
                  <FormField label="Logo"><LogoField url={p.logoUrl} onChange={(u) => setSec('profile', 'logoUrl', u)} disabled={!canEdit} /></FormField>
                </Card>

                <Card index={1} className="xl:col-span-4 p-6 space-y-3">
                  <h2 className="text-xl font-black font-sans flex items-center gap-2"><FiShield className="text-red-400" /> Verified identity</h2>
                  {[['Legal entity', d.identity.legalName], ['Registry ID', d.identity.registry], ['Type', d.identity.type === 'BUSINESS' ? 'Corporate (CAC)' : d.identity.type === 'INDIVIDUAL' ? 'Individual (NIN)' : '—']].map(([k, v]) => (
                    <div key={k} className="bg-neutral-900 rounded-lg px-3 py-2.5 flex justify-between gap-2 text-xs"><span className="text-neutral-400">{k}</span><b className="text-right break-all">{v || '—'}</b></div>
                  ))}
                  <Pill tone={d.identity.kycStatus === 'VERIFIED' ? 'green' : 'amber'}>{d.identity.kycStatus === 'VERIFIED' ? 'KYC verified' : 'Verification pending'}</Pill>
                  <p className="text-[11px] text-neutral-400">Legal details are locked to your verified KYC record. To change them, contact <a className="text-[#FFBF00] underline" href="mailto:compliance@stonovah.com">compliance@stonovah.com</a>.</p>
                </Card>
              </div>
            </fieldset>
          )}

          {tab === 'settlement' && <SettlementPane />}

          {tab === 'defaults' && (
            <fieldset disabled={!canEdit} className="contents">
              <Card className="p-6 space-y-5 max-w-3xl">
                <div><h2 className="text-xl font-black font-sans">Event defaults</h2><p className="text-[11px] text-neutral-400">Pre-fills new events. You can change each one while creating the event.</p></div>
                <FormField label={`Who pays the ${pct}% platform fee?`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[['ORGANIZER_ABSORBED', 'I absorb it', 'Deducted from my sales. Buyers see clean prices.'], ['BUYER_ADDED', 'Buyer pays it', 'Added as a booking fee at checkout.']].map(([k, t, s]) => (
                      <button key={k} type="button" onClick={() => setSec('defaults', 'feeHandling', k)} className={`text-left p-4 rounded-xl border cursor-pointer transition ${d.defaults.feeHandling === k ? 'bg-neutral-900 border-red-600' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'}`}><b className="font-sans block">{t}</b><span className="text-[11px] text-neutral-400">{s}</span></button>
                    ))}
                  </div>
                </FormField>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Default ticket template">
                    <select value={d.defaults.defaultTemplateId || ''} onChange={(e) => setSec('defaults', 'defaultTemplateId', e.target.value || null)} className={inputCls}>
                      <option value="">No default (choose each time)</option>
                      {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Low inventory alert at (% sold)" error={show('lowStockPct')}>
                    <input type="number" min="50" max="100" value={d.defaults.lowStockPct} onChange={(e) => setSec('defaults', 'lowStockPct', Number(e.target.value))} className={inputCls} />
                  </FormField>
                </div>
              </Card>
            </fieldset>
          )}

          {tab === 'notifications' && (
            <fieldset disabled={!canEdit} className="contents">
              <Card className="p-6 space-y-3 max-w-2xl">
                <div><h2 className="text-xl font-black font-sans">Notifications</h2><p className="text-[11px] text-neutral-400">Alerts appear in the bell at the top of the dashboard sidebar. Important account alerts (KYC, account status, events taken offline) are always sent.</p></div>
                {Object.entries(notifLabels).map(([k, [l, desc]]) => (
                  <div key={k} className="bg-neutral-900 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-sm">
                    <span><b className="block">{l}</b><span className="text-[11px] text-neutral-400">{desc}</span></span>
                    <Toggle on={d.notifications[k]} onChange={(v) => setSec('notifications', k, v)} label={l} disabled={!canEdit} />
                  </div>
                ))}
              </Card>
            </fieldset>
          )}

          {tab === 'security' && <SecurityTab />}
          {tab === 'team' && <TeamTab />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {dirty && canEdit && ['profile', 'defaults', 'notifications'].includes(tab) && (
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="sticky bottom-4 z-30 bg-black text-white rounded-2xl shadow-2xl border border-neutral-800 p-4 font-mono flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span className="text-xs"><span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-2 animate-pulse" /><b>You have unsaved changes</b>{!valid && <span className="text-red-400 block mt-1">Fix the highlighted fields to save.</span>}</span>
            <div className="flex gap-2"><Btn variant="soft" onClick={() => setD(saved)}><FiRotateCcw /> Discard</Btn><Btn disabled={!valid || saving} onClick={save}><FiSave /> {saving ? 'Saving…' : 'Save Changes'}</Btn></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SecurityTab() {
  const [f, setF] = useState({ cur: '', next: '', conf: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rules = passwordRules(f.next);
  const valid = f.cur && rules.every((r) => r.ok) && f.next === f.conf;
  const [sessionsKey, setSessionsKey] = useState(0);

  const submit = async () => {
    setBusy(true); setError('');
    try {
      await authApi.changePassword(f.cur, f.next);
      setF({ cur: '', next: '', conf: '' });
      const r = await authApi.changePassword(f.cur, f.next);
      setF({ cur: '', next: '', conf: '' });
      setSessionsKey((k) => k + 1);
      toast.success(r.signedOutOthers ? `Password updated. ${r.signedOutOthers} other device(s) were signed out.` : 'Password updated');
    } catch (e) { setError(apiErrorMessage(e, 'Could not update your password.')); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-black font-sans">Change password</h2>
        <FormField label="Current password" required><input type="password" autoComplete="current-password" value={f.cur} onChange={(e) => setF({ ...f, cur: e.target.value })} className={inputCls} /></FormField>
        <FormField label="New password" required><input type="password" autoComplete="new-password" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} className={inputCls} /></FormField>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {rules.map((r) => <span key={r.label} className={`flex items-center gap-1.5 ${r.ok ? 'text-white' : 'text-neutral-500'}`}><span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${r.ok ? 'bg-emerald-500 text-black' : 'bg-neutral-800'}`}>{r.ok && <FiCheck />}</span>{r.label}</span>)}
        </div>
        <FormField label="Confirm new password" required error={f.conf && f.next !== f.conf ? 'Passwords do not match' : ''}><input type="password" autoComplete="new-password" value={f.conf} onChange={(e) => setF({ ...f, conf: e.target.value })} className={inputCls} /></FormField>
        {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>}
        <Btn disabled={!valid || busy} onClick={submit}>{busy ? 'Updating…' : 'Update Password'}</Btn>
      </Card>

      <Card index={1} className="p-6 space-y-3">
        <h2 className="text-xl font-black font-sans">More security options</h2>
        <div className="space-y-5">
          <SessionsCard reloadKey={sessionsKey} />
          <Card className="p-6">
            <div className="bg-neutral-900 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <span><b className="block">Two-factor authentication</b><span className="text-neutral-400">Coming soon.</span></span>
              <Toggle on={false} onChange={() => {}} disabled label="Two-factor authentication" />
            </div>
          </Card>
        </div>
        <div className="bg-neutral-900 rounded-xl p-3 text-xs">
          <b className="block">Active sessions</b>
          <span className="text-neutral-400">Viewing and signing out other devices is coming next. After changing your password, sign out of devices you no longer use.</span>
        </div>
      </Card>
    </div>
  );
}