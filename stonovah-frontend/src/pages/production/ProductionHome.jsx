import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiCheckCircle, FiFilm, FiPlus, FiMinus, FiClock, FiPhone, FiMail, FiGrid,
  FiFileText, FiLayers, FiVideo, FiSliders, FiGlobe, FiUsers, FiBriefcase, FiVolume2, FiStar,
} from 'react-icons/fi';
import * as P from '../../api/production';
import { useProduction } from './ProductionContext';
import { CONTACT_EMAIL, FORMAT_LABEL, useProdData, usePageTitle } from './ProdLive';
import { Btn, Breadcrumb, Card, Chip, EmptyState, ErrorBox, Loading, Reveal, SectionHead } from './ProdUi';

/* ------------------------------------------------------------------ */
/* Static content from the design                                      */
/* ------------------------------------------------------------------ */

const HERO = {
  eyebrow: 'Stonovah Production Arm // Script to Screen',
  headline: 'From script to screen',
  subtext: 'We help independent filmmakers, production studios and global brands package and execute Film, TV and Commercial projects from concept to final delivery.',
  primaryCtaLabel: 'Get the Full Package',
  secondaryCtaLabel: 'Choose What You Need',
  stats: [
    { label: 'Format capabilities', value: 'Arri RAW • Venice 4K' },
    { label: 'Turnaround SLA', value: '24hr Packaging Quote' },
    { label: 'Production scope', value: 'Pan-African & Global' },
    { label: 'Master deliverables', value: 'DCP • Netflix IMF Master' },
  ],
};

// To use a real photo on a card, add imageUrl: '/images/production/film.jpg' to its entry.
const TYPES = [
  { slug: 'film', art: 'film', name: 'Film', tag: 'Feature & Independent', summary: 'Short & Feature Films, Documentaries.' },
  { slug: 'tv', art: 'tv', name: 'TV', tag: 'Broadcast & Streaming', summary: 'Web & Television Series, Television Shows.' },
  { slug: 'commercials', art: 'lens', name: 'Commercials', tag: 'Branded Entertainment', summary: 'Adverts and brand films.' },
];

const STAGES = [
  { no: 1, label: 'Script Development', blurb: 'Story bible, screenplay doctoring, and treatment polishing.', link: 'Service profile', to: '/production/services?stage=DEVELOP', icon: FiFileText },
  { no: 2, label: 'Pre-Production', blurb: 'Budget breakdowns, casting calls, and key crew assembly.', link: 'Dual packaging', to: '/production/services?stage=PREPARE', icon: FiLayers },
  { no: 3, label: 'Shoot Execution', blurb: 'Soundstage clearance, camera packages, and principal photography.', link: 'Studio & crew', to: '/production/services?stage=SHOOT', icon: FiVideo },
  { no: 4, label: 'Post-Production', blurb: 'Editorial assembly, Dolby Atmos audio mix, and 4K color grading.', link: 'Finishing suite', to: '/production/services?stage=FINISH', icon: FiSliders },
  { no: 5, label: 'Release Readiness', blurb: 'DCP mastering, censor board classification, and distribution slates.', link: 'Distribution ready', to: '/production/services?stage=RELEASE', icon: FiGlobe },
];

const PATHWAYS = [
  {
    key: 'full', badge: 'Turnkey end-to-end', title: 'Full Package',
    subtitle: 'One team, one plan, from idea to finished film. We manage every phase from writer room to world premiere.',
    bullets: ['Executive producer supervision across all production nodes', 'Consolidated fiscal transparency & line-item milestone billing'],
    buttonLabel: 'Explore Full Production Packaging', buttonHref: '/production/services/full-production',
  },
  {
    key: 'alacarte', badge: 'Modular & a la carte', title: 'Choose What You Need',
    subtitle: 'Pick only the services you want. Plug Stonovah into any stage of your existing film or commercial pipeline.',
    bullets: ['Flexible deployment for soundstage, cast sourcing, or post suite', 'Dynamic interactive package builder with live rate estimates'],
    buttonLabel: 'Build Your Package', buttonHref: '/production/build-package',
  },
];

const SEGMENTS = [
  { key: 'indie', icon: FiFilm, tag: 'Indie & Emerging', name: 'Individuals & First-Time Filmmakers', positioning: 'Guidance through maiden features, short film grant projects, and debut directing reels with industry-standard packaging.', focusArea: 'Development, Grant Applications & Indie Crew' },
  { key: 'companies', icon: FiBriefcase, tag: 'Studios & Co-Producers', name: 'Production Companies', positioning: 'Co-production infrastructure, local Nigerian & African line production, equipment rental, and soundstage management.', focusArea: 'Line Production, Soundstages & Kit Packages' },
  { key: 'brands', icon: FiVolume2, tag: 'Enterprise & Advertising', name: 'Brands & Agencies', positioning: 'High-impact television commercials, narrative branded content, and product launch films executed under tight broadcast turnarounds.', focusArea: 'Commercials, Brand Docs & Rapid Turnaround' },
];

const INTAKE = { sla: 'Responds within 24 business hours', phone: '+234 913 819 7974' };

/* ------------------------------------------------------------------ */

function Hero({ hero }) {
  const h = { ...HERO, ...(hero ?? {}) };
  const stats = h.stats?.length ? h.stats : HERO.stats;
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.18),transparent_55%)]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-6">
        <div className="flex items-center justify-between">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Production' }]} />
          <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Studio active
          </span>
        </div>
        <div className="mt-14 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {h.eyebrow}
          </span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
            {h.headline}
          </motion.h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65">{h.subtext}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Btn to="/production/services/full-production" arrow>{h.primaryCtaLabel}</Btn>
            <Btn to="/production/build-package" variant="dark">{h.secondaryCtaLabel} <FiGrid className="text-sm text-white/60" /></Btn>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{s.label}</p>
              <p className="mt-2 text-sm font-semibold">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Inline SVG covers, so the cards never depend on image files or an API.
function TypeArt({ kind }) {
  return (
    <svg viewBox="0 0 400 176" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a060b" />
          <stop offset="0.6" stopColor="#140a0b" />
          <stop offset="1" stopColor="#0a0a0a" />
        </linearGradient>
        <radialGradient id={`glow-${kind}`} cx="0.75" cy="0.35" r="0.6">
          <stop offset="0" stopColor="#e10613" stopOpacity="0.45" />
          <stop offset="1" stopColor="#e10613" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="176" fill={`url(#bg-${kind})`} />
      <rect width="400" height="176" fill={`url(#glow-${kind})`} />

      {kind === 'film' && (
        <g>
          <g transform="rotate(-8 200 88)" fill="none" stroke="#fff" strokeOpacity="0.14">
            <rect x="-20" y="62" width="460" height="52" fill="#000" fillOpacity="0.35" />
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={i}>
                <rect x={i * 30 - 6} y="67" width="12" height="8" rx="2" fill="#fff" fillOpacity="0.12" stroke="none" />
                <rect x={i * 30 - 6} y="101" width="12" height="8" rx="2" fill="#fff" fillOpacity="0.12" stroke="none" />
                <rect x={i * 30 + 6} y="79" width="18" height="18" strokeOpacity="0.1" />
              </g>
            ))}
          </g>
          <g transform="translate(250 28) rotate(-6)">
            <rect x="0" y="22" width="110" height="78" rx="6" fill="#111" stroke="#fff" strokeOpacity="0.25" />
            <rect x="0" y="0" width="110" height="20" rx="4" fill="#e10613" fillOpacity="0.9" />
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} d={`M${8 + i * 22} 0 l12 0 l-10 20 l-12 0z`} fill="#0a0a0a" />
            ))}
            <rect x="10" y="38" width="60" height="5" rx="2" fill="#fff" fillOpacity="0.25" />
            <rect x="10" y="52" width="86" height="5" rx="2" fill="#fff" fillOpacity="0.15" />
            <rect x="10" y="66" width="46" height="5" rx="2" fill="#fff" fillOpacity="0.15" />
          </g>
        </g>
      )}

      {kind === 'tv' && (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M0 ${30 + i * 24} Q100 ${10 + i * 24} 200 ${30 + i * 24} T400 ${30 + i * 24}`} fill="none" stroke="#fff" strokeOpacity="0.05" />
          ))}
          <g transform="translate(205 22)">
            <rect x="0" y="0" width="150" height="96" rx="8" fill="#0b0b0b" stroke="#fff" strokeOpacity="0.28" strokeWidth="2" />
            <rect x="8" y="8" width="134" height="80" rx="3" fill="#1a0507" />
            <rect x="8" y="8" width="134" height="80" rx="3" fill="#e10613" fillOpacity="0.12" />
            {['#fff', '#e10613', '#888', '#444', '#fff', '#a00'].map((c, i) => (
              <rect key={i} x={14 + i * 21} y="14" width="19" height="20" fill={c} fillOpacity="0.35" />
            ))}
            <circle cx="75" cy="62" r="14" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
            <path d="M71 55 l12 7 -12 7z" fill="#fff" fillOpacity="0.75" />
            <rect x="60" y="100" width="30" height="8" fill="#222" />
            <rect x="42" y="108" width="66" height="5" rx="2" fill="#2a2a2a" />
          </g>
          <circle cx="62" cy="52" r="5" fill="#e10613" />
          <rect x="74" y="49" width="46" height="6" rx="3" fill="#fff" fillOpacity="0.25" />
        </g>
      )}

      {kind === 'lens' && (
        <g transform="translate(290 88)">
          {[78, 62, 46, 30].map((r, i) => (
            <circle key={r} r={r} fill={i === 3 ? '#050505' : 'none'} stroke="#fff" strokeOpacity={0.12 + i * 0.07} strokeWidth="2" />
          ))}
          <circle r="16" fill="#e10613" fillOpacity="0.55" />
          <circle cx="-8" cy="-8" r="5" fill="#fff" fillOpacity="0.5" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={i} x1="0" y1="-78" x2="0" y2="-70" stroke="#fff" strokeOpacity="0.25" transform={`rotate(${i * 15})`} />
          ))}
          <g transform="translate(-250 -20)" fill="#fff" fillOpacity="0.08">
            <rect width="90" height="8" rx="4" />
            <rect y="16" width="60" height="8" rx="4" />
            <rect y="32" width="75" height="8" rx="4" />
          </g>
        </g>
      )}
    </svg>
  );
}

function ProjectTypes() {
  return (
    <section className="bg-[#0d0d0d] py-20">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHead eyebrow="Execution slates" title="By Project Type" sub="Disciplined production infrastructure mapped specifically to narrative cinematic features, episodic television and high-impact commercial campaigns." />
        <div className="grid gap-5 md:grid-cols-3">
          {TYPES.map((t, i) => (
            <Reveal key={t.slug} delay={i * 0.06}>
              <Link to={`/production/types/${t.slug}`} className="group block overflow-hidden rounded-xl border border-white/[0.07] bg-[#161616] transition-colors hover:border-white/20">
                <div className="relative h-44 overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                    {t.imageUrl
                      ? <img src={t.imageUrl} alt="" className="h-full w-full object-cover opacity-80" loading="lazy" />
                      : <TypeArt kind={t.art} />}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent" />
                  <Chip className="absolute left-3 top-3">{t.tag}</Chip>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold">{t.name}</h3>
                  <p className="mt-2 text-sm text-white/55">{t.summary}</p>
                  <p className="mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/80 group-hover:text-white">
                    Explore {t.name} Production <FiArrowRight className="text-red-500" />
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pipeline() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHead eyebrow="Workflow architecture" title="Script to Screen Pipeline" sub="Five cohesive milestones engineered to systematically transition initial creative treatments into festival-grade and broadcast-ready digital packages." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((s, i) => {
            const StageIcon = s.icon;
            return (
              <Reveal key={s.no} delay={i * 0.05}>
                <Card className="flex h-full flex-col p-5">
                  <div className="flex items-center justify-between font-mono text-[10px] text-white/40">
                    <span>0{s.no}</span>
                    <StageIcon className="text-red-500" />
                  </div>
                  <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">Stage 0{s.no}</p>
                  <h3 className="mt-1 text-lg font-bold">{s.label}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{s.blurb}</p>
                  <div className="mt-auto border-t border-white/5 pt-4">
                    <Link to={s.to} className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/80 hover:text-white">
                      {s.link} <FiArrowRight className="shrink-0 text-white/40" />
                    </Link>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Pathways({ pathways }) {
  const list = pathways?.length ? pathways : PATHWAYS;
  return (
    <section className="bg-[#0d0d0d] py-20">
      <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-2">
        {list.map((p, i) => (
          <Reveal key={p.key} delay={i * 0.08}>
            <Card className={`flex h-full flex-col p-8 ${i === 0 ? 'bg-[linear-gradient(135deg,#240607,#161616_60%)]' : ''}`}>
              <div className="flex items-start justify-between">
                {p.badge && <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">{p.badge}</p>}
                {i === 0 ? <FiCheckCircle className="text-red-500" /> : <FiGrid className="text-red-500" />}
              </div>
              <h3 className="mt-4 text-4xl font-bold tracking-tight">{p.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/60">{p.subtitle}</p>
              <ul className="mt-6 space-y-3">
                {p.bullets?.map((b) => (
                  <li key={b} className="flex gap-3 text-xs text-white/65"><FiCheckCircle className="mt-0.5 shrink-0 text-red-500" />{b}</li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <Btn to={p.buttonHref} variant={i === 0 ? 'primary' : 'ghost'} arrow className={`w-full justify-between ${i !== 0 ? 'border-red-500/40' : ''}`}>
                  {p.buttonLabel}
                </Btn>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Segments({ segments }) {
  const list = segments?.length ? segments : SEGMENTS;
  return (
    <section id="who-we-work-with" className="py-20">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHead eyebrow="Partnership ecosystem" title="Who We Work With" sub="Delivering specialized production backing across different levels of scale, commercial stakes, and creative ambition." />
        <div className="grid gap-5 md:grid-cols-3">
          {list.map((s, i) => {
            const SegIcon = s.icon ?? FiUsers;
            return (
              <Reveal key={s.key} delay={i * 0.06}>
                <Card className="h-full p-6">
                  <div className="flex items-center justify-between">
                    <SegIcon className="text-2xl text-red-500" />
                    {s.tag && <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/50">{s.tag}</span>}
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{s.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{s.positioning}</p>
                  {s.focusArea && (
                    <div className="mt-6 border-t border-white/5 pt-4">
                      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">Focus area</p>
                      <p className="mt-1 text-xs text-white/75">{s.focusArea}</p>
                    </div>
                  )}
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// The only API-driven section: loading, error, empty state, then cards.
function Featured() {
  const { data, loading, error, reload } = useProdData(() => P.getPastProductions({ limit: 3 }), []);
  const items = data?.data ?? [];
  return (
    <section className="bg-[#0d0d0d] py-20">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHead eyebrow="Portfolio showcase" title="Featured Productions"
          right={<Link to="/production/projects" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300">View all case studies <FiArrowRight /></Link>} />
        {loading ? <Loading />
          : error ? <ErrorBox message={error} onRetry={reload} />
          : !items.length ? (
            <EmptyState
              icon={FiStar}
              title="No productions published yet"
              message="Case studies from our completed films, series and commercials will be featured here."
              action={<Btn to="/production/request" variant="ghost" arrow>Start your project</Btn>}
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {items.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.06}>
                  <Link to={`/production/projects/${p.slug}`} className="group block overflow-hidden rounded-xl border border-white/[0.07] bg-[#161616] hover:border-white/20">
                    <div className="relative h-52 bg-[linear-gradient(135deg,#2a0508,#0f0f0f_70%)]">
                      {p.coverUrl && <img src={p.coverUrl} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />}
                      <Chip className="absolute left-3 top-3">{[FORMAT_LABEL[p.format], p.categoryTag].filter(Boolean).join(' // ')}</Chip>
                    </div>
                    <div className="p-5">
                      {p.highlight && <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-red-400">{p.highlight}</p>}
                      <h3 className="mt-2 text-xl font-bold">{p.title}</h3>
                      {p.logline && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/55">{p.logline}</p>}
                      <p className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/75 group-hover:text-white">
                        View project case study <FiArrowRight className="text-red-500" />
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
      </div>
    </section>
  );
}

function Faqs() {
  const { data } = useProdData(() => P.getFaqs(), []);
  const [open, setOpen] = useState(0);
  if (!data?.length) return null; // not in the design, so hidden when empty
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHead eyebrow="Questions" title="Frequently Asked" />
        <div className="space-y-3">
          {data.map((f, i) => (
            <Card key={f.id} className="overflow-hidden">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                <span className="text-sm font-semibold">{f.question}</span>
                {open === i ? <FiMinus className="shrink-0 text-red-500" /> : <FiPlus className="shrink-0 text-white/50" />}
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-white/60">{f.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntakeCta() {
  const { options } = useProduction();
  const sla = options?.sla?.reviewHours
    ? `Responds within ${options.sla.reviewHours} business hours`
    : options?.sla?.reviewDays
      ? `Responds within ${options.sla.reviewDays} business days`
      : INTAKE.sla;
  const phone = options?.hotlinePhone ?? INTAKE.phone;
  return (
    <section className="border-t border-white/5 bg-[radial-gradient(ellipse_at_bottom,rgba(225,6,19,0.14),transparent_60%)] py-24">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Intake desk online
        </span>
        <h2 className="mt-6 text-4xl font-black uppercase leading-tight tracking-tight sm:text-6xl">Tell us about your project</h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60">Whether you have a completed screenplay ready for production, or simply need crew and equipment for an upcoming shoot, let our team build your production roadmap.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn to="/production/request" arrow>Request a Production Service</Btn>
          <Btn to="/production/build-package" variant="ghost">Or Build Your Package Step-by-Step</Btn>
        </div>
        <div className="mt-14 grid gap-6 border-t border-white/10 pt-8 text-left sm:grid-cols-3">
          <div className="flex gap-3"><FiClock className="mt-1 text-red-500" /><div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">Intake SLA</p><p className="mt-1 text-xs text-white/75">{sla}</p></div></div>
          <div className="flex gap-3"><FiPhone className="mt-1 text-red-500" /><div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">Production hotline</p><a href={`tel:${phone.replace(/\s/g, '')}`} className="mt-1 block text-xs text-white/75">{phone}</a></div></div>
          <div className="flex gap-3"><FiMail className="mt-1 text-red-500" /><div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">Official dispatch</p><a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 block break-all text-xs text-white/75">{CONTACT_EMAIL}</a></div></div>
        </div>
      </div>
    </section>
  );
}

export default function ProductionHome() {
  const { data: content } = useProdData(() => P.getContent(), []);
  usePageTitle(content?.seo?.title);
  return (
    <>
      <Hero hero={content?.hero} />
      <ProjectTypes />
      <Pipeline />
      <Pathways pathways={content?.pathways} />
      <Segments segments={content?.segments} />
      <Featured />
      <Faqs />
      <IntakeCta />
    </>
  );
}