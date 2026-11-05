import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiCopy, FiMail, FiPhone } from 'react-icons/fi';
import * as P from '../../api/production';
import { FORMAT_LABEL, fmtDate, ngn, useProdData, usePageTitle } from './ProdLive';
import { Btn, Card, ErrorBox, Loading } from './ProdUi';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

export default function ProductionConfirmation() {
  const { reference } = useParams();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  usePageTitle('Brief received | Stonovah Production');
  const { data: c, loading, error, reload } = useProdData(() => P.getConfirmation(reference, token), [reference, token]);

  if (loading) return <Loading />;
  if (error || !c) return <div className="mx-auto max-w-3xl px-5 py-20"><ErrorBox message="We could not find this confirmation. Check the link in your confirmation email." onRetry={reload} /><Link to="/production" className="mt-4 inline-block text-xs underline">Back to Production</Link></div>;

  const first = (c.contactName ?? '').split(' ')[0];
  const budget = c.budget?.minKobo != null || c.budget?.maxKobo != null
    ? [c.budget.minKobo != null ? ngn(c.budget.minKobo, { full: true }) : null, c.budget.maxKobo != null ? ngn(c.budget.maxKobo, { full: true }) : 'and above'].filter(Boolean).join(' – ')
    : c.budget?.label ?? 'Undisclosed';
  const copy = async () => { try { await navigator.clipboard.writeText(c.reference); toast.success('Reference copied'); } catch { toast.error('Could not copy'); } };

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-14">
      <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70"><FiCheckCircle className="text-red-500" /> Transmission confirmed // Brief {c.reference}</span>
      <h1 className="mt-6 text-4xl font-black uppercase leading-[1] tracking-tight sm:text-6xl">Your production brief <span className="text-[#e10613]">has been received</span></h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65">Thank you, <b className="text-white">{first}</b>. Your project brief for <i>“{c.projectTitle}”</i> has been securely received. A producer from our team will review your scope, crew requirements and technical delivery needs.</p>
      <p className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/60"><FiMail className="shrink-0 text-red-500" /> A confirmation email is on its way to <b className="text-white/85">{c.contactEmail}</b>.</p>

      <section className="mt-14">
        <p className={`${mono} text-white/40`}>Execution roadmap</p>
        <h2 className="mt-1 text-3xl font-bold">What happens next</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {c.nextSteps.map((s, i) => (
            <Card key={s.key} className="p-6">
              <div className="flex items-start justify-between"><p className={`text-5xl font-black ${i === 0 ? 'text-[#e10613]' : 'text-white/[0.14]'}`}>{String(i + 1).padStart(2, '0')}</p>{s.timing && <span className={`${mono} rounded bg-white/[0.06] px-2 py-1 text-white/60`}>{s.timing}</span>}</div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mt-12 p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Submission recap <span className="font-normal text-white/50">// Brief {c.reference}</span></h2>
          {c.ndaAcceptedAt && <span className={`${mono} rounded bg-red-600/15 px-2.5 py-1 text-red-300`}>Mutual NDA accepted {fmtDate(c.ndaAcceptedAt)}</span>}
        </div>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Project title', c.projectTitle, FORMAT_LABEL[c.format]],
            ['Producing entity', c.companyName || c.contactName, c.entityType === 'STUDIO' ? 'Studio / company' : 'Individual'],
            ['Key contact', c.contactName, c.contactEmail],
            ['Estimated scope', budget, null],
          ].map(([k, v, sub]) => (
            <div key={k}><dt className={`${mono} text-white/35`}>{k}</dt><dd className="mt-2 text-sm font-bold">{v}</dd>{sub && <dd className="mt-0.5 text-xs text-red-400">{sub}</dd>}</div>
          ))}
        </dl>
        <div className="mt-6 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
          <div><p className={`${mono} text-white/35`}>Uploaded assets</p>{c.files.length ? c.files.map((x) => <p key={x.name} className="mt-2 truncate text-xs text-white/75">{x.name} <span className="text-white/40">{(x.sizeBytes / 1048576).toFixed(1)} MB</span></p>) : <p className="mt-2 text-xs text-white/40">No files attached</p>}</div>
          <div><p className={`${mono} text-white/35`}>Principal photography</p><p className="mt-2 text-sm font-semibold">{c.principalPhoto.territory || 'To be confirmed'}</p>{c.principalPhoto.targetStart && <p className="mt-1 text-xs text-white/55">Target start: {fmtDate(c.principalPhoto.targetStart)}</p>}</div>
          <div><p className={`${mono} text-white/35`}>Requested services ({c.services.length})</p><div className="mt-2 flex flex-wrap gap-1.5">{c.services.map((s) => <span key={s.slug} className="rounded bg-white/[0.06] px-2 py-1 text-[11px]">{s.label}</span>)}</div></div>
        </div>
      </Card>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link to="/production/projects" className="rounded-xl border border-white/[0.07] bg-[#161616] p-6 hover:border-white/25"><p className={`${mono} text-red-400`}>Studio portfolio</p><p className="mt-2 text-xl font-bold">Past productions & showcase</p><p className="mt-1 text-sm text-white/50">Explore completed films, series and commercials.</p></Link>
        <Link to="/production" className="rounded-xl border border-white/[0.07] bg-[#161616] p-6 hover:border-white/25"><p className={`${mono} text-red-400`}>Production desk</p><p className="mt-2 text-xl font-bold">Return to production</p><p className="mt-1 text-sm text-white/50">Review the script-to-screen pipeline or build another package.</p></Link>
      </div>

      <Card className="mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold">Need to expedite your review or filming starts within 14 days?</p>
          {c.hotlinePhone && <a href={`tel:${c.hotlinePhone.replace(/\s/g, '')}`} className="mt-2 inline-flex items-center gap-2 text-sm text-white/70"><FiPhone className="text-red-500" /> Call the production desk: {c.hotlinePhone}</a>}
        </div>
        <Btn variant="ghost" onClick={copy}><FiCopy /> Copy reference {c.reference}</Btn>
      </Card>
    </div>
  );
}