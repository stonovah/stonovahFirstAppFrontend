// src/pages/admin/pages/EventReview.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiXCircle, FiCheckCircle, FiMapPin, FiCalendar, FiCheckSquare, FiSquare, FiFileText, FiAlertTriangle } from 'react-icons/fi';
import { Card, Pill, Btn, Img, Bar } from '../ui';
import { adminApi } from '../../../api/admin';
import { useFeeRate } from '../../steps/helpers';
import { PassPreview } from '../../steps/TicketTemplate';
import { useLoad, ErrorLine, KV, humanize } from '../adminBits';
import { moneyK, fmtDate, ago, priceRange, KYC } from '../adminLive';
import RejectModal from './RejectModal';
import ApproveModal from './ApproveModal';

const protocols = [
  ['Content & community standards', 'Title, artwork and description are free of hate speech, trademark infringement and uncleared media.'],
  ['Venue and capacity', 'The venue is real and the capacity is realistic for it.'],
  ['Pricing and fee structure', 'Ticket prices look sensible and the fee choice is clear.'],
  ['Organizer identity (KYC)', 'The documents match the organizer’s details.'],
];

export default function EventReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const feeRate = useFeeRate();
  const pct = Number((feeRate * 100).toFixed(2));
  const { data: e, error } = useLoad(() => adminApi.events.get(id), [id]);
  const [checks, setChecks] = useState([false, false, false, false]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);

  if (!e) return error ? <Card className="p-10 text-center">{error} <Link to="/admin/events/pending" className="text-[#FFBF00] underline">Back to queue</Link></Card> : <p className="font-mono text-xs font-bold">LOADING DOSSIER…</p>;

  const p = e.organizer.organizerProfile;
  const t = e.tierSummary;
  const waiting = e.status === 'PENDING' && !e.isApproved;
  const done = checks.filter(Boolean).length;
  const canApprove = waiting && done === 4 && e.issues.length === 0;
  const top = [...e.tiers].filter((x) => x.price > 0).sort((a, b) => b.price - a.price)[0];
  const sampleFee = top ? Math.round(top.price * feeRate) : 0;
  const meta = Object.entries(p?.kycMeta || {}).filter(([k, v]) => v !== null && v !== '' && !['organizationName', 'cacNumber', 'nin'].includes(k));
  const docs = Object.entries(p?.kycDocuments || {});
  const toggle = (i) => setChecks((c) => c.map((v, j) => (j === i ? !v : v)));
  const kyc = KYC[p?.kycStatus];

  return (
    <>
      <Link to="/admin/events/pending" className="inline-flex items-center gap-2 text-xs font-mono font-bold hover:underline"><FiArrowLeft /> Back to Pending Approval Queue</Link>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black font-sans tracking-tight">{e.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono font-bold">
            <span className="bg-black text-white px-2 py-1 rounded">REF: {String(e.id).slice(-8).toUpperCase()}</span>
            <span className="text-red-700">● {waiting ? 'Waiting for review' : e.status === 'PENDING' ? 'Approved, scheduled' : `Status: ${e.status}`}</span>
            {e.submittedAt && <span className="text-black/70">Submitted {ago(e.submittedAt)}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Btn variant="dark" disabled={e.status !== 'PENDING'} onClick={() => setRejectOpen(true)}><FiXCircle /> Reject with Reason…</Btn>
          <Btn disabled={!canApprove} onClick={() => setApproveOpen(true)}><FiCheckCircle /> Approve & Publish</Btn>
        </div>
      </motion.div>

      {e.issues.length > 0 && (
        <div className="bg-black text-red-200 rounded-2xl p-4 flex gap-3 text-xs font-mono"><FiAlertTriangle className="text-red-400 shrink-0 mt-0.5 text-lg" />
          <span><b className="block text-red-300 mb-1">This event can’t be approved yet</b>{e.issues.map((i) => <span key={i} className="block">• {i}</span>)}<span className="block mt-1 text-neutral-400">Reject it with feedback so the organizer can fix this.</span></span></div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-6">
          <Card index={1} className="p-5 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2"><div><span className="text-[9px] text-neutral-500 font-bold">01 / DETAILS</span><h2 className="text-xl font-black font-sans">Event Identity & Artwork</h2></div>{e.category && <Pill>{e.category}</Pill>}</div>
            <div className="relative h-64 rounded-xl overflow-hidden bg-neutral-900">{e.posterUrl ? <Img src={e.posterUrl} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-xs text-neutral-600">NO POSTER UPLOADED</div>}</div>
            {e.description && <p className="text-xs leading-relaxed text-neutral-300 whitespace-pre-line">{e.description}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-neutral-900 rounded-xl p-3 flex gap-3"><FiMapPin className="text-red-400 mt-1" /><div><span className="text-[9px] text-neutral-500 font-bold block">VENUE</span><b className="font-sans">{e.venue || '—'}</b><span className="text-[10px] text-neutral-400 block">{e.venueAddress}</span></div></div>
              <div className="bg-neutral-900 rounded-xl p-3 flex gap-3"><FiCalendar className="text-red-400 mt-1" /><div><span className="text-[9px] text-neutral-500 font-bold block">SCHEDULE</span><b className="font-sans">{fmtDate(e.startAt)}</b><span className="text-[10px] text-neutral-400 block">Ends {fmtDate(e.endAt)}</span></div></div>
            </div>
          </Card>

          <Card index={2} className="p-5 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3"><div><span className="text-[9px] text-neutral-500 font-bold">02 / TICKETING</span><h2 className="text-xl font-black font-sans">Ticket Types & Capacity</h2></div>
              <div className="bg-neutral-900 rounded-xl px-4 py-2"><span className="text-[9px] text-neutral-500 font-bold block">GROSS POTENTIAL</span><b className="text-xl font-sans text-[#FFBF00]">{moneyK(t.projectedGross)}</b></div></div>
            <div className="overflow-x-auto"><table className="w-full text-xs min-w-[460px]"><thead><tr className="text-[9px] text-neutral-500 text-left"><th className="py-2">TICKET TYPE</th><th>QUANTITY</th><th>PRICE</th><th className="text-right">SUBTOTAL</th></tr></thead>
              <tbody>{e.tiers.map((x) => <tr key={x.id} className="border-t border-neutral-800"><td className="py-3 font-bold">{x.name}</td><td>{x.quantity.toLocaleString()}</td><td>{x.price ? moneyK(x.price) : 'Free'}</td><td className="text-right">{moneyK(x.quantity * x.price)}</td></tr>)}</tbody></table></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[['TOTAL CAPACITY', t.capacity.toLocaleString()], ['PRICE RANGE', priceRange(t)], ['TICKET TYPES', t.count]].map(([k, v]) => <div key={k} className="bg-neutral-900 rounded-lg p-3"><span className="text-[9px] text-neutral-500 font-bold block">{k}</span><b className="text-lg font-sans">{v}</b></div>)}
            </div>
          </Card>

          <Card index={3} className="p-5 space-y-4">
            <div className="flex justify-between items-center"><div><span className="text-[9px] text-neutral-500 font-bold">03 / FEES</span><h2 className="text-xl font-black font-sans">Fee Allocation</h2></div><Pill tone="solid">Platform fee {pct}%</Pill></div>
            <div className="bg-neutral-900 rounded-lg p-3 text-xs flex flex-wrap gap-2 justify-between"><span className="text-neutral-400">Chosen by the organizer:</span><b className="text-red-300">{e.feeHandling === 'ORGANIZER_ABSORBED' ? `Organizer absorbs the ${pct}% fee` : e.feeHandling === 'BUYER_ADDED' ? `Buyer pays a ${pct}% booking fee` : 'Not chosen'}</b></div>
            {top && e.feeHandling && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                <div className="bg-neutral-900 rounded-xl p-4"><span className="text-[9px] text-neutral-500 font-bold block">BUYER PAYS ({top.name})</span><b className="text-2xl font-sans">{moneyK(e.feeHandling === 'BUYER_ADDED' ? top.price + sampleFee : top.price)}</b></div>
                <div className="bg-neutral-900 rounded-xl p-4"><span className="text-[9px] text-neutral-500 font-bold block">STONOVAH FEE</span><b className="text-2xl font-sans text-red-400">{moneyK(sampleFee)}</b></div>
                <div className="bg-neutral-900 rounded-xl p-4"><span className="text-[9px] text-neutral-500 font-bold block">ORGANIZER RECEIVES</span><b className="text-2xl font-sans">{moneyK(e.feeHandling === 'ORGANIZER_ABSORBED' ? top.price - sampleFee : top.price)}</b></div>
              </div>
            )}
          </Card>

          <Card index={4} className="p-5 space-y-3">
            <div><span className="text-[9px] text-neutral-500 font-bold">04 / TICKET DESIGN</span><h2 className="text-xl font-black font-sans">Selected Ticket Template</h2></div>
            {e.ticketTemplate ? <div className="max-w-sm space-y-2"><b className="text-sm">{e.ticketTemplate.name}</b>{!e.ticketTemplate.isActive && <Pill tone="red" className="ml-2">Not published</Pill>}<PassPreview template={e.ticketTemplate} eventName={e.title} tierName={top?.name} /></div> : <p className="text-xs text-neutral-400">No template selected.</p>}
          </Card>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <Card index={2} className="p-5 space-y-3">
            <div className="flex justify-between items-center"><div><span className="text-[9px] text-neutral-500 font-bold">KYC DOSSIER</span><h2 className="text-xl font-black font-sans">Organizer Record</h2></div>{kyc && <Pill tone={kyc.tone}>{kyc.label}</Pill>}</div>
            <div className="bg-neutral-900 rounded-xl p-3"><b className="font-sans text-lg">{p?.organizationName || e.organizer.email}</b><span className="text-[10px] text-neutral-400 block">{e.hostedByStonovah ? 'HOSTED BY STONOVAH' : p?.organizerType === 'BUSINESS' ? 'CORPORATE ENTITY' : 'INDIVIDUAL ORGANIZER'}</span></div>
            <KV k="CONTACT EMAIL" v={e.organizer.email} mono /><KV k="PHONE" v={e.organizer.phone} mono />
            {p?.cacNumber && <KV k="CAC NUMBER" v={p.cacNumber} mono />}
            {p?.nin && <KV k="NIN (MASKED)" v={`•••••••${p.nin.slice(-4)}`} mono />}
            <KV k="ACCOUNT STATUS" v={p?.status} />
            {meta.map(([k, v]) => <KV key={k} k={humanize(k).toUpperCase()} v={String(v)} />)}
            {docs.map(([k, url]) => (
              <div key={k} className="bg-neutral-900 rounded-xl p-3 flex items-center gap-3"><div className="w-9 h-9 rounded bg-red-950 text-red-400 flex items-center justify-center"><FiFileText /></div><div className="flex-1 min-w-0"><b className="text-xs block truncate">{humanize(k)}</b><span className="text-[10px] text-neutral-400">Submitted KYC document</span></div><a href={url} target="_blank" rel="noreferrer"><Btn variant="soft">Open</Btn></a></div>
            ))}
            {!docs.length && !e.hostedByStonovah && <p className="text-[11px] text-amber-300">No KYC documents were uploaded.</p>}
            {!e.hostedByStonovah && <Link to={`/admin/organizers/${e.organizer.id}`} className="text-[10px] font-bold text-[#FFBF00] hover:text-white block">Open the full organizer record (verify KYC, status, audit log) →</Link>}
          </Card>

          <Card index={3} className="p-5 space-y-3">
            <div className="flex justify-between items-center"><div><span className="text-[9px] text-neutral-500 font-bold">REVIEWER CHECKLIST</span><h2 className="text-xl font-black font-sans">Before You Approve</h2></div><Pill tone={done === 4 ? 'green' : 'solid'}>{done} of 4</Pill></div>
            <Bar percent={(done / 4) * 100} color={done === 4 ? 'bg-emerald-400' : 'bg-red-600'} />
            <p className="text-[11px] text-neutral-400">A personal checklist: tick each item once you have checked it. Approval unlocks when all four are ticked.</p>
            {protocols.map(([title, d], i) => (
              <motion.button key={title} type="button" whileTap={{ scale: 0.98 }} onClick={() => toggle(i)} className="w-full text-left bg-neutral-900 hover:bg-neutral-800 rounded-xl p-3 flex gap-3 cursor-pointer transition">
                {checks[i] ? <FiCheckSquare className="text-emerald-400 mt-0.5 shrink-0 text-lg" /> : <FiSquare className="text-red-500 mt-0.5 shrink-0 text-lg" />}
                <span><b className="text-sm font-sans block">{title}</b><span className="text-[10px] text-neutral-400 block leading-snug">{d}</span></span>
              </motion.button>
            ))}
          </Card>
        </div>
      </div>

      <ErrorLine>{error}</ErrorLine>

      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="sticky bottom-4 z-30 bg-black text-white rounded-2xl shadow-2xl border border-neutral-800 p-4 font-mono flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="text-xs"><span className="text-[9px] text-neutral-500 font-bold block">REVIEW ACTIONS</span>
          {!waiting ? `This event is not waiting for review (${e.status}).` : e.issues.length ? 'Fix the issues above or reject with feedback.' : canApprove ? 'Checklist complete. You can approve this event.' : `Tick all four checklist items to unlock approval (${done}/4).`}</div>
        <div className="flex gap-2 shrink-0"><Btn variant="soft" disabled={e.status !== 'PENDING'} onClick={() => setRejectOpen(true)}><FiXCircle /> Reject…</Btn><Btn disabled={!canApprove} onClick={() => setApproveOpen(true)}><FiCheckCircle /> Approve & Publish</Btn></div>
      </motion.div>

      <RejectModal event={e} open={rejectOpen} onClose={() => setRejectOpen(false)} onDone={() => navigate('/admin/events/pending')} />
      <ApproveModal event={e} open={approveOpen} onClose={() => setApproveOpen(false)} onDone={() => navigate('/admin/events/pending')} />
    </>
  );
}