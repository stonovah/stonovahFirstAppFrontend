import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiPlay, FiArrowRight, FiCheckCircle, FiShield, 
  FiCamera, FiVideo, FiZap, FiRadio, FiCheck, FiDownload,
  FiSliders, FiHardDrive, FiCpu, FiGlobe, FiLayers
} from 'react-icons/fi';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import RecentWork from '../components/portfolio/RecentWork';

export default function CinematicMediaPage() {
  const [activeCadence, setActiveCadence] = useState(0);

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

  // 1. Disciplines & Field Execution
  const disciplines = [
    {
      code: 'EXEC // 01',
      title: 'High-Impact Press Photography',
      desc: 'Real-time wireless tethering, instant color grading, and automated metadata embedding for instant wire distribution.',
      link: '/disciplines/press-photo'
    },
    {
      code: 'EXEC // 02',
      title: 'Cinematic 4K Video Production',
      desc: 'Multi-camera cinema setups recording high-bitrate ProRes/RAW video for rapid same-day sizzle edit packages.',
      link: '/disciplines/video-prod'
    },
    {
      code: 'EXEC // 03',
      title: 'Talent & Journalist Interviews',
      desc: 'Dedicated backdrops, acoustic isolation kits, multi-mic setups, and broadcast lighting for press junkets.',
      link: '/disciplines/interviews'
    },
    {
      code: 'EXEC // 04',
      title: 'Signal Routing & Watermarking',
      desc: 'Secure live feeds, dynamic DRM watermarking, multi-tier press access portals, and cloud sync.',
      link: '/disciplines/signal-routing'
    }
  ];

  // 2. The 5-Day Precision Delivery Cadence
  const cadenceSteps = [
    {
      day: 'D - 1',
      phase: 'PRE-EVENT CALIBRATION',
      desc: 'Network load testing, optical line checks, LUT sync across cinema units, press credentials ingest, and cloud server provisioning.',
      status: 'PREPARATION'
    },
    {
      day: 'D + 0',
      phase: 'SAME-DAY REAL-TIME DISPATCH',
      desc: 'Live wireless camera tethering to local NAS hubs, automated AI face tagging, immediate press gallery uploads within 15 minutes.',
      status: 'REAL-TIME OPS'
    },
    {
      day: 'D + 2',
      phase: 'HIGHLIGHT REEL & EPK CUTS',
      desc: '4K cinema edit suite delivery of 60-second highlight cuts, talent soundbites, and formatted social media broadcast assets.',
      status: 'PROCESSING'
    },
    {
      day: 'D + 5',
      phase: 'FULL ARCHIVE & RAW ASSET MASTERS',
      desc: 'Complete high-res master repository access, searchable metadata logs, LTO tape backup, and final press reporting metrics.',
      status: 'FINAL DELIVERY'
    }
  ];

 
  // 4. Technical Hardware & Field Arsenal
  const hardware = [
    {
      title: 'RED V-Raptor 8K VV Cinema Systems',
      desc: 'Ultra-high dynamic range cinema sensors capable of 8K @ 120fps with wireless IP connectivity.',
      tag: 'CINEMA CAMERAS'
    },
    {
      title: 'Sony A1 & Live Wireless Transmitters',
      desc: '50MP high-speed still units paired with dedicated dual-band 5G transmitters for immediate FTP upload.',
      tag: 'PRESS STILLS'
    },
    {
      title: 'SanDisk Professional PRO-BLADE Systems',
      desc: 'Hot-swappable NVMe SSD mag architecture delivering 3000MB/s transfer speeds for multi-camera ingests.',
      tag: 'FAST MEDIA'
    },
    {
      title: '4K Ultra-Bright Field Client Monitors',
      desc: 'Calibrated DCI-P3 displays for real-time client preview, waveform monitoring, and wireless LUT verification.',
      tag: 'MONITORING'
    },
    {
      title: 'Dedicated On-Site Edit & Color Rig',
      desc: 'Mobile rack system with M-Series Max hardware, 10GbE network switches, and local RAID arrays.',
      tag: 'MOBILE POST'
    },
    {
      title: '10Gbps Bonded Cellular & Satellite Array',
      desc: 'Redundant high-bandwidth connectivity units ensuring guaranteed upload speeds in high-density arenas.',
      tag: 'CONNECTIVITY'
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
              FIELD CAPTURE & RAPID PRESS DISPATCH
            </motion.span>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-[#111111]">
              CINEMATIC MEDIA HANDLING <br />
              <span className="text-[#E50914]">& INSTANT PRESS DELIVERY</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xs sm:text-sm text-neutral-900 font-medium leading-relaxed max-w-2xl mb-8">
              End-to-end event media infrastructure combining cinema-grade optics, automated wireless ingest, live color workflows, and instant wire-service delivery for major global events.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 mb-10">
              <Link to="/request-service?service=media">
                <motion.span 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#E50914] hover:bg-red-700 text-white font-black text-xs px-6 py-3.5 rounded transition uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-950/20"
                >
                  <FiCamera /> REQUEST A SERVICE
                </motion.span>
              </Link>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#111111] text-white p-3.5 rounded-lg border border-black/10">
                <span className="block text-xl font-black text-[#FFBF00]">&lt; 15 MINS</span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mt-0.5">Tethered Photo Turnaround</span>
              </div>
              <div className="bg-[#111111] text-white p-3.5 rounded-lg border border-black/10">
                <span className="block text-xl font-black text-[#E50914]">8K RAW / 4K ProRes</span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mt-0.5">Cinema Capture Standard</span>
              </div>
              <div className="bg-[#111111] text-white p-3.5 rounded-lg border border-black/10 sm:col-span-1 col-span-2">
                <span className="block text-xl font-black text-white">Automated AI</span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mt-0.5">Metadata & Face Tagging</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Hero Visual Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-4"
          >
            <div className="bg-[#111111] p-4 rounded-2xl border-2 border-black/20 shadow-2xl">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/5] group">
                <img 
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80" 
                  alt="Camera Rig" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                
                <div className="absolute top-3 left-3">
                  <span className="bg-[#E50914] text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    MEDIA INGEST ACTIVE
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-mono text-[#FFBF00] font-bold block uppercase">FIELD WIRE</span>
                  <p className="text-xs font-bold uppercase mt-0.5">
                    Live FTP Tethering & Local RAID Sync
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. DISCIPLINES & FIELD EXECUTION */}
      <section id="disciplines" className="px-6 py-20 max-w-7xl mx-auto border-b border-[#111111]/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-1">
              FIELD CAPABILITIES
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111111]">
              DISCIPLINES & FIELD EXECUTION
            </h2>
          </div>
          <p className="text-xs font-medium text-neutral-900 max-w-md leading-relaxed">
            From high-speed red carpet photography to broadcast video cutdowns, we deploy dedicated units engineered for speed and precision.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {disciplines.map((item, idx) => (
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
                <p className="text-xs text-neutral-400 leading-relaxed mb-8">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-[10px] font-mono">
                <span className="text-neutral-500 uppercase">SPECS READY</span>
                <span className="font-bold text-[#FFBF00] group-hover:translate-x-1 transition-transform">
                  EXPLORE ↗
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. RECENT PRESS DISPATCHES & STAGE STILLS */}
      <RecentWork scope="Media" id="dispatches" eyebrow="PRODUCED WORK" title="RECENT MEDIA WORK" />


      {/* 6. CALL TO ACTION BANNER */}
      <section id="contact" className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="bg-[#111111] text-white p-10 md:p-14 rounded-3xl border border-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-2">
              RESERVE EVENT CREW
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase mb-3 text-white leading-tight">
              Equip your next event with world-class visual storytellers
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Get immediate technical quotes, crew availability for press junkets, and custom media routing solutions.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link to="/request-service?service=media">
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