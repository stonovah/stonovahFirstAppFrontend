import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck, FiExternalLink, FiPhone } from 'react-icons/fi';
import * as P from '../../api/production';
import { apiErrorMessage } from '../../lib/api';
import { fmtDate, ngn, useProdData, usePageTitle } from './ProdLive';
import { Card, Loading } from './ProdUi';
import { LinkGone } from './ClientLayout';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';
const CAT = { CREW: 'Crew', CAST: 'Cast', BACKGROUND: 'Background' };

export default function ClientShortlist() {
  const { token } = useParams();
  usePageTitle('Your crew & cast shortlist | Stonovah');
  const { data, loading, error } = useProdData(() => P.getShortlist(token), [token]);
  const [live, setLive] = useState(null);
  const [busy, setBusy] = useState(null);
  const s = live ?? data;

  if (loading) return <Loading />;
  if (error || !s) return <LinkGone />;

  const toggle = async (role, c) => {
    setBusy(c.id);
    try { setLive(await P.selectCandidate(token, role.id, c.id, !c.picked)); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    setBusy(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-20 pt-12">
      <p className={`${mono} text-red-400`}>Crew & cast shortlist • {s.reference}</p>
      <h1 className="mt-4 text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">{s.projectTitle}</h1>
      <p className="mt-4 text-sm text-white/60">Hello {s.clientName}. Review the candidates below and choose your preferences. Our team confirms bookings with you after your selection.</p>
      <p className="mt-2 text-xs text-white/40">{[s.shootStart && `Shoot: ${fmtDate(s.shootStart)}${s.shootEnd ? ` to ${fmtDate(s.shootEnd)}` : ''}`, s.locations, s.expiresAt && `Link valid until ${fmtDate(s.expiresAt)}`].filter(Boolean).join(' • ')}</p>

      {!s.roles.length && <Card className="mt-10 p-8 text-center text-sm text-white/55">There are no open roles to review right now.</Card>}

      <div className="mt-10 space-y-6">
        {s.roles.map((r) => (
          <Card key={r.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={`${mono} text-white/40`}>{CAT[r.category]} • {r.qty} {r.qty === 1 ? 'position' : 'positions'}</p>
                <h2 className="mt-1 text-xl font-bold">{r.title}</h2>
                {(r.windowStart || r.windowEnd) && <p className="mt-1 text-xs text-white/45">{fmtDate(r.windowStart)}{r.windowEnd ? ` to ${fmtDate(r.windowEnd)}` : ''}</p>}
              </div>
              {r.canChoose ? <span className={`${mono} rounded bg-white/[0.06] px-2.5 py-1 text-white/60`}>Chosen {r.pickedCount} of {r.qty}</span>
                : <span className={`${mono} rounded bg-green-500/15 px-2.5 py-1 text-green-300`}>Confirmed</span>}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {r.candidates.map((c) => (
                <div key={c.id} className={`rounded-lg border p-4 ${c.picked || c.booked ? 'border-red-600/60 bg-red-600/[0.07]' : 'border-white/10 bg-black/30'}`}>
                  <p className="font-bold">{c.name}</p>
                  {c.guild && <p className="text-xs text-white/50">{c.guild}</p>}
                  {c.availability && <p className="mt-2 text-xs text-white/60">Availability: {c.availability}</p>}
                  {c.quoteKobo != null && <p className="mt-1 text-xs text-white/60">Proposed quote: <b className="text-white">{ngn(c.quoteKobo, { full: true })}</b></p>}
                  {c.reelUrl && <a href={c.reelUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300"><FiExternalLink /> Watch showreel</a>}
                  {r.canChoose && (
                    <button disabled={busy === c.id} onClick={() => toggle(r, c)} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${c.picked ? 'bg-red-600 text-white' : 'border border-white/15 text-white/80 hover:border-white/35'}`}>
                      {c.picked ? <><FiCheck /> Chosen (click to remove)</> : 'Choose this candidate'}
                    </button>
                  )}
                  {c.booked && <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-300"><FiCheck /> Booked</p>}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      {s.hotlinePhone && <p className="mt-10 text-center text-sm text-white/55">Questions? <a href={`tel:${s.hotlinePhone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 font-semibold text-white"><FiPhone className="text-red-500" /> {s.hotlinePhone}</a></p>}
    </div>
  );
}