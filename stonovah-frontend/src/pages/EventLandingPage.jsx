import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiCalendar, FiMapPin } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from './admin/ui';
import TicketPicker from '../components/tickets/TicketPicker';
import { usePublicEvents, eventFacts, priceLabel, fmtShort, startCheckout } from './public/publicLive';
import RecentWork from '../components/portfolio/RecentWork';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

const Eyebrow = ({ children }) => (
  <p className={`flex items-center gap-2 ${mono} text-red-500`}>
    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
    {children}
  </p>
);

const pillars = [
  { code: '01 // LIVESTREAM', title: 'Livestream Coordination', desc: 'Ultra-low latency 4K broadcast distribution across multi-platform feeds, custom CDNs, and interactive virtual stage environments.', link: '/events/livestream' },
  { code: '02 // MEDIA', title: 'Media Handling', desc: 'Instant photo/video ingest, automated AI tagging, press syndication, and real-time cloud asset distribution during live operations.', link: '/events/media' },
  { code: '03 // COORD', title: 'Event Coordination', desc: 'End-to-end stage direction, spatial design, technical rigging, and VIP security/hospitality logistics for arena-scale crowds.', link: '/events/coordination' },
  { code: '04 // TICKETING', title: 'Ticketing Infrastructure', desc: 'Anti-scalp dynamic QR turnstile access, automated gate check-ins, and real-time capacity/telemetry analytics.', link: '/events/ticketing' },
];

const metrics = [
  { val: '180+', label: 'Events managed globally' },
  { val: '99.98%', label: 'Broadcast stream uptime' },
  { val: '3.4M+', label: 'Live spectators streamed' },
  { val: '14.2M', label: 'Turnstile scans processed' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

export default function EventLandingPageContent() {
  const navigate = useNavigate();
  const { data: events, loading, error } = usePublicEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [buying, setBuying] = useState(null);

  const now = Date.now();
  const upcoming = (events || [])
    .filter((e) => !e.endAt || new Date(e.endAt).getTime() >= now)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  const filteredEvents = upcoming
    .filter((e) => {
      const f = eventFacts(e);
      return filter === 'ALL' || (filter === 'FREE' && f.free) || (filter === 'PAID' && !f.free)
        || (filter === 'THIS MONTH' && new Date(e.startAt).getTime() <= now + 30 * 86400000);
    })
    .filter((e) => `${e.title} ${e.venue || ''} ${e.organizer?.name || ''}`.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] font-sans text-white antialiased selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* 1. HERO */}
      <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.18),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-16">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Stonovah Events Arm // Live & Broadcast
            </motion.span>

            <motion.h1 variants={fadeInUp} className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
              Engineered for <br />
              <span className="text-red-500">cultural resonance,</span> <br />
              broadcast at scale
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">
              A turnkey event management, high-bitrate broadcast, and gate telemetry engine built for
              creators, brands, and stadiums looking to create sovereign, zero-downtime spectacles.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e10613] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]">
                Request a service <FiArrowRight className="text-sm" />
              </a>
              <a href="#pillars" className="inline-flex items-center justify-center gap-2 rounded-md bg-white/[0.07] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/[0.12]">
                Explore services
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 lg:grid-cols-4"
          >
            {metrics.map((m) => (
              <motion.div key={m.label} variants={fadeInUp}>
                <p className={`${mono} text-white/40`}>{m.label}</p>
                <p className="mt-2 text-3xl font-black">{m.val}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. FOUR PILLARS */}
      <section id="pillars" className="bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <Eyebrow>Operational specs</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Four Pillars of Sovereign Execution</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/55">
              Integrated live event logistics built to handle arena capacities, ultra-high bitrate
              distribution, and live broadcast requirements.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid gap-5 md:grid-cols-2"
          >
            {pillars.map((pillar) => (
              <Link to={pillar.link} key={pillar.code} className="block">
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="group flex h-full flex-col justify-between rounded-xl border border-white/[0.07] bg-[#161616] p-8 transition-colors hover:border-white/25"
                >
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <span className={`${mono} text-red-500`}>{pillar.code}</span>
                      <span className="text-white/40 transition-colors group-hover:text-white">↗</span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold uppercase transition-colors group-hover:text-white">{pillar.title}</h3>
                    <p className="mb-8 text-xs leading-relaxed text-white/50">{pillar.desc}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className={`${mono} text-[9px] text-white/40`}>Specs ready</span>
                    <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-red-400 transition-transform group-hover:translate-x-1">
                      Explore <FiArrowRight />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. BROWSE LIVE EVENTS */}
      <section id="events" className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <Eyebrow>Ticketing & dispatch</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Browse Live Events & Cultural Showcases</h2>
            </div>
            <span className={`${mono} text-white/50`}>
              {upcoming.length} upcoming event{upcoming.length === 1 ? '' : 's'} on sale
            </span>
          </motion.div>

          <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event, venue or organizer…"
                className="w-full rounded-lg border border-white/10 bg-[#161616] py-3 pl-10 pr-4 text-xs text-white placeholder:text-white/35 focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/40"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['ALL', 'THIS MONTH', 'FREE', 'PAID'].map((c) => (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(c)}
                  className={`cursor-pointer rounded-lg px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                    filter === c
                      ? 'bg-[#e10613] text-white'
                      : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {c}
                </motion.button>
              ))}
            </div>
          </div>

          {loading && <p className={`${mono} py-10 text-center text-white/40`}>Loading events…</p>}
          {error && (
            <div className="my-6 rounded-lg border border-red-500/30 bg-red-500/[0.07] p-4 text-sm text-red-200">{error}</div>
          )}

          <motion.div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((ev) => {
              const f = eventFacts(ev);
              const canBuy = !f.soldOut && !f.ended;
              const badge = f.soldOut ? 'SOLD OUT' : f.almost ? 'ALMOST SOLD OUT' : 'ON SALE';
              return (
                <motion.div
                  key={ev.id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -4 }}
                  className="group flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.07] bg-[#161616] transition-colors hover:border-white/20"
                >
                  <div>
                    <Link to={`/events/${ev.slug}`} className="relative block h-48 overflow-hidden bg-[linear-gradient(135deg,#2a0508,#0f0f0f_70%)]">
                      {ev.posterUrl && (
                        <img src={ev.posterUrl} alt={ev.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent" />
                      <span className="absolute right-3 top-3 inline-block rounded bg-black/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
                        {badge}
                      </span>
                      {ev.hostedByStonovah && (
                        <span className="absolute left-3 top-3 inline-block rounded bg-[#e10613] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                          Hosted by Stonovah
                        </span>
                      )}
                    </Link>
                    <div className="p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-white/45">
                        <span className="flex items-center gap-1"><FiCalendar className="text-red-500" /> {fmtShort(ev.startAt)}</span>
                        <span className="flex items-center gap-1"><FiMapPin className="text-red-500" /> {ev.venue}</span>
                      </div>
                      <Link to={`/events/${ev.slug}`}>
                        <h3 className="mb-2 text-lg font-bold leading-snug transition-colors group-hover:text-white">{ev.title}</h3>
                      </Link>
                      {ev.description && (
                        <p className="mb-2 max-h-[3.6rem] overflow-hidden text-xs leading-relaxed text-white/55">{ev.description}</p>
                      )}
                      {ev.organizer?.name && <span className={`${mono} text-[9px] text-white/35`}>by {ev.organizer.name}</span>}
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 px-6 pb-6">
                    <div className="mt-5">
                      <span className={`${mono} block text-[9px] text-white/35`}>Price</span>
                      <span className="text-base font-black">{priceLabel(f)}</span>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <Link
                        to={`/events/${ev.slug}`}
                        className="rounded-md border border-white/15 bg-white/[0.03] px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-white/30"
                      >
                        Details
                      </Link>
                      <motion.button
                        whileHover={{ scale: canBuy ? 1.05 : 1 }}
                        whileTap={{ scale: canBuy ? 0.95 : 1 }}
                        disabled={!canBuy}
                        onClick={() => setBuying(ev)}
                        className="cursor-pointer rounded-md bg-[#e10613] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510] disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/35"
                      >
                        {f.ended ? 'Ended' : f.soldOut ? 'Sold out' : 'Get tickets'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
              <h3 className="text-base font-bold">{upcoming.length ? 'No events match your search' : 'No events on sale right now'}</h3>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/50">
                {upcoming.length ? 'Try a different search or filter.' : 'Check back soon for upcoming shows and showcases.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. PAST EVENTS */}
      <div className="border-t border-white/5 bg-[#0d0d0d]">
        <RecentWork id="past" eyebrow="PROVEN RECORD" title="PAST EVENTS & PRODUCTIONS" limit={3}
          className="mx-auto max-w-7xl px-5 py-20" />
      </div>

      {/* 5. CTA BANNER */}
      <section id="contact" className="border-t border-white/5 bg-[radial-gradient(ellipse_at_bottom,rgba(225,6,19,0.14),transparent_60%)] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="flex flex-col items-start justify-between gap-6 rounded-xl border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.16),#161616_60%)] p-8 md:flex-row md:items-center md:p-10"
          >
            <div>
              <p className={`${mono} text-red-400`}>Initiate production</p>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-tight md:text-4xl">Plan your event with us</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                Partner with Stonovah for end-to-end stage direction, high-bitrate streaming
                distribution, dynamic gate control, and talent management.
              </p>
            </div>
            <Link
              to="/request-service"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#e10613] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]"
            >
              Request a service <FiArrowRight className="text-sm" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Modal open={!!buying} onClose={() => setBuying(null)} width="max-w-md">
        {buying && (
          <div className="space-y-4 p-6">
            <div className="pr-10">
              <span className="block font-mono text-[9px] uppercase text-neutral-400">{fmtShort(buying.startAt)} • {buying.venue}</span>
              <h2 className="text-xl font-black uppercase leading-tight">{buying.title}</h2>
            </div>
            <TicketPicker event={buying} onContinue={(items) => { const ev = buying; setBuying(null); startCheckout(navigate, ev, items); }} />
            <Link to={`/events/${buying.slug}`} className="block text-[10px] font-bold text-red-400 hover:text-white">View full event details →</Link>
          </div>
        )}
      </Modal>
      <Footer />
    </main>
  );
}