import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, CountUp } from '../ui';
import { Pagination, FormField, inputCls } from '../ui2';
import { useLoad, ErrorLine } from '../adminBits';
import { fmtDate, ago, useDebounced } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { Select } from '../ui2';
import { useProdAccess } from './useProdAccess';
import { ngn, mono, SOURCING_STATUS } from './prodAdmin';

const PAGE = 15;
const TABS = [['all', 'All', {}], ['open', 'Open', { status: 'SOURCING_ACTIVE' }], ['shortlists', 'Shortlists', { status: 'SHORTLIST_SENT,REVIEW_PENDING' }],
  ['booked', 'Booked', { status: 'BOOKED,CONTRACTED' }], ['alert', 'Alert', { alert: 'true' }], ['closed', 'Closed', { status: 'CLOSED' }]];

const quarters = () => {
  const now = new Date();
  let y = now.getFullYear();
  let q = Math.floor(now.getMonth() / 3) + 1;
  const out = [];
  for (let i = 0; i < 6; i++) { out.push({ value: `${y}-Q${q}`, label: `Q${q} ${y}` }); q -= 1; if (q === 0) { q = 4; y -= 1; } }
  return out;
};

function NewModal({ producers, onClose }) {
  const navigate = useNavigate();
  const [f, setF] = useState({ projectTitle: '', clientName: '', clientEmail: '', shootStart: '', shootEnd: '', locations: '', leadId: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const dateErr = f.shootStart && f.shootEnd && f.shootEnd < f.shootStart ? 'The shoot ends before it starts' : '';
  const emailErr = f.clientEmail && !/^\S+@\S+\.\S+$/.test(f.clientEmail.trim()) ? 'Enter a valid email' : '';
  const valid = f.projectTitle.trim() && f.clientName.trim() && !dateErr && !emailErr;
  const submit = async () => {
    setBusy(true);
    try {
      const d = await A.createDossier({
        projectTitle: f.projectTitle.trim(), clientName: f.clientName.trim(), clientEmail: f.clientEmail.trim() || undefined,
        shootStart: f.shootStart || undefined, shootEnd: f.shootEnd || undefined, locations: f.locations.trim() || undefined,
        leadId: f.leadId || undefined, notes: f.notes.trim() || undefined,
      });
      toast.success('Dossier created. Add the roles you need.');
      navigate(`/admin/production/sourcing/${d.id}`);
    } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };
  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-2xl">
      <div className="space-y-4 p-6">
        <div className="pr-10"><h2 className="text-xl font-black">New sourcing request</h2><p className="mt-1 text-[11px] text-white/45">For a production that did not come from an active project. You add the roles on the next page.</p></div>
        <FormField label="Lead producer"><Select value={f.leadId} onChange={(v) => set('leadId', v)} options={[{ value: '', label: 'Me' }, ...producers.map((p) => ({ value: p.id, label: p.email }))]} /></FormField>
        <FormField label="Project title" required><input value={f.projectTitle} maxLength={160} onChange={(e) => set('projectTitle', e.target.value)} className={inputCls} /></FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Client name" required><input value={f.clientName} maxLength={120} onChange={(e) => set('clientName', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Client email" hint="Needed to send the shortlist." error={emailErr}><input type="email" value={f.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Shoot start"><input type="date" value={f.shootStart} onChange={(e) => set('shootStart', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Shoot end" error={dateErr}><input type="date" value={f.shootEnd} onChange={(e) => set('shootEnd', e.target.value)} className={inputCls} /></FormField>
        </div>
        <FormField label="Locations"><input value={f.locations} maxLength={300} onChange={(e) => set('locations', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Notes"><textarea rows={3} maxLength={2000} value={f.notes} onChange={(e) => set('notes', e.target.value)} className={inputCls} /></FormField>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={submit}>{busy ? 'Creating…' : 'Create dossier'}</Btn></div>
      </div>
    </Modal>
  );
}

export default function ProdSourcing() {
  const navigate = useNavigate();
  const { can } = useProdAccess();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [origin, setOrigin] = useState('');
  const [quarter, setQuarter] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const search = useDebounced(q.trim());
  const extra = TABS.find((t) => t[0] === tab)[2];

  const list = useLoad(() => A.sourcing({ ...extra, search: search || undefined, origin: origin || undefined, quarter: quarter || undefined, page, limit: PAGE }), [tab, search, origin, quarter, page]);
  const stats = useLoad(() => A.sourcingStats());
  const prod = useLoad(() => A.producers());

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? { total: 0, pages: 1 };
  const counts = list.data?.counts ?? {};
  const s = stats.data;
  const reset = () => setPage(1);
  const tabCount = { all: counts.all, open: counts.open, shortlists: counts.shortlists, booked: counts.booked, alert: counts.alert, closed: counts.closed };

  return (
    <>
      <PageHeader eyebrow="LIVE SOURCING NETWORK" title="Crew & Cast Sourcing" desc="Staffing requests, candidate shortlists, bookings and dropout replacements for every production.">
        <Btn disabled={!can.write} onClick={() => setCreating(true)}><FiPlus /> New sourcing request</Btn>
      </PageHeader>

      {s && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            ['Pipeline demand', <CountUp key="a" value={s.openBatches} />, `${s.rolesTotal} roles • ${s.filledPct}% filled`],
            ['Shortlists sent', <CountUp key="b" value={s.shortlistsSent} />, 'Awaiting client choice'],
            ['Roles contracted', <CountUp key="c" value={s.rolesContracted} />, `${ngn(s.committedKobo)} committed in bookings`],
            ['Dropout alerts', <CountUp key="d" value={s.activeAlerts} />, s.activeAlerts ? 'Replacement needed' : 'All clear'],
          ].map(([k, v, sub], i) => (
            <Card key={k} index={i} className={`space-y-1 p-5 ${i === 3 && s.activeAlerts ? 'border-red-600/50' : ''}`}><span className={`${mono} text-[9px] text-white/45`}>{k}</span><b className="block text-3xl font-black">{v}</b><span className="text-[11px] text-white/45">{sub}</span></Card>
          ))}
        </div>
      )}
      <ErrorLine>{stats.error}</ErrorLine>

      {counts.alert > 0 && tab !== 'alert' && (
        <button type="button" onClick={() => { setTab('alert'); reset(); }} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-red-600/50 bg-red-600/10 p-4 text-left text-sm">
          <FiAlertTriangle className="shrink-0 text-red-400" /><span><b>{counts.alert} dossier(s) have a dropout.</b> <span className="text-white/60">Open them to book a replacement.</span></span>
        </button>
      )}

      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="flex flex-1 flex-wrap gap-2">
          {TABS.map(([k, l]) => (
            <button key={k} type="button" onClick={() => { setTab(k); reset(); }} className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}>{l} ({tabCount[k] ?? 0})</button>
          ))}
        </div>
        <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder="Search dossier, project, client…" className={`${inputCls} pl-9 lg:w-64`} /></div>
        <Select className="lg:w-40" value={origin} onChange={(v) => { setOrigin(v); reset(); }} options={[{ value: '', label: 'All origins' }, { value: 'DIRECT', label: 'Direct' }, { value: 'WEB', label: 'From a request' }]} />
        <Select className="lg:w-36" value={quarter} onChange={(v) => { setQuarter(v); reset(); }} options={[{ value: '', label: 'All time' }, ...quarters()]} />
      </Card>
      <ErrorLine>{list.error}</ErrorLine>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-xs">
          <thead><tr className={`${mono} border-b border-white/10 text-[9px] text-white/40`}><th className="p-3">Dossier</th><th className="p-3">Production & client</th><th className="p-3">Roles</th><th className="p-3">Window</th><th className="p-3">Lead</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => navigate(`/admin/production/sourcing/${r.id}`)} className="cursor-pointer border-b border-white/5 align-top transition hover:bg-white/[0.04]">
                <td className="p-3"><b className="font-mono">{r.reference}</b><span className="mt-1 block text-[10px] text-white/40">{r.origin === 'WEB' ? 'From request' : 'Direct'} • {ago(r.updatedAt)}</span></td>
                <td className="p-3"><b className="block">{r.projectTitle}</b><span className="text-white/45">{r.clientName}</span></td>
                <td className="p-3"><b>{r.summary.roles} roles</b> <span className="text-white/45">({r.summary.headcount} people)</span>
                  <span className="mt-1 flex flex-wrap gap-1">{r.summary.crew > 0 && <Pill>{r.summary.crew} crew</Pill>}{r.summary.cast > 0 && <Pill>{r.summary.cast} cast</Pill>}{r.summary.background > 0 && <Pill>{r.summary.background} bg</Pill>}</span>
                  <span className="mt-1 block text-[10px] text-white/45">{r.summary.filled}/{r.summary.roles} filled{r.summary.dropouts > 0 && <b className="ml-2 text-red-400">{r.summary.dropouts} dropout</b>}</span></td>
                <td className="p-3 text-white/60">{r.shootStart ? fmtDate(r.shootStart, false) : '—'}{r.shootEnd ? ` to ${fmtDate(r.shootEnd, false)}` : ''}<span className="block text-[10px] text-white/35">{r.locations}</span></td>
                <td className="p-3 text-white/60">{r.leadEmail ?? '—'}</td>
                <td className="p-3"><Pill tone={SOURCING_STATUS[r.status].tone}>{SOURCING_STATUS[r.status].label}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.loading && !list.data && <p className="p-6 font-mono text-xs font-bold">LOADING…</p>}
        {list.data && !rows.length && <p className="p-10 text-center text-sm text-white/40">No dossiers match these filters.</p>}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
        <span>Showing {rows.length} of {meta.total} dossier(s)</span>
        {meta.pages > 1 && <Pagination page={page} pages={meta.pages} onPage={setPage} />}
      </div>

      {creating && <NewModal producers={prod.data ?? []} onClose={() => setCreating(false)} />}
    </>
  );
}