import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPlay, FiArrowRight, FiCheckCircle, FiCheck, FiUsers, 
  FiZap, FiShield, FiSliders, FiClock, FiGlobe, FiLayers
} from 'react-icons/fi';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { Link } from 'react-router-dom';
import RecentWork from '../components/portfolio/RecentWork';

export default function EventCoordinationPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  // 1. Four Pillars of Flawless Delivery
  const pillars = [
    {
      code: 'PILLAR // 01',
      title: 'VIP & Diplomatic Protocol Management',
      desc: 'Precision security routing, high-profile delegation intake, private lounge coordination, and real-time escort logistics.',
      specs: ['Armored Convoys', 'Fast-Track Ingress', 'Bespoke Escorts']
    },
    {
      code: 'PILLAR // 02',
      title: 'Artiste & Artist VIP Hospitality',
      desc: 'Green room architecture, tailored rider fulfillment, soundcheck scheduling, and dedicated stage-door transit.',
      specs: ['Rider Logistics', 'Acoustic Lounges', 'Private Transit']
    },
    {
      code: 'PILLAR // 03',
      title: 'Arena & Large-Scale Crowd Mechanics',
      desc: 'RFID turnstiles, anti-scalp gate validation, zone flow management, and active bottleneck reduction systems.',
      specs: ['RFID Scanners', 'Zone Barrier Ops', 'Real-time Telemetry']
    },
    {
      code: 'PILLAR // 04',
      title: 'Technical Directing & Show-Calling',
      desc: 'Master timecode synchronization, multi-crew comms, precision pyrotechnics timing, and live stage management.',
      specs: ['Show Control Sync', 'Comms Matrix', 'Pyro Safety Ops']
    }
  ];

  // 2. The 4-Step Production Engine
  const steps = [
    {
      num: '01',
      title: 'INTAKE & ARCHITECTURE',
      desc: 'Venue site mapping, spatial flow design, power distribution audits, emergency evacuation routing, and crew allocation.',
      highlights: ['Site Mapping', 'Power Audits', 'Safety Plan']
    },
    {
      num: '02',
      title: 'TECHNICAL SOUNDCHECK',
      desc: 'Rigging stress tests, LED wall calibration, line checks across main FOH and monitors, and timecode alignment.',
      highlights: ['Rigging Checks', 'LED Calibration', 'FOH Tuning']
    },
    {
      num: '03',
      title: 'LIVE SHOW EXECUTION & GATE LOCK',
      desc: 'Master stage directing, multi-channel crew communications, live press dispatch, and turnstile monitoring.',
      highlights: ['Show Calling', 'Press Sync', 'Crowd Telemetry']
    },
    {
      num: '04',
      title: 'STRIKE & ARCHIVAL CLEARANCE',
      desc: 'Rapid stage strike, equipment inventory audit, raw footage handoff, and venue handover within scheduled timeline.',
      highlights: ['Stage Strike', 'Asset Backup', 'Site Handover']
    }
  ];

  // 3. Included in Every Production
  const inclusions = [
    {
      title: 'Redundant Power Ingestion',
      desc: 'Dual-generator sync with automated seamless transfer units ensuring 0ms power interruption.'
    },
    {
      title: 'Master Show Controller Hub',
      desc: 'Central command trailer equipped with broadcast monitors, multi-frequency radios, and venue CCTV feeds.'
    },
    {
      title: 'Paramedic & Emergency Response',
      desc: 'On-site medical stations, dedicated emergency exit lanes, and direct ambulance routing.'
    },
    {
      title: 'Dedicated Client Hospitality Concierge',
      desc: 'Dedicated single point of contact handling real-time rider changes, VIP arrivals, and executive demands.'
    },
    {
      title: 'On-Site Rapid Print & Credentials',
      desc: 'High-speed PVC badge printing for last-minute press, staff, and VIP access upgrades.'
    },
    {
      title: 'Post-Event Metric Breakdown',
      desc: 'Comprehensive gate audit reporting, crowd density heatmaps, and technical performance logs.'
    }
  ];

  return (
    <main className="min-h-screen bg-[#FFBF00] text-[#111111] font-sans antialiased selection:bg-[#E50914] selection:text-white">
      
      {/* HEADER / NAVIGATION */}
      <Navbar/>

      {/* 1. HERO SECTION */}
      <section className="relative px-6 pt-12 pb-20 max-w-7xl mx-auto border-b border-[#111111]/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-8"
          >
            <motion.span variants={fadeInUp} className="text-xs font-mono font-bold text-[#E50914] tracking-widest block mb-2 uppercase">
              HIGH-STAKES STAGE DIRECTING & CROWD LOGISTICS
            </motion.span>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-[#111111]">
              END-TO-END EVENT <br />
              COORDINATION & <br />
              <span className="text-[#E50914]">CULTURAL SPECTACLES</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xs sm:text-sm text-neutral-900 font-medium leading-relaxed max-w-2xl mb-8">
              Full-scale production management for arenas, summits, and cultural festivals. From VIP diplomatic intake to master stage directing and real-time gate telemetry.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 mb-10">
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/request-service-event-coordination"
                className="bg-[#E50914] hover:bg-red-700 text-white font-black text-xs px-6 py-3.5 rounded transition uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-950/20"
              >
                <FiZap /> REQUEST A SERVICE
              </motion.a>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#111111] text-white p-3.5 rounded-lg border border-black/10">
                <span className="block text-2xl font-black text-[#FFBF00]">99.8%</span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mt-0.5">On-Time Show Execution</span>
              </div>
              <div className="bg-[#111111] text-white p-3.5 rounded-lg border border-black/10">
                <span className="block text-2xl font-black text-[#E50914]">120+</span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mt-0.5">Arena Spectacles Managed</span>
              </div>
              <div className="bg-[#111111] text-white p-3.5 rounded-lg border border-black/10 sm:col-span-1 col-span-2">
                <span className="block text-2xl font-black text-white">0.00%</span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mt-0.5">Security Failure Rate</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Side Stats Box */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-4"
          >
            <div className="bg-[#111111] text-white p-6 rounded-2xl border-2 border-black/20 shadow-2xl space-y-6">
              <div className="border-b border-neutral-800 pb-4">
                <span className="text-[10px] font-mono text-[#E50914] font-bold block uppercase">CAPACITY HANDLING</span>
                <span className="text-3xl font-black text-white block mt-1">50,000+</span>
                <span className="text-xs text-neutral-400">Single-day stadium crowd coordination capacity</span>
              </div>

              <div className="border-b border-neutral-800 pb-4">
                <span className="text-[10px] font-mono text-[#FFBF00] font-bold block uppercase">GATE INGRESS SPEEDS</span>
                <span className="text-3xl font-black text-white block mt-1">&lt; 2.4s</span>
                <span className="text-xs text-neutral-400">Average turnstile scanning duration per attendee</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">ACTIVE CREW NETWORK</span>
                <span className="text-3xl font-black text-white block mt-1">350+</span>
                <span className="text-xs text-neutral-400">Vetted stage managers, riggers & security personnel</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. FOUR PILLARS OF FLAWLESS DELIVERY */}
      <section id="pillars" className="px-6 py-20 max-w-7xl mx-auto border-b border-[#111111]/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-1">
              OPERATIONAL EXCELLENCE
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111111]">
              FOUR PILLARS OF FLAWLESS DELIVERY
            </h2>
          </div>
          <p className="text-xs font-medium text-neutral-900 max-w-md leading-relaxed">
            Eliminating friction points between high-profile talent, massive audience turnout, and complex technical production requirements.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {pillars.map((item, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="bg-[#111111] text-white p-7 rounded-xl border border-black/20 flex flex-col justify-between group shadow-2xl hover:border-[#E50914] transition duration-300"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-mono font-bold text-[#E50914] tracking-widest uppercase">
                    {item.code}
                  </span>
                  <span className="text-neutral-400 group-hover:text-[#FFBF00] transition">↗</span>
                </div>
                <h3 className="text-lg font-bold uppercase mb-3 text-white group-hover:text-[#FFBF00] transition leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 space-y-1.5">
                {item.specs.map((spec, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2 text-[10px] font-mono text-neutral-300">
                    <FiCheck className="text-[#FFBF00]" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. THE 4-STEP PRODUCTION ENGINE */}
      <section id="engine" className="px-6 py-20 max-w-7xl mx-auto border-b border-[#111111]/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mb-12"
        >
          <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-1">
            METHODOLOGY
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111111]">
            THE 4-STEP PRODUCTION ENGINE
          </h2>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {steps.map((s, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              onClick={() => setActiveStep(idx)}
              className={`p-6 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                activeStep === idx 
                  ? 'bg-[#111111] text-white border-[#E50914] shadow-2xl scale-[1.02]' 
                  : 'bg-[#111111]/90 text-white border-black/20 hover:border-[#FFBF00]/50'
              }`}
            >
              <div>
                <span className={`text-3xl font-black font-mono block mb-3 ${activeStep === idx ? 'text-[#E50914]' : 'text-[#FFBF00]'}`}>
                  {s.num}
                </span>
                <h3 className="text-xs font-mono font-bold uppercase mb-2 text-neutral-300">
                  {s.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  {s.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 space-y-1">
                {s.highlights.map((h, hIdx) => (
                  <span key={hIdx} className="block text-[9px] font-mono text-neutral-400">
                    • {h}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. WHAT IS INCLUDED IN EVERY STONOVAH PRODUCTION */}
      <section id="included" className="px-6 py-20 max-w-7xl mx-auto border-b border-[#111111]/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mb-12"
        >
          <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-1">
            STANDARD PACKAGE
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111111]">
            WHAT IS INCLUDED IN EVERY STONOVAH PRODUCTION
          </h2>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {inclusions.map((inc, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-[#111111] text-white p-7 rounded-2xl border border-black/20 shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded bg-[#1D1D1D] flex items-center justify-center text-[#E50914] mb-4 border border-neutral-800 font-bold text-sm">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold uppercase text-[#FFBF00] mb-2 leading-snug">
                  {inc.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {inc.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>GUARANTEED STANDARD</span>
                <FiCheckCircle className="text-emerald-400" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. CASE STUDY: PAN-AFRICAN FILM SUMMIT & GALA */}
      <RecentWork scope="Event Coordination" id="case-study" eyebrow="FEATURED WORK" title="RECENT COORDINATION WORK" />

      {/* 6. CALL TO ACTION BANNER */}
      <section id="contact" className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="bg-[#111111] text-white p-10 md:p-14 rounded-3xl border border-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-2">
              INITIATE SPECTACLE LOGISTICS
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase mb-3 text-white leading-tight">
              PLAN YOUR NEXT EVENT WITH STONOVAH
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Contact our senior event directors to discuss venue feasibility, crowd mechanics, security protocols, and technical stage requirements.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link to="/request-service-event-coordination">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#E50914] hover:bg-red-700 text-white font-black text-xs uppercase px-8 py-4 rounded-xl transition tracking-wider shadow-xl shadow-red-950/50 whitespace-nowrap"
              >
                REQUEST A SERVICE
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <Footer/>

    </main>
  );
}