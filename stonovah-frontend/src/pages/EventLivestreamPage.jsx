import React from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiArrowRight, FiRadio, FiCpu, FiZap, FiGlobe, FiShield } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Link } from 'react-router-dom';
import RecentWork from '../components/portfolio/RecentWork';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

const Eyebrow = ({ children }) => (
  <p className={`flex items-center gap-2 ${mono} text-red-500`}>
    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
    {children}
  </p>
);

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const pillars = [
  { icon: FiZap, title: 'High-Bitrate 4K UHD Transport', desc: 'Uncompressed multi-camera ingest fed directly into edge-compute encoders running proprietary SRT/Zixi protocols.' },
  { icon: FiRadio, title: 'Lossless Audio Transmission', desc: '32-bit floating point Dante/AES67 audio streams routed with zero jitter across redundant fiber lines.' },
  { icon: FiGlobe, title: 'Hybrid Architecture & Custom CDNs', desc: 'Direct peering with tier-1 transit providers and custom edge nodes ensuring sub-500ms latency globally.' },
  { icon: FiShield, title: 'Non-Redundant Failover Matrix', desc: 'Triple-path automated failover spanning satellite, bond 5G cellular, and dual ISP connections.' },
];

const heroMetrics = [
  { val: '50 - 150 Mbps', label: 'Custom bitrate stream' },
  { val: '< 350ms', label: 'Sub-second latency' },
  { val: 'Triple Failover', label: '5G / Fiber / Satellite' },
];

// Defined in your original file but not rendered there. Kept here in case you add those sections later.
// const steps = [...]
// const fleetItems = [...]

export default function LivestreamCoordinationPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* 1. HERO */}
      <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.18),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="lg:col-span-7">
              <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Live broadcast logistics // ultra-low latency
              </motion.span>

              <motion.h1 variants={fadeInUp} className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
                Lossless, ultra- <br />
                <span className="text-red-500">low latency</span> <br />
                livestream <br />
                coordination
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-6 max-w-xl text-base leading-relaxed text-white/65">
                A military-grade live broadcast infrastructure delivering uncompressed 4K video feeds, zero-packet-loss audio routing, and direct CDN syndication for global high-stakes spectacles.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e10613] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]">
                  <FiPlay className="fill-current text-sm" /> Initiate livestream
                </a>
                <a href="#pillars" className="inline-flex items-center justify-center gap-2 rounded-md bg-white/[0.07] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/[0.12]">
                  System architecture <FiArrowRight className="text-sm" />
                </a>
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

            {/* control room preview */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="relative lg:col-span-5">
              <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#161616] p-2">
                <div className="group relative aspect-video overflow-hidden rounded-lg bg-[linear-gradient(135deg,#2a0508,#0f0f0f_70%)]">
                  <img
                    src="https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1200&q=80"
                    alt="Broadcast Control Room"
                    className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded bg-[#e10613] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" /> Live feed 01
                    </span>
                    <span className="rounded bg-black/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
                      4K @ 60 FPS
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className={`${mono} block text-[9px] text-red-400`}>Broadcast hub</span>
                      <span className="text-xs font-bold uppercase">Main Control Room Terminal</span>
                    </div>
                    <span className="rounded bg-black/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/70 backdrop-blur">
                      SRT encryption: active
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between rounded-lg border border-white/5 bg-black/30 p-3 font-mono text-xs text-white/60">
                  <div className="flex items-center gap-2"><FiCpu className="text-red-500" /><span>ENCODER LOAD: 32%</span></div>
                  <div className="flex items-center gap-2"><FiZap className="text-red-500" /><span>JITTER: 0.4ms</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. ENGINEERING PRECISION */}
      <section id="pillars" className="bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Core specs</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Engineering Precision <br />Behind Every Frame
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/55">
              Eliminating stream drops, latency spikes, and audio desynchronization through dedicated hardware setups and custom protocol routing.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={staggerContainer} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((item) => {
              const PillarIcon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="group flex flex-col justify-between rounded-xl border border-white/[0.07] bg-[#161616] p-6 transition-colors hover:border-white/25"
                >
                  <div>
                    <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-xl text-red-500">
                      <PillarIcon />
                    </span>
                    <h3 className="mb-3 text-base font-bold leading-snug">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-white/50">{item.desc}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5 font-mono text-[10px] text-white/35">
                    <span>SPEC READY</span>
                    <span className="text-red-500 transition-transform group-hover:translate-x-1">↗</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 3. RECENT WORK */}
      <RecentWork scope="Livestream" id="transmissions" eyebrow="FIELD ARCHIVE" title="RECENT LIVESTREAM WORK" />

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
            <div className="max-w-2xl">
              <p className={`${mono} text-red-400`}>Initiate broadcast ops</p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl">
                Ready to broadcast your next milestone production?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Connect directly with our lead broadcast engineering crew to reserve equipment, audit venue connectivity, and configure custom ultra-low latency streams.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <Link
                to="/request-service?service=livestream"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#e10613] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]"
              >
                Book livestream fleet <FiArrowRight className="text-sm" />
              </Link>
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/15 bg-white/[0.03] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-white/30"
              >
                Request a service
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}