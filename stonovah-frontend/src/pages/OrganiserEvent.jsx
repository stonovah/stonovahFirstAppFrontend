// src/pages/OrganiserEvent.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiMapPin, FiSearch, FiCheckCircle, FiChevronLeft, FiChevronRight,
  FiPlus, FiAlertTriangle,
} from 'react-icons/fi';
import { eventsApi } from '../api/events';
import { apiErrorMessage } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/routes';
import { formatNaira, koboToNaira } from './steps/helpers';
import { useCan } from '../context/AuthContext';

const PAGE_SIZE = 5;

// ---------- presentation helpers ----------
const STATUS = {
  DRAFT:       { label: 'DRAFT',          badge: 'bg-neutral-800 text-neutral-300 border-neutral-700',      tag: 'bg-neutral-800 text-white',    tagText: 'DRAFT' },
  PENDING:     { label: 'PENDING REVIEW', badge: 'bg-red-500/20 text-red-400 border-red-500/30',            tag: 'bg-red-600 text-white',        tagText: 'UNDER STONOVAH REVIEW' },
  LIVE:        { label: 'LIVE',           badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', tag: 'bg-emerald-600 text-white',   tagText: 'ON SALE' },
  UNPUBLISHED: { label: 'UNPUBLISHED',    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',      tag: 'bg-amber-600 text-white',      tagText: 'TAKEN OFFLINE' },
  ENDED:       { label: 'ENDED',          badge: 'bg-neutral-800 text-neutral-400 border-neutral-700',      tag: 'bg-neutral-900 text-neutral-400', tagText: 'CONCLUDED' },
};

const TABS = [
  ['All Events', null],
  ['Draft', 'DRAFT'],
  ['Pending Review', 'PENDING'],
  ['Live', 'LIVE'],
  ['Ended', 'ENDED'],
  ['Unpublished', 'UNPUBLISHED'],
];

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date not set';

const timeAgo = (iso) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const money = (kobo) => formatNaira(koboToNaira(kobo));

const priceRange = (t) => {
  if (t.minPrice === null) return '—';
  if (t.maxPrice === 0) return 'FREE';
  if (t.minPrice === t.maxPrice) return money(t.minPrice);
  return `${t.minPrice === 0 ? 'FREE' : money(t.minPrice)} – ${money(t.maxPrice)}`;
};

const feeLabel = (f) => (f === 'ORGANIZER_ABSORBED' ? 'Organizer absorbs' : f === 'BUYER_ADDED' ? 'Buyer pays' : 'Not set');

// What a draft still needs before it can be submitted (mirrors the server's checks)
const draftMissing = (e) => {
  const m = [];
  if (!e.venue) m.push('venue');
  if (!e.startAt || !e.endAt) m.push('dates');
  if (!e.tierSummary.count) m.push('ticket types');
  if (!e.feeHandling) m.push('fee choice');
  if (!e.ticketTemplateId) m.push('ticket template');
  return m;
};

// An approved event waiting for its publish time is still PENDING on the server
const describe = (e) => {
  const base = STATUS[e.status] || STATUS.DRAFT;
  if (e.status === 'PENDING' && e.isApproved && e.publishAt) {
    return { ...base, label: 'SCHEDULED', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30', tag: 'bg-sky-600 text-white', tagText: `APPROVED • LIVE ${fmtDate(e.publishAt).toUpperCase()}` };
  }
  return base;
};

const statusLine = (e) => {
  const t = e.tierSummary;
  switch (e.status) {
    case 'DRAFT': { const m = draftMissing(e); return m.length ? `Missing: ${m.join(', ')}` : 'Ready to submit'; }
    case 'PENDING': return e.isApproved && e.publishAt ? 'Approved • goes live automatically' : 'Waiting for admin review';
    case 'LIVE': return `${t.sold} / ${t.capacity} sold${t.capacity ? ` (${Math.round((t.sold / t.capacity) * 100)}%)` : ''}`;
    case 'UNPUBLISHED': return 'Taken off sale';
    default: return 'Event concluded';
  }
};

const specsOf = (e) => [
  { label: 'FEE MODEL', value: feeLabel(e.feeHandling) },
  { label: 'TICKET TYPES', value: e.tierSummary.count },
  { label: 'PRICE RANGE', value: priceRange(e.tierSummary) },
  { label: 'TICKETS SOLD', value: `${e.tierSummary.sold} / ${e.tierSummary.capacity}` },
];

const btn = 'text-[11px] font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
const btnSoft = `${btn} bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-white`;
const btnRed = `${btn} bg-red-600 hover:bg-red-700 border-red-600 text-white`;
const btnDanger = `${btn} bg-transparent hover:bg-red-950 border-red-900 text-red-400`;

const fadeInUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

// ---------- one event card ----------
// CHANGED: added onScan to the props
function EventCard({ evt, compact, busy, onEdit, onNavigate, onScan, onAsk, canScan, canFinance }) {
  const st = describe(evt);
  const can = useCan();
  const canWrite = can('events.write');
  

  return (
    <motion.div variants={fadeInUp} className="bg-black text-white rounded-2xl border border-black overflow-hidden shadow-2xl hover:border-[#FFBF00]/50 transition duration-300">
      <div className="p-5 md:p-6 flex flex-col lg:flex-row gap-6">
        {!compact && (
          <div className="w-full lg:w-64 h-48 lg:h-auto rounded-xl overflow-hidden relative bg-neutral-900 border border-neutral-800 shrink-0">
            {evt.posterUrl ? (
              <img src={evt.posterUrl} alt={evt.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-red-950/50 flex items-center justify-center text-[10px] font-mono text-neutral-500 uppercase">No poster</div>
            )}
            <span className={`absolute top-3 left-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded ${st.tag}`}>{st.tagText}</span>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[10px] font-mono bg-black/80 backdrop-blur-sm p-1.5 rounded border border-neutral-700">
              <span className="text-neutral-400">REF: {String(evt.id).slice(-8).toUpperCase()}</span>
              {evt.category && <span className="text-[#FFBF00] font-bold truncate ml-2">{evt.category}</span>}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between space-y-4 min-w-0">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${st.badge}`}>● {st.label}</span>
                <span className="text-xs font-mono text-neutral-400">• {statusLine(evt)}</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Updated {timeAgo(evt.updatedAt)}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-black uppercase text-white break-words">{evt.title}</h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-300 mt-2">
              <span className="flex items-center gap-1.5"><FiCalendar className="text-[#FFBF00]" /> {fmtDate(evt.startAt)}</span>
              <span className="flex items-center gap-1.5"><FiMapPin className="text-[#FFBF00]" /> {[evt.venue, evt.venueAddress].filter(Boolean).join(', ') || 'Venue not set'}</span>
              <span className="bg-neutral-900 px-2 py-0.5 rounded text-neutral-400 border border-neutral-800">{evt.tierSummary.capacity.toLocaleString()} tickets</span>
            </div>

            {evt.status === 'DRAFT' && evt.rejectionFeedback && (
              <div className="mt-3 flex gap-2 bg-red-950/50 border border-red-900 rounded-lg p-3 text-xs font-mono">
                <FiAlertTriangle className="text-red-400 shrink-0 mt-0.5" />
                <span><b className="text-red-300">Sent back by Stonovah{evt.rejectionCategory ? ` (${evt.rejectionCategory})` : ''}:</b> <span className="text-neutral-300">{evt.rejectionFeedback}</span></span>
              </div>
            )}
          </div>

          {!compact && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800 font-mono text-xs">
              {specsOf(evt).map((s) => (
                <div key={s.label}>
                  <span className="text-[9px] text-neutral-400 uppercase block">{s.label}</span>
                  <span className="font-bold text-white block mt-0.5">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 font-mono">
            <div className="flex flex-wrap gap-2">
              {evt.status === 'DRAFT' && canWrite &&  (
                <>
                  <button type="button" className={btnSoft} onClick={() => onEdit(evt.id, 1)}>Edit</button>
                  <button type="button" className={btnRed} onClick={() => onEdit(evt.id, 5)}>Review & Submit</button>
                  <button type="button" className={btnDanger} disabled={busy} onClick={() => onAsk('delete', evt)}>Delete</button>
                </>
              )}
              {evt.status === 'PENDING' && canWrite &&  (
                <button type="button" className={btnSoft} disabled={busy} onClick={() => onAsk('withdraw', evt)}>Withdraw to edit</button>
              )}
              {evt.status === 'LIVE' && canWrite &&  (
                <>
                <a className={btnSoft} href={`/events/${evt.slug}`} target="_blank" rel="noreferrer">View public page</a>
                  {/* CHANGED: opens the scanner on THIS event when onScan is provided */}
                  {canScan && (onScan || onNavigate) && (
                    <button
                      type="button"
                      className={btnRed}
                      onClick={() => (onScan ? onScan(evt.id) : onNavigate('Gate Check-In & Scanner'))}
                    >
                      Gate Scanner
                    </button>
                  )}
                  {canFinance && onNavigate && <button type="button" className={btnSoft} onClick={() => onNavigate('Payouts & Revenue')}>Payouts</button>}
                </>
              )}
              {evt.status === 'UNPUBLISHED' && (
                <a className={btnSoft} href="mailto:events.review@stonovah.com">Contact support</a>
              )}
            </div>
            {evt.status === 'LIVE' && (
              <span className="flex items-center gap-2 text-neutral-400 text-[11px]"><FiCheckCircle className="text-emerald-400" /> On sale</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- page ----------
// CHANGED: added onScan to the props
export default function OrganiserEvent({ onCreate, onEdit, onNavigate, onScan }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const standalone = !onEdit; // rendered as its own route, not inside the dashboard tabs

  const [events, setEvents] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [tab, setTab] = useState(null);       // status filter
  const [search, setSearch] = useState('');
  const [when, setWhen] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('modified');
  const [compact, setCompact] = useState(false);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null); // { type: 'delete' | 'withdraw', evt }
  const [busyId, setBusyId] = useState(null);
  const can = useCan();
  const canWrite = can('events.write');

  const load = useCallback(async () => {
    setError('');
    try {
      setEvents(await eventsApi.list());
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not load your events.'));
      setEvents((prev) => prev ?? []);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [tab, search, when, category, sort]);

  const edit = (id, step = 1) => (onEdit ? onEdit(id, step) : navigate(`${ROUTES.createEvent}?event=${id}&step=${step}`));
  const create = () => (onCreate ? onCreate() : navigate(ROUTES.createEvent));

  const list = events || [];
  const counts = useMemo(() => {
    const c = { all: list.length };
    list.forEach((e) => { c[e.status] = (c[e.status] || 0) + 1; });
    return c;
  }, [list]);
  const categories = useMemo(() => [...new Set(list.map((e) => e.category).filter(Boolean))], [list]);
  const pending = list.filter((e) => e.status === 'PENDING' && !e.isApproved);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const now = Date.now();
    const out = list.filter((e) => {
      if (tab && e.status !== tab) return false;
      if (category !== 'all' && e.category !== category) return false;
      if (when === 'upcoming' && !(e.startAt && new Date(e.startAt).getTime() >= now)) return false;
      if (when === 'past' && !(e.startAt && new Date(e.startAt).getTime() < now)) return false;
      if (needle && !`${e.title} ${e.venue || ''} ${e.id}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    const time = (v) => (v ? new Date(v).getTime() : Infinity);
    if (sort === 'modified') out.sort((a, b) => time(b.updatedAt) - time(a.updatedAt));
    if (sort === 'date') out.sort((a, b) => time(a.startAt) - time(b.startAt));
    if (sort === 'sold') out.sort((a, b) => b.tierSummary.sold - a.tierSummary.sold);
    return out;
  }, [list, tab, search, when, category, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const runConfirm = async () => {
    const { type, evt } = confirm;
    setBusyId(evt.id);
    try {
      if (type === 'delete') await eventsApi.remove(evt.id);
      else await eventsApi.withdraw(evt.id);
      toast.success(type === 'delete' ? 'Draft deleted' : 'Event withdrawn. You can edit it again.');
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const orgName = user?.organizerProfile?.organizationName;
  const selectCls = 'bg-neutral-900 border border-neutral-700 text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#FFBF00]';

  const body = (
    <div className="space-y-6">
      {/* HEADER */}
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-black/20 pb-6">
        <motion.div variants={fadeInUp}>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">My Events</h1>
            <span className="bg-black text-[#FFBF00] font-mono text-xs font-bold px-2.5 py-1 rounded-full">
              {list.length} Production{list.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs font-medium text-black/80 max-w-xl mt-1">
            Manage, publish, and track admissions across your drafts, pending, live and past productions.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="flex items-center gap-3 shrink-0">
          {orgName && (
            <div className="bg-black/10 px-3 py-2 rounded-xl border border-black/20 text-xs font-mono font-bold text-black flex flex-col">
              <span className="text-[9px] text-black/60 uppercase">ORGANIZER</span>
              <span>{orgName}</span>
            </div>
          )}
          {canWrite &&
          <button type="button" onClick={create} className="bg-black hover:bg-neutral-900 text-[#FFBF00] font-mono font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider flex items-center gap-2 transition shadow-xl cursor-pointer">
            <FiPlus className="text-base" /> Create New Event
          </button>}
        </motion.div>
      </motion.div>

      {error && (
        <div className="bg-black text-red-400 font-mono text-xs font-bold rounded-xl p-3 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={load} className="text-[#FFBF00] hover:text-white cursor-pointer">Retry</button>
        </div>
      )}

      {/* REVIEW NOTICE (only when something is actually waiting) */}
      {pending.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-black text-white p-4 rounded-2xl border border-black flex items-center gap-3 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold shrink-0">!</div>
          <div>
            <span className="text-xs font-bold uppercase text-[#FFBF00] block">
              {pending.length} Production{pending.length === 1 ? '' : 's'} In Review
            </span>
            <p className="text-xs text-neutral-300 font-mono">
              Stonovah is reviewing <span className="underline">{pending.map((e) => e.title).join(', ')}</span>. You will be notified once a decision is made.
            </p>
          </div>
        </motion.div>
      )}

      {/* SEARCH & FILTERS */}
      <div className="bg-black text-white p-4 rounded-2xl border border-black shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, venue, or reference ID..."
              className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FFBF00] font-mono"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <select value={when} onChange={(e) => setWhen(e.target.value)} className={selectCls}>
              <option value="all">All Upcoming & Past</option>
              <option value="upcoming">Upcoming Only</option>
              <option value="past">Past Only</option>
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>
              <option value="modified">Sort: Last Modified</option>
              <option value="date">Sort: Date Ascending</option>
              <option value="sold">Sort: Tickets Sold</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.filter(([, status]) => status === null || status !== 'UNPUBLISHED' || counts.UNPUBLISHED).map(([name, status]) => {
              const active = tab === status;
              const count = status === null ? counts.all : counts[status] || 0;
              return (
                <button
                  key={name} type="button" onClick={() => setTab(status)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition cursor-pointer ${active ? 'bg-[#FFBF00] text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
                >
                  <span>{name}</span>
                  <span className={`text-[10px] px-1.5 rounded ${active ? 'bg-black text-[#FFBF00]' : 'bg-neutral-800 text-neutral-300'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => setCompact((c) => !c)} className="text-neutral-400 hover:text-[#FFBF00] text-[11px] font-bold cursor-pointer">
            {compact ? 'COMFORTABLE VIEW' : 'COMPACT DENSITY'}
          </button>
        </div>
      </div>

      {/* LIST */}
      {events === null ? (
        <p className="font-mono text-xs font-bold">LOADING YOUR EVENTS…</p>
      ) : filtered.length === 0 ? (
        canWrite ? (
          <div className="bg-black text-white p-8 rounded-2xl font-mono text-center space-y-3">
            <h3 className="text-lg font-black font-sans">{list.length === 0 ? 'You have no events yet' : 'No events match these filters'}</h3>
            <p className="text-xs text-neutral-400">{list.length === 0 ? 'Create your first production to start selling tickets.' : 'Try clearing the search or switching tabs.'}</p>
            {list.length === 0 && (
              <button type="button" onClick={create} className="bg-red-600 hover:bg-red-700 font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider cursor-pointer">Create New Event</button>
            )}
          </div>
        ) : null
      ) : (
        <motion.div key={`${tab}-${page}`} initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
          {shown.map((evt) => (
            <EventCard
              key={evt.id} evt={evt} compact={compact} busy={busyId === evt.id}
              onEdit={edit} onNavigate={onNavigate} onScan={onScan} onAsk={(type, e) => setConfirm({ type, evt: e })}
            />
          ))}
        </motion.div>
      )}

      {/* PAGINATION */}
      {filtered.length > 0 && (
        <div className="bg-black text-white p-4 rounded-2xl border border-black shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="text-neutral-400 text-[11px]">
            Portfolio: <span className="text-white">{counts.LIVE || 0} Live</span> • <span className="text-[#FFBF00]">{counts.PENDING || 0} Pending</span> • <span className="text-white">{counts.DRAFT || 0} Drafts</span> • <span className="text-white">{counts.ENDED || 0} Ended</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 mr-2">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 cursor-pointer"><FiChevronLeft /></button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" onClick={() => setPage(n)} className={`px-3 py-1 rounded font-bold cursor-pointer ${n === page ? 'bg-red-600 text-white' : 'bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300'}`}>{n}</button>
            ))}
            <button type="button" disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 cursor-pointer"><FiChevronRight /></button>
          </div>
        </div>
      )}

      {/* CONFIRM */}
      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => !busyId && setConfirm(null)}>
          <div className="bg-black text-white border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 font-mono" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black font-sans">{confirm.type === 'delete' ? 'Delete this draft?' : 'Withdraw from review?'}</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {confirm.type === 'delete'
                ? <>“{confirm.evt.title}” and its ticket types will be permanently deleted. This cannot be undone.</>
                : <>“{confirm.evt.title}” goes back to a draft so you can edit it. You will need to submit it again for review.</>}
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" className={btnSoft} disabled={!!busyId} onClick={() => setConfirm(null)}>Cancel</button>
              <button type="button" className={confirm.type === 'delete' ? btnRed : btnSoft} disabled={!!busyId} onClick={runConfirm}>
                {busyId ? 'Working…' : confirm.type === 'delete' ? 'Delete draft' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return standalone ? <div className="min-h-screen bg-[#FFBF00] text-black font-sans p-4 md:p-8 selection:bg-black selection:text-[#FFBF00]">{body}</div> : <div className="text-black font-sans">{body}</div>;
}