// src/pages/organizer/pages/OrganizerPayouts.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiDownload, FiCheckCircle } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, CountUp, Bar, Modal } from '../../admin/ui';
import { BarChart } from '../orgUi';
import SettlementAccountCard from '../SettlementAccount';
import { financeApi } from '../../../api/finance';
import { apiErrorMessage } from '../../../api/apiClient';
import { formatNaira, koboToNaira } from '../../steps/helpers';
import { downloadCsv } from '../../admin/adminData';
import { useCan } from '../../../context/AuthContext';

const money = (kobo) => formatNaira(koboToNaira(kobo));
const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const PAYOUT = { PENDING: { label: 'Pending transfer', tone: 'amber' }, PAID: { label: 'Paid & Settled', tone: 'green' } };
const TYPE = { ADVANCE: 'Advance', SETTLEMENT: 'Final settlement' };
const FEE_LABEL = (h, rate) => (h === 'ORGANIZER_ABSORBED' ? `You absorb ${rate}%` : h === 'BUYER_ADDED' ? `Buyer pays ${rate}%` : 'Not set');

export default function OrganizerPayouts() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null); // event row being requested
  const [busy, setBusy] = useState(false);
  const canFinance = useCan()('finance.write');

  const load = useCallback(async () => {
    setError('');
    try { setData(await financeApi.overview()); }
    catch (e) { setError(apiErrorMessage(e, 'Could not load your payouts.')); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const sendRequest = async () => {
    setBusy(true);
    try {
      await financeApi.requestAdvance(confirm.eventId);
      toast.success('Advance request sent to Stonovah for review');
      setConfirm(null);
      await load();
    } catch (e) { toast.error(apiErrorMessage(e)); setConfirm(null); await load(); }
    finally { setBusy(false); }
  };

  if (!data) {
    return error
      ? <div className="bg-black text-red-400 font-mono text-xs font-bold rounded-xl p-3 flex justify-between gap-3"><span>{error}</span><button type="button" onClick={load} className="text-[#FFBF00] cursor-pointer">Retry</button></div>
      : <p className="font-mono text-xs font-bold">LOADING YOUR PAYOUTS…</p>;
  }

  const { totals, settings, events, payouts, daily, bank } = data;
  const rate = Number((settings.feeRate * 100).toFixed(2));
  const advPct = Number((settings.advancePercentage * 100).toFixed(2));
  const withSales = events.filter((e) => e.sold > 0 || e.financials.advancePaid + e.financials.advancePending + e.financials.settlementPaid + e.financials.settlementPending > 0);
  const advanceRows = events.filter((e) => ['NOT_YET', 'BLOCKED', 'ELIGIBLE', 'REQUESTED'].includes(e.advance.state));

  const chart = daily.map((d) => ({
    label: new Date(`${d.date}T12:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }),
    value: koboToNaira(d.amount),
  }));

  const stats = [
    ['GROSS SALES', totals.gross, 'Face value of paid tickets'],
    ['PLATFORM FEES PAID BY YOU', totals.orgFee, `${rate}% on events where you absorb the fee`],
    ['NET REVENUE', totals.net, `Buyers also paid ${money(totals.buyerFee)} in booking fees`],
    ['PAID OUT SO FAR', totals.paidOut, 'Advances and final settlements'],
    ['PENDING PAYOUT', totals.pending, 'Approved, waiting for Stonovah to transfer'],
  ];

  const statement = () =>
    downloadCsv('settlement-statement.csv', [
      ['Payout', 'Event', 'Type', 'Amount (NGN)', 'Status', 'Paid at', 'Bank reference'],
      ...payouts.map((p) => [p.id, p.eventTitle, TYPE[p.type] || p.type, koboToNaira(p.amount), p.status, p.paidAt ? new Date(p.paidAt).toISOString() : '', p.paymentReference || '']),
    ]);

  return (
    <>
      <PageHeader eyebrow="ORGANIZER PORTAL / FINANCIAL LEDGER" title="Payouts & Revenue" desc="Track sales, fees, advances and settlements for every production, and request an advance when you qualify.">
        <Btn variant="dark" onClick={statement}><FiDownload /> Download Statement (CSV)</Btn>
      </PageHeader>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map(([k, v, s], i) => (
          <Card key={k} index={i} hover className={`p-4 space-y-1 relative overflow-hidden ${k === 'PENDING PAYOUT' ? 'ring-2 ring-red-600' : ''}`}>
            <span className="absolute top-0 left-4 w-10 h-0.5 bg-red-600" />
            <span className="text-[9px] font-bold text-neutral-400 tracking-wider">{k}</span>
            <b className="text-2xl font-black font-sans block break-all"><CountUp value={Math.round(koboToNaira(v))} prefix="₦" /></b>
            <span className="text-[10px] text-neutral-400">{s}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card index={1} className="xl:col-span-8 p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black font-sans">Ticket sales, last 14 days</h3>
            <Pill>{formatNaira(chart.reduce((s, d) => s + d.value, 0))}</Pill>
          </div>
          <BarChart data={chart} height={150} format={(v) => formatNaira(v)} />
        </Card>

        <div className="xl:col-span-4 space-y-4">
          <Card index={2} className="p-5 space-y-2">
            <h3 className="text-sm font-black font-sans">How payouts work</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Stonovah transfers your money to your verified settlement account and records each transfer here with its bank reference.
              You can ask for an early advance of {advPct}% of your ticket sales once an event qualifies. The rest is settled after the event.
            </p>
          </Card>
          <SettlementAccountCard bank={bank} onChanged={load} canEdit={canFinance} />
        </div>
      </div>

      {advanceRows.length > 0 && (
        <Card index={3} className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-black font-sans">Advance eligibility</h3>
            <p className="text-[11px] text-neutral-400">Receive {advPct}% of ticket sales early once an event reaches {settings.advanceCapacityPct}% of capacity, or {settings.advanceDaysBefore} days before the event. Stonovah reviews each request.</p>
          </div>

          {advanceRows.map((e) => {
            const a = e.advance;
            const days = a.daysToEvent;
            return (
              <div key={e.eventId} className="bg-neutral-900 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-4">
                  <b className="font-sans block">{e.title}</b>
                  <span className="text-[10px] text-neutral-400">{days === null ? 'Date not set' : days < 0 ? 'Already started' : `${Math.ceil(days)} days to event`}</span>
                </div>

                <div className="lg:col-span-5 space-y-2 text-[10px]">
                  <div>
                    <div className="flex justify-between mb-1"><span>Sales {a.soldPct.toFixed(0)}% of capacity</span><span className="text-neutral-400">needs {a.neededCapacityPct}%</span></div>
                    <Bar percent={(a.soldPct / a.neededCapacityPct) * 100} color={a.soldPct >= a.neededCapacityPct ? 'bg-emerald-400' : 'bg-red-600'} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><span>{days === null ? 'No date' : `${Math.max(0, Math.ceil(days))} days out`}</span><span className="text-neutral-400">qualifies at {a.neededDays}</span></div>
                    <Bar percent={days === null ? 0 : Math.min(100, (1 - Math.max(0, days - a.neededDays) / 30) * 100)} color={days !== null && days >= 0 && days <= a.neededDays ? 'bg-emerald-400' : 'bg-red-600'} />
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-1 lg:text-right">
                  <span className="text-[9px] text-neutral-500 font-bold block">ESTIMATED ADVANCE</span>
                  <b className="text-xl font-sans block">{money(a.estimate)}</b>
                  {a.state === 'REQUESTED' ? (
                    <Pill tone="amber"><FiCheckCircle /> Requested {fmt(a.requestedAt)}</Pill>
                  ) : (
                    <Btn className="py-1.5" disabled={a.state !== 'ELIGIBLE' || !canFinance} onClick={() => setConfirm(e)}>
                      {a.state === 'ELIGIBLE' ? 'Request Advance' : a.state === 'BLOCKED' ? 'Action needed' : 'Not yet eligible'}
                    </Btn>
                  )}
                </div>

                {a.state === 'BLOCKED' && (
                  <ul className="lg:col-span-12 text-[11px] text-amber-300 list-disc pl-5">{a.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
                )}
                {a.lastRejection && (
                  <p className="lg:col-span-12 text-[11px] text-red-300">Your previous request was declined{a.lastRejection.note ? `: ${a.lastRejection.note}` : '.'}</p>
                )}
              </div>
            );
          })}
        </Card>
      )}

      <Card index={4} className="overflow-hidden">
        <div className="p-4"><h3 className="text-lg font-black font-sans">Revenue by event</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[980px]">
            <thead><tr className="text-[9px] text-neutral-500 text-left bg-neutral-950"><th className="p-4">EVENT</th><th>FEE MODEL</th><th>GROSS</th><th>FEE</th><th>NET</th><th>ADVANCE</th><th>FINAL SETTLEMENT</th></tr></thead>
            <tbody>
              {withSales.map((e, i) => {
                const f = e.financials;
                const settlement = payouts.find((p) => p.eventId === e.eventId && p.type === 'SETTLEMENT');
                return (
                  <motion.tr key={e.eventId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="border-t border-neutral-800">
                    <td className="p-4 max-w-[260px]"><b className="font-sans block">{e.title}</b><Pill tone={e.status === 'LIVE' ? 'green' : 'grey'}>{e.status}</Pill></td>
                    <td><Pill>{FEE_LABEL(e.feeHandling, rate)}</Pill></td>
                    <td className="font-bold">{money(f.grossRevenue)}</td>
                    <td>{f.feeDeducted ? money(f.feeDeducted) : '—'}</td>
                    <td className="font-bold">{money(f.netOwed)}</td>
                    <td>{f.advancePaid ? money(f.advancePaid) : f.advancePending ? <span className="text-amber-300">{money(f.advancePending)} pending</span> : '—'}</td>
                    <td>{settlement ? <><b>{money(settlement.amount)}</b><span className="block"><Pill tone={PAYOUT[settlement.status]?.tone}>{PAYOUT[settlement.status]?.label}</Pill></span></> : <span className="text-neutral-500">Not yet scheduled</span>}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {!withSales.length && <p className="text-center text-sm text-neutral-400 py-10">Revenue appears here once tickets start selling.</p>}
        </div>
      </Card>

      <Card index={5} className="overflow-hidden">
        <div className="p-4"><h3 className="text-lg font-black font-sans">Payout history</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead><tr className="text-[9px] text-neutral-500 text-left bg-neutral-950"><th className="p-4">PAYOUT</th><th>EVENT</th><th>TYPE</th><th>AMOUNT</th><th>STATUS</th><th>DATE</th><th>BANK REFERENCE</th></tr></thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-t border-neutral-800">
                  <td className="p-4 font-bold">#{String(p.id).slice(-8).toUpperCase()}</td>
                  <td className="max-w-[220px] truncate">{p.eventTitle}</td>
                  <td>{TYPE[p.type] || p.type}</td>
                  <td className="font-bold">{money(p.amount)}</td>
                  <td><Pill tone={PAYOUT[p.status]?.tone}>{PAYOUT[p.status]?.label || p.status}</Pill></td>
                  <td>{p.status === 'PAID' ? fmt(p.paidAt) : 'Awaiting transfer'}</td>
                  <td className="font-mono text-[10px] text-neutral-400">{p.paymentReference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!payouts.length && <p className="text-center text-sm text-neutral-400 py-10">No payouts yet.</p>}
        </div>
      </Card>

      <Modal open={!!confirm} onClose={() => !busy && setConfirm(null)} width="max-w-md">
        {confirm && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-black font-sans pr-10">Request an advance?</h2>
            <div className="bg-neutral-800 rounded-xl p-4 text-xs space-y-1">
              <b className="block">{confirm.title}</b>
              <span className="text-neutral-400 block">Estimated advance</span>
              <b className="text-lg font-sans">{money(confirm.advance.estimate)}</b>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Stonovah reviews the request. If approved, the amount is sent to your settlement account{bank.current ? ` (${bank.current.bankName} •••• ${bank.current.last4})` : ''} and deducted from your final settlement.
              The final amount is calculated when the request is approved.
            </p>
            <div className="flex gap-2">
              <Btn variant="soft" disabled={busy} onClick={() => setConfirm(null)}>Cancel</Btn>
              <Btn disabled={busy} onClick={sendRequest}>{busy ? 'Sending…' : 'Send Request'}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
} 