import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, Bar, CountUp } from '../ui';
import { Pagination, FormField, inputCls } from '../ui2';
import { useLoad, ErrorLine } from '../adminBits';
import { fmtDate, useDebounced } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { Select } from '../ui2';
import { useProdAccess } from './useProdAccess';
import { ngn, mono, FORMAT_LABEL, STAGE_LABEL, PROJECT_STATUS, LIFECYCLE, FORMAT_OPTIONS } from './prodAdmin';

const PAGE = 15;
const TABS = [['open', 'Open'], ['COMPLETED', 'Completed'], ['CANCELLED', 'Cancelled']];
const initials = (e) => (e ? e.split('@')[0].slice(0, 2).toUpperCase() : '—');

function NewModal({ onClose, producers }) {
  const navigate = useNavigate();
  const [f, setF] = useState({ title: '', clientName: '', clientEmail: '', clientCompany: '', format: '', stage: 'DEVELOP', pmId: '', startDate: '', endDate: '', locations: '', synopsis: '' });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const dateErr = f.startDate && f.endDate && f.endDate < f.startDate ? 'The end date is before the start date' : '';
  const emailErr = f.clientEmail && !/^\S+@\S+\.\S+$/.test(f.clientEmail.trim()) ? 'Enter a valid email' : '';
  const valid = f.title.trim() && f.clientName.trim() && f.format && !dateErr && !emailErr;

  const submit = async () => {
    setBusy(true);
    try {
      const p = await A.createProject({
        title: f.title.trim(), clientName: f.clientName.trim(), format: f.format, stage: f.stage,
        clientEmail: f.clientEmail.trim() || undefined, clientCompany: f.clientCompany.trim() || undefined,
        pmId: f.pmId || undefined, startDate: f.startDate || undefined, endDate: f.endDate || undefined,
        locations: f.locations.trim() || undefined, synopsis: f.synopsis.trim() || undefined,
      });
      toast.success('Project mobilized');
      navigate(`/admin/production/projects/${p.id}`);
    } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };

  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-2xl">
      <div className="space-y-4 p-6">
        <div className="pr-10"><h2 className="text-xl font-black">Mobilize new project</h2><p className="mt-1 text-[11px] text-white/45">Most projects start by converting an accepted proposal. Use this for work that did not come through a proposal. The contract starts at ₦0 and is set on the Budget tab.</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField label="Format" required><Select value={f.format} onChange={(v) => set('format', v)} options={FORMAT_OPTIONS} placeholder="Select…" /></FormField>
          <FormField label="Starting stage"><Select value={f.stage} onChange={(v) => set('stage', v)} options={LIFECYCLE.map((s) => ({ value: s, label: STAGE_LABEL[s] }))} /></FormField>
          <FormField label="Project manager"><Select value={f.pmId} onChange={(v) => set('pmId', v)} options={[{ value: '', label: 'Me' }, ...producers.map((p) => ({ value: p.id, label: p.email }))]} /></FormField>
        </div>
        <FormField label="Project title" required><input value={f.title} maxLength={160} onChange={(e) => set('title', e.target.value)} className={inputCls} /></FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Client name" required><input value={f.clientName} maxLength={120} onChange={(e) => set('clientName', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Client email" hint="Needed to email project updates." error={emailErr}><input type="email" value={f.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Company"><input value={f.clientCompany} maxLength={160} onChange={(e) => set('clientCompany', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Locations"><input value={f.locations} maxLength={300} onChange={(e) => set('locations', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Principal photography start"><input type="date" value={f.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputCls} /></FormField>
          <FormField label="Target wrap" error={dateErr}><input type="date" value={f.endDate} onChange={(e) => set('endDate', e.target.value)} className={inputCls} /></FormField>
        </div>
        <FormField label="Synopsis"><textarea rows={3} maxLength={2000} value={f.synopsis} onChange={(e) => set('synopsis', e.target.value)} className={inputCls} /></FormField>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={submit}>{busy ? 'Creating…' : 'Mobilize project'}</Btn></div>
      </div>
    </Modal>
  );
}

function BoardCard({ p }) {
  return (
    <Link to={`/admin/production/projects/${p.id}`} className="block space-y-3 rounded-xl border border-white/[0.07] bg-[#161616] p-4 transition hover:border-white/25">
      <div className="flex items-start justify-between gap-2"><Pill tone="red">{FORMAT_LABEL[p.format] ?? 'Project'}</Pill><b className="text-sm">{ngn(p.contractKobo)}</b></div>
      <div><b className="block text-base leading-tight">{p.title}</b><span className="text-[11px] text-white/45">{p.clientCompany || p.clientName}</span></div>
      {(p.status === 'ON_HOLD' || p.highlightTags?.length > 0) && (
        <div className="flex flex-wrap gap-1.5">{p.status === 'ON_HOLD' && <Pill tone="amber">On hold</Pill>}{(p.highlightTags ?? []).map((t) => <Pill key={t}>{t}</Pill>)}</div>
      )}
      <div><div className="mb-1 flex justify-between text-[10px] text-white/45"><span>PHASE PROGRESS</span><b className="text-white/70">{p.progressPct}%</b></div><Bar percent={p.progressPct} /></div>
      <div className="flex items-center gap-2 border-t border-white/5 pt-3 text-xs text-white/65"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[9px] font-black">{initials(p.pmEmail)}</span><span className="truncate">{p.pmEmail ?? 'No project manager'}</span></div>
    </Link>
  );
}

export default function ProdProjects() {
  const navigate = useNavigate();
  const { can } = useProdAccess();
  const [sp] = useSearchParams();
  const [view, setView] = useState('kanban');
  const [tab, setTab] = useState(sp.get('status') === 'COMPLETED' ? 'COMPLETED' : 'open');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [stage, setStage] = useState('');
  const [lead, setLead] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const search = useDebounced(q.trim());
  const board = view === 'kanban';

  const list = useLoad(
    () => A.projects({ status: tab === 'open' ? undefined : tab, search: search || undefined, type: type || undefined, stage: stage || undefined, lead: lead || undefined, page: board ? 1 : page, limit: board ? 100 : PAGE }),
    [tab, search, type, stage, lead, page, board]
  );
  const stats = useLoad(() => A.projectStats());
  const prod = useLoad(() => A.producers());

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? { total: 0, pages: 1 };
  const byStage = Object.fromEntries((list.data?.byStage ?? []).map((g) => [g.stage, g]));
  const s = stats.data;
  const reset = () => setPage(1);
  const producers = prod.data ?? [];

  return (
    <>
      <PageHeader eyebrow="LIVE GRID" title="Active Projects" desc="Every mobilized production, from development through release. Open a project to manage its scope, milestones, budget, files and client updates.">
        <div className="flex gap-1 rounded-lg bg-black/40 p-1">
          {[['kanban', FiGrid, 'Board'], ['table', FiList, 'Table']].map(([k, I, l]) => (
            <button key={k} type="button" onClick={() => { setView(k); reset(); }} className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${view === k ? 'bg-[#e10613]' : 'text-white/55 hover:text-white'}`}><I /> {l}</button>
          ))}
        </div>
        <Btn disabled={!can.write} onClick={() => setCreating(true)}><FiPlus /> Mobilize new project</Btn>
      </PageHeader>

      {s && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            ['Active pipeline', <CountUp key="a" value={s.active} />, `${s.onHold} on hold`],
            ['Envelope allocated', ngn(s.envelopeKobo), 'Contract value of active projects'],
            ['In principal photography', <CountUp key="b" value={s.inShoot} />, 'Projects in the Shoot stage'],
            ['Closing within 14 days', <CountUp key="c" value={s.closingWithin14Days} />, 'Target wrap date approaching'],
          ].map(([k, v, sub], i) => <Card key={k} index={i} className="space-y-1 p-5"><span className={`${mono} text-[9px] text-white/45`}>{k}</span><b className="block text-3xl font-black">{v}</b><span className="text-[11px] text-white/45">{sub}</span></Card>)}
        </div>
      )}
      <ErrorLine>{stats.error}</ErrorLine>

      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="flex gap-2">
          {TABS.map(([k, l]) => <button key={k} type="button" onClick={() => { setTab(k); reset(); }} className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}>{l}</button>)}
        </div>
        <div className="relative min-w-[200px] flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder="Search project, client or reference…" className={`${inputCls} pl-9`} /></div>
        <Select className="lg:w-44" value={type} onChange={(v) => { setType(v); reset(); }} options={[{ value: '', label: 'All project types' }, ...FORMAT_OPTIONS]} />
        <Select className="lg:w-40" value={stage} onChange={(v) => { setStage(v); reset(); }} options={[{ value: '', label: 'All stages' }, ...LIFECYCLE.map((x) => ({ value: x, label: STAGE_LABEL[x] }))]} />
        <Select className="lg:w-52" value={lead} onChange={(v) => { setLead(v); reset(); }} options={[{ value: '', label: 'All project managers' }, { value: 'unassigned', label: 'Unassigned' }, ...producers.map((p) => ({ value: p.id, label: p.email }))]} />
      </Card>
      <ErrorLine>{list.error}</ErrorLine>
      {list.loading && !list.data && <p className="font-mono text-xs font-bold">LOADING…</p>}

      {board ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {LIFECYCLE.map((st) => {
            const col = rows.filter((r) => r.stage === st);
            return (
              <div key={st} className="space-y-3">
                <div className="rounded-xl border border-white/[0.07] bg-[#161616] p-4">
                  <div className="flex items-center justify-between"><b className="text-sm">{STAGE_LABEL[st]}</b><Pill tone={st === 'SHOOT' && col.length ? 'red' : 'grey'}>{col.length}</Pill></div>
                  <span className={`${mono} text-[9px] text-white/40`}>{ngn(byStage[st]?.contractKobo ?? 0)} contracted</span>
                </div>
                {col.map((p) => <BoardCard key={p.id} p={p} />)}
                {list.data && !col.length && <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-[11px] text-white/30">No projects</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead><tr className={`${mono} border-b border-white/10 text-[9px] text-white/40`}><th className="p-3">Project</th><th className="p-3">Client</th><th className="p-3">Type</th><th className="p-3">Stage</th><th className="p-3">Progress</th><th className="p-3 text-right">Contract</th><th className="p-3">Wrap</th><th className="p-3">Manager</th><th className="p-3">Status</th></tr></thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} onClick={() => navigate(`/admin/production/projects/${p.id}`)} className="cursor-pointer border-b border-white/5 align-top hover:bg-white/[0.04]">
                    <td className="p-3"><b className="block">{p.title}</b><span className="font-mono text-[10px] text-white/40">{p.reference}</span></td>
                    <td className="p-3"><b className="block">{p.clientName}</b><span className="text-white/45">{p.clientCompany || '—'}</span></td>
                    <td className="p-3"><Pill>{FORMAT_LABEL[p.format] ?? '—'}</Pill></td>
                    <td className="p-3">{STAGE_LABEL[p.stage]}</td>
                    <td className="w-36 p-3"><Bar percent={p.progressPct} /><span className="text-[10px] text-white/45">{p.progressPct}%</span></td>
                    <td className="p-3 text-right font-bold">{ngn(p.contractKobo)}</td>
                    <td className="p-3 text-white/60">{p.endDate ? fmtDate(p.endDate, false) : '—'}</td>
                    <td className="p-3 text-white/60">{p.pmEmail ?? 'Unassigned'}</td>
                    <td className="p-3"><Pill tone={PROJECT_STATUS[p.status].tone}>{PROJECT_STATUS[p.status].label}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.data && !rows.length && <p className="p-10 text-center text-sm text-white/40">No projects match these filters.</p>}
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
            <span>Showing {rows.length} of {meta.total} project(s)</span>
            {meta.pages > 1 && <Pagination page={page} pages={meta.pages} onPage={setPage} />}
          </div>
        </>
      )}
      {board && list.data && !rows.length && <p className="text-center text-sm text-white/40">No projects match these filters.</p>}

      {creating && <NewModal producers={producers} onClose={() => setCreating(false)} />}
    </>
  );
}