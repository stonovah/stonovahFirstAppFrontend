// src/pages/admin/pages/ExecutiveOverview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiCreditCard, FiRotateCcw, FiDollarSign, FiClock, FiLock, FiBookOpen, FiAward, FiFilm, FiArrowRight } from 'react-icons/fi';
import { Pill, CountUp, Bar } from '../ui';
import { adminApi } from '../../../api/admin';
import { useLoad, ErrorLine } from '../adminBits';
import { moneyK, ago, slaInfo, shortId, ORDER_STATUS } from '../adminLive';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';
const rowCls = 'block rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-xs transition-colors hover:border-white/20 hover:bg-white/[0.06]';
const linkCls = 'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300';

const soon = [
  [FiBookOpen, 'Publishing & DRM', 'Books, readers and royalties.', '/admin/soon/books'],
  [FiAward, 'Courses & Mentorship', 'Cohorts, curriculum and sessions.', '/admin/soon/courses'],
  [FiFilm, 'Film & Studio', 'Production bookings and delivery.', '/admin/soon/curriculum'],
];

// Local dark-styled versions of the shared Card and PageHeader.
function Card({ children, className = '', index = 0, hover = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={hover ? { y: -3 } : undefined}
      className={`rounded-xl border border-white/[0.07] bg-[#161616] ${className}`}
    >
      {children}
    </motion.div>
  );
}

function PageHeader({ eyebrow, title, desc }) {
  return (
    <div>
      <p className={`flex items-center gap-2 ${mono} text-red-500`}>
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
      {desc && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{desc}</p>}
    </div>
  );
}

function Section({ title, to, children, empty }) {
  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">{title}</h3>
        {to && <Link to={to} className={linkCls}>Open <FiArrowRight /></Link>}
      </div>
      {children}
      {empty && <p className="text-xs text-white/40">Nothing waiting. Well done.</p>}
    </Card>
  );
}

export default function ExecutiveOverview() {
  const ov = useLoad(() => adminApi.overview());
  const queue = useLoad(() => adminApi.events.pending());
  const kyc = useLoad(() => adminApi.organizers.list({ kyc: 'PENDING', submitted: 'true', limit: 5 }));
  const bank = useLoad(() => adminApi.organizers.bankRequests({ status: 'PENDING', limit: 5 }));
  const orders = useLoad(() => adminApi.orders.list({ limit: 6 }));
  const live = useLoad(() => adminApi.events.list({ status: 'LIVE', limit: 5 }));

  const o = ov.data;
  const a = o?.attention || {};
  const slaH = queue.data?.slaHours ?? o?.approvalSlaHours ?? 4;
  const waiting = (queue.data?.queue || []).slice(0, 5);
  const kycRows = kyc.data?.data || [];
  const bankRows = bank.data?.data || [];

  const stats = o && [
    { l: 'Ticket revenue', v: moneyK(o.ticketRevenue), s: 'Face value of paid tickets' },
    { l: 'Order value', v: moneyK(o.totalGrossRevenue), s: 'Includes buyer-paid fees' },
    { l: 'Tickets sold', v: <CountUp value={o.totalTicketsSold} />, s: `${o.paidOrdersLast24h} paid orders in the last 24h` },
    { l: 'Live events', v: <CountUp value={o.activeEvents} />, s: `${o.scheduledEvents} approved and scheduled` },
  ];
  const tiles = o && [
    ['Events to review', o.pendingApprovals, '/admin/events/pending', FiCalendar],
    ['KYC to review', a.kycPending, '/admin/organizers', FiUsers],
    ['Account changes', a.bankChanges, '/admin/organizers', FiCreditCard],
    ['Refund requests', a.refunds, '/admin/orders', FiRotateCcw],
    ['Advance requests', a.advances, '/admin/payouts', FiDollarSign],
    ['Payouts to pay', o.pendingPayouts, '/admin/payouts', FiClock],
  ];

  return (
    <>
      <PageHeader eyebrow="Console overview" title="Executive Operations Console" desc="What needs your attention today, and how the platform is doing." />
      <ErrorLine>{ov.error}</ErrorLine>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <Card key={s.l} index={i} hover className="relative space-y-2 overflow-hidden p-5">
              <span className="absolute left-5 top-0 h-0.5 w-12 bg-[#e10613]" />
              <span className={`${mono} block text-[9px] text-white/40`}>{s.l}</span>
              <b className="block break-words text-3xl font-black">{s.v}</b>
              <span className="text-[11px] text-white/45">{s.s}</span>
            </Card>
          ))}
        </div>
      )}

      <h2 className={`flex items-center gap-2 ${mono} text-sm text-white/80`}>
        <span className="h-2 w-2 rounded-full bg-red-500" /> Needs your attention
      </h2>
      {tiles && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {tiles.map(([label, n, to, Icon], i) => (
            <Link key={label} to={to}>
              <Card index={i} hover className={`space-y-1 p-4 ${n > 0 ? 'border-red-500/60 bg-[linear-gradient(135deg,#240607,#161616_60%)]' : ''}`}>
                <Icon className="text-red-500" />
                <b className="block text-3xl font-black">{n}</b>
                <span className={`${mono} text-[9px] text-white/45`}>{label}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Section title="Events waiting for review" to="/admin/events/pending" empty={queue.data && !waiting.length}>
          {waiting.map((e) => {
            const sla = slaInfo(e.submittedAt || e.updatedAt, slaH);
            return (
              <Link key={e.id} to={`/admin/events/pending/${e.id}`} className={rowCls}>
                <b className="block truncate text-sm">{e.title}</b>
                <span className="text-white/50">{e.organizer?.name}</span>
                <span className={`mt-1 block font-bold ${sla.overdue ? 'text-red-400' : 'text-white/70'}`}>● {sla.overdue ? 'Past the review target' : `${sla.label} left`}</span>
              </Link>
            );
          })}
        </Section>

        <Section title="KYC waiting for a decision" to="/admin/organizers" empty={kyc.data && !kycRows.length}>
          {kycRows.map((r) => (
            <Link key={r.id} to={`/admin/organizers/${r.id}`} className={rowCls}>
              <b className="block truncate text-sm">{r.name}</b>
              <span className="text-white/50">{r.type === 'BUSINESS' ? 'Business' : 'Individual'} • joined {ago(r.createdAt)}</span>
            </Link>
          ))}
        </Section>

        <Section title="Settlement account changes" to="/admin/organizers" empty={bank.data && !bankRows.length}>
          {bankRows.map((r) => (
            <Link key={r.id} to={`/admin/organizers/${r.organizerId}`} className={rowCls}>
              <b className="block truncate text-sm">{r.legalName || 'Organizer'}</b>
              <span className="text-white/50">{r.bankName} •••• {r.accountNumber.slice(-4)} • {ago(r.createdAt)}</span>
            </Link>
          ))}
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card index={1} className="space-y-3 p-5 xl:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Recent orders</h3>
            <Link to="/admin/orders" className={linkCls}>All orders <FiArrowRight /></Link>
          </div>
          <ErrorLine>{orders.error}</ErrorLine>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-xs">
              <thead>
                <tr className={`${mono} text-left text-[9px] text-white/35`}>
                  <th className="py-2">Order</th><th>Buyer</th><th>Event</th><th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(orders.data?.data || []).map((x) => (
                  <tr key={x.id} className="border-t border-white/5">
                    <td className="py-2.5"><b>{shortId(x.id)}</b><span className="block text-[9px] text-white/40">{ago(x.createdAt)}</span></td>
                    <td className="text-white/75">{x.buyerName}</td>
                    <td className="max-w-[180px] truncate text-white/75">{x.event.title}</td>
                    <td className="text-right font-bold">
                      {x.totalAmount ? moneyK(x.totalAmount) : 'Free'}
                      <span className="block"><Pill tone={ORDER_STATUS[x.status].tone}>{ORDER_STATUS[x.status].label}</Pill></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.data && !orders.data.data.length && <p className="py-6 text-center text-xs text-white/40">No orders yet.</p>}
          </div>
        </Card>

        <Card index={2} className="space-y-3 p-5 xl:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Live events</h3>
            <Link to="/admin/events" className={linkCls}>All events <FiArrowRight /></Link>
          </div>
          <ErrorLine>{live.error}</ErrorLine>
          {(live.data?.data || []).map((e) => {
            const t = e.tierSummary;
            const pct = t.capacity ? Math.round((t.sold / t.capacity) * 100) : 0;
            return (
              <Link key={e.id} to={`/admin/events/${e.id}`} className={`${rowCls} space-y-1.5`}>
                <div className="flex justify-between gap-2">
                  <b className="truncate">{e.title}</b>
                  <span className="shrink-0 text-white/50">{t.sold.toLocaleString()} / {t.capacity.toLocaleString()}</span>
                </div>
                <Bar percent={pct} />
              </Link>
            );
          })}
          {live.data && !live.data.data.length && <p className="text-xs text-white/40">No events are live right now.</p>}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {soon.map(([Icon, t, d, to], i) => (
          <Card key={t} index={i} className="space-y-2 p-5">
            <div className="flex justify-between gap-2"><Icon className="text-xl text-red-500" /><Pill>Coming soon</Pill></div>
            <h3 className="font-bold">{t}</h3>
            <p className="text-[11px] text-white/45">{d}</p>
            <Link to={to} className={`${mono} flex items-center gap-1 text-[9px] text-white/40`}><FiLock /> Locked</Link>
          </Card>
        ))}
      </div>
    </>
  );
}