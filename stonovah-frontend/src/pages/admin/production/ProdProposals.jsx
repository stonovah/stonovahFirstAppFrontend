import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, CountUp } from '../ui';
import { Pagination, FormField, inputCls, Select } from '../ui2';
import { useLoad, ErrorLine } from '../adminBits';
import { fmtDate, useDebounced } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { useProdAccess } from './useProdAccess';
import { ngn, mono, PROPOSAL_STATUS, REQ_STATUS } from './prodAdmin';

const PAGE = 15;

function NewModal({ onClose }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('request');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ title: '', clientName: '', clientEmail: '', clientCompany: '' });
  const [busy, setBusy] = useState(false);
  const search = useDebounced(q.trim());
  const reqs = useLoad(() => A.requests({ search: search || undefined, limit: 8 }), [search]);

  const create = async (body) => {
    setBusy(true);
    try { const p = await A.createProposal(body); toast.success('Draft proposal created'); navigate(`/admin/production/proposals/${p.id}`); }
    catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };
  const blankOk = f.title.trim() && f.clientName.trim() && /^\S+@\S+\.\S+$/.test(f.clientEmail.trim());

  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-xl">
      <div className="space-y-4 p-6">
        <h2 className="pr-10 text-xl font-black">New proposal</h2>
        <div className="flex gap-1 rounded-lg bg-black/40 p-1">
          {[['request', 'From a request'], ['blank', 'Blank proposal']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setMode(k)} className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${mode === k ? 'bg-white/10' : 'text-white/45 hover:text-white'}`}>{l}</button>
          ))}
        </div>

        {mode === 'request' ? (
          <>
            <p className="text-[11px] text-white/45">The proposal is prefilled with the request’s client, services and producer.</p>
            <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference, client or project…" className={`${inputCls} pl-9`} /></div>
            <ErrorLine>{reqs.error}</ErrorLine>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {(reqs.data?.data ?? []).filter((r) => r.status !== 'DECLINED').map((r) => (
                <button key={r.id} type="button" disabled={busy} onClick={() => create({ requestId: r.id })} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg bg-neutral-900 p-3 text-left hover:bg-neutral-800 disabled:opacity-50">
                  <span className="min-w-0"><b className="block truncate text-sm">{r.projectTitle}</b><span className="text-[11px] text-white/45">{r.reference} • {r.contactName}</span></span>
                  <Pill tone={REQ_STATUS[r.status].tone}>{REQ_STATUS[r.status].label}</Pill>
                </button>
              ))}
              {reqs.data && !reqs.data.data.length && <p className="py-4 text-center text-xs text-white/40">No matching requests.</p>}
            </div>
          </>
        ) : (
          <>
            <FormField label="Project title" required><input value={f.title} maxLength={160} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} /></FormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Client name" required><input value={f.clientName} maxLength={120} onChange={(e) => setF({ ...f, clientName: e.target.value })} className={inputCls} /></FormField>
              <FormField label="Client email" required><input type="email" value={f.clientEmail} onChange={(e) => setF({ ...f, clientEmail: e.target.value })} className={inputCls} /></FormField>
            </div>
            <FormField label="Company (optional)"><input value={f.clientCompany} maxLength={160} onChange={(e) => setF({ ...f, clientCompany: e.target.value })} className={inputCls} /></FormField>
            <Btn disabled={!blankOk || busy} onClick={() => create({ title: f.title.trim(), clientName: f.clientName.trim(), clientEmail: f.clientEmail.trim(), clientCompany: f.clientCompany.trim() || undefined })}>{busy ? 'Creating…' : 'Create draft'}</Btn>
          </>
        )}
        <Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

export default function ProdProposals() {
  const navigate = useNavigate();
  const { can } = useProdAccess();
  const [tab, setTab] = useState('');
  const [q, setQ] = useState('');
  const [producer, setProducer] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const search = useDebounced(q.trim());

  const list = useLoad(() => A.proposals({ status: tab || undefined, search: search || undefined, producer: producer || undefined, sort, page, limit: PAGE }), [tab, search, producer, sort, page]);
  const stats = useLoad(() => A.proposalStats());
  const prod = useLoad(() => A.producers());

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? { total: 0, pages: 1 };
  const counts = list.data?.counts ?? {};
  const s = stats.data;
  const reset = () => setPage(1);

  return (
    <>
      <PageHeader eyebrow="CONTRACT VAULT" title="Proposals & Production Quotes" desc="Itemized production agreements and quotes: build, send, track the client’s response, and convert accepted proposals into projects.">
        <Btn disabled={!can.finance} onClick={() => setCreating(true)}><FiPlus /> New proposal</Btn>
      </PageHeader>

      {s && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          {[
            ['Total pipeline value', ngn(s.pipelineValueKobo), 'Drafts and sent proposals'],
            ['Active drafts', <CountUp key="d" value={s.activeDrafts} />, 'Not yet sent'],
            ['Sent & pending client', <CountUp key="s" value={s.sent.count} />, `${ngn(s.sent.valueKobo)} outbound`],
            ['Accepted this month', <CountUp key="a" value={s.acceptedThisMonth.count} />, `${ngn(s.acceptedThisMonth.valueKobo)} booked`],
            ['Decision speed', s.avgDecisionDays == null ? '—' : `${s.avgDecisionDays} days`, s.winRatePct == null ? 'No decisions yet' : `${s.winRatePct}% win rate`],
          ].map(([k, v, sub], i) => (
            <Card key={k} index={i} className="space-y-1 p-5"><span className={`${mono} text-[9px] text-white/45`}>{k}</span><b className="block text-3xl font-black">{v}</b><span className="text-[11px] text-white/45">{sub}</span></Card>
          ))}
        </div>
      )}
      <ErrorLine>{stats.error}</ErrorLine>

      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="flex flex-1 flex-wrap gap-2">
          {[['', `All (${counts.total ?? 0})`], ...Object.entries(PROPOSAL_STATUS).map(([k, v]) => [k, `${v.label} (${counts[k] ?? 0})`])].map(([k, l]) => (
            <button key={k} type="button" onClick={() => { setTab(k); reset(); }} className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}>{l}</button>
          ))}
        </div>
        <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder="Search proposal, client, project…" className={`${inputCls} pl-9 lg:w-72`} /></div>
        <Select
            className="lg:w-48"
            value={producer}
            onChange={(v) => { setProducer(v); reset(); }}
            options={[
                { value: '', label: 'All producers' },
                { value: 'unassigned', label: 'Unassigned' },
                ...(prod.data ?? []).map((p) => ({ value: p.id, label: p.email })),
            ]}
        />
        <Select
            className="lg:w-40"
            value={sort}
            onChange={(v) => { setSort(v); reset(); }}
            options={[
                { value: 'newest', label: 'Newest first' },
                { value: 'oldest', label: 'Oldest first' },
                { value: 'value', label: 'Highest value' },
            ]}
        />
      </Card>
      <ErrorLine>{list.error}</ErrorLine>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-xs">
          <thead><tr className={`${mono} border-b border-white/10 text-[9px] text-white/40`}><th className="p-3">Proposal</th><th className="p-3">Client</th><th className="p-3">Project & scope</th><th className="p-3 text-right">Value</th><th className="p-3">Valid until</th><th className="p-3">Producer</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} onClick={() => navigate(`/admin/production/proposals/${p.id}`)} className="cursor-pointer border-b border-white/5 align-top transition hover:bg-white/[0.04]">
                <td className="p-3"><b className="font-mono">{p.reference}</b> <span className="text-white/40">V{p.version}</span>{p.request && <span className="mt-1 block text-[10px] text-white/40">Ref: {p.request.reference}</span>}</td>
                <td className="p-3"><b className="block">{p.clientName}</b><span className="text-white/45">{p.clientCompany || '—'}</span></td>
                <td className="p-3"><b className="block">{p.title}</b><span className="text-white/45">{[p.formatLabel, p.scopeLabel].filter(Boolean).join(' • ')}</span></td>
                <td className="p-3 text-right font-bold">{ngn(p.totalKobo)}</td>
                <td className="p-3 text-white/60">{p.validUntil ? fmtDate(p.validUntil, false) : '—'}</td>
                <td className="p-3 text-white/60">{p.producerEmail ?? 'Unassigned'}</td>
                <td className="p-3"><Pill tone={PROPOSAL_STATUS[p.status].tone}>{PROPOSAL_STATUS[p.status].label}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.loading && !list.data && <p className="p-6 font-mono text-xs font-bold">LOADING…</p>}
        {list.data && !rows.length && <p className="p-10 text-center text-sm text-white/40">No proposals match these filters.</p>}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
        <span>Showing {rows.length} of {meta.total} proposal(s)</span>
        {meta.pages > 1 && <Pagination page={page} pages={meta.pages} onPage={setPage} />}
      </div>

      {creating && <NewModal onClose={() => setCreating(false)} />}
    </>
  );
}