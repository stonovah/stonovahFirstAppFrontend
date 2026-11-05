import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCamera } from 'react-icons/fi';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import RecentWork from '../components/portfolio/RecentWork';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

const Eyebrow = ({ children }) => (
  <p className={`flex items-center gap-2 ${mono} text-red-500`}>
    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
    {children}
  </p>
);

const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const disciplines = [
  { code: 'EXEC // 01', title: 'High-Impact Press Photography', desc: 'Real-time wireless tethering, instant color grading, and automated metadata embedding for instant wire distribution.', link: '/disciplines/press-photo' },
  { code: 'EXEC // 02', title: 'Cinematic 4K Video Production', desc: 'Multi-camera cinema setups recording high-bitrate ProRes/RAW video for rapid same-day sizzle edit packages.', link: '/disciplines/video-prod' },
  { code: 'EXEC // 03', title: 'Talent & Journalist Interviews', desc: 'Dedicated backdrops, acoustic isolation kits, multi-mic setups, and broadcast lighting for press junkets.', link: '/disciplines/interviews' },
  { code: 'EXEC // 04', title: 'Signal Routing & Watermarking', desc: 'Secure live feeds, dynamic DRM watermarking, multi-tier press access portals, and cloud sync.', link: '/disciplines/signal-routing' },
];

const heroMetrics = [
  { val: '< 15 MINS', label: 'Tethered photo turnaround' },
  { val: '8K RAW / 4K ProRes', label: 'Cinema capture standard' },
  { val: 'Automated AI', label: 'Metadata & face tagging' },
];

// Defined in your original file but not rendered there: cadenceSteps and hardware. Add them back as sections if you want them.

export default function CinematicMediaPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* 1. HERO */}
      <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.18),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="lg:col-span-8">
              <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Field capture & rapid press dispatch
              </motion.span>

              <motion.h1 variants={fadeInUp} className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                Cinematic media handling <br />
                <span className="text-red-500">& instant press delivery</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">
                End-to-end event media infrastructure combining cinema-grade optics, automated wireless ingest, live color workflows, and instant wire-service delivery for major global events.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-8">
                <Link to="/request-service?service=media" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e10613] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]">
                  <FiCamera className="text-sm" /> Request a service
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                {heroMetrics.map((m) => (
                  <div key={m.label}>
                    <p className="text-lg font-black sm:text-2xl">{m.val}</p>
                    <p className={`${mono} mt-1 text-[9px] text-white/40`}>{m.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="lg:col-span-4">
              <div className="rounded-xl border border-white/[0.07] bg-[#161616] p-2">
                <div className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-[linear-gradient(135deg,#2a0508,#0f0f0f_70%)]">
                  <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
                    alt="Camera Rig"
                    className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                  <div className="absolute left-3 top-3">
                    <span className="flex items-center gap-1.5 rounded bg-[#e10613] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" /> Media ingest active
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <span className={`${mono} block text-[9px] text-red-400`}>Field wire</span>
                    <p className="mt-0.5 text-xs font-bold uppercase">Live FTP Tethering & Local RAID Sync</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. DISCIPLINES */}
      <section id="disciplines" className="bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Field capabilities</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Disciplines & Field Execution</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/55">
              From high-speed red carpet photography to broadcast video cutdowns, we deploy dedicated units engineered for speed and precision.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={staggerContainer} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {disciplines.map((item) => (
              <motion.div
                key={item.code}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="group flex flex-col justify-between rounded-xl border border-white/[0.07] bg-[#161616] p-7 transition-colors hover:border-white/25"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className={`${mono} text-red-500`}>{item.code}</span>
                    <span className="text-white/40 transition-colors group-hover:text-white">↗</span>
                  </div>
                  <h3 className="mb-3 text-lg font-bold leading-snug">{item.title}</h3>
                  <p className="mb-8 text-xs leading-relaxed text-white/50">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 font-mono text-[10px]">
                  <span className="uppercase text-white/35">Specs ready</span>
                  <span className="font-bold text-red-400 transition-transform group-hover:translate-x-1">EXPLORE ↗</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. RECENT WORK */}
      <RecentWork scope="Media" id="dispatches" eyebrow="PRODUCED WORK" title="RECENT MEDIA WORK" />

      {/* 4. CTA */}
      <section id="contact" className="border-t border-white/5 bg-[radial-gradient(ellipse_at_bottom,rgba(225,6,19,0.14),transparent_60%)] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="flex flex-col items-start justify-between gap-8 rounded-xl border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.16),#161616_60%)] p-8 md:flex-row md:items-center md:p-12"
          >
            <div className="max-w-xl">
              <p className={`${mono} text-red-400`}>Reserve event crew</p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl">
                Equip your next event with world-class visual storytellers
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Get immediate technical quotes, crew availability for press junkets, and custom media routing solutions.
              </p>
            </div>
            <Link
              to="/request-service?service=media"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#e10613] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]"
            >
              Request a service <FiArrowRight className="text-sm" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}