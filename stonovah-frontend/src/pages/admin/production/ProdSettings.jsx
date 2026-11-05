import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave, FiRotateCcw, FiSend, FiLock, FiSearch } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader } from '../ui';
import { Pagination, FormField, Toggle, inputCls } from '../ui2';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { fmtDate, ago, useDebounced } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import {Select} from '../ui2';
import { useProdAccess } from './useProdAccess';
import { mono } from './prodAdmin';

const TOKENS = ['client_name', 'project_name', 'reference_code', 'service_list', 'submission_date', 'review_sla_days'];
const SAMPLE = { client_name: 'Oluwaseun Adeyemi', project_name: 'The Last Griot of Lagos', reference_code: 'REQ-2026-0001', service_list: '• Script Development\n• Crew & Cast Sourcing', submission_date: '24 October 2026, 11:20', review_sla_days: '2' };
const REGION_STATUS = [{ value: 'PRIMARY', label: 'Primary hub' }, { value: 'ACTIVE', label: 'Active' }, { value: 'PLANNED', label: 'Planned' }];
const ROLE_OPTS = [{ value: '', label: 'No restriction (full access)' }, { value: 'LEAD', label: 'Lead Producer' }, { value: 'PRODUCER', label: 'Producer' }, { value: 'FINANCE', label: 'Finance' }, { value: 'VIEWER', label: 'Viewer' }];
const ENTITIES = ['SERVICE', 'REQUEST', 'PROPOSAL', 'PROJECT', 'SOURCING', 'PITCH', 'PAST', 'CONTENT', 'SETTINGS'].map((v) => ({ value: v, label: v[0] + v.slice(1).toLowerCase() }));
const TABS = [['general', 'Notifications & SLAs'], ['legal', 'Legal & regions'], ['budget', 'Budget tiers'], ['email', 'Email template'], ['staff', 'Staff roles'], ['audit', 'Audit trail'], ['history', 'Change history']];
const FORM_TABS = ['general', 'legal', 'budget', 'email'];
const del = (l, i) => l.filter((_, n) => n !== i);
const upd = (l, i, p) => l.map((x, n) => (n === i ? { ...x, ...p } : x));
const Sec = ({ title, sub, children }) => <Card className="space-y-4 p-6"><div><h2 className="text-xl font-black">{title}</h2>{sub && <p className="mt-1 text-[11px] text-white/45">{sub}</p>}</div>{children}</Card>;
const k2n = (k) => (k == null ? '' : String(Number(k) / 100));
const tierKey = (label, taken) => { let b = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 26) || 'tier'; if (b.length < 2) b = 'tier'; let k = b; for (let n = 2; taken.includes(k); n++) k = `${b}_${n}`; return k; };

const toForm = (s) => ({
  notifyEmail: s.notifyEmail ?? '', notifyOnNewRequest: !!s.notifyOnNewRequest, notifyOnTranche: !!s.notifyOnTranche, notifyOnDropout: !!s.notifyOnDropout,
  reviewSlaDays: String(s.reviewSlaDays), shortlistSlaDays: String(s.shortlistSlaDays), defaultRevisionRounds: String(s.defaultRevisionRounds),
  proposalValidityDays: String(s.proposalValidityDays), defaultContingencyPct: String(s.defaultContingencyPct),
  tranches: (s.defaultTranches ?? []).map((t) => ({ label: t.label, pct: String(t.pct) })),
  ndaTier: s.ndaTier ?? '', scriptPrivacyText: s.scriptPrivacyText ?? '', proposalDisclaimer: s.proposalDisclaimer ?? '',
  regions: (s.regions ?? []).map((r) => ({ name: r.name, status: r.status, detail: r.detail ?? '', note: r.note ?? '' })),
  tiers: (s.budgetTiers ?? []).map((t) => ({ key: t.key, existing: true, label: t.label, min: k2n(t.minKobo), max: k2n(t.maxKobo), undisclosed: !!t.undisclosed })),
  emailSubject: s.emailSubject ?? '', emailBody: s.emailBody ?? '', hotlinePhone: s.hotlinePhone ?? '',
});

function toBody(f) {
  const errors = [];
  const int = (v, lo, hi, label) => { const n = Number(v); if (v === '' || !Number.isInteger(n) || n < lo || n > hi) { errors.push(`${label} must be ${lo} to ${hi}`); return lo; } return n; };
  const pct = Number(f.defaultContingencyPct);
  if (f.defaultContingencyPct === '' || !(pct >= 0 && pct <= 50)) errors.push('Contingency must be 0 to 50%');
  if (f.notifyEmail.trim() && !/^\S+@\S+\.\S+$/.test(f.notifyEmail.trim())) errors.push('Enter a valid notification email');
  const tr = f.tranches.map((t) => ({ label: t.label.trim(), pct: Number(t.pct) }));
  if (!tr.length || tr.some((t) => !t.label || !(t.pct >= 1 && t.pct <= 100))) errors.push('Every milestone needs a label and a percentage from 1 to 100');
  else if (Math.round(tr.reduce((n, t) => n + t.pct, 0) * 100) !== 10000) errors.push('Default milestones must add up to 100%');
  ['scriptPrivacyText', 'proposalDisclaimer', 'ndaTier', 'hotlinePhone', 'emailSubject', 'emailBody'].forEach((k) => { if (!f[k].trim()) errors.push(`${k} cannot be empty`); });
  const bad = [...(f.emailSubject + f.emailBody).matchAll(/\{\{\s*([a-z_]+)\s*\}\}/gi)].map((m) => m[1]).filter((x) => !TOKENS.includes(x));
  if (bad.length) errors.push(`Unknown email token: ${[...new Set(bad)].join(', ')}`);
  const regions = f.regions.filter((r) => r.name.trim()).map((r) => ({ name: r.name.trim(), status: r.status, ...(r.detail.trim() ? { detail: r.detail.trim() } : {}), ...(r.note.trim() ? { note: r.note.trim() } : {}) }));
  if (!regions.length) errors.push('Keep at least one operating region');
  const taken = [];
  const budgetTiers = f.tiers.filter((t) => t.label.trim()).map((t) => {
    const key = t.existing ? t.key : tierKey(t.label, taken); taken.push(key);
    const n = (v) => (t.undisclosed || v === '' ? null : Number(v));
    const min = n(t.min); const max = n(t.max);
    if ((min !== null && !(min >= 0)) || (max !== null && !(max >= 0))) errors.push(`${t.label}: amounts must be zero or more`);
    if (min !== null && max !== null && max < min) errors.push(`${t.label}: the maximum is below the minimum`);
    return { key, label: t.label.trim(), minNaira: min, maxNaira: max, undisclosed: t.undisclosed };
  });
  if (!budgetTiers.length) errors.push('Keep at least one budget tier');
  return {
    errors,
    body: {
      notifyEmail: f.notifyEmail.trim() || undefined, notifyOnNewRequest: f.notifyOnNewRequest, notifyOnTranche: f.notifyOnTranche, notifyOnDropout: f.notifyOnDropout,
      reviewSlaDays: int(f.reviewSlaDays, 1, 30, 'Review SLA'), shortlistSlaDays: int(f.shortlistSlaDays, 1, 30, 'Shortlist SLA'), defaultRevisionRounds: int(f.defaultRevisionRounds, 0, 10, 'Revision rounds'),
      proposalValidityDays: int(f.proposalValidityDays, 1, 180, 'Proposal validity'), defaultContingencyPct: pct, defaultTranches: tr,
      ndaTier: f.ndaTier.trim(), scriptPrivacyText: f.scriptPrivacyText.trim(), proposalDisclaimer: f.proposalDisclaimer.trim(), regions, budgetTiers,
      emailSubject: f.emailSubject.trim(), emailBody: f.emailBody.trim(), hotlinePhone: f.hotlinePhone.trim(),
    },
  };
}

/* ───────── staff ───────── */
function StaffRow({ s, onSaved }) {
  const [role, setRole] = useState(s.role ?? '');
  const [title, setTitle] = useState(s.title ?? '');
  const [cap, setCap] = useState(String(s.capacity));
  const [on, setOn] = useState(s.isActive);
  const [busy, setBusy] = useState(false);
  const capOk = Number.isInteger(Number(cap)) && Number(cap) >= 1 && Number(cap) <= 50;
  const body = {};
  if (role && role !== (s.role ?? '')) body.role = role;
  if (title.trim() !== (s.title ?? '')) body.title = title.trim() || null;
  if (Number(cap) !== s.capacity) body.capacity = Number(cap);
  if (on !== s.isActive) body.isActive = on;
  const dirty = Object.keys(body).length > 0;
  const save = async () => { setBusy(true); try { await A.updateStaff(s.userId, body); toast.success('Access updated'); onSaved(); } catch (e) { toast.error(apiErrorMessage(e)); } setBusy(false); };
  return (
    <tr className="border-b border-white/5 align-middle">
      <td className="p-3"><b className="block break-all">{s.email}</b><span className="text-[10px] text-white/40">{s.hasRow ? 'Custom access' : 'Full access (no row)'}</span></td>
      <td className="p-3"><div className="w-52"><Select value={role} onChange={setRole} options={ROLE_OPTS.filter((o) => o.value || !s.hasRow || true)} /></div></td>
      <td className="p-3"><input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" className={inputCls} /></td>
      <td className="w-24 p-3"><input type="number" min="1" max="50" value={cap} onChange={(e) => setCap(e.target.value)} className={inputCls} /></td>
      <td className="p-3"><Toggle on={on} label="Active" onChange={setOn} /></td>
      <td className="p-3 text-right"><Btn variant="soft" className="px-3 py-1.5" disabled={!dirty || !capOk || busy} onClick={save}><FiSave /> Save</Btn></td>
    </tr>
  );
}
function Staff({ can }) {
  const q = useLoad(() => A.staff(), []);
  if (!can.lead) return <Card className="p-8 text-center text-sm text-white/45"><FiLock className="mx-auto mb-2 text-2xl" />Only a Lead Producer (or an admin with no Production role set) can manage staff roles.</Card>;
  return (
    <Card className="space-y-3 p-5">
      <p className="text-[11px] text-white/45">An admin with no role set keeps full access. Choosing a role narrows them. Capacity is how many open items they can carry, and Active off removes their Production access. You cannot lower your own access.</p>
      <ErrorLine>{q.error}</ErrorLine>
      <div className="overflow-x-auto"><table className="w-full min-w-205 text-left text-xs">
        <thead><tr className={`${mono} border-b border-white/10 text-[9px] text-white/40`}><th className="p-3">Admin</th><th className="p-3">Production role</th><th className="p-3">Title</th><th className="p-3">Capacity</th><th className="p-3">Active</th><th className="p-3" /></tr></thead>
        <tbody>{(q.data ?? []).map((s) => <StaffRow key={`${s.userId}:${s.role}:${s.isActive}:${s.capacity}:${s.title}`} s={s} onSaved={q.reload} />)}</tbody></table></div>
    </Card>
  );
}

/* ───────── audit and history ───────── */
function Audit() {
  const [f, setF] = useState({ entity: '', actor: '', q: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const search = useDebounced(f.q.trim());
  const prod = useLoad(() => A.producers());
  const a = useLoad(() => A.audit({ entity: f.entity || undefined, actor: f.actor || undefined, search: search || undefined, from: f.from || undefined, to: f.to ? `${f.to}T23:59:59` : undefined, page, limit: 25 }), [f.entity, f.actor, search, f.from, f.to, page]);
  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setPage(1); };
  const meta = a.data?.meta ?? { total: 0, pages: 1 };
  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-50 flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={f.q} onChange={(e) => set('q', e.target.value)} placeholder="Search the message text…" className={`${inputCls} pl-9`} /></div>
        <Select className="lg:w-40" value={f.entity} onChange={(v) => set('entity', v)} options={[{ value: '', label: 'All areas' }, ...ENTITIES]} />
        <Select className="lg:w-52" value={f.actor} onChange={(v) => set('actor', v)} options={[{ value: '', label: 'All actors' }, { value: 'system', label: 'System / client' }, ...(prod.data ?? []).map((p) => ({ value: p.id, label: p.email }))]} />
        <input type="date" value={f.from} onChange={(e) => set('from', e.target.value)} className={`${inputCls} lg:w-40`} aria-label="From" />
        <input type="date" value={f.to} onChange={(e) => set('to', e.target.value)} className={`${inputCls} lg:w-40`} aria-label="To" />
      </Card>
      <ErrorLine>{a.error}</ErrorLine>
      <Card className="overflow-x-auto"><table className="w-full min-w-215 text-left text-xs">
        <thead><tr className={`${mono} border-b border-white/10 text-[9px] text-white/40`}><th className="p-3">When</th><th className="p-3">Area</th><th className="p-3">Action</th><th className="p-3">Message</th><th className="p-3">Actor</th></tr></thead>
        <tbody>{(a.data?.data ?? []).map((r) => (
          <tr key={r.id} className="border-b border-white/5 align-top"><td className="whitespace-nowrap p-3 text-white/55">{fmtDate(r.createdAt)}</td><td className="p-3"><Pill>{r.entityType}</Pill></td><td className="p-3 font-mono text-[10px]">{r.action}</td><td className="p-3 text-white/75">{r.message}</td><td className="break-all p-3 text-white/55">{r.actor}</td></tr>))}</tbody></table>
        {a.loading && !a.data && <p className="p-6 font-mono text-xs font-bold">LOADING…</p>}
        {a.data && !a.data.data.length && <p className="p-10 text-center text-sm text-white/40">No activity matches these filters.</p>}</Card>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50"><span>{meta.total} event(s)</span>{meta.pages > 1 && <Pagination page={page} pages={Math.min(meta.pages, 12)} onPage={setPage} />}</div>
    </div>
  );
}
function History() {
  const [page, setPage] = useState(1);
  const h = useLoad(() => A.settingsHistory({ page, limit: 15 }), [page]);
  const meta = h.data?.meta ?? { pages: 1 };
  const show = (v) => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s == null ? '—' : s.length > 60 ? `${s.slice(0, 60)}…` : s; };
  return (
    <div className="space-y-3"><ErrorLine>{h.error}</ErrorLine>
      {h.data && !h.data.data.length && <Card className="p-10 text-center text-sm text-white/40">No settings changes recorded yet.</Card>}
      {(h.data?.data ?? []).map((r) => (
        <Card key={r.id} className="space-y-2 p-4"><div className="flex justify-between gap-2 text-[11px]"><b className="break-all">{r.adminEmail}</b><span className="text-white/45">{fmtDate(r.createdAt)}</span></div>
          {Object.entries(r.changes).map(([k, [from, to]]) => <p key={k} className="text-xs text-white/65"><b className="text-white">{k}</b>: <span className="text-white/40">{show(from)}</span> → {show(to)}</p>)}</Card>))}
      {meta.pages > 1 && <div className="flex justify-center"><Pagination page={page} pages={meta.pages} onPage={setPage} /></div>}</div>
  );
}

/* ───────── page ───────── */
export default function ProdSettings() {
  const { can } = useProdAccess();
  const q = useLoad(() => A.settings());
  const [tab, setTab] = useState('general');
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dlg, setDlg] = useState(null);
  const [testTo, setTestTo] = useState('');
  const body = useRef(null);
  const s = q.data;
  useEffect(() => { if (s) setF(toForm(s)); }, [s]);

  if (!f) return <>{<PageHeader eyebrow="CONFIGURATION" title="Production Arm Configuration & Operational Settings" />}{q.error ? <ErrorLine>{q.error}</ErrorLine> : <p className="font-mono text-xs font-bold">LOADING…</p>}</>;

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const cur = toBody(f);
  const saved = toBody(toForm(s)).body;
  const changed = Object.keys(cur.body).filter((k) => JSON.stringify(cur.body[k]) !== JSON.stringify(saved[k]));
  const dirty = changed.length > 0;
  const off = !can.write;
  const run = async (fn, ok) => { setBusy(true); try { await fn(); if (ok) toast.success(ok); q.reload(); } catch (e) { toast.error(apiErrorMessage(e)); } setBusy(false); };
  const save = () => run(() => A.saveSettings(Object.fromEntries(changed.map((k) => [k, cur.body[k]]))), 'Settings saved');
  const input = (k, extra = {}) => <input value={f[k]} disabled={off} onChange={(e) => set(k, e.target.value)} className={inputCls} {...extra} />;
  const tog = (k, label, sub) => <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-950 p-3"><div><b className="block text-xs">{label}</b><span className="text-[10px] text-white/40">{sub}</span></div><Toggle on={f[k]} label={label} disabled={off} onChange={(v) => set(k, v)} /></div>;
  const insert = (t) => {
    const el = body.current;
    const at = el ? el.selectionStart : f.emailBody.length;
    set('emailBody', `${f.emailBody.slice(0, at)}{{${t}}}${f.emailBody.slice(at)}`);
  };
  const render = (tpl) => tpl.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_m, k) => SAMPLE[k] ?? '');
  const paySum = f.tranches.reduce((n, t) => n + (Number(t.pct) || 0), 0);
  const showSave = FORM_TABS.includes(tab);

  return (
    <>
      <PageHeader eyebrow="CONFIGURATION" title="Production Arm Configuration & Operational Settings" desc="Notification routing, turnaround targets, legal text, operating regions, budget tiers and the confirmation email.">
        <Btn variant="soft" disabled={!can.write || busy} onClick={() => setDlg('reset')}><FiRotateCcw /> Reset to defaults</Btn>
      </PageHeader>

      <div className="flex flex-wrap gap-2">{TABS.map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`cursor-pointer rounded-lg px-4 py-2.5 text-xs font-bold ${tab === k ? 'bg-red-600' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}>{l}{FORM_TABS.includes(k) && dirty ? ' •' : ''}</button>)}</div>

      {showSave && (dirty || cur.errors.length > 0) && (
        <Card className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 border-red-600/40 bg-[#1a1010] p-3">
          <span className="text-xs">{dirty ? `Unsaved changes: ${changed.join(', ')}` : 'There are problems to fix'}</span>
          <span className="flex gap-2"><Btn variant="soft" onClick={() => setF(toForm(s))}>Discard</Btn><Btn disabled={!can.write || !dirty || cur.errors.length > 0 || busy} onClick={save}><FiSave /> {busy ? 'Saving…' : 'Save changes'}</Btn></span>
        </Card>
      )}
      {showSave && cur.errors.length > 0 && <Card className="space-y-1 border-amber-500/40 p-4 text-xs text-amber-200">{cur.errors.map((e) => <p key={e}>• {e}</p>)}</Card>}
      {!can.write && showSave && <p className="text-[11px] text-white/40">You have read-only access to Production.</p>}

      {tab === 'general' && (
        <div className="space-y-6">
          <Sec title="Notification routing" sub="Where Production alerts go.">
            <FormField label="Primary administrative notification email" hint="Receives new briefs, accepted proposals and dropouts.">{input('notifyEmail', { type: 'email' })}</FormField>
            {tog('notifyOnNewRequest', 'Alert on new service requests', 'In-app alert to every admin, plus an email to the address above.')}
            {tog('notifyOnTranche', 'Alert on payment tranche records', 'When a client payment is marked received.')}
            {tog('notifyOnDropout', 'Alert on crew dropout incidents', 'When a booked person withdraws from a role.')}
          </Sec>
          <Sec title="Turnaround & defaults">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <FormField label="Request review target (days)" hint="Shown to the client; unreviewed briefs past it alert admins.">{input('reviewSlaDays', { type: 'number', min: 1, max: 30 })}</FormField>
              <FormField label="Crew shortlist target (days)">{input('shortlistSlaDays', { type: 'number', min: 1, max: 30 })}</FormField>
              <FormField label="Default revision rounds">{input('defaultRevisionRounds', { type: 'number', min: 0, max: 10 })}</FormField>
              <FormField label="Proposal validity (days)">{input('proposalValidityDays', { type: 'number', min: 1, max: 180 })}</FormField>
              <FormField label="Studio management & contingency (%)">{input('defaultContingencyPct', { type: 'number', min: 0, max: 50, step: 0.5 })}</FormField>
              <FormField label="Production hotline" required>{input('hotlinePhone', { maxLength: 40 })}</FormField>
            </div>
            <FormField label="Default payment milestones" right={<span className={Math.round(paySum * 100) === 10000 ? 'text-emerald-400' : 'text-red-400'}>{paySum}% of 100%</span>}>
              <div className="space-y-2">
                {f.tranches.map((t, i) => <div key={i} className="flex gap-2"><input value={t.label} disabled={off} maxLength={60} onChange={(e) => set('tranches', upd(f.tranches, i, { label: e.target.value }))} className={inputCls} /><input type="number" value={t.pct} disabled={off} onChange={(e) => set('tranches', upd(f.tranches, i, { pct: e.target.value }))} className={`${inputCls} w-24`} /><Btn variant="soft" className="px-3" disabled={off || f.tranches.length <= 1} onClick={() => set('tranches', del(f.tranches, i))}><FiTrash2 /></Btn></div>)}
                {f.tranches.length < 6 && <Btn variant="soft" disabled={off} onClick={() => set('tranches', [...f.tranches, { label: '', pct: '' }])}><FiPlus /> Add milestone</Btn>}
              </div>
            </FormField>
          </Sec>
        </div>
      )}

      {tab === 'legal' && (
        <div className="space-y-6">
          <Sec title="Legal, NDA & IP governance">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-950 p-3"><div><b className="block text-xs">Mandatory mutual NDA</b><span className="text-[10px] text-white/40">Always on: the public form promises it.</span></div><span className="flex items-center gap-2"><FiLock className="text-white/40" /><Toggle on label="NDA enforced" disabled onChange={() => {}} /></span></div>
            <FormField label="NDA tier label">{input('ndaTier', { maxLength: 40 })}</FormField>
            <FormField label="Script privacy & IP clause (shown on the request form)"><textarea rows={5} maxLength={4000} disabled={off} value={f.scriptPrivacyText} onChange={(e) => set('scriptPrivacyText', e.target.value)} className={inputCls} /></FormField>
            <FormField label="Proposal legal disclaimer (printed on every proposal PDF)"><textarea rows={5} maxLength={4000} disabled={off} value={f.proposalDisclaimer} onChange={(e) => set('proposalDisclaimer', e.target.value)} className={inputCls} /></FormField>
          </Sec>
          <Sec title="Operational regions & field units" sub="Shown in the public footer (planned regions are hidden).">
            {f.regions.map((r, i) => (
              <div key={i} className="space-y-2 rounded-lg bg-neutral-950 p-3">
                <div className="grid gap-2 md:grid-cols-[1fr_180px_auto]"><input value={r.name} disabled={off} maxLength={60} placeholder="Country" onChange={(e) => set('regions', upd(f.regions, i, { name: e.target.value }))} className={inputCls} /><Select value={r.status} disabled={off} onChange={(v) => set('regions', upd(f.regions, i, { status: v }))} options={REGION_STATUS} /><Btn variant="soft" className="px-3" disabled={off || f.regions.length <= 1} onClick={() => set('regions', del(f.regions, i))}><FiTrash2 /></Btn></div>
                <div className="grid gap-2 md:grid-cols-[1fr_160px]"><input value={r.detail} disabled={off} maxLength={200} placeholder="Locations and detail" onChange={(e) => set('regions', upd(f.regions, i, { detail: e.target.value }))} className={inputCls} /><input value={r.note} disabled={off} maxLength={60} placeholder="Note (e.g. Q3 2027)" onChange={(e) => set('regions', upd(f.regions, i, { note: e.target.value }))} className={inputCls} /></div>
              </div>
            ))}
            {f.regions.length < 12 && <Btn variant="soft" disabled={off} onClick={() => set('regions', [...f.regions, { name: '', status: 'ACTIVE', detail: '', note: '' }])}><FiPlus /> Add jurisdiction</Btn>}
          </Sec>
        </div>
      )}

      {tab === 'budget' && (
        <Sec title="Budget envelope tiers" sub="The budget choices on the public request form. Amounts are in naira. Tick “Undisclosed” for a flexible tier with no amounts.">
          {f.tiers.map((t, i) => (
            <div key={i} className="space-y-2 rounded-lg bg-neutral-950 p-3">
              <div className="grid gap-2 md:grid-cols-[1fr_140px_140px_auto]">
                <input value={t.label} disabled={off} maxLength={60} placeholder="Label, e.g. ₦35M – ₦100M" onChange={(e) => set('tiers', upd(f.tiers, i, { label: e.target.value }))} className={inputCls} />
                <input type="number" min="0" value={t.undisclosed ? '' : t.min} disabled={off || t.undisclosed} placeholder="Min (₦)" onChange={(e) => set('tiers', upd(f.tiers, i, { min: e.target.value }))} className={inputCls} />
                <input type="number" min="0" value={t.undisclosed ? '' : t.max} disabled={off || t.undisclosed} placeholder="Max (₦)" onChange={(e) => set('tiers', upd(f.tiers, i, { max: e.target.value }))} className={inputCls} />
                <Btn variant="soft" className="px-3" disabled={off || f.tiers.length <= 1} onClick={() => set('tiers', del(f.tiers, i))}><FiTrash2 /></Btn>
              </div>
              <div className="flex items-center justify-between"><label className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" disabled={off} checked={t.undisclosed} onChange={(e) => set('tiers', upd(f.tiers, i, { undisclosed: e.target.checked }))} className="accent-red-600" /> Undisclosed / flexible</label><span className="font-mono text-[10px] text-white/30">Key: {t.existing ? t.key : 'created on save'}</span></div>
            </div>
          ))}
          {f.tiers.length < 8 && <Btn variant="soft" disabled={off} onClick={() => set('tiers', [...f.tiers, { key: '', existing: false, label: '', min: '', max: '', undisclosed: false }])}><FiPlus /> Add tier</Btn>}
          <p className="text-[10px] text-white/35">Leave Max empty for “and above”. Requests already submitted keep the tier they chose.</p>
        </Sec>
      )}

      {tab === 'email' && (
        <Sec title="Production request confirmation email" sub="Sent to the client automatically when they submit a brief.">
          <FormField label="Subject line" required>{input('emailSubject', { maxLength: 200 })}</FormField>
          <div className="flex flex-wrap gap-2">{TOKENS.map((t) => <button key={t} type="button" disabled={off} onClick={() => insert(t)} className="cursor-pointer rounded bg-white/6 px-2 py-1 font-mono text-[10px] hover:bg-white/12 disabled:cursor-not-allowed">{`{{${t}}}`}</button>)}</div>
          <FormField label="Email body" required hint="Click a token to insert it where the cursor is."><textarea ref={body} rows={14} maxLength={8000} disabled={off} value={f.emailBody} onChange={(e) => set('emailBody', e.target.value)} className={`${inputCls} font-mono`} /></FormField>
          <div className="rounded-lg bg-neutral-950 p-4"><span className={`${mono} text-[9px] text-white/40`}>Preview with sample data</span><p className="mt-2 text-xs font-bold">{render(f.emailSubject)}</p><pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-white/65">{render(f.emailBody)}</pre></div>
          <div className="flex flex-wrap items-end gap-2">
            <FormField label="Send a test to" className="w-72" hint={dirty ? 'Save your changes first. The test uses the saved template.' : `Empty sends to ${s.notifyEmail ?? 'the notification email'}.`}><input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" className={inputCls} /></FormField>
            <Btn variant="soft" disabled={!can.write || dirty || busy} onClick={() => run(async () => { const r = await A.testEmail(testTo.trim() || undefined); toast.success(`Test sent to ${r.sentTo}`); })}><FiSend /> Send test email</Btn>
          </div>
        </Sec>
      )}

      {tab === 'staff' && <Staff can={can} />}
      {tab === 'audit' && <Audit />}
      {tab === 'history' && <History />}

      {dlg === 'reset' && <ConfirmModal open title="Reset every Production setting to its default?" confirmLabel="Reset to defaults" checkLabel="I understand this overwrites all settings on every tab." onClose={() => setDlg(null)} onConfirm={async () => { try { await A.resetSettings(); toast.success('Settings reset'); setDlg(null); q.reload(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>Notification email, SLAs, legal text, regions, budget tiers and the email template return to the built-in values. The change is logged in history.</p></ConfirmModal>}
    </>
  );
}