// src/pages/admin/pages/PendingQueue.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiClock, FiUser, FiHome, FiMapPin, FiArrowRight, FiFileText, FiSearch, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Img, useNow } from '../ui';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { moneyK, ago, fmtDate, slaInfo, priceRange } from '../adminLive';

const filters = [['all', 'All Pending'], ['urgent', 'Launching < 48 hrs'], ['corporate', 'Corporate Organizers'], ['individual', 'Individual Organizers']];
const slaColor = { ok: 'text-neutral-300', warn: 'text-amber-300', critical: 'text-red-400' };
const urgent = (e) => e.startAt && new Date(e.startAt).getTime() - Date.now() < 48 * 3600000;
const matches = (f, e) => f === 'all' || (f === 'urgent' && urgent(e)) || (f === 'corporate' && e.organizer?.type === 'BUSINESS') || (f === 'individual' && e.organizer?.type === 'INDIVIDUAL');

export default function PendingQueue() {
  const navigate = useNavigate();
  const now = useNow(30000);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    try { setData(await adminApi.events.pending()); setError(''); }
    catch (e) { setError(apiErrorMessage(e, 'Could not load the queue.')); setData((d) => d ?? { slaHours: 4, queue: [], scheduled: [] }); }
  }, []);
  useEffect(() => { load(); const id = setInterval(load, 60000); return () => clearInterval(id); }, [load]);

  if (!data) return <p className="font-mono text-xs font-bold">LOADING THE QUEUE…</p>;

  const { slaHours, queue, scheduled } = data;
  const since = (e) => e.submittedAt || e.updatedAt;
  const list = queue.filter((e) => matches(filter, e)).filter((e) => !q.trim() || `${e.title} ${e.organizer?.name || ''} ${e.id}`.toLowerCase().includes(q.trim().toLowerCase()));
  const count = (f) => queue.filter((e) => matches(f, e)).length;
  const oldest = queue.length ? Math.max(...queue.map((e) => now - new Date(since(e)).getTime())) : 0;

  const stats = [
    { l: 'IN THE QUEUE', v: queue.length, u: 'Events', s: `Review target: ${slaHours} hours`, icon: FiClock },
    { l: 'OLDEST WAITING', v: queue.length ? Math.floor(oldest / 3600000) : 0, u: 'Hours', s: 'Since the organizer submitted', icon: FiShield },
    { l: 'PAST THE SLA', v: queue.filter((e) => slaInfo(since(e), slaHours, now).overdue).length, u: 'Events', s: `Waiting longer than ${slaHours} hours`, icon: FiAlertTriangle },
    { l: 'NOT READY TO APPROVE', v: queue.filter((e) => e.issues.length).length, u: 'Events', s: 'Missing KYC, tickets, template or dates', icon: FiFileText },
  ];

  return (
    <>
      <PageHeader eyebrow="VERIFICATION CORRIDOR" title="Events Pending Approval Queue"
        desc="Every event an organizer submits waits here before it is published and tickets go on sale." />

      {error && <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={s.l} index={i} hover className="p-5 space-y-2 relative">
            <span className="absolute bottom-0 left-0 w-1/3 h-0.5 bg-red-600" />
            <div className="flex justify-between"><span className="text-[9px] font-bold text-neutral-400 tracking-wider">{s.l}</span><s.icon className="text-red-400" /></div>
            <div><b className="text-4xl font-black font-sans">{s.v}</b> <span className="text-sm text-neutral-300">{s.u}</span></div>
            <span className="text-[10px] text-neutral-500">{s.s}</span>
          </Card>
        ))}
      </div>

      <Card className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex flex-wrap gap-2 flex-1">
          {filters.map(([k, l]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} className={`text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition ${filter === k ? 'bg-red-600' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'}`}>{l} ({count(k)})</button>
          ))}
        </div>
        <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search queue…" className="bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#FFBF00] w-full" /></div>
      </Card>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {list.map((e, i) => {
            const sla = slaInfo(since(e), slaHours, now);
            const t = e.tierSummary;
            return (
              <motion.div key={e.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }} transition={{ delay: i * 0.04 }}
                className={`bg-black text-white rounded-2xl shadow-2xl font-mono flex flex-col lg:flex-row gap-4 p-4 border-l-4 ${urgent(e) ? 'border-red-600' : 'border-neutral-700'}`}>
                <div className="relative w-full lg:w-36 h-36 lg:h-auto rounded-xl overflow-hidden shrink-0 bg-neutral-900">
                  {e.posterUrl ? <Img src={e.posterUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600">NO POSTER</div>}
                  {urgent(e) && <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-red-600 px-2 py-0.5 rounded">LAUNCHING SOON</span>}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold">
                    <span className="bg-neutral-800 px-2 py-0.5 rounded">{String(e.id).slice(-8).toUpperCase()}</span>
                    <Pill tone="red">● Pending approval</Pill>
                    {e.organizer?.kycStatus && <Pill tone={e.organizer.kycStatus === 'VERIFIED' ? 'green' : 'amber'}>KYC {e.organizer.kycStatus.toLowerCase()}</Pill>}
                    {e.hostedByStonovah && <Pill>Hosted by Stonovah</Pill>}
                  </div>
                  <h3 className="text-xl font-black font-sans">{e.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-300">
                    <span className="flex items-center gap-1">{e.organizer?.type === 'BUSINESS' ? <FiHome /> : <FiUser />} {e.organizer?.name}</span>
                    {e.organizer?.cacNumber && <span className="bg-neutral-800 px-2 rounded text-[10px]">CAC: {e.organizer.cacNumber}</span>}
                    {e.organizer?.nin && <span className="bg-neutral-800 px-2 rounded text-[10px]">NIN: {e.organizer.nin}</span>}
                    <span className="flex items-center gap-1"><FiMapPin /> {e.venue || 'No venue'}</span>
                    <span className="flex items-center gap-1"><FiCalendar /> {fmtDate(e.startAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-[11px]">
                    <b>{t.capacity.toLocaleString()} capacity</b>
                    <span className="text-neutral-500">{t.count} ticket type{t.count === 1 ? '' : 's'} ({priceRange(t)})</span>
                    <span>Projected gross: {moneyK(t.projectedGross)}</span>
                  </div>
                  <Pill>{e.feeHandling === 'ORGANIZER_ABSORBED' ? 'Fee: organizer absorbs' : e.feeHandling === 'BUYER_ADDED' ? 'Fee: buyer pays at checkout' : 'Fee: not chosen'}</Pill>
                  {e.issues.length > 0 && (
                    <div className="bg-red-950/50 border border-red-900 rounded-lg p-2 text-[11px] flex gap-2"><FiAlertTriangle className="text-red-400 shrink-0 mt-0.5" /><span className="text-red-200">Cannot be approved yet: {e.issues.join('; ')}.</span></div>
                  )}
                </div>

                <div className="lg:text-right space-y-2 shrink-0 flex flex-col lg:items-end justify-between">
                  <div className="text-[10px]">
                    <span className="text-neutral-500 font-bold block">SUBMISSION TIMING</span>
                    Submitted {ago(since(e))}
                    <span className={`block font-bold ${slaColor[sla.level]}`}>● SLA: {sla.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <Btn onClick={() => navigate(`/admin/events/pending/${e.id}`)}>Review Event & KYC <FiArrowRight /></Btn>
                    <Link to={`/admin/events/pending/${e.id}`} aria-label="Open dossier" className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-center"><FiFileText /></Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {!list.length && <Card className="p-10 text-center text-sm text-neutral-400">The queue is clear. Nothing is waiting for review.</Card>}
      </div>

      {scheduled.length > 0 && (
        <Card className="p-5 space-y-3">
          <h3 className="text-lg font-black font-sans">Approved and scheduled ({scheduled.length})</h3>
          <p className="text-[11px] text-neutral-400">These need no action. They go live automatically at the time shown.</p>
          {scheduled.map((e) => (
            <Link key={e.id} to={`/admin/events/${e.id}`} className="bg-neutral-900 hover:bg-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs transition">
              <span><b className="block">{e.title}</b><span className="text-neutral-400">{e.organizer?.name}</span></span>
              <Pill tone="amber">Goes live {fmtDate(e.publishAt)}</Pill>
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}