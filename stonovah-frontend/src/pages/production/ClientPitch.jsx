import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiDownload, FiPhone } from 'react-icons/fi';
import * as P from '../../api/production';
import { apiErrorMessage } from '../../lib/api';
import { fmtDate, useProdData, usePageTitle } from './ProdLive';
import { Btn, Card, Loading } from './ProdUi';
import { LinkGone } from './ClientLayout';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';
const STATE = {
  FINAL: ['Final', 'bg-green-500/15 text-green-300'],
  FOR_REVIEW: ['For your review', 'bg-amber-500/15 text-amber-300'],
  IN_PREPARATION: ['In preparation', 'bg-white/[0.07] text-white/55'],
};
const box = 'w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-red-500';

function Feedback({ token, materialKey, label }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    try { await P.sendPitchFeedback(token, { key: materialKey, message: msg.trim() }); toast.success('Feedback sent to your producer'); setMsg(''); setOpen(false); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    setBusy(false);
  };
  if (!open) return <button onClick={() => setOpen(true)} className="text-[11px] font-bold uppercase tracking-wider text-white/55 hover:text-white">{label}</button>;
  return (
    <div className="mt-3 w-full">
      <textarea rows={3} className={box} placeholder="Your comments or requested changes" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={3000} />
      <div className="mt-2 flex gap-2"><Btn onClick={send} disabled={busy || msg.trim().length < 3}>{busy ? 'Sending…' : 'Send feedback'}</Btn><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn></div>
    </div>
  );
}

export default function ClientPitch() {
  const { token } = useParams();
  usePageTitle('Your pitch materials | Stonovah');
  const { data: p, loading, error } = useProdData(() => P.getPitch(token), [token]);
  const [dl, setDl] = useState(null);

  if (loading) return <Loading />;
  if (error || !p) return <LinkGone />;

  const download = async (file) => {
    setDl(file.id);
    try { window.open((await P.getPitchFileUrl(token, file.id)).url, '_blank', 'noopener'); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    setDl(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-20 pt-12">
      <p className={`${mono} text-red-400`}>Pitch & financing materials</p>
      <h1 className="mt-4 text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">{p.projectTitle}</h1>
      <p className="mt-4 text-sm text-white/60">Hello {p.clientName}{p.clientCompany ? ` (${p.clientCompany})` : ''}. {p.delivered ? 'Your final package is complete.' : 'Review the materials shared with you below.'}</p>
      {p.delivered && <div className="mt-6 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200"><FiCheckCircle className="mt-0.5 shrink-0" /> Delivered {fmtDate(p.deliveredAt)}. Download links stay available until {fmtDate(p.expiresAt)}.</div>}
      {!p.delivered && p.deadline && <p className="mt-2 text-xs text-white/40">Pitch deadline: {fmtDate(p.deadline)}</p>}

      <div className="mt-10 space-y-4">
        {p.deliverables.map((d) => {
          const [text, cls] = STATE[d.state];
          return (
            <Card key={d.key} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{d.label}</h2>
                  {d.version ? <p className="mt-1 text-xs text-white/45">Version {d.version.number}{d.version.label ? ` • ${d.version.label}` : ''} • shared {fmtDate(d.version.sharedAt)}</p> : <p className="mt-1 text-xs text-white/40">Our team is preparing this material.</p>}
                </div>
                <span className={`${mono} rounded px-2.5 py-1 ${cls}`}>{text}</span>
              </div>
              {d.version?.file && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Btn variant="dark" disabled={dl === d.version.file.id} onClick={() => download(d.version.file)}><FiDownload /> {dl === d.version.file.id ? 'Preparing…' : `Download ${d.version.file.name}`}</Btn>
                  {d.version.file.sizeBytes ? <span className="text-xs text-white/40">{(d.version.file.sizeBytes / 1048576).toFixed(1)} MB</span> : null}
                </div>
              )}
              {d.version && <div className="mt-4 border-t border-white/5 pt-3"><Feedback token={token} materialKey={d.key} label="Send feedback on this material" /></div>}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-6"><h2 className="text-lg font-bold">General message</h2><p className="mt-1 text-sm text-white/55">Anything else our team should know?</p><div className="mt-3"><Feedback token={token} label="Write a message" /></div></Card>
      {p.hotlinePhone && <p className="mt-10 text-center text-sm text-white/55">Questions? <a href={`tel:${p.hotlinePhone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 font-semibold text-white"><FiPhone className="text-red-500" /> {p.hotlinePhone}</a></p>}
    </div>
  );
}