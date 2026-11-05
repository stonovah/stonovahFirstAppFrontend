import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiList, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, Bar, CountUp } from '../ui';
import { Pagination, FormField, inputCls } from '../ui2';
import { useLoad, ErrorLine } from '../adminBits';
import { fmtDate, useDebounced } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { Select } from '../ui2';
import { useProdAccess } from './useProdAccess';
import { mono, FORMAT_LABEL, FORMAT_OPTIONS, AUDIENCE_LABEL, AUDIENCE_OPTIONS, FUNDING_LABEL, FUNDING_KEYS, PITCH_STATUS, DELIVERABLE_STATUS, d10 } from './prodAdmin';

const PAGE = 15;
const TABS = [['all', 'All requests'], ['urgent', 'Urgent (due within 7 days)'], ['in_review', 'In review'], ['draft_sent', 'Draft sent'], ['needs_allocation', 'Needs allocation'], ['waterfalls', 'Co-production waterfalls']];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function NewModal({ producers, onClose }) {
  const navigate = useNavigate();
  const [f, setF] = useState({ clientName: '', clientEmail: '', clientCompany: '', projectTitle: '', format: '', budgetLabel: '', audience: '', deadline: '', producerId: '', materials: [] });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const emailOk = /^\S+@\S+\.\S+$/.test(f.clientEmail.trim());
  const valid = f.clientName.trim() && emailOk && f.projectTitle.trim() && f.materials.length > 0;
  const toggle = (k) => set('materials', f.materials.includes(k) ? f.materials.filter((x) => x !== k) : [...f.materials, k]);
  const submit = async () => {
    setBusy(true);
    try {
      const p = await A.createPitch({
        clientName: f.clientName.trim(), clientEmail: f.clientEmail.trim(), clientCompany: f.clientCompany.trim() || undefined, projectTitle: f.projectTitle.trim(),
        format: f.format || undefined, budgetLabel: f.budgetLabel.trim() || undefined, audience: f.audience || undefined, deadline: f.deadline || undefined,
        producerId: f.producerId || undefined, materials: f.materials,
      });
      toast.success('Pitch brief created');
      navigate(`/admin/production/funding/${p.id}`);
    } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };
  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-2xl">
      <div className="space-y-4 p-6">
        <div className="pr-10"><h2 className="text-xl font-black">Manual pitch brief</h2><p className="mt-1 text-[11px] text-white/45">For a pitch that did not come through the public request form. Pitches from the public form are created automatically.</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField label="Project format"><Select value={f.format} onChange={(v) => set('format', v)} options={[{ value: '', label: 'Not set' }, ...FORMAT_OPTIONS]} /></FormField>
          <FormField label="Pitching to"><Select value={f.audience} onChange={(v) => set('audience', v)} options={[{ value: '', label: 'Not set' }, ...AUDIENCE_OPTIONS]} /></FormField>
          <FormField label="Producer"><Select value={f.producerId} onChange={(v) => set('producerId', v)} options={[{ value: '', label: 'Me' }, ...producers.map((p) => ({ value: p.id, label: p.email }))]} /></FormField>
        </div>
        <FormField label="Project title" required><input value={f.projectTitle} maxLength={160} onChange={(e) => set('projectTitle', e.target.value)} className={inputCls} /></FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Client name" required><input value={f.clientName} maxLength={120} onChange={(e) => set('clientName', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Client email" required error={f.clientEmail && !emailOk ? 'Enter a valid email' : ''}><input type="email" value={f.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Company"><input value={f.clientCompany} maxLength={160} onChange={(e) => set('clientCompany', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Budget"><input value={f.budgetLabel} maxLength={80} onChange={(e) => set('budgetLabel', e.target.value)} placeholder="e.g. ₦420M feature" className={inputCls} /></FormField>
          <FormField label="Pitch deadline"><input type="date" value={f.deadline} onChange={(e) => set('deadline', e.target.value)} className={inputCls} /></FormField>
        </div>
        <FormField label="Materials needed" required>
          <div className="grid gap-2 sm:grid-cols-2">
            {FUNDING_KEYS.map((k) => (
              <label key={k} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-xs ${f.materials.includes(k) ? 'border-red-600 bg-red-600/10' : 'border-white/10'}`}>
                <input type="checkbox" checked={f.materials.includes(k)} onChange={() => toggle(k)} className="accent-red-600" /> {FUNDING_LABEL[k]}
              </label>
            ))}
          </div>
        </FormField>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={submit}>{busy ? 'Creating…' : 'Create pitch brief'}</Btn></div>
      </div>
    </Modal>
  );
}

function CalendarView({ producers }) {
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), 1)); });
  const from = month;
  const to = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0, 23, 59, 59));
  const cal = useLoad(() => A.fundingCalendar({ from: from.toISOString(), to: to.toISOString() }), [month.getTime()]);
  const byDay = useMemo(() => {
    const m = {};
    (cal.data ?? []).forEach((p) => { const k = d10(p.deadline); (m[k] ||= []).push(p); });
    return m;
  }, [cal.data]);
  const lead = (month.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const key = (day) => `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const shift = (n) => setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + n, 1)));
  const today = d10(new Date().toISOString());

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">{month.toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h2>
        <div className="flex gap-2"><Btn variant="soft" className="px-3" onClick={() => shift(-1)}><FiChevronLeft /></Btn><Btn variant="soft" onClick={() => { const n = new Date(); setMonth(new Date(Date.UTC(n.getFullYear(), n.getMonth(), 1))); }}>Today</Btn><Btn variant="soft" className="px-3" onClick={() => shift(1)}><FiChevronRight /></Btn></div>
      </div>
      <ErrorLine>{cal.error}</ErrorLine>
      <div className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-7 gap-1">
          {DAYS.map((d) => <div key={d} className={`${mono} p-2 text-[9px] text-white/40`}>{d}</div>)}
          {cells.map((day, i) => {
            const items = day ? byDay[key(day)] ?? [] : [];
            return (
              <div key={i} className={`min-h-[96px] rounded-lg border p-2 ${day ? 'border-white/[0.07] bg-neutral-950' : 'border-transparent'} ${day && key(day) === today ? 'ring-1 ring-red-600' : ''}`}>
                {day && <span className="text-[10px] font-bold text-white/45">{day}</span>}
                <div className="mt-1 space-y-1">
                  {items.map((p) => (
                    <button key={p.id} type="button" onClick={() => navigate(`/admin/production/funding/${p.id}`)} title={`${p.projectTitle} • ${p.clientName}`}
                      className={`block w-full cursor-pointer truncate rounded px-1.5 py-1 text-left text-[10px] font-semibold ${p.status === 'DELIVERED' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-600/20 text-red-200 hover:bg-red-600/30'}`}>{p.projectTitle}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {cal.data && !cal.data.length && <p className="text-center text-sm text-white/40">No pitch deadlines this month.</p>}
      {producers.length === 0 && null}
    </Card>
  );
}

export default function ProdFunding() {
  const navigate = useNavigate();
  const { can } = useProdAccess();
  const [view, setView] = useState('list');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [audience, setAudience] = useState('');
  const [deadline, setDeadline] = useState('');
  const [producer, setProducer] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const search = useDebounced(q.trim());

  const list = useLoad(
    () => A.funding({ view: tab === 'all' ? undefined : tab, search: search || undefined, audience: audience || undefined, deadline: deadline || undefined, producer: producer || undefined, sort, page, limit: PAGE }),
    [tab, search, audience, deadline, producer, sort, page]
  );
  const stats = useLoad(() => A.fundingStats());
  const prod = useLoad(() => A.producers());
  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? { total: 0, pages: 1 };
  const counts = list.data?.counts ?? {};
  const s = stats.data;
  const reset = () => setPage(1);
  const producers = prod.data ?? [];

  return (
    <>
      <PageHeader eyebrow="CAPITAL FACILITATION & PACKAGING" title="Funding & Pitch Materials Pipeline" desc="Investor packs, pitch decks, lookbooks and financing plans requested through the public form or created by the team.">
        <div className="flex gap-1 rounded-lg bg-black/40 p-1">
          {[['list', FiList, 'List'], ['calendar', FiCalendar, 'Pitch calendar']].map(([k, I, l]) => (
            <button key={k} type="button" onClick={() => setView(k)} className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${view === k ? 'bg-[#e10613]' : 'text-white/55 hover:text-white'}`}><I /> {l}</button>
          ))}
        </div>
        <Btn disabled={!can.write} onClick={() => setCreating(true)}><FiPlus /> Manual pitch brief</Btn>
      </PageHeader>

      {s && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            ['Incoming intake', s.newBriefs, 'New briefs awaiting triage'],
            ['In progress', s.inProgress, 'Being drafted, reviewed or with the client'],
            ['Due this week', s.dueThisWeek, s.overdue ? `${s.overdue} overdue` : 'None overdue'],
            ['Delivered this year', s.deliveredThisYear, 'Final packages sent to clients'],
          ].map(([k, v, sub], i) => <Card key={k} index={i} className={`space-y-1 p-5 ${i === 2 && s.overdue ? 'border-red-600/50' : ''}`}><span className={`${mono} text-[9px] text-white/45`}>{k}</span><b className="block text-3xl font-black"><CountUp value={v} /></b><span className="text-[11px] text-white/45">{sub}</span></Card>)}
        </div>
      )}
      <ErrorLine>{stats.error}</ErrorLine>

      {view === 'calendar' ? <CalendarView producers={producers} /> : (
        <>
          <Card className="space-y-3 p-3">
            <div className="flex flex-wrap gap-2">
              {TABS.map(([k, l]) => <button key={k} type="button" onClick={() => { setTab(k); reset(); }} className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}>{l} ({counts[k] ?? 0})</button>)}
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-[220px] flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder="Search project, client, company, reference…" className={`${inputCls} pl-9`} /></div>
              <Select className="lg:w-48" value={audience} onChange={(v) => { setAudience(v); reset(); }} options={[{ value: '', label: 'Pitching to: all' }, ...AUDIENCE_OPTIONS]} />
              <Select className="lg:w-44" value={deadline} onChange={(v) => { setDeadline(v); reset(); }} options={[{ value: '', label: 'Deadline: all' }, { value: 'overdue', label: 'Overdue' }, { value: 'week', label: 'Within 7 days' }, { value: 'month', label: 'Within 30 days' }, { value: 'none', label: 'No deadline' }]} />
              <Select className="lg:w-52" value={producer} onChange={(v) => { setProducer(v); reset(); }} options={[{ value: '', label: 'All producers' }, { value: 'unassigned', label: 'Unassigned' }, ...producers.map((p) => ({ value: p.id, label: p.email }))]} />
              <Select className="lg:w-40" value={sort} onChange={(v) => { setSort(v); reset(); }} options={[{ value: 'newest', label: 'Newest first' }, { value: 'deadline', label: 'Soonest deadline' }]} />
            </div>
          </Card>
          <ErrorLine>{list.error}</ErrorLine>

          <Card className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-xs">
              <thead><tr className={`${mono} border-b border-white/10 text-[9px] text-white/40`}><th className="p-3">Request</th><th className="p-3">Client & entity</th><th className="p-3">Project & format</th><th className="p-3">Materials</th><th className="p-3">Pitching to</th><th className="p-3">Deadline</th><th className="p-3">Producer</th><th className="p-3">Status</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} onClick={() => navigate(`/admin/production/funding/${r.id}`)} className="cursor-pointer border-b border-white/5 align-top transition hover:bg-white/[0.04]">
                    <td className="p-3 font-mono font-bold">{r.reference ?? 'Manual'}<span className="mt-1 block font-sans text-[10px] font-normal text-white/40">{fmtDate(r.createdAt, false)}</span></td>
                    <td className="p-3"><b className="block">{r.clientName}</b><span className="text-white/45">{r.clientCompany || r.clientEmail}</span></td>
                    <td className="p-3"><b className="block">{r.projectTitle}</b><span className="text-white/45">{[FORMAT_LABEL[r.format], r.budgetLabel].filter(Boolean).join(' • ')}</span></td>
                    <td className="p-3"><div className="flex max-w-[260px] flex-wrap gap-1">{r.materials.map((m) => <Pill key={m.key} tone={DELIVERABLE_STATUS[m.status].tone}>{m.label}</Pill>)}</div>
                      <div className="mt-2 flex items-center gap-2"><div className="w-24"><Bar percent={r.pacing.pct} /></div><span className="text-[10px] text-white/45">{r.pacing.final}/{r.pacing.needed} final</span></div></td>
                    <td className="p-3 text-white/70">{AUDIENCE_LABEL[r.audience] ?? '—'}</td>
                    <td className="p-3">{r.deadline ? <span className={r.overdue ? 'font-bold text-red-400' : 'text-white/70'}>{fmtDate(r.deadline, false)}{r.overdue && <span className="block text-[10px]">Overdue</span>}</span> : <span className="text-white/35">None</span>}</td>
                    <td className="p-3 text-white/60">{r.producerEmail ?? 'Unassigned'}</td>
                    <td className="p-3"><Pill tone={PITCH_STATUS[r.status].tone}>{PITCH_STATUS[r.status].label}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.loading && !list.data && <p className="p-6 font-mono text-xs font-bold">LOADING…</p>}
            {list.data && !rows.length && <p className="p-10 text-center text-sm text-white/40">No pitch briefs match these filters.</p>}
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
            <span>Showing {rows.length} of {meta.total} pitch dossier(s)</span>
            {meta.pages > 1 && <Pagination page={page} pages={meta.pages} onPage={setPage} />}
          </div>
        </>
      )}

      {s?.reviewers?.length > 0 && (
        <Card className="space-y-3 p-5">
          <span className={`${mono} text-white/45`}>Reviewer allocations (open pitches against capacity)</span>
          <div className="grid gap-3 md:grid-cols-3">
            {s.reviewers.map((r) => (
              <div key={r.id} className="space-y-2 rounded-lg bg-neutral-900 p-3 text-xs"><div className="flex justify-between gap-2"><b className="truncate">{r.email}</b><span className="shrink-0 text-white/50">{r.open}/{r.capacity}</span></div><Bar percent={r.loadPct} color={r.loadPct >= 100 ? 'bg-red-500' : 'bg-[#e10613]'} /></div>
            ))}
          </div>
        </Card>
      )}

      {creating && <NewModal producers={producers} onClose={() => setCreating(false)} />}
    </>
  );
}