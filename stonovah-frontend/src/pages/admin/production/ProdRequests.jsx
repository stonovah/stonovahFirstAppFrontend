import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader } from '../ui';
import { useLoad, ErrorLine } from '../adminBits';
import { ago, useDebounced } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { useProdAccess } from './useProdAccess';
import { mono, REQ_STATUS, FORMAT_LABEL, budgetText } from './prodAdmin';
import { Pagination, inputCls, Select } from '../ui2';


const PAGE = 15;

export default function ProdRequests() {
  const navigate = useNavigate();
  const { can } = useProdAccess();
  const [sp] = useSearchParams();
  const [tab, setTab] = useState(sp.get('status') || '');
  const [unread, setUnread] = useState(false);
  const [q, setQ] = useState('');
  const [assigned, setAssigned] = useState('');
  const [format, setFormat] = useState('');
  const [mode, setMode] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState(new Set());
  const [bulkTo, setBulkTo] = useState('');
  const search = useDebounced(q.trim());

  const list = useLoad(
    () => A.requests({ status: tab || undefined, unread: unread ? 'true' : undefined, search: search || undefined, assigned: assigned || undefined, format: format || undefined, mode: mode || undefined, sort, page, limit: PAGE }),
    [tab, unread, search, assigned, format, mode, sort, page]
  );
  const prod = useLoad(() => A.producers());

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? { total: 0, pages: 1 };
  const counts = list.data?.counts ?? {};
  const producerOptions = (prod.data ?? []).map((p) => ({ value: p.id, label: p.email }));
  const formatOptions = Object.entries(FORMAT_LABEL).map(([k, v]) => ({ value: k, label: v }));
  const reset = () => { setPage(1); setSel(new Set()); };

  const cards = [
    { key: 'all', label: 'Total inbound', value: counts.total ?? 0, active: !tab && !unread, go: () => { setTab(''); setUnread(false); reset(); } },
    { key: 'unread', label: 'New unread', value: counts.unread ?? 0, active: unread, dot: true, go: () => { setTab(''); setUnread(true); reset(); } },
    ...Object.entries(REQ_STATUS).map(([k, v]) => ({ key: k, label: v.label, value: counts[k] ?? 0, active: tab === k && !unread, go: () => { setTab(k); setUnread(false); reset(); } })),
  ];

  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOn = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const applyBulk = async () => {
    try {
      const res = await A.bulkAssign([...sel], bulkTo === 'none' ? null : bulkTo);
      toast.success(`${res.updated} request(s) updated`);
      setSel(new Set()); setBulkTo(''); list.reload(); prod.reload();
    } catch (e) { toast.error(apiErrorMessage(e)); }
  };

  return (
    <>
      <PageHeader eyebrow="GLOBAL INTAKE PIPELINE" title="Service Requests & Client Intake" desc="Inbound briefs from the public Request a Production Service form. Triage, assign, and move them toward a proposal." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {cards.map((c) => (
          <button key={c.key} type="button" onClick={c.go}
            className={`cursor-pointer rounded-xl border p-4 text-left transition ${c.active ? 'border-red-600 bg-red-600/10' : 'border-white/[0.07] bg-[#161616] hover:border-white/25'}`}>
            <span className={`${mono} flex items-center gap-1.5 text-[9px] text-white/45`}>{c.dot && c.value > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}{c.label}</span>
            <b className="mt-2 block text-3xl font-black">{c.value}</b>
          </button>
        ))}
      </div>

      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[220px] flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder="Search reference, client, company, project…" className={`${inputCls} pl-9`} /></div>
        <Select className="lg:w-52" value={assigned} onChange={(v) => { setAssigned(v); reset(); }}
        options={[{ value: '', label: 'All producers' }, { value: 'unassigned', label: 'Unassigned' }, ...producerOptions]} />
        <Select className="lg:w-44" value={format} onChange={(v) => { setFormat(v); reset(); }}
        options={[{ value: '', label: 'All project types' }, ...formatOptions]} />
        <Select className="lg:w-40" value={mode} onChange={(v) => { setMode(v); reset(); }}
        options={[{ value: '', label: 'All packages' }, { value: 'FULL', label: 'Full turnkey' }, { value: 'MODULAR', label: 'À la carte' }]} />
        <Select className="lg:w-36" value={sort} onChange={(v) => { setSort(v); reset(); }}
        options={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }]} />
      </Card>
      <ErrorLine>{list.error}</ErrorLine>

      {sel.size > 0 && can.write && (
        <Card className="flex flex-wrap items-center gap-3 border-red-600/40 p-3 text-xs">
          <b>{sel.size} selected</b>
         <Select
            className="w-64"
            value={bulkTo}
            onChange={setBulkTo}
            options={[
                { value: '', label: 'Assign to…' },
                { value: 'none', label: 'Unassign' },
                ...(prod.data ?? []).map((p) => ({ value: p.id, label: `${p.email} (${p.openTotal}/${p.capacity})` })),
            ]}
         />
          <Btn disabled={!bulkTo} onClick={applyBulk}>Apply</Btn>
          <Btn variant="soft" onClick={() => setSel(new Set())}>Clear</Btn>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-xs">
          <thead>
            <tr className={`${mono} border-b border-white/10 text-[9px] text-white/40`}>
              <th className="w-10 p-3">{can.write && <input type="checkbox" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(rows.map((r) => r.id)))} className="accent-red-600" />}</th>
              <th className="p-3">Request</th><th className="p-3">Client & contact</th><th className="p-3">Entity</th><th className="p-3">Project</th>
              <th className="p-3">Services</th><th className="p-3">Budget</th><th className="p-3">Producer</th><th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => navigate(`/admin/production/requests/${r.id}`)} className="cursor-pointer border-b border-white/5 align-top transition hover:bg-white/[0.04]">
                <td className="p-3" onClick={(e) => e.stopPropagation()}>{can.write && <input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} className="accent-red-600" />}</td>
                <td className="p-3">
                  <span className="flex items-center gap-2">{!r.readAt && <span className="h-2 w-2 rounded-full bg-red-500" title="Unread" />}<b className="font-mono">{r.reference}</b></span>
                  <span className="mt-1 flex gap-1"><span className="text-[10px] text-white/40">{ago(r.submittedAt)}</span>{r.isRush && <Pill tone="red">Rush</Pill>}</span>
                </td>
                <td className="p-3"><b className="block">{r.contactName}</b><span className="block text-white/50">{r.contactEmail}</span><span className="block text-white/40">{r.contactPhone}</span></td>
                <td className="p-3"><b className="block">{r.companyName || '—'}</b><span className="text-[10px] uppercase text-white/40">{r.entityType === 'STUDIO' ? 'Studio / company' : 'Individual'}</span></td>
                <td className="p-3"><b className="block">{r.projectTitle}</b><Pill>{FORMAT_LABEL[r.format] ?? '—'}</Pill></td>
                <td className="p-3 text-white/70">{r.services.slice(0, 2).join(', ')}{r.services.length > 2 ? ` +${r.services.length - 2}` : ''}<span className="mt-1 block text-[10px] uppercase text-white/35">{r.mode === 'FULL' ? 'Full turnkey' : 'À la carte'}</span></td>
                <td className="p-3 font-semibold">{budgetText(r)}</td>
                <td className="p-3 text-white/60">{r.assignedToEmail ?? 'Unassigned'}</td>
                <td className="p-3"><Pill tone={REQ_STATUS[r.status].tone}>{REQ_STATUS[r.status].label}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.loading && !list.data && <p className="p-6 font-mono text-xs font-bold">LOADING…</p>}
        {list.data && !rows.length && <p className="p-10 text-center text-sm text-white/40">No requests match these filters.</p>}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
        <span>Showing {rows.length} of {meta.total} request(s)</span>
        {meta.pages > 1 && <Pagination page={page} pages={meta.pages} onPage={(n) => { setPage(n); setSel(new Set()); }} />}
      </div>
    </>
  );
}