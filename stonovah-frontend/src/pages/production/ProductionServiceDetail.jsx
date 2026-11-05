import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiClock, FiDownload, FiFileText, FiMail, FiMinus, FiPhone, FiPlus, FiShield } from 'react-icons/fi';
import * as P from '../../api/production';
import { useProduction } from './ProductionContext';
import { CONTACT_EMAIL, STAGE_NO, ngn, useProdData, usePageTitle } from './ProdLive';
import { Breadcrumb, Btn, Card, ErrorBox, Eyebrow, Icon, Loading, Reveal } from './ProdUi';
import toast from 'react-hot-toast';
import { DEFAULT_ENGINE_STAGES, getDefaultService } from './prodDefaults';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

function splitTitle(name) {
  const sp = name.lastIndexOf(' ');
  if (sp > 0) return [name.slice(0, sp), name.slice(sp + 1)];
  const h = name.indexOf('-');
  if (h > 0) return [name.slice(0, h + 1), name.slice(h + 1)];
  return ['', name];
}

function Section({ eyebrow, title, sub, dark, id, children }) {
  return (
    <section id={id} className={`py-16 ${dark ? 'bg-[#0d0d0d]' : ''}`}>
      <div className="mx-auto max-w-7xl px-5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">{title}</h2>
        {sub && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">{sub}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

const cols = (n) => (n === 3 ? 'lg:grid-cols-3' : n >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-2');

// Full Production Packaging only: the five stages as one engine.
function Engine() {
  const { data } = useProdData(() => P.getServices(), []);
  const live = (data?.stages ?? []).filter((s) => s.stage !== 'CROSS');
  const stages = live.length ? live : DEFAULT_ENGINE_STAGES;
  if (!stages.length) return null;
  return (
    <Section dark eyebrow="All-inclusive pipeline" title="Unified production engine" sub="Every phase is covered under one master schedule and budget.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stages.map((s, i) => (
          <Reveal key={s.stage} delay={i * 0.05}>
            <Link to={`/production/services?stage=${s.stage}`} className="block h-full rounded-xl border border-white/[0.07] bg-[#161616] p-5 hover:border-white/25">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e10613] text-xs font-bold">{STAGE_NO[s.stage]}</span>
              <h3 className="mt-4 text-lg font-bold">{s.label}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/50">{s.blurb}</p>
              <p className={`${mono} mt-5 text-red-400`}>Included in package</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function MiniCard({ s, label }) {
  return (
    <Link to={`/production/services/${s.slug}`} className="group flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[#161616] p-5 hover:border-white/25">
      <div className="min-w-0">
        <p className={`${mono} text-red-400`}>{label}{s.stageLabel ? ` • ${s.stageLabel}` : ''}</p>
        <p className="mt-2 text-lg font-bold">{s.name}</p>
        {s.shortDescription && <p className="mt-1 line-clamp-2 text-xs text-white/50">{s.shortDescription}</p>}
      </div>
      <FiArrowRight className="shrink-0 text-white/40 group-hover:text-white" />
    </Link>
  );
}

function Detail({ s }) {
  const navigate = useNavigate();
  const { options, pkg, has, addService, removeService } = useProduction();
  const c = s.content ?? {};
  const turnkey = s.kind === 'TURNKEY';
  const inPkg = has(s.id);
  const [scopeId, setScopeId] = useState(null); // only set when the visitor actually picks one
  const [busy, setBusy] = useState(false);
  const scope = s.scopeOptions.find((o) => o.id === scopeId) ?? s.scopeOptions[0];
  const [lead, last] = splitTitle(s.name);
  const stageNo = STAGE_NO[s.stage];
  const phone = options?.hotlinePhone;

  const confirmSwitch = () => {
    if (!pkg?.items?.length) return true;
    if (turnkey && pkg.mode !== 'FULL') return window.confirm('Adding the Full Package replaces the individual services in your package. Continue?');
    if (!turnkey && pkg.mode === 'FULL') return window.confirm('This replaces the Full Package with individual services. Continue?');
    return true;
  };
   const add = async (extra = {}) => {
    if (s.isDefault) { toast.error('Packaging opens once the catalogue is seeded.'); return null; }
    if (!confirmSwitch()) return null;
    setBusy(true);
    const p = await addService(s.id, extra);
    setBusy(false);
    return p;
  };
  const toggle = async () => {
    if (inPkg) { setBusy(true); await removeService(s.id); setBusy(false); }
    else await add(scopeId ? { scopeOptionId: scopeId } : {});
  };
  const requestNow = async () => {
    if (s.isDefault) { navigate('/production/request'); return; }
    const ok = inPkg ? true : await add(scopeId ? { scopeOptionId: scopeId } : {});
    if (ok) navigate('/production/request');
  };

  const PackageBtn = ({ className = '' }) => (
    <Btn variant="dark" onClick={toggle} disabled={busy} className={className}>
      {inPkg ? <><FiMinus /> Remove from my package</> : <><FiPlus /> Add to my package</>}
    </Btn>
  );

  return (
    <>
      {/* hero */}
      <section className="border-b border-white/5 bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.14),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-6">
          <div className="flex items-center justify-between">
            <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Production', to: '/production' }, { label: s.name }]} />
            {stageNo && (
              <div className="hidden items-center gap-3 sm:flex">
                <span className={`${mono} text-white/40`}>Pipeline progress</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => <span key={n} className={`h-1.5 w-6 rounded-full ${n <= stageNo ? 'bg-[#e10613]' : 'bg-white/10'}`} />)}
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className={`${mono} text-red-400`}>● {s.stageLabel ?? s.stageMeta?.label}</p>
              <h1 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
                {lead} <span className="text-[#e10613]">{last}</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65">{s.shortDescription}</p>
              {c.tagline && <p className="mt-3 text-sm font-semibold text-red-400">{c.tagline}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                <Btn onClick={requestNow} disabled={busy} arrow>Request this service</Btn>
                <PackageBtn />
              </div>
              {c.heroStats?.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-8">
                  {c.heroStats.map((h) => (
                    <div key={h.label}><p className="text-3xl font-black">{h.value}</p><p className={`${mono} mt-1 text-white/40`}>{h.label}</p></div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {s.heroUrl && <img src={s.heroUrl} alt="" className="h-48 w-full rounded-xl object-cover" />}
              {(c.specSheet?.rows?.length > 0 || s.leadTimeLabel) && (
                <Card className="p-5">
                  <p className={`${mono} text-white/45`}>{turnkey ? 'Package spec' : 'Standard spec sheet'}</p>
                  <dl className="mt-4 divide-y divide-white/5">
                    {(c.specSheet?.rows ?? [{ label: 'Turnaround', value: s.leadTimeLabel }]).map((r) => (
                      <div key={r.label} className="flex justify-between gap-4 py-2.5 text-xs">
                        <dt className="text-white/50">{r.label}</dt>
                        <dd className="text-right font-semibold">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {c.specSheet?.note && <p className="mt-3 text-[11px] leading-relaxed text-white/45">{c.specSheet.note}</p>}
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {c.audiences?.length > 0 && (
        <Section eyebrow="Target audience alignment" title={turnkey ? 'Engineered for three production archetypes' : 'Who it is for'} sub={s.mandate}>
          <div className="grid gap-4 md:grid-cols-3">
            {c.audiences.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.05}>
                <Card className="h-full p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-red-500"><Icon name={s.iconKey} /></span>
                  <h3 className="mt-5 text-lg font-bold">{a.title}</h3>
                  {a.body && <p className="mt-3 text-sm leading-relaxed text-white/55">{a.body}</p>}
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {s.scopeOptions.length > 0 && scope && (
        <Section dark eyebrow="Configurable scope" title="Choose your scope & option" sub="Select an execution tier below to inspect deliverables, standard turnaround and scope specifications.">
          <div className="flex flex-wrap gap-2">
            {s.scopeOptions.map((o) => (
              <button key={o.id} onClick={() => setScopeId(o.id)}
                className={`rounded-md border px-4 py-2.5 text-left text-xs font-bold transition-colors ${scope.id === o.id ? 'border-red-600 bg-red-600/15 text-white' : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25'}`}>
                {o.label}
              </button>
            ))}
          </div>
          <Card className="mt-4 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className={`${mono} text-red-400`}>● {scope.label}</p>
                {scope.summary && <p className="mt-3 text-sm leading-relaxed text-white/65">{scope.summary}</p>}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/60">
                  {scope.durationLabel && <span className="flex items-center gap-2"><FiClock className="text-red-500" /> Estimated duration: <b className="text-white">{scope.durationLabel}</b></span>}
                  {scope.primaryDeliverable && <span className="flex items-center gap-2"><FiFileText className="text-red-500" /> Primary deliverable: <b className="text-white">{scope.primaryDeliverable}</b></span>}
                </div>
                {Array.isArray(scope.details) && scope.details.length > 0 && (
                  <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                    {scope.details.map((d) => (
                      <div key={d.label} className="text-xs"><dt className="text-white/40">{d.label}</dt><dd className="font-semibold">{d.value}</dd></div>
                    ))}
                  </dl>
                )}
              </div>
              <Btn variant="ghost" disabled={busy} onClick={() => add({ scopeOptionId: scope.id })} className="shrink-0">
                {inPkg ? 'Update scope in package' : 'Configure scope'}
              </Btn>
            </div>
          </Card>
        </Section>
      )}

      {s.tiers.length > 0 && (
        <Section eyebrow="Package tiers" title="Choose a tier" sub="Indicative starting points. Final pricing is confirmed in your proposal.">
          <div className="grid gap-4 md:grid-cols-3">
            {s.tiers.map((t) => (
              <Card key={t.id} className="flex flex-col p-6">
                {t.tag && <span className={`${mono} text-red-400`}>{t.tag}</span>}
                <h3 className="mt-2 text-lg font-bold">{t.name}</h3>
                {t.description && <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{t.description}</p>}
                <p className="mt-5 text-xl font-black">{t.fromPriceKobo ? `From ${ngn(t.fromPriceKobo)}` : 'Quote on request'}</p>
                <Btn variant="ghost" disabled={busy} onClick={() => add({ tierId: t.id })} className="mt-4">Select this tier</Btn>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {c.deliverables?.length > 0 && (
        <Section dark eyebrow={turnkey ? 'Deliverable architecture' : 'Guaranteed outcomes'} title="What you get" sub="Tangible deliverables for seamless handover to directors, packaging agents and production crews.">
          <div className={`grid gap-4 md:grid-cols-2 ${cols(c.deliverables.length)}`}>
            {c.deliverables.map((d, i) => (
              <Reveal key={d.title} delay={i * 0.04}>
                <Card className="h-full p-6">
                  <p className={`${mono} text-white/35`}>{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 text-base font-bold uppercase tracking-wide">{d.title}</h3>
                  {d.body && <p className="mt-3 text-sm leading-relaxed text-white/55">{d.body}</p>}
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {c.sampleManifest?.columns?.length > 0 && (
        <Section eyebrow="Sample" title={c.sampleManifest.title} sub={c.sampleManifest.subtitle}>
          {c.sampleManifest.illustrative && <p className={`${mono} mb-3 text-amber-400`}>Illustrative example</p>}
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {c.sampleManifest.columns.map((h) => <th key={h} className={`${mono} px-5 py-3 text-white/40`}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {c.sampleManifest.rows.map((r, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    {r.map((cell, j) => <td key={j} className={`px-5 py-3 ${j === 0 ? 'font-semibold' : 'text-white/60'}`}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Section>
      )}

      {c.steps?.length > 0 && (
        <Section eyebrow={turnkey ? 'Execution cadence' : 'End-to-end methodology'} title={turnkey ? 'How turnkey packaging works' : 'How it works'} sub="A disciplined, step-by-step process with zero guesswork.">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {c.steps.map((st, i) => (
              <Reveal key={st.title} delay={i * 0.04}>
                <Card className="h-full p-6">
                  <p className="text-5xl font-black text-white/[0.12]">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 text-base font-bold uppercase tracking-wide">{st.title}</h3>
                  {st.body && <p className="mt-2 text-sm leading-relaxed text-white/55">{st.body}</p>}
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {c.requirements?.length > 0 && (
        <Section dark eyebrow="Client onboarding checklist" title="What we need from you" sub="Having these key foundational pieces ready will accelerate your kickoff timeline.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.requirements.map((r) => (
              <Card key={r.title} className="p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-red-500"><FiCheckCircle /></span>
                <h3 className="mt-4 text-sm font-bold uppercase tracking-wide">{r.title}</h3>
                {r.body && <p className="mt-2 text-xs leading-relaxed text-white/50">{r.body}</p>}
              </Card>
            ))}
          </div>
        </Section>
      )}

      {c.assurance && (
        <section className="py-10">
          <div className="mx-auto max-w-7xl px-5">
            <Card className="flex gap-4 p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-600/15 text-xl text-red-500"><FiShield /></span>
              <div>
                <h3 className="text-lg font-bold">{c.assurance.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{c.assurance.body}</p>
              </div>
            </Card>
          </div>
        </section>
      )}

      {c.downloads?.length > 0 && (
        <section className="py-6">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-5">
            {c.downloads.map((d) => (
              <a key={d.url} href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md border border-white/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white/75 hover:border-white/30">
                <FiDownload /> {d.label}
              </a>
            ))}
          </div>
        </section>
      )}

      {turnkey && <Engine />}

      {/* closing CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5">
          <Card className="bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.16),#161616_60%)] p-8 sm:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className={`${mono} text-red-400`}>Commence production</p>
                <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">{c.cta?.heading ?? `Ready to start with ${s.name}?`}</h2>
                {c.cta?.body && <p className="mt-3 text-sm leading-relaxed text-white/60">{c.cta.body}</p>}
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/70">
                  {phone && <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2"><FiPhone className="text-red-500" /> {phone}</a>}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2"><FiMail className="text-red-500" /> {CONTACT_EMAIL}</a>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-3">
                <Btn onClick={requestNow} disabled={busy} arrow>Request this service</Btn>
                <PackageBtn />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* next steps */}
      {(s.prev || s.next) ? (
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-5">
            <p className={`${mono} mb-4 text-white/40`}>Pipeline sequence</p>
            <div className="grid gap-4 md:grid-cols-2">
              {s.prev ? <MiniCard s={s.prev} label="← Previous service" /> : <span />}
              {s.next && <MiniCard s={s.next} label="Next service →" />}
            </div>
          </div>
        </section>
      ) : s.related?.length > 0 && (
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-5">
            <p className={`${mono} mb-4 text-white/40`}>{turnkey ? 'Looking for specific stages instead?' : 'Related services'}</p>
            <div className={`grid gap-4 md:grid-cols-2 ${turnkey ? 'lg:grid-cols-4' : ''}`}>
              {s.related.map((r) => <MiniCard key={r.id} s={r} label="Service" />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

// The live page wins. Built-in content is used only when the API is unreachable or the whole
// catalogue is empty, so a service the admin has hidden never comes back.
async function loadService(slug) {
  try {
    return await P.getService(slug);
  } catch (e) {
    const def = getDefaultService(slug);
    if (!def) throw e;
    if (e?.response?.status === 404) {
      const cat = await P.getServices().catch(() => null);
      const liveCount = cat ? cat.stages.reduce((n, g) => n + g.services.length, 0) + (cat.turnkey ? 1 : 0) : 0;
      if (liveCount > 0) throw e;
    }
    return def;
  }
}

export default function ProductionServiceDetail() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useProdData(() => loadService(slug), [slug]);
  usePageTitle(data ? `${data.name} | Stonovah Production` : undefined);

  if (loading) return <Loading />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <ErrorBox message={error ?? 'Service not found'} onRetry={reload} />
        <Link to="/production/services" className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:text-white"><FiArrowLeft /> Back to services</Link>
      </div>
    );
  }
  return <Detail key={data.id} s={data} />;
}