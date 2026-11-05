import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowRight, FiFilm, FiLayers } from 'react-icons/fi';
import * as P from '../../api/production';
import { useProduction } from './ProductionContext';
import { FORMAT_LABEL, STAGE_NO, useProdData, usePageTitle } from './ProdLive';
import { Breadcrumb, Btn, Card, Chip, ErrorBox, Eyebrow, Icon, Loading, Reveal } from './ProdUi';
import { getDefaultType } from './prodDefaults';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';
const STAGE_WORD = { DEVELOP: 'Develop', PREPARE: 'Prepare', SHOOT: 'Shoot', FINISH: 'Finish', RELEASE: 'Release', CROSS: 'All stages' };

function Page({ t }) {
  const navigate = useNavigate();
  const { types, updatePackage } = useProduction();
  const c = t.content ?? {};
  const focus = c.primaryFocus;
  const others = types.filter((x) => x.slug !== t.slug && x.content?.primaryFocus);

  const build = async () => {
    const p = await updatePackage({ category: t.formats[0] }); // preselects this format in the builder
    if (p) navigate('/production/build-package');
  };

  return (
    <>
      <section className="border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.16),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-6">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Production', to: '/production' }, { label: t.name }]} />
          <p className={`${mono} mt-12 text-white/50`}>Project type // {c.code ?? '00'} {t.summary}</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">{c.heroTitle ?? `${t.name} Production Packaging`}</h1>
          {c.heroSubtitle && <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">{c.heroSubtitle}</p>}
        </div>
      </section>

      {/* matrix switcher */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-5">
          <Card className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className={`${mono} text-white/45`}>Production matrix switcher</p>
                <p className="mt-1 text-xs text-white/50">Switch project paradigms or review the differences between them.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {types.map((x) => (
                  <Link key={x.slug} to={`/production/types/${x.slug}`}
                    className={`rounded-md px-4 py-2 text-[11px] font-bold transition-colors ${x.slug === t.slug ? 'bg-[#e10613] text-white' : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25'}`}>
                    {x.name}{x.slug === t.slug ? ' (Active)' : ''}
                  </Link>
                ))}
              </div>
            </div>

            {focus && (
              <div className="mt-6 flex flex-col gap-4 rounded-lg bg-black/40 p-5 sm:flex-row sm:items-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-600/15 text-xl text-red-500"><FiFilm /></span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold">Primary Focus: {focus.title}</h2>
                    <span className="rounded bg-red-600 px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em]">IN SCOPE</span>
                  </div>
                  <p className="mt-1 text-sm text-white/55">{focus.description}</p>
                </div>
                {focus.runtimeLabel && (
                  <div className="shrink-0 text-right">
                    <p className={`${mono} text-white/40`}>Runtime coverage</p>
                    <p className="mt-1 rounded bg-white/[0.06] px-3 py-1.5 text-xs font-bold">{focus.runtimeLabel}</p>
                  </div>
                )}
              </div>
            )}

            {others.length > 0 && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {others.map((o) => (
                  <div key={o.slug} className="rounded-lg border-l-2 border-red-600/50 bg-black/30 p-4">
                    <p className={`${mono} text-white/45`}>{o.name} variant note</p>
                    <p className="mt-2 text-sm font-semibold">{o.content.primaryFocus.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">{o.content.primaryFocus.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Btn onClick={build} arrow>Build your package for {t.name}</Btn>
              <Btn to="/production/services/full-production" variant="dark"><FiLayers /> Request full packaging</Btn>
            </div>
          </Card>
        </div>
      </section>

      {/* services */}
      {t.services.length > 0 && (
        <section className="bg-[#0d0d0d] py-16">
          <div className="mx-auto max-w-7xl px-5">
            <Eyebrow>Execution breakdown</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Services Most Often Needed for {t.name}</h2>
            <p className="mt-3 max-w-2xl text-sm text-white/55">Deploy full department packages or commission individual components tailored to your project.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {t.services.map((sv, i) => (
                <Reveal key={sv.id} delay={i * 0.04}>
                  <Link to={`/production/services/${sv.slug}`} className="group flex h-full flex-col rounded-xl border border-white/[0.07] bg-[#161616] p-6 hover:border-white/25">
                    <div className="flex items-center justify-between">
                      <span className={`${mono} text-white/45`}>{STAGE_WORD[sv.stage]}</span>
                      <span className={`${mono} text-white/35`}>{sv.stage === 'CROSS' ? 'All stages' : `Stage 0${STAGE_NO[sv.stage]}`}</span>
                    </div>
                    <span className="mt-5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-red-500"><Icon name={sv.iconKey} /></span>
                    <h3 className="mt-4 text-lg font-bold">{sv.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{sv.shortDescription}</p>
                    <p className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-red-400">View service details <FiArrowRight /></p>
                  </Link>
                </Reveal>
              ))}
            </div>

            {c.lifecycle?.phases?.length > 0 && (
              <Card className="mt-6 p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="lg:w-1/3">
                    <p className={`${mono} text-red-400`}>Workflow cadence</p>
                    <h3 className="mt-2 text-xl font-bold">{c.lifecycle.title}</h3>
                  </div>
                  <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                    {c.lifecycle.phases.map((p, i) => (
                      <div key={p.label}>
                        <div className="rounded bg-white/[0.04] px-3 py-3 text-center">
                          <p className="font-mono text-[9px] text-white/40">{p.weeks}</p>
                          <p className="mt-1 text-xs font-bold">{p.label}</p>
                        </div>
                        <div className={`mt-1.5 h-1 rounded-full ${i === c.lifecycle.phases.length - 1 ? 'bg-white/30' : 'bg-[#e10613]'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* case studies (hidden until something is published) */}
      {t.featured.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex items-end justify-between">
              <div>
                <Eyebrow>Proven portfolio track record</Eyebrow>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Sample {t.name} Productions</h2>
              </div>
              <Link to="/production/projects" className="hidden items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 sm:flex">Browse full archive <FiArrowRight /></Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {t.featured.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.05}>
                  <Link to={`/production/projects/${p.slug}`} className="group block overflow-hidden rounded-xl border border-white/[0.07] bg-[#161616] hover:border-white/20">
                    <div className="relative h-52 bg-[linear-gradient(135deg,#2a0508,#0f0f0f_70%)]">
                      {p.coverUrl && <img src={p.coverUrl} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />}
                      <Chip className="absolute left-3 top-3">{[FORMAT_LABEL[p.format], p.categoryTag].filter(Boolean).join(' // ')}</Chip>
                    </div>
                    <div className="p-5">
                      <p className={`${mono} text-white/40`}>{[p.runtimeLabel, p.location].filter(Boolean).join(' • ')}</p>
                      <h3 className="mt-2 text-xl font-bold">{p.title}</h3>
                      {p.logline && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/55">{p.logline}</p>}
                      {p.highlight && <p className="mt-3 text-[11px] font-semibold text-red-400">{p.highlight}</p>}
                      <p className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/75 group-hover:text-white">View project case study <FiArrowRight className="text-red-500" /></p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* closing CTA */}
      <section className="pb-24 pt-6">
        <div className="mx-auto max-w-5xl px-5">
          <Card className="bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.16),#161616_60%)] p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className={`${mono} text-red-400`}>Interactive estimator</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Ready to package your {t.name} project?</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/60">Launch the package builder with {t.name} preselected. Choose your departments and request a tailored proposal.</p>
              </div>
              <Btn onClick={build} arrow className="shrink-0">Build your {t.name} package now</Btn>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
export default function ProductionTypePage() {
  const { slug } = useParams();
  const { data: t, loading, error, reload } = useProdData(() => P.getProjectType(slug), [slug]);
  usePageTitle(t ? `${t.name} Production | Stonovah` : undefined);

  if (loading) return <Loading />;
  if (error) return <div className="mx-auto max-w-3xl px-5 py-24"><ErrorBox message={error} onRetry={reload} /></div>;
  if (!t) return null;
  return <Page t={t} />;
}
