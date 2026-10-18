import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiCalendar, FiMapPin } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Link, useNavigate } from 'react-router-dom';   // replaces the existing `import { Link } ...`
import { Modal } from './admin/ui';
import TicketPicker from '../components/tickets/TicketPicker';
import { usePublicEvents, eventFacts, priceLabel, fmtShort, startCheckout } from './public/publicLive';
import RecentWork from '../components/portfolio/RecentWork';

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

  // Four Pillars of Sovereign Execution
  const pillars = [
    {
      code: '01 // LIVESTREAM',
      title: 'Livestream Coordination',
      desc: 'Ultra-low latency 4K broadcast distribution across multi-platform feeds, custom CDNs, and interactive virtual stage environments.',
      link: '/events/livestream',
    },
    {
      code: '02 // MEDIA',
      title: 'Media Handling',
      desc: 'Instant photo/video ingest, automated AI tagging, press syndication, and real-time cloud asset distribution during live operations.',
      link: '/events/media',
    },
    {
      code: '03 // COORD',
      title: 'Event Coordination',
      desc: 'End-to-end stage direction, spatial design, technical rigging, and VIP security/hospitality logistics for arena-scale crowds.',
      link: '/events/coordination',
    },
    {
      code: '04 // TICKETING',
      title: 'Ticketing Infrastructure',
      desc: 'Anti-scalp dynamic QR turnstile access, automated gate check-ins, and real-time capacity/telemetry analytics.',
      link: '/events/ticketing',
    },
  ];

  // Live Events & Showcases Data
  

  // Past Events Data
 

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };


  return (
    <main className="relative bg-[#FFBF00] text-black font-sans min-h-screen selection:bg-black selection:text-[#FFBF00]">
      <Navbar />

      {/* 1. HERO (no background image) */}
      <section className="relative border-b-2 border-black/20">
        <div className="px-8 pt-16 pb-12 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.span
              variants={fadeInUp}
              className="text-xs font-mono text-black/70 font-bold tracking-widest block mb-3 uppercase"
            >
              
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-none mb-6 text-black"
            >
              ENGINEERED FOR <br />
              <span className="text-[#A01515]">CULTURAL RESONANCE,</span> <br />
              BROADCAST AT SCALE
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xs md:text-sm text-black/80 font-medium mb-8 leading-relaxed max-w-2xl"
            >
              A turnkey event management, high-bitrate broadcast, and gate telemetry engine built for
              creators, brands, and stadiums looking to create sovereign, zero-downtime spectacles.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 mb-14">
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#contact"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3.5 rounded transition uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-black/30"
              >
                REQUEST A SERVICE
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#pillars"
                className="bg-black hover:bg-neutral-900 text-[#FFBF00] font-bold text-xs px-6 py-3.5 rounded transition uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-black/30"
              >
                EXPLORE SERVICES
              </motion.a>
            </motion.div>
          </motion.div>

          {/* 4 HERO METRICS */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t-2 border-black/20 pt-8"
          >
            {[
              { val: '180+', label: 'Events Managed Globally', color: 'text-[#FFBF00]' },
              { val: '99.98%', label: 'Broadcast Stream Uptime', color: 'text-red-500' },
              { val: '3.4M+', label: 'Live Spectators Streamed', color: 'text-[#FFBF00]' },
              { val: '14.2M', label: 'Turnstile Scans Processed', color: 'text-[#FFBF00]' },
            ].map((metric, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="bg-black text-white p-5 rounded-lg text-left border border-black shadow-xl transition-transform"
              >
                <span className={`block text-3xl font-black ${metric.color}`}>{metric.val}</span>
                <span className="text-[10px] font-mono text-neutral-300 uppercase font-bold tracking-wider block mt-1">
                  {metric.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. FOUR PILLARS */}
      <section id="pillars" className="px-8 py-16 max-w-7xl mx-auto border-t-2 border-black/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-black/70 uppercase tracking-widest block mb-1">
              OPERATIONAL SPECS
            </span>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-black">
              Four Pillars of Sovereign Execution
            </h2>
          </div>
          <p className="text-xs text-black/80 font-medium max-w-md">
            Integrated live event logistics built to handle arena capacities, ultra-high bitrate
            distribution, and live broadcast requirements.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {pillars.map((pillar) => (
            <Link to={pillar.link} key={pillar.code} className="block">
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                className="h-full bg-black text-white p-8 rounded-xl border border-black flex flex-col justify-between group hover:bg-neutral-900 transition duration-300 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-mono font-bold text-red-500 tracking-widest uppercase">
                      {pillar.code}
                    </span>
                    <span className="text-neutral-400 group-hover:text-white transition">↗</span>
                  </div>
                  <h3 className="text-xl font-bold uppercase mb-3 text-white group-hover:text-[#FFBF00] transition">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-8">{pillar.desc}</p>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">SPECS READY</span>
                  <span className="text-xs font-bold text-[#FFBF00] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {pillar.link} <FiArrowRight />
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* 3. BROWSE LIVE EVENTS */}
      <section id="events" className="px-8 py-16 max-w-7xl mx-auto border-t-2 border-black/10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-black/70 uppercase tracking-widest block mb-1">TICKETING & DISPATCH</span>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-black">BROWSE LIVE EVENTS & CULTURAL SHOWCASES</h2>
          </div>
          <span className="text-xs font-mono text-black font-bold">{upcoming.length} UPCOMING EVENT{upcoming.length === 1 ? '' : 'S'} ON SALE</span>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by event, venue or organizer…"
              className="w-full bg-black text-white pl-10 pr-4 py-3 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-red-600 text-xs placeholder:text-neutral-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'THIS MONTH', 'FREE', 'PAID'].map((c) => (
              <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => setFilter(c)}
                className={`text-xs font-bold px-4 py-3 rounded-lg uppercase transition cursor-pointer ${filter === c ? 'bg-red-600 text-white shadow-md shadow-black/30' : 'bg-black/10 text-black hover:bg-black hover:text-[#FFBF00] border border-black/30'}`}>{c}</motion.button>
            ))}
          </div>
        </div>

        {loading && <p className="text-xs font-mono font-bold text-black/70 uppercase">Loading events…</p>}
        {error && <p className="text-xs font-mono font-bold text-red-800">{error}</p>}

        <motion.div layout initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const f = eventFacts(ev);
            const canBuy = !f.soldOut && !f.ended;
            const badge = f.soldOut ? 'SOLD OUT' : f.almost ? 'ALMOST SOLD OUT' : 'ON SALE';
            return (
              <motion.div layout key={ev.id} variants={fadeInUp} whileHover={{ y: -6 }} className="bg-black text-white rounded-xl border border-black overflow-hidden flex flex-col justify-between group transition duration-300 shadow-xl">
                <div>
                  <Link to={`/events/${ev.slug}`} className="block h-48 relative overflow-hidden bg-neutral-900">
                    {ev.posterUrl ? <img src={ev.posterUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /> : <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-red-950" />}
                    <span className="absolute top-3 right-3 bg-black text-neutral-200 text-[9px] font-mono px-2 py-0.5 rounded border border-neutral-700 uppercase">{badge}</span>
                    {ev.hostedByStonovah && <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">HOSTED BY STONOVAH</span>}
                  </Link>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-neutral-400 mb-3">
                      <span className="flex items-center gap-1"><FiCalendar className="text-red-500" /> {fmtShort(ev.startAt)}</span>
                      <span className="flex items-center gap-1"><FiMapPin className="text-red-500" /> {ev.venue}</span>
                    </div>
                    <Link to={`/events/${ev.slug}`}><h3 className="text-base font-bold uppercase mb-2 leading-snug text-white group-hover:text-[#FFBF00] transition">{ev.title}</h3></Link>
                    {ev.description && <p className="text-xs text-neutral-300 leading-relaxed mb-2 max-h-[3.6rem] overflow-hidden">{ev.description}</p>}
                    {ev.organizer?.name && <span className="text-[10px] font-mono text-neutral-500 uppercase">by {ev.organizer.name}</span>}
                  </div>
                </div>
                <div className="p-6 pt-0 border-t border-neutral-800 flex items-center justify-between mt-auto gap-3">
                  <div className="mt-5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block">PRICE</span>
                    <span className="text-base font-black text-white">{priceLabel(f)}</span>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Link to={`/events/${ev.slug}`} className="border border-neutral-700 hover:border-white text-white text-xs font-bold uppercase px-3 py-2.5 rounded transition">DETAILS</Link>
                    <motion.button whileHover={{ scale: canBuy ? 1.05 : 1 }} whileTap={{ scale: canBuy ? 0.95 : 1 }} disabled={!canBuy} onClick={() => setBuying(ev)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase px-4 py-2.5 rounded transition shadow-md shadow-black/40 cursor-pointer disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed">
                      {f.ended ? 'ENDED' : f.soldOut ? 'SOLD OUT' : 'GET TICKETS'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {!loading && !error && filteredEvents.length === 0 && (
          <p className="text-xs font-mono font-bold text-black/70 uppercase mt-6">{upcoming.length ? 'No events match your search.' : 'No events are on sale right now. Check back soon.'}</p>
        )}
      </section>

      {/* 4. PAST EVENTS */}
      <RecentWork id="past" eyebrow="PROVEN RECORD" title="PAST EVENTS & PRODUCTIONS" limit={3}
        className="px-8 py-16 max-w-7xl mx-auto border-t-2 border-black/10" />

      {/* 5. CTA BANNER */}
      <section id="contact" className="px-8 py-12 max-w-7xl mx-auto pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="bg-black text-white border-2 border-red-600 p-8 md:p-12 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-[#FFBF00] uppercase tracking-widest block mb-2">
              INITIATE PRODUCTION
            </span>
            <h2 className="text-2xl md:text-4xl font-black uppercase mb-2 text-white">
              Plan Your Event With Us
            </h2>
            <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
              Partner with Stonovah for end-to-end stage direction, high-bitrate streaming
              distribution, dynamic gate control, and talent management.
            </p>
          </div>
          <Link to="/request-service" className="mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-8 py-4 rounded whitespace-nowrap transition tracking-wider shadow-lg shadow-red-950/60 cursor-pointer"
            >
              Request a service
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <Modal open={!!buying} onClose={() => setBuying(null)} width="max-w-md">
        {buying && (
          <div className="p-6 space-y-4">
            <div className="pr-10">
              <span className="text-[9px] font-mono text-neutral-400 uppercase block">{fmtShort(buying.startAt)} • {buying.venue}</span>
              <h2 className="text-xl font-black uppercase leading-tight">{buying.title}</h2>
            </div>
            <TicketPicker event={buying} onContinue={(items) => { const ev = buying; setBuying(null); startCheckout(navigate, ev, items); }} />
            <Link to={`/events/${buying.slug}`} className="text-[10px] font-bold text-[#FFBF00] hover:text-white block">View full event details →</Link>
          </div>
        )}
      </Modal>
      <Footer />
    </main>
  );
}