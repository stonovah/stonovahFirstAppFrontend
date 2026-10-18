// src/pages/admin/pages/ExecutiveOverview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiCreditCard, FiRotateCcw, FiDollarSign, FiClock, FiLock, FiBookOpen, FiAward, FiFilm } from 'react-icons/fi';
import { Card, Pill, PageHeader, CountUp, Bar } from '../ui';
import { adminApi } from '../../../api/admin';
import { useLoad, ErrorLine } from '../adminBits';
import { moneyK, ago, slaInfo, shortId, ORDER_STATUS } from '../adminLive';

const soon = [
  [FiBookOpen, 'Publishing & DRM', 'Books, readers and royalties.', '/admin/soon/books'],
  [FiAward, 'Courses & Mentorship', 'Cohorts, curriculum and sessions.', '/admin/soon/courses'],
  [FiFilm, 'Film & Studio', 'Production bookings and delivery.', '/admin/soon/curriculum'],
];

function Section({ title, to, children, empty }) {
  return (
    <Card className="p-5 space-y-3">
      <div className="flex justify-between items-center"><h3 className="text-lg font-black font-sans">{title}</h3>{to && <Link to={to} className="text-[10px] font-bold text-[#FFBF00] hover:text-white">Open →</Link>}</div>
      {children}
      {empty && <p className="text-xs text-neutral-500">Nothing waiting. Well done.</p>}
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
    { l: 'TICKET REVENUE', v: moneyK(o.ticketRevenue), s: 'Face value of paid tickets' },
    { l: 'ORDER VALUE', v: moneyK(o.totalGrossRevenue), s: 'Includes buyer-paid fees' },
    { l: 'TICKETS SOLD', v: <CountUp value={o.totalTicketsSold} />, s: `${o.paidOrdersLast24h} paid orders in the last 24h` },
    { l: 'LIVE EVENTS', v: <CountUp value={o.activeEvents} />, s: `${o.scheduledEvents} approved and scheduled` },
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
      <PageHeader eyebrow="CONSOLE OVERVIEW" title="Executive Operations Console" desc="What needs your attention today, and how the platform is doing." />
      <ErrorLine>{ov.error}</ErrorLine>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Card key={s.l} index={i} hover className="p-5 space-y-2 relative overflow-hidden"><span className="absolute top-0 left-5 w-12 h-0.5 bg-red-600" /><span className="text-[9px] font-bold text-neutral-400 tracking-wider block">{s.l}</span><b className="text-3xl font-black font-sans block break-words">{s.v}</b><span className="text-[10px] text-neutral-400">{s.s}</span></Card>
          ))}
        </div>
      )}

      <h2 className="text-lg font-black uppercase flex items-center gap-2"><span className="w-2 h-2 bg-red-600 rounded-full" /> Needs your attention</h2>
      {tiles && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {tiles.map(([label, n, to, Icon], i) => (
            <Link key={label} to={to}><Card index={i} hover className={`p-4 space-y-1 ${n > 0 ? 'ring-2 ring-red-600' : ''}`}><Icon className="text-red-400" /><b className="text-3xl font-black font-sans block">{n}</b><span className="text-[10px] text-neutral-400 font-bold">{label.toUpperCase()}</span></Card></Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Section title="Events waiting for review" to="/admin/events/pending" empty={queue.data && !waiting.length}>
          {waiting.map((e) => { const sla = slaInfo(e.submittedAt || e.updatedAt, slaH); return (
            <Link key={e.id} to={`/admin/events/pending/${e.id}`} className="block bg-neutral-900 hover:bg-neutral-800 rounded-xl p-3 transition text-xs"><b className="font-sans text-sm block truncate">{e.title}</b><span className="text-neutral-400">{e.organizer?.name}</span><span className={`block font-bold mt-1 ${sla.overdue ? 'text-red-400' : 'text-neutral-300'}`}>● {sla.overdue ? 'Past the review target' : `${sla.label} left`}</span></Link>); })}
        </Section>
        <Section title="KYC waiting for a decision" to="/admin/organizers" empty={kyc.data && !kycRows.length}>
          {kycRows.map((r) => <Link key={r.id} to={`/admin/organizers/${r.id}`} className="block bg-neutral-900 hover:bg-neutral-800 rounded-xl p-3 transition text-xs"><b className="font-sans text-sm block truncate">{r.name}</b><span className="text-neutral-400">{r.type === 'BUSINESS' ? 'Business' : 'Individual'} • joined {ago(r.createdAt)}</span></Link>)}
        </Section>
        <Section title="Settlement account changes" to="/admin/organizers" empty={bank.data && !bankRows.length}>
          {bankRows.map((r) => <Link key={r.id} to={`/admin/organizers/${r.organizerId}`} className="block bg-neutral-900 hover:bg-neutral-800 rounded-xl p-3 transition text-xs"><b className="font-sans text-sm block truncate">{r.legalName || 'Organizer'}</b><span className="text-neutral-400">{r.bankName} •••• {r.accountNumber.slice(-4)} • {ago(r.createdAt)}</span></Link>)}
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card index={1} className="xl:col-span-7 p-5 space-y-3">
          <div className="flex justify-between items-center"><h3 className="text-lg font-black font-sans">Recent orders</h3><Link to="/admin/orders" className="text-[10px] font-bold text-[#FFBF00] hover:text-white">All orders →</Link></div>
          <ErrorLine>{orders.error}</ErrorLine>
          <div className="overflow-x-auto"><table className="w-full text-xs min-w-[480px]"><thead><tr className="text-[9px] text-neutral-500 text-left"><th className="py-2">ORDER</th><th>BUYER</th><th>EVENT</th><th className="text-right">AMOUNT</th></tr></thead>
            <tbody>{(orders.data?.data || []).map((x) => (
              <tr key={x.id} className="border-t border-neutral-800"><td className="py-2.5"><b>{shortId(x.id)}</b><span className="block text-[9px] text-neutral-500">{ago(x.createdAt)}</span></td><td>{x.buyerName}</td><td className="max-w-[180px] truncate">{x.event.title}</td><td className="text-right font-bold">{x.totalAmount ? moneyK(x.totalAmount) : 'Free'}<span className="block"><Pill tone={ORDER_STATUS[x.status].tone}>{ORDER_STATUS[x.status].label}</Pill></span></td></tr>))}</tbody></table>
            {orders.data && !orders.data.data.length && <p className="text-xs text-neutral-500 py-6 text-center">No orders yet.</p>}</div>
        </Card>
        <Card index={2} className="xl:col-span-5 p-5 space-y-3">
          <div className="flex justify-between items-center"><h3 className="text-lg font-black font-sans">Live events</h3><Link to="/admin/events" className="text-[10px] font-bold text-[#FFBF00] hover:text-white">All events →</Link></div>
          <ErrorLine>{live.error}</ErrorLine>
          {(live.data?.data || []).map((e) => { const t = e.tierSummary; const pct = t.capacity ? Math.round((t.sold / t.capacity) * 100) : 0; return (
            <Link key={e.id} to={`/admin/events/${e.id}`} className="block bg-neutral-900 hover:bg-neutral-800 rounded-xl p-3 transition space-y-1.5"><div className="flex justify-between gap-2 text-xs"><b className="font-sans truncate">{e.title}</b><span className="shrink-0 text-neutral-400">{t.sold.toLocaleString()} / {t.capacity.toLocaleString()}</span></div><Bar percent={pct} /></Link>); })}
          {live.data && !live.data.data.length && <p className="text-xs text-neutral-500">No events are live right now.</p>}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {soon.map(([Icon, t, d, to], i) => (
          <Card key={t} index={i} className="p-5 space-y-2 opacity-90"><div className="flex justify-between gap-2"><Icon className="text-red-400 text-xl" /><Pill>Coming soon</Pill></div><h3 className="font-black font-sans">{t}</h3><p className="text-[11px] text-neutral-400">{d}</p><Link to={to} className="text-[10px] font-bold text-neutral-500 flex items-center gap-1"><FiLock /> Locked</Link></Card>
        ))}
      </div>
    </>
  );
}