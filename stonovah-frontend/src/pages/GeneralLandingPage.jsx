import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiVideo, FiMusic, FiUsers, FiGlobe, FiBookOpen, FiCalendar, FiCompass, FiArrowRight,
} from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';

const arms = [
  { code: '01 / PROD', title: 'Production', icon: FiVideo, tag: 'Studio spec / record', desc: 'High-end audio/visual execution, commercial direction, multi-cam broadcast rigging, and mastering crafted for global theatrical and streaming release.', link: '/production' },
  { code: '02 / MUS', title: 'Music', icon: FiMusic, tag: 'Catalog vault', desc: 'A&R house, record label operations, acoustic engineering, sync scoring, and turning original audio into global IP.', link: '#' },
  { code: '03 / TALENT', title: 'Talent Management', icon: FiUsers, tag: 'Roster directory', desc: 'Executive representation, tour hospitality, press marketing, multi-territory process management, and strategic brand partnership development.', link: '#' },
  { code: '04 / DIST', title: 'Distribution', icon: FiGlobe, tag: 'Global pipeline', desc: 'Global direct distribution across theatrical networks, DSP platforms, streaming channels, and physical media fulfillment infrastructure.', link: '#' },
  { code: '05 / PUB', title: 'Publishing', icon: FiBookOpen, tag: 'DSP track & license', desc: 'Ecosystem protection, worldwide royalty collection, synchronization rights, metadata management, and rights holder administration.', link: '#' },
  { code: '06 / EVENT', title: 'Events', icon: FiCalendar, tag: 'Ticket & turnstile', desc: 'Turnkey event logistics, high-throughput gate control systems, live broadcast integration, and arena-scale technical management.', link: '/events' },
  { code: '07 / EDU', title: 'Learning', icon: FiCompass, tag: 'Academy & training', desc: 'Technical masterclasses in broadcast engineering, stage design, music business, and media logistics led by industry veterans.', link: '#' },
];

const releases = [
  { badge: 'Livestream / Broadcast', title: 'Stonovah Global Soundstage 2025', desc: 'The master gateway for independent artists to showcase, connect, and stream live 4K broadcasts to over 42 countries, completely uncompressed.', tag: 'Watch live stream & preview', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80' },
  { badge: 'Publishing / Essence', title: 'The Architecture of Sound & Story', desc: 'A definitive manuscript on sonic branding, sound design systems, and modern royalty tracking across decentralized media channels.', tag: 'Explore publishing catalog', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80' },
  { badge: 'Academy / Broadcast', title: 'Executive Creative Direction Masterclass', desc: 'Advanced curriculum in live broadcast management, spatial audio engineering, and IP syndication taught by industry leaders.', tag: 'Explore studio courses', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80' },
];

const metrics = [
  { label: 'Global footprint', value: '42+ Active', sub: 'Territories worldwide' },
  { label: 'Master catalog', value: '180K+ Titles', sub: 'Monetized globally' },
  { label: 'Distribution', value: '14.8M Direct', sub: 'Pushed streaming listeners' },
  { label: 'Broadcast pipeline', value: '4K UHD HDR', sub: 'Uncompressed feed' },
];

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

const Eyebrow = ({ children }) => (
  <p className={`flex items-center gap-2 ${mono} text-red-500`}>
    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
    {children}
  </p>
);

const PrimaryBtn = ({ to, href, children }) => {
  const cls = 'inline-flex items-center justify-center gap-2 rounded-md bg-[#e10613] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]';
  return to ? <Link to={to} className={cls}>{children}</Link> : <a href={href} className={cls}>{children}</a>;
};

const DarkBtn = ({ href, children }) => (
  <a href={href} className="inline-flex items-center justify-center gap-2 rounded-md bg-white/[0.07] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/[0.12]">
    {children}
  </a>
);

export default function GeneralLandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      {/* 1. NAVBAR */}
      <Navbar />

      {/* 2. HERO */}
      <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.18),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-20 text-center">
          <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Multimedia & distribution powerhouse
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
            Stonovah Creative House Limited
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65">
            A multimedia and distribution powerhouse partnering with creative individuals and brands.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <PrimaryBtn href="#arms">Explore the 7 arms <FiArrowRight className="text-sm" /></PrimaryBtn>
            <DarkBtn href="/request-service">Request a service</DarkBtn>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-6 border-t border-white/10 pt-8 text-left lg:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label}>
                <p className={`${mono} text-white/40`}>{m.label}</p>
                <p className="mt-2 text-xl font-black">{m.value}</p>
                <p className="mt-1 text-[11px] text-white/45">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OPERATIONAL ARMS */}
      <section id="arms" className="bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Architectural overview</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">The Seven Operational Arms</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/55">
              Synchronized creative arms structured for cinematic audio, sonic engineering, sovereign publishing, and event impact.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {arms.map((arm) => {
              const ArmIcon = arm.icon;
              return (
                <Link key={arm.code} to={arm.link} className="group block h-full">
                  <div className="flex h-full flex-col justify-between rounded-xl border border-white/[0.07] bg-[#161616] p-6 transition-colors group-hover:border-white/25">
                    <div>
                      <div className="mb-6 flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-red-500">
                          <ArmIcon />
                        </span>
                        <span className={`${mono} text-red-500`}>{arm.code}</span>
                      </div>
                      <h3 className="mb-3 text-lg font-bold uppercase tracking-wide">{arm.title}</h3>
                      <p className="mb-6 text-xs leading-relaxed text-white/50">{arm.desc}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <span className={`${mono} text-[9px] text-white/50`}>{arm.tag}</span>
                      <FiArrowRight className="text-white/40 transition-colors group-hover:text-red-500" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. LIVE NOW & FEATURED RELEASES */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Streaming & dispatch pipeline</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Live Now & Featured Releases</h2>
            </div>
            <a href="#" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300">
              Browse all releases (42) <FiArrowRight />
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {releases.map((rel) => (
              <div key={rel.title} className="flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.07] bg-[#161616] transition-colors hover:border-white/20">
                <div>
                  <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,#2a0508,#0f0f0f_70%)]">
                    <img src={rel.image} alt={rel.title} className="h-full w-full object-cover opacity-80" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 inline-block rounded bg-black/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
                      {rel.badge}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 text-lg font-bold leading-snug">{rel.title}</h3>
                    <p className="text-xs leading-relaxed text-white/55">{rel.desc}</p>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <a href="#" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/80 hover:text-white">
                    {rel.tag} <FiArrowRight className="text-red-500" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALLOUT BANNER */}
      <section className="border-t border-white/5 bg-[radial-gradient(ellipse_at_bottom,rgba(225,6,19,0.14),transparent_60%)] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.16),#161616_60%)] p-8 md:flex-row md:items-center md:p-10">
            <div>
              <p className={`${mono} text-red-400`}>Executive & enterprise</p>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-tight md:text-3xl">Stonovah Creative House</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                Partner directly with our board of directors and division heads for state co-productions, enterprise distribution deals, and exclusive talent representation.
              </p>
            </div>
            <PrimaryBtn to="/request-service">Request a service <FiArrowRight className="text-sm" /></PrimaryBtn>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0a0a] px-5 pb-8 pt-14">
        <div className="mx-auto mb-12 grid max-w-7xl gap-8 text-xs md:grid-cols-4">
          <div>
            <span className="text-base font-black tracking-tighter">STONOVAH</span>
            <p className="mb-4 mt-3 text-[11px] leading-relaxed text-white/50">
              An ecosystem tailored for engineering prestigious productions, audio masters, live events, talent representation, and media distribution.
            </p>
            <span className={`${mono} text-[9px] text-red-500`}>Stonovah Creative House Limited</span>
          </div>

          <div>
            <h4 className={`${mono} mb-3 text-white/40`}>Operational arms</h4>
            <ul className="space-y-2 text-[11px] text-white/55">
              <li><Link to="/production" className="hover:text-white">01 // Production</Link></li>
              <li><a href="#" className="hover:text-white">02 // Music</a></li>
              <li><a href="#" className="hover:text-white">03 // Talent Management</a></li>
              <li><a href="#" className="hover:text-white">04 // Distribution</a></li>
              <li><a href="#" className="hover:text-white">05 // Publishing</a></li>
              <li><Link to="/events" className="hover:text-white">06 // Events</Link></li>
              <li><a href="#" className="hover:text-white">07 // Courses</a></li>
            </ul>
          </div>

          <div>
            <h4 className={`${mono} mb-3 text-white/40`}>HQ & direct lines</h4>
            <p className="mb-2 text-[11px] text-white/55">Executive Suites & Studio Group</p>
            <a href="mailto:contact@stonovah.com" className="mb-1 block text-white/80 hover:text-white">contact@stonovah.com</a>
            <p className="text-[11px] text-white/55">+1 (800) 540 - 7748</p>
            <span className="mt-3 inline-block rounded border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[9px] text-white/60">24/7 Exec Desk Active</span>
          </div>

          <div>
            <h4 className={`${mono} mb-3 text-white/40`}>Networks & portals</h4>
            <ul className="space-y-2 text-[11px] text-white/55">
              <li><a href="#" className="hover:text-white">Virtual Showroom</a></li>
              <li><a href="#" className="hover:text-white">SoundCloud Portal</a></li>
              <li><a href="#" className="hover:text-white">Unison Engine</a></li>
              <li><a href="#" className="hover:text-white">Enterprise Audio</a></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 font-mono text-[10px] text-white/40 md:flex-row">
          <p>© 2025 Stonovah Creative House Limited. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Distribution Agreement</a>
          </div>
        </div>
      </footer>
    </div>
  );
}