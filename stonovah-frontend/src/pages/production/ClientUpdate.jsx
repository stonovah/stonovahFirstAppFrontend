import { useParams } from 'react-router-dom';
import { FiPhone } from 'react-icons/fi';
import * as P from '../../api/production';
import { fmtDate, useProdData, usePageTitle } from './ProdLive';
import { Card, Loading } from './ProdUi';
import { LinkGone } from './ClientLayout';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';
const STATUS = { ACTIVE: 'In progress', ON_HOLD: 'On hold', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

export default function ClientUpdate() {
  const { token } = useParams();
  usePageTitle('Project update | Stonovah');
  const { data: u, loading, error } = useProdData(() => P.getUpdate(token), [token]);
  if (loading) return <Loading />;
  if (error || !u) return <LinkGone />;
  const pr = u.project;
  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-12">
      <p className={`${mono} text-red-400`}>Project update • {pr.reference}</p>
      <h1 className="mt-4 text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">{pr.title}</h1>
      <Card className="mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`${mono} text-white/45`}>Stage: <span className="text-white">{pr.stageLabel}</span></p>
          <span className={`${mono} rounded bg-white/[0.07] px-2.5 py-1 text-white/70`}>{STATUS[pr.status] ?? pr.status}</span>
        </div>
        <div className="mt-4 flex justify-between text-xs"><span className="text-white/45">Overall progress</span><b>{pr.progressPct}%</b></div>
        <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#e10613]" style={{ width: `${pr.progressPct}%` }} /></div>
      </Card>
      <Card className="mt-4 p-7">
        <p className={`${mono} text-white/40`}>Message from your producer • {fmtDate(u.sentAt)}</p>
        <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-white/80">{u.message}</p>
      </Card>
      {u.hotlinePhone && <p className="mt-10 text-center text-sm text-white/55">Questions? <a href={`tel:${u.hotlinePhone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 font-semibold text-white"><FiPhone className="text-red-500" /> {u.hotlinePhone}</a></p>}
    </div>
  );
}