// src/pages/admin/pages/AllEvents.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiDownload, FiChevronDown, FiRefreshCw } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Img, Bar, CountUp } from '../ui';
import { Pagination, Select } from '../ui2';
import { downloadCsv } from '../adminData';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { EVENT_STATUS, moneyK, fmtDate, useDebounced } from '../adminLive';

const ALL = Object.keys(EVENT_STATUS);
const sel = 'bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFBF00]';

export default function AllEvents() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [open, setOpen] = useState(false);
  const [staged, setStaged] = useState(ALL);
  const [statuses, setStatuses] = useState(ALL);
  const [when, setWhen] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [res, setRes] = useState({ data: [], meta: { total: 0, pages: 1 }, counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const search = useDebounced(q.trim());

  useEffect(() => { setPage(1); }, [search, statuses, when, type]);
  useEffect(() => {
    let live = true;
    setLoading(true);
    adminApi.events.list({ search, status: statuses.length && statuses.length < ALL.length ? statuses.join(',') : '', when, type, page, limit: 10 })
      .then((r) => { if (live) { setRes(r); setError(''); } })
      .catch((e) => live && setError(apiErrorMessage(e, 'Could not load events.')))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [search, statuses, when, type, page]);

  const { data: rows, meta, counts } = res;
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const reset = () => { setQ(''); setStatuses(ALL); setStaged(ALL); setWhen(''); setType(''); };

  return (
    <>
      <PageHeader eyebrow="MODULE 03" title="All Events Management" desc="Every event across the platform, including events hosted by Stonovah.">
        <div className="bg-black text-white rounded-xl px-4 py-2 font-mono flex gap-6">
          <div><span className="text-[9px] text-neutral-500 font-bold block">TOTAL EVENTS</span><b className="text-xl font-sans"><CountUp value={total} /></b></div>
          <div><span className="text-[9px] text-neutral-500 font-bold block">LIVE NOW</span><b className="text-xl font-sans text-[#FFBF00]">{counts.LIVE || 0}</b></div>
          <div><span className="text-[9px] text-neutral-500 font-bold block">AWAITING REVIEW</span><b className="text-xl font-sans">{counts.PENDING || 0}</b></div>
        </div>
      </PageHeader>

      <Card className="p-4 space-y-3 relative">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, organizer, venue, or reference ID…" className={`${sel} w-full pl-9`} /></div>
          <Btn variant="soft" onClick={() => downloadCsv('events-page.csv', [['Ref', 'Title', 'Organizer', 'Status', 'Starts', 'Venue', 'Sold', 'Capacity', 'Sold gross (NGN)'], ...rows.map((e) => [e.id, e.title, e.organizer?.name, e.status, e.startAt, e.venue, e.tierSummary.sold, e.tierSummary.capacity, e.tierSummary.soldGross / 100])])}><FiDownload /> Export this page</Btn>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <button type="button" onClick={() => { setStaged(statuses); setOpen((o) => !o); }} className={`${sel} flex items-center gap-2 cursor-pointer`}>
              <span className="w-2 h-2 rounded-full bg-red-500" /> Status: {statuses.length === ALL.length ? 'All' : `${statuses.length} selected`} <FiChevronDown />
            </button>
            {open && (<>
              <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute z-30 top-full mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-3 space-y-1">
                {ALL.map((s) => (
                  <label key={s} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-800 text-sm cursor-pointer">
                    <input type="checkbox" className="accent-red-600" checked={staged.includes(s)} onChange={() => setStaged((st) => (st.includes(s) ? st.filter((x) => x !== s) : [...st, s]))} />{EVENT_STATUS[s].label}<span className="ml-auto text-neutral-500">{counts[s] || 0}</span>
                  </label>
                ))}
                <div className="flex justify-between pt-2"><button type="button" onClick={() => setStaged(ALL)} className="text-xs text-neutral-300 hover:text-white cursor-pointer">Reset</button><Btn className="py-1.5" onClick={() => { setStatuses(staged.length ? staged : ALL); setOpen(false); }}>Apply</Btn></div>
              </motion.div></>)}
          </div>
          <Select
            className="w-44"
            value={when}
            onChange={setWhen}
            options={[
              { value: '', label: 'Date: All' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'past', label: 'Past' },
            ]}
          />
          <Select
            className="w-48"
            value={type}
            onChange={setType}
            options={[
              { value: '', label: 'Type: Free & Paid' },
              { value: 'paid', label: 'Paid' },
              { value: 'free', label: 'Free' },
            ]}
          />
          <button type="button" onClick={reset} className="ml-auto text-[10px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"><FiRefreshCw /> CLEAR FILTERS</button>
        </div>
      </Card>

      {error && <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{error}</p>}

      <Card index={1} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[980px]">
            <thead><tr className="text-[9px] text-neutral-500 text-left bg-neutral-950"><th className="p-4">EVENT</th><th>ORGANIZER</th><th>SCHEDULE & VENUE</th><th>PRICING</th><th className="w-44">SOLD / CAPACITY</th><th>SOLD (FACE VALUE)</th><th>STATUS</th></tr></thead>
            <tbody>
              {rows.map((e, i) => {
                const t = e.tierSummary;
                const pct = t.capacity ? Math.round((t.sold / t.capacity) * 100) : 0;
                const to = e.status === 'PENDING' && !e.isApproved ? `/admin/events/pending/${e.id}` : `/admin/events/${e.id}`;
                const st = e.status === 'PENDING' && e.isApproved ? { label: 'Scheduled', tone: 'amber' } : EVENT_STATUS[e.status];
                return (
                  <motion.tr key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-t border-neutral-800 hover:bg-neutral-900 transition">
                    <td className="p-4"><Link to={to} className="flex items-center gap-3 group"><div className="w-14 h-12 rounded overflow-hidden shrink-0 bg-neutral-900">{e.posterUrl && <Img src={e.posterUrl} className="w-full h-full object-cover" />}</div>
                      <span><b className="font-sans text-sm group-hover:text-[#FFBF00] transition block max-w-[260px]">{e.title}</b><span className="text-[9px] text-neutral-500 font-bold">{String(e.id).slice(-8).toUpperCase()}{e.hostedByStonovah ? ' • HOSTED' : ''}</span></span></Link></td>
                    <td><b className="block">{e.organizer?.name}</b><span className="text-[10px] text-red-300">{e.organizer?.type === 'BUSINESS' ? 'Business' : e.organizer?.type === 'INDIVIDUAL' ? 'Individual' : '—'}</span></td>
                    <td>{fmtDate(e.startAt, false)}<span className="block text-[10px] text-neutral-400">{e.venue || 'No venue'}</span></td>
                    <td><Pill tone="grey">{t.maxPrice === 0 ? 'FREE' : t.count ? 'PAID' : '—'}</Pill></td>
                    <td className="pr-4"><div className="flex justify-between text-[10px] mb-1"><span>{t.sold.toLocaleString()} / {t.capacity.toLocaleString()}</span><b>{pct}%</b></div><Bar percent={pct} /></td>
                    <td className="font-bold">{t.maxPrice === 0 ? 'Free' : moneyK(t.soldGross)}</td>
                    <td><Pill tone={st.tone}>{st.label}</Pill></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {loading && <p className="text-center text-sm text-neutral-400 py-12">Loading…</p>}
          {!loading && !rows.length && <p className="text-center text-sm text-neutral-400 py-12">No events match these filters.</p>}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 border-t border-neutral-800 text-xs">
          <span>Showing <b>{meta.total ? (page - 1) * 10 + 1 : 0}–{Math.min(page * 10, meta.total)}</b> of <b>{meta.total}</b> events</span>
          <Pagination page={page} pages={meta.pages} onPage={setPage} />
        </div>
      </Card>
    </>
  );
}