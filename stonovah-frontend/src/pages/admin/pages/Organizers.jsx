// src/pages/admin/pages/Organizers.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiSearch, FiUsers, FiCheckCircle, FiFileText, FiSlash, FiRefreshCw } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, CountUp } from '../ui';
import { Avatar, Pagination, Select } from '../ui2';
import { downloadCsv } from '../adminData';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { ORG_STATUS, KYC, useDebounced } from '../adminLive';

const sel = 'bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFBF00]';
const PAGE = 10;

export default function Organizers() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [kyc, setKyc] = useState('');
  const [page, setPage] = useState(1);
  const [res, setRes] = useState({ data: [], meta: { total: 0, pages: 1 }, counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const search = useDebounced(q.trim());

  useEffect(() => { setPage(1); }, [search, status, type, kyc]);
  useEffect(() => {
    let live = true;
    setLoading(true);
    adminApi.organizers.list({ search, status, type, kyc, page, limit: PAGE })
      .then((r) => { if (live) { setRes(r); setError(''); } })
      .catch((e) => live && setError(apiErrorMessage(e, 'Could not load organizers.')))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [search, status, type, kyc, page]);

  const { data: rows, meta, counts: c } = res;
  const stats = [
    { l: 'REGISTERED ORGANIZERS', v: c.total || 0, sub: `${c.business || 0} business (CAC) / ${c.individual || 0} individual (NIN)`, icon: FiUsers, bar: 'bg-red-600' },
    { l: 'ACTIVE & VERIFIED', v: c.active || 0, chip: c.total ? `${(((c.active || 0) / c.total) * 100).toFixed(1)}%` : null, sub: 'KYC verified and in good standing', icon: FiCheckCircle, bar: 'bg-emerald-400' },
    { l: 'KYC AWAITING REVIEW', v: c.kycPending || 0, sub: 'Submitted and waiting for a decision', icon: FiFileText, bar: 'bg-amber-400' },
    { l: 'SUSPENDED / PROBATION', v: (c.suspended || 0) + (c.probation || 0), sub: `${c.suspended || 0} suspended • ${c.probation || 0} on probation`, icon: FiSlash, bar: 'bg-red-600' },
  ];

  return (
    <>
      <PageHeader eyebrow="REGISTRY" title="Organizers Directory" desc="Verified businesses and individuals who sell tickets through Stonovah.">
        <Btn variant="dark" onClick={() => downloadCsv('organizers-page.csv', [['ID', 'Name', 'Type', 'Registry ID', 'Email', 'Account status', 'KYC', 'Events'], ...rows.map((o) => [o.id, o.name, o.type, o.cacNumber || o.nin, o.email, o.status, o.kycStatus, o.events.total])])}><FiDownload /> Export this page</Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={s.l} index={i} hover className="p-5 space-y-2 relative overflow-hidden">
            <span className={`absolute bottom-0 left-0 w-16 h-0.5 ${s.bar}`} />
            <div className="flex justify-between"><span className="text-[9px] font-bold text-neutral-400 tracking-wider">{s.l}</span><s.icon className="text-red-400" /></div>
            <div className="flex items-end gap-2"><b className="text-5xl font-black font-sans"><CountUp value={s.v} /></b>{s.chip && <Pill tone="green" className="mb-2">{s.chip}</Pill>}</div>
            <span className="text-[10px] text-neutral-400 block">{s.sub}</span>
          </Card>
        ))}
      </div>

      <Card className="p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email or CAC number…" className={`${sel} w-full pl-9`} /></div>
        <Select
          className="w-44"
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: 'Account: All' },
            ...Object.entries(ORG_STATUS).map(([k, v]) => ({ value: k, label: v.label })),
          ]}
        />
        <Select
          className="w-40"
          value={kyc}
          onChange={setKyc}
          options={[
            { value: '', label: 'KYC: All' },
            ...Object.entries(KYC).map(([k, v]) => ({ value: k, label: v.label })),
          ]}
        />
        <Select
          className="w-48"
          value={type}
          onChange={setType}
          options={[
            { value: '', label: 'Type: All' },
            { value: 'BUSINESS', label: 'Business (CAC)' },
            { value: 'INDIVIDUAL', label: 'Individual (NIN)' },
          ]}
        />
        <button type="button" onClick={() => { setQ(''); setStatus(''); setType(''); setKyc(''); }} aria-label="Clear filters" className="w-10 h-10 bg-neutral-900 hover:bg-neutral-800 rounded-lg flex items-center justify-center cursor-pointer"><FiRefreshCw /></button>
      </Card>

      {error && <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{error}</p>}

      <Card index={1} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[900px]">
            <thead><tr className="text-[9px] text-neutral-500 text-left bg-neutral-950"><th className="p-4">ORGANIZER</th><th>CONTACT</th><th>CLASSIFICATION</th><th>STATUS</th><th className="text-right pr-4">EVENTS</th></tr></thead>
            <tbody>
              {rows.map((o, i) => {
                const st = ORG_STATUS[o.status] || { label: '—', tone: 'grey' };
                const k = KYC[o.kycStatus];
                return (
                  <motion.tr key={o.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => navigate(`/admin/organizers/${o.id}`)} className="border-t border-neutral-800 hover:bg-neutral-900 transition cursor-pointer">
                    <td className="p-4"><div className="flex items-center gap-3"><Avatar name={o.name} />
                      <span><b className="font-sans text-sm block">{o.name}</b><span className="text-[10px] text-red-400 font-bold">{o.type === 'BUSINESS' ? 'CAC' : o.type === 'INDIVIDUAL' ? 'NIN' : 'NO KYC'} <span className="text-neutral-300">{o.cacNumber || o.nin || ''}</span></span></span></div></td>
                    <td><span className="block">{o.email}</span><span className="text-[10px] text-neutral-400">{o.phone}</span></td>
                    <td>{o.type ? <Pill>{o.type === 'BUSINESS' ? 'Corporate (CAC)' : 'Individual (NIN)'}</Pill> : <span className="text-neutral-500">Not submitted</span>}</td>
                    <td><Pill tone={st.tone}>{st.label}</Pill>{k && <span className="block mt-1"><Pill tone={k.tone}>{k.label}</Pill></span>}</td>
                    <td className="text-right pr-4"><b className="text-lg font-sans block">{o.events.total}</b><span className="text-[9px] font-bold text-emerald-400">{o.events.live} LIVE{o.events.pending ? <span className="text-amber-300"> • {o.events.pending} PENDING</span> : ''}</span></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {loading && <p className="text-center text-sm text-neutral-400 py-12">Loading…</p>}
          {!loading && !rows.length && <p className="text-center text-sm text-neutral-400 py-12">No organizers match these filters.</p>}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 border-t border-neutral-800 text-[10px] font-bold text-neutral-400">
          <span>SHOWING {meta.total ? (page - 1) * PAGE + 1 : 0} – {Math.min(page * PAGE, meta.total)} OF {meta.total} ORGANIZERS</span>
          <Pagination page={page} pages={meta.pages} onPage={setPage} />
        </div>
      </Card>
    </>
  );
}