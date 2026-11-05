import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import * as P from '../../api/production';
import { STAGE_NO, useProdData, usePageTitle } from './ProdLive';
import { Breadcrumb, Btn, Card, Icon, Reveal } from './ProdUi';

const STAGE_NAV = [
  { stage: 'DEVELOP', no: '01', label: 'Develop', sub: 'Script & IP Blueprint' },
  { stage: 'PREPARE', no: '02', label: 'Prepare', sub: 'Breakdowns & Casting' },
  { stage: 'SHOOT', no: '03', label: 'Shoot', sub: 'Principal Photography' },
  { stage: 'FINISH', no: '04', label: 'Finish', sub: 'Atmos & Color Master' },
  { stage: 'RELEASE', no: '05', label: 'Release', sub: 'DCP & Worldwide QC' },
];
const CODE = { DEVELOP: 'DEV', PREPARE: 'PRE', SHOOT: 'SHOOT', FINISH: 'POST', RELEASE: 'REL', CROSS: 'ALL' };
const ORDER = ['DEVELOP', 'PREPARE', 'SHOOT', 'FINISH', 'RELEASE', 'CROSS'];

const STAGE_INFO = {
  DEVELOP: { title: 'Development & Narrative Design', blurb: 'Foundational IP • Script architecture' },
  PREPARE: { title: 'Preparation & Talent Attachment', blurb: 'Crew rosters • Shoot logistics' },
  SHOOT: { title: 'Shooting & Soundstage Execution', blurb: 'Line management • Certified hardware' },
  FINISH: { title: 'Post-Production & Finishing', blurb: 'Color suites • Dolby Atmos' },
  RELEASE: { title: 'Release Readiness & Screening', blurb: 'Broadcast masters • Screener suites' },
  CROSS: { title: 'Cross-Cutting Executive Infrastructure', blurb: 'Legal • Financing • Global compliance' },
};

// The standard catalogue from the design. Shown whenever the live catalogue is empty or unreachable.
const DEFAULT_SERVICES = [
  { slug: 'script-development', name: 'Script Development', stage: 'DEVELOP', iconKey: 'file-text', shortDescription: 'Screenplay coverage, treatment polishing, story bible creation, and production-ready script locks.' },
  { slug: 'pre-production-planning', name: 'Pre-Production Planning', stage: 'PREPARE', iconKey: 'calendar', shortDescription: 'Comprehensive scene breakdowns, shooting schedules, location scouting logistics, and department budgets.' },
  { slug: 'crew-cast-sourcing', name: 'Crew & Cast Sourcing', stage: 'PREPARE', iconKey: 'users', shortDescription: 'Guild casting calls, director of photography attachment, key department heads, and vetted local production fixers.' },
  { slug: 'equipment-locations-studio', name: 'Equipment, Locations & Studio', stage: 'SHOOT', iconKey: 'video', shortDescription: 'High-spec Arri/RED camera kits, certified acoustic soundstages, private location clearances, and grip trucks.' },
  { slug: 'production-management', name: 'Production Management', stage: 'SHOOT', iconKey: 'clipboard', shortDescription: 'On-set line production oversight, daily call sheets, union compliance, guild catering, and real-time contingency logs.' },
  { slug: 'post-production', name: 'Post-Production', stage: 'FINISH', iconKey: 'sliders', shortDescription: 'Offline editorial assemblies, Dolby Atmos theatrical audio mixing, 4K HDR color mastering, and visual effects finishing.' },
  { slug: 'release-readiness', name: 'Release Readiness', stage: 'RELEASE', iconKey: 'award', shortDescription: 'DCI-compliant DCP cinema masters, festival screener packages, broadcast network QC, and delivery deliverables.' },
  { slug: 'legal-clearances-insurance', name: 'Legal, Clearances & Insurance', stage: 'CROSS', iconKey: 'shield', shortDescription: 'Chain of title verification, music synchronization licensing, production insurance policies, and actor waivers.' },
  { slug: 'funding-pitch-materials', name: 'Funding & Pitch Materials', stage: 'CROSS', iconKey: 'dollar-sign', shortDescription: 'Investor-ready pitch decks, financial waterfall projections, co-production tax incentives, and grant filings.' },
].map((s) => ({ ...s, id: `default-${s.slug}` }));

const DEFAULT_TURNKEY = {
  slug: 'full-production',
  name: 'Full Production Packaging',
  badge: 'Prime executive tier',
  shortDescription: "One unified team, one coordinated production plan, from initial writer's room treatments to final worldwide premiere and theatrical distribution.",
};

function groupStages(services) {
  return ORDER.map((stage) => ({ stage, ...STAGE_INFO[stage], services: services.filter((s) => s.stage === stage) })).filter((g) => g.services.length > 0);
}

export default function ProductionServices() {
  usePageTitle('Production Services Catalog | Stonovah Creative House');
  const { data, error } = useProdData(() => P.getServices(), []);
  const [params] = useSearchParams();
  const want = (params.get('stage') || '').toUpperCase();

  // Live catalogue wins as soon as it has anything in it, so admin changes show up.
  const liveCount = (data?.stages ?? []).reduce((n, s) => n + s.services.length, 0);
  const live = liveCount > 0;
  const turnkey = live ? data.turnkey : data?.turnkey ?? DEFAULT_TURNKEY;
  const stages = live ? data.stages : groupStages(DEFAULT_SERVICES);
  const moduleCount = stages.reduce((n, s) => n + s.services.length, 0);

  const go = (stage) => document.getElementById(`stage-${stage}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  useEffect(() => {
    if (!want) return;
    const t = setTimeout(() => go(want), 250);
    return () => clearTimeout(t);
  }, [want, live]);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-6">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Production', to: '/production' }, { label: 'Services' }]} />

      <div className="mt-10">
        <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Stonovah production services directory
        </span>
        <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">Production Services Catalog</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">Choose end-to-end management or pick individual services to integrate directly into your production pipeline.</p>
        {error && !live && <p className="mt-3 text-xs text-white/40">Showing the standard catalogue. Live updates are unavailable right now.</p>}
      </div>

      {/* stage architecture */}
      <div className="mt-12">
        <div className="mb-3 flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
          <span>Script-to-screen stage architecture</span>
          <span className="hidden sm:inline">Click a stage to navigate pipeline</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {STAGE_NAV.map((s) => (
            <button key={s.stage} onClick={() => go(s.stage)} className="rounded-lg border border-white/[0.07] bg-[#161616] p-4 text-left transition-colors hover:border-white/25">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">{s.no} // {s.label.toUpperCase()}</p>
              <p className="mt-2 text-lg font-bold">{s.label}</p>
              <p className="mt-0.5 text-xs text-white/50">{s.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* turnkey banner */}
      {turnkey && (
        <Reveal className="mt-8">
          <Card className="border-t-2 border-t-red-600 bg-[linear-gradient(135deg,#240607,#161616_55%)] p-7">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.16em]">
              <span className="rounded bg-red-600/20 px-2 py-1 text-red-400">Turnkey end-to-end suite</span>
              {turnkey.badge && <span className="text-white/50">• {turnkey.badge}</span>}
            </div>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tight">{turnkey.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{turnkey.shortDescription}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Dedicated Executive Producer', 'Cross-Disciplinary Roster', moduleCount > 0 && `${moduleCount} modular units`, turnkey.leadTimeLabel]
                    .filter(Boolean)
                    .map((chip) => (
                      <span key={chip} className="flex items-center gap-2 rounded bg-white/[0.05] px-3 py-1.5 text-[11px] text-white/70"><FiCheckCircle className="text-red-500" /> {chip}</span>
                    ))}
                </div>
              </div>
              <Btn to={`/production/services/${turnkey.slug}`} arrow className="shrink-0">Explore Full Production Packaging</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      {/* two paths */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Link to={`/production/services/${turnkey?.slug ?? 'full-production'}`} className="flex items-center justify-between rounded-xl bg-[#e10613] p-5 transition-colors hover:bg-[#c40510]">
          <div>
            <p className="text-lg font-bold">Get the Full Package</p>
            <p className="text-xs text-white/80">Turnkey execution with complete team</p>
          </div>
          <FiArrowRight className="text-xl" />
        </Link>
        <Link to="/production/build-package" className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#161616] p-5 transition-colors hover:border-white/25">
          <div>
            <p className="text-lg font-bold">Choose What You Need</p>
            <p className="text-xs text-white/55">Build custom package from individual services</p>
          </div>
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">Configure <FiArrowRight /></span>
        </Link>
      </div>

      {/* stage sections */}
      {stages.map((s) => (
        <section key={s.stage} id={`stage-${s.stage}`} className="mt-14 scroll-mt-24">
          <div className="flex flex-col gap-2 rounded-lg bg-white/[0.04] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded bg-black/60 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/60">
                {s.stage === 'CROSS' ? 'All stages' : `Stage 0${STAGE_NO[s.stage]}`}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide sm:text-base">{s.title}</h2>
            </div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{s.blurb}</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {s.services.map((sv, i) => (
              <Reveal key={sv.id} delay={i * 0.05}>
                <Link to={`/production/services/${sv.slug}`} className="group flex h-full flex-col rounded-xl border border-white/[0.07] bg-[#161616] p-6 transition-colors hover:border-white/25">
                  <div className="flex items-start justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-red-500"><Icon name={sv.iconKey} /></span>
                    <span className="font-mono text-[9px] font-bold tracking-[0.14em] text-white/35">{CODE[s.stage]}-{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{sv.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{sv.shortDescription}</p>
                  <p className="mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/80 group-hover:text-white">Learn more <FiArrowRight className="text-red-500" /></p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}