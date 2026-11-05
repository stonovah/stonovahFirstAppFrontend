import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiCheck } from 'react-icons/fi';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
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
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const pillars = [
  { code: 'PILLAR // 01', title: 'VIP & Diplomatic Protocol Management', desc: 'Precision security routing, high-profile delegation intake, private lounge coordination, and real-time escort logistics.', specs: ['Armored Convoys', 'Fast-Track Ingress', 'Bespoke Escorts'] },
  { code: 'PILLAR // 02', title: 'Artiste & Artist VIP Hospitality', desc: 'Green room architecture, tailored rider fulfillment, soundcheck scheduling, and dedicated stage-door transit.', specs: ['Rider Logistics', 'Acoustic Lounges', 'Private Transit'] },
  { code: 'PILLAR // 03', title: 'Arena & Large-Scale Crowd Mechanics', desc: 'RFID turnstiles, anti-scalp gate validation, zone flow management, and active bottleneck reduction systems.', specs: ['RFID Scanners', 'Zone Barrier Ops', 'Real-time Telemetry'] },
  { code: 'PILLAR // 04', title: 'Technical Directing & Show-Calling', desc: 'Master timecode synchronization, multi-crew comms, precision pyrotechnics timing, and live stage management.', specs: ['Show Control Sync', 'Comms Matrix', 'Pyro Safety Ops'] },
];

const steps = [
  { num: '01', title: 'INTAKE & ARCHITECTURE', desc: 'Venue site mapping, spatial flow design, power distribution audits, emergency evacuation routing, and crew allocation.', highlights: ['Site Mapping', 'Power Audits', 'Safety Plan'] },
  { num: '02', title: 'TECHNICAL SOUNDCHECK', desc: 'Rigging stress tests, LED wall calibration, line checks across main FOH and monitors, and timecode alignment.', highlights: ['Rigging Checks', 'LED Calibration', 'FOH Tuning'] },
  { num: '03', title: 'LIVE SHOW EXECUTION & GATE LOCK', desc: 'Master stage directing, multi-channel crew communications, live press dispatch, and turnstile monitoring.', highlights: ['Show Calling', 'Press Sync', 'Crowd Telemetry'] },
  { num: '04', title: 'STRIKE & ARCHIVAL CLEARANCE', desc: 'Rapid stage strike, equipment inventory audit, raw footage handoff, and venue handover within scheduled timeline.', highlights: ['Stage Strike', 'Asset Backup', 'Site Handover'] },
];

const inclusions = [
  { title: 'Redundant Power Ingestion', desc: 'Dual-generator sync with automated seamless transfer units ensuring 0ms power interruption.' },
  { title: 'Master Show Controller Hub', desc: 'Central command trailer equipped with broadcast monitors, multi-frequency radios, and venue CCTV feeds.' },
  { title: 'Paramedic & Emergency Response', desc: 'On-site medical stations, dedicated emergency exit lanes, and direct ambulance routing.' },
  { title: 'Dedicated Client Hospitality Concierge', desc: 'Dedicated single point of contact handling real-time rider changes, VIP arrivals, and executive demands.' },
  { title: 'On-Site Rapid Print & Credentials', desc: 'High-speed PVC badge printing for last-minute press, staff, and VIP access upgrades.' },
  { title: 'Post-Event Metric Breakdown', desc: 'Comprehensive gate audit reporting, crowd density heatmaps, and technical performance logs.' },
];

const quickMetrics = [
  { val: '99.8%', label: 'On-time show execution' },
  { val: '120+', label: 'Arena spectacles managed' },
  { val: '0.00%', label: 'Security failure rate' },
];

const sideStats = [
  { label: 'Capacity handling', val: '50,000+', sub: 'Single-day stadium crowd coordination capacity' },
  { label: 'Gate ingress speeds', val: '< 2.4s', sub: 'Average turnstile scanning duration per attendee' },
  { label: 'Active crew network', val: '350+', sub: 'Vetted stage managers, riggers & security personnel' },
];

export default function EventCoordinationPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* 1. HERO */}
      <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.18),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="lg:col-span-8">
              <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> High-stakes stage directing & crowd logistics
              </motion.span>

              <motion.h1 variants={fadeInUp} className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                End-to-end event <br />
                coordination & <br />
                <span className="text-red-500">cultural spectacles</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">
                Full-scale production management for arenas, summits, and cultural festivals. From VIP diplomatic intake to master stage directing and real-time gate telemetry.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-8">
                <a href="/request-service-event-coordination" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e10613] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]">
                  Request a service <FiArrowRight className="text-sm" />
                </a>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                {quickMetrics.map((m) => (
                  <div key={m.label}>
                    <p className="text-2xl font-black sm:text-3xl">{m.val}</p>
                    <p className={`${mono} mt-1 text-[9px] text-white/40`}>{m.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="lg:col-span-4">
              <div className="space-y-6 rounded-xl border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.14),#161616_60%)] p-6">
                {sideStats.map((s, i) => (
                  <div key={s.label} className={i < sideStats.length - 1 ? 'border-b border-white/10 pb-5' : ''}>
                    <span className={`${mono} block text-[9px] text-red-400`}>{s.label}</span>
                    <span className="mt-1 block text-3xl font-black">{s.val}</span>
                    <span className="text-xs text-white/50">{s.sub}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FOUR PILLARS */}
      <section id="pillars" className="bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Operational excellence</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Four Pillars of Flawless Delivery</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/55">
              Eliminating friction points between high-profile talent, massive audience turnout, and complex technical production requirements.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={staggerContainer} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((item) => (
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
                  <p className="mb-6 text-xs leading-relaxed text-white/50">{item.desc}</p>
                </div>
                <div className="space-y-1.5 border-t border-white/5 pt-4">
                  {item.specs.map((spec) => (
                    <div key={spec} className="flex items-center gap-2 font-mono text-[10px] text-white/60">
                      <FiCheck className="text-red-500" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. 4-STEP ENGINE */}
      <section id="engine" className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className="mb-10">
            <Eyebrow>Methodology</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">The 4-Step Production Engine</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={staggerContainer} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, idx) => (
              <motion.div
                key={s.num}
                variants={fadeInUp}
                onClick={() => setActiveStep(idx)}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-6 transition-colors ${
                  activeStep === idx
                    ? 'border-red-500/60 bg-[linear-gradient(135deg,#240607,#161616_60%)]'
                    : 'border-white/[0.07] bg-[#161616] hover:border-white/25'
                }`}
              >
                <div>
                  <span className={`mb-3 block font-mono text-3xl font-black ${activeStep === idx ? 'text-red-500' : 'text-white/30'}`}>{s.num}</span>
                  <h3 className={`${mono} mb-2 text-white/85`}>{s.title}</h3>
                  <p className="mb-4 text-xs leading-relaxed text-white/50">{s.desc}</p>
                </div>
                <div className="space-y-1 border-t border-white/5 pt-4">
                  {s.highlights.map((h) => (
                    <span key={h} className="block font-mono text-[9px] text-white/45">• {h}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. INCLUDED */}
      <section id="included" className="bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className="mb-10">
            <Eyebrow>Standard package</Eyebrow>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">What Is Included in Every Stonovah Production</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={staggerContainer} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {inclusions.map((inc, idx) => (
              <motion.div
                key={inc.title}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="flex flex-col justify-between rounded-xl border border-white/[0.07] bg-[#161616] p-7 transition-colors hover:border-white/25"
              >
                <div>
                  <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] font-mono text-sm font-bold text-red-500">
                    0{idx + 1}
                  </div>
                  <h3 className="mb-2 text-base font-bold leading-snug">{inc.title}</h3>
                  <p className="text-xs leading-relaxed text-white/50">{inc.desc}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 font-mono text-[10px] text-white/35">
                  <span>GUARANTEED STANDARD</span>
                  <FiCheckCircle className="text-red-500" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. RECENT WORK */}
      <RecentWork scope="Event Coordination" id="case-study" eyebrow="FEATURED WORK" title="RECENT COORDINATION WORK" />

      {/* 6. CTA */}
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
              <p className={`${mono} text-red-400`}>Initiate spectacle logistics</p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl">Plan your next event with Stonovah</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Contact our senior event directors to discuss venue feasibility, crowd mechanics, security protocols, and technical stage requirements.
              </p>
            </div>
            <Link
              to="/request-service-event-coordination"
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