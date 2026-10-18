// src/pages/admin/pages/EventsOverview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Pill, Btn, PageHeader, CountUp, Bar } from '../ui';
import { adminApi } from '../../../api/admin';
import { useLoad, ErrorLine } from '../adminBits';
import { EVENT_STATUS, moneyK, ago, fmtDate } from '../adminLive';

const KIND = { event: 'green', payout: 'amber', refund: 'amber', organizer: 'grey', settings: 'red' };
const FLOW = ['DRAFT', 'PENDING', 'LIVE', 'UNPUBLISHED', 'ENDED'];

export default function EventsOverview() {
  const all = useLoad(() => adminApi.events.list({ limit: 1 }));
  const live = useLoad(() => adminApi.events.list({ status: 'LIVE', limit: 8 }));
  const act = useLoad(() => adminApi.activity());
  const counts = all.data?.counts || {};
  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <>
      <PageHeader eyebrow="EVENTS CONSOLE" title="Events Overview" desc="Where every event stands, how the live ones are selling, and what the team has done recently.">
        <Link to="/admin/events/pending"><Btn variant="dark">Review queue ({counts.PENDING || 0})</Btn></Link>
        <Link to="/admin/events"><Btn>All events →</Btn></Link>
      </PageHeader>
      <ErrorLine>{all.error}</ErrorLine>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {FLOW.map((k, i) => (
          <Link key={k} to="/admin/events"><Card index={i} hover className="p-4 space-y-1"><span className="text-[9px] font-bold text-neutral-400 tracking-wider block">{EVENT_STATUS[k].label.toUpperCase()}</span><b className="text-4xl font-black font-sans block"><CountUp value={counts[k] || 0} /></b><span className="text-[10px] text-neutral-500">{total ? Math.round(((counts[k] || 0) / total) * 100) : 0}% of {total}</span></Card></Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card index={1} className="xl:col-span-7 p-5 space-y-3">
          <h3 className="text-lg font-black font-sans">Live events: sell-through</h3>
          <ErrorLine>{live.error}</ErrorLine>
          <div className="overflow-x-auto"><table className="w-full text-xs min-w-[520px]"><thead><tr className="text-[9px] text-neutral-500 text-left"><th className="py-2">EVENT</th><th>STARTS</th><th className="w-40">SOLD / CAPACITY</th><th className="text-right">SOLD (FACE VALUE)</th></tr></thead>
            <tbody>{(live.data?.data || []).map((e) => { const t = e.tierSummary; const pct = t.capacity ? Math.round((t.sold / t.capacity) * 100) : 0; return (
              <tr key={e.id} className="border-t border-neutral-800"><td className="py-3 max-w-[220px]"><Link to={`/admin/events/${e.id}`} className="font-bold font-sans hover:text-[#FFBF00] block truncate">{e.title}</Link><span className="text-[10px] text-neutral-500">{e.organizer?.name}</span></td><td>{fmtDate(e.startAt, false)}</td><td className="pr-4"><span className="text-[10px]">{t.sold.toLocaleString()} / {t.capacity.toLocaleString()} ({pct}%)</span><Bar percent={pct} /></td><td className="text-right font-bold">{moneyK(t.soldGross)}</td></tr>); })}</tbody></table>
            {live.data && !live.data.data.length && <p className="text-xs text-neutral-500 py-6 text-center">No events are live right now.</p>}</div>
        </Card>

        <Card index={2} className="xl:col-span-5 p-5 space-y-3">
          <div><h3 className="text-lg font-black font-sans">Activity Ledger</h3><p className="text-[11px] text-neutral-400">Approvals, payouts, refund decisions, KYC and settings changes.</p></div>
          <ErrorLine>{act.error}</ErrorLine>
          <div className="space-y-2 max-h-[460px] overflow-y-auto">
            {(act.data || []).map((a) => (
              <Link key={a.id} to={a.link} className="block bg-neutral-900 hover:bg-neutral-800 rounded-xl p-3 transition">
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold font-sans">{a.title}<Pill tone={KIND[a.kind]}>{a.kind}</Pill></div>
                {a.detail && <span className="text-[10px] text-neutral-400 block truncate">{a.detail}</span>}
                <span className="text-[9px] text-neutral-500">{ago(a.at)}{a.by ? ` • ${a.by}` : ''}</span>
              </Link>
            ))}
            {act.data && !act.data.length && <p className="text-xs text-neutral-500">Nothing has happened yet.</p>}
            {act.loading && !act.data && <p className="text-xs text-neutral-500">Loading…</p>}
          </div>
        </Card>
      </div>
    </>
  );
}