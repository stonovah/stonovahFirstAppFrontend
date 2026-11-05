import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiClock, FiDownload, FiPhone, FiXCircle } from 'react-icons/fi';
import * as P from '../../api/production';
import { apiErrorMessage } from '../../lib/api';
import { fmtDate, ngn, useProdData, usePageTitle } from './ProdLive';
import { Btn, Card, Loading } from './ProdUi';
import { LinkGone } from './ClientLayout';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';
const money = (k) => ngn(k, { full: true });
const field = 'mt-2 w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-red-500';

function Banner({ p }) {
  const map = {
    ACCEPTED: { I: FiCheckCircle, cls: 'border-green-500/30 bg-green-500/10 text-green-200', t: `You accepted this proposal${p.respondedAt ? ` on ${fmtDate(p.respondedAt)}` : ''}. Your producer will contact you shortly to begin mobilization.` },
    DECLINED: { I: FiXCircle, cls: 'border-white/15 bg-white/5 text-white/70', t: `This proposal was declined${p.respondedAt ? ` on ${fmtDate(p.respondedAt)}` : ''}. Contact us if you would like a revised version.` },
  };
  const b = map[p.status] ?? (p.expired || p.status === 'EXPIRED' ? { I: FiClock, cls: 'border-amber-500/30 bg-amber-500/10 text-amber-200', t: 'This proposal has expired. Please contact the production desk for a refreshed proposal.' } : null);
  if (!b) return null;
  return <div className={`mt-8 flex items-start gap-3 rounded-lg border p-4 text-sm ${b.cls}`}><b.I className="mt-0.5 shrink-0" /> {b.t}</div>;
}

export default function ClientProposal() {
  const { token } = useParams();
  usePageTitle('Your production proposal | Stonovah');
  const { data: p, loading, error, reload } = useProdData(() => P.getProposal(token), [token]);
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (error || !p) return <LinkGone />;

  const accept = async () => {
    setBusy(true);
    try { await P.acceptProposal(token, name.trim()); toast.success('Proposal accepted. Thank you.'); reload(); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    setBusy(false);
  };
  const decline = async () => {
    setBusy(true);
    try { await P.declineProposal(token, reason.trim()); toast.success('Your response has been recorded.'); reload(); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    setBusy(false);
  };

  const L = p.ledger;
  return (
    <div className="mx-auto max-w-4xl px-5 pb-20 pt-12">
      <p className={`${mono} text-red-400`}>Production agreement & commercial quote{p.version > 1 ? ` • V${p.version}` : ''} • {p.reference}</p>
      <h1 className="mt-4 text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">{p.title}</h1>
      <p className="mt-4 text-sm text-white/60">Prepared for <b className="text-white">{p.clientName}</b>{p.clientCompany ? `, ${p.clientCompany}` : ''}. {[p.formatLabel, p.scopeLabel].filter(Boolean).join(' • ')}</p>
      <p className="mt-1 text-xs text-white/45">{p.sentAt && `Issued ${fmtDate(p.sentAt)}`}{p.validUntil && ` • Valid until ${fmtDate(p.validUntil)}`}</p>
      <div className="mt-5"><Btn variant="ghost" href={P.proposalPdfUrl(token)} target="_blank" rel="noreferrer"><FiDownload /> Download PDF</Btn></div>
      <Banner p={p} />

      <h2 className="mt-12 text-2xl font-bold">Itemized scope of services</h2>
      <div className="mt-5 space-y-4">
        {p.phases.map((ph) => (
          <Card key={ph.stage} className="p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3"><p className={`${mono} text-red-400`}>{ph.label}</p><p className="text-sm font-bold">{money(ph.subtotalKobo)}</p></div>
            <ul className="divide-y divide-white/5">
              {ph.items.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{i.title} {i.priority === 'HIGH' && <span className="ml-2 rounded bg-red-600/20 px-1.5 py-0.5 font-mono text-[9px] text-red-300">HIGH PRIORITY</span>}</p>
                    {i.description && <p className="mt-1 text-sm text-white/55">{i.description}</p>}
                    {i.timelineLabel && <p className="mt-1 text-xs text-white/40">{i.timelineLabel}</p>}
                  </div>
                  <p className="shrink-0 text-sm font-bold">{money(i.valueKobo)}</p>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-xl font-bold">Commercial ledger</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-white/55">Subtotal</dt><dd>{money(L.subtotalKobo)}</dd></div>
          <div className="flex justify-between"><dt className="text-white/55">Studio management & contingency ({L.contingencyPct}%)</dt><dd>{money(L.contingencyKobo)}</dd></div>
          <div className="flex justify-between"><dt className="text-white/55">Taxes and levies{L.taxNote ? ` (${L.taxNote})` : ''}</dt><dd>{money(L.taxKobo)}</dd></div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-black"><dt>Grand total</dt><dd className="text-[#e10613]">{money(L.totalKobo)}</dd></div>
        </dl>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="text-xl font-bold">Payment milestones</h2>
        <ul className="mt-4 divide-y divide-white/5">
          {p.paymentPlan.map((t) => <li key={t.sequence} className="flex justify-between py-2.5 text-sm"><span className="text-white/65">{t.label} ({t.pct}%)</span><b>{money(t.amountKobo)}</b></li>)}
        </ul>
        <p className="mt-3 text-xs text-white/45">Included revision rounds: {p.revisionRounds}</p>
      </Card>

      {p.specialConditions && <Card className="mt-4 p-6"><h2 className="text-lg font-bold">Special conditions</h2><p className="mt-2 whitespace-pre-line text-sm text-white/60">{p.specialConditions}</p></Card>}
      {p.disclaimer && <p className="mt-6 text-xs leading-relaxed text-white/40">{p.disclaimer}</p>}

      {p.canRespond && (
        <Card className="mt-10 border-t-2 border-t-red-600 p-7">
          <h2 className="text-2xl font-bold">Your response</h2>
          {!declining ? (
            <>
              <p className="mt-2 text-sm text-white/55">Typing your name below acts as your acceptance of this proposal. Your name, the time and your network address are recorded.</p>
              <label className="mt-5 block"><span className={`${mono} text-white/45`}>Full name *</span><input className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Your full name" /></label>
              <label className="mt-4 flex items-start gap-3 text-sm text-white/70"><input type="checkbox" className="mt-1" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I am authorised to accept this proposal for {p.clientCompany || 'myself'}.</label>
              <div className="mt-6 flex flex-wrap gap-3">
                <Btn onClick={accept} disabled={busy || name.trim().length < 2 || !agree} arrow>{busy ? 'Submitting…' : 'Accept proposal'}</Btn>
                <Btn variant="ghost" onClick={() => setDeclining(true)}>Decline</Btn>
              </div>
            </>
          ) : (
            <>
              <label className="mt-5 block"><span className={`${mono} text-white/45`}>Reason for declining *</span><textarea rows={4} className={field} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} /></label>
              <div className="mt-6 flex flex-wrap gap-3">
                <Btn onClick={decline} disabled={busy || reason.trim().length < 3}>{busy ? 'Submitting…' : 'Confirm decline'}</Btn>
                <Btn variant="ghost" onClick={() => setDeclining(false)}>Back</Btn>
              </div>
            </>
          )}
        </Card>
      )}
      {p.hotlinePhone && <p className="mt-8 text-center text-sm text-white/55">Questions? <a href={`tel:${p.hotlinePhone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 font-semibold text-white"><FiPhone className="text-red-500" /> {p.hotlinePhone}</a></p>}
    </div>
  );
}