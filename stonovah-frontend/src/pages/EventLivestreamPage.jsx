import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiArrowRight, FiCheckCircle, FiRadio, 
  FiCpu, FiZap, FiGlobe, FiLayers, FiVideo, FiShield, FiSliders
} from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Link } from 'react-router-dom';
import RecentWork from '../components/portfolio/RecentWork';

export default function LivestreamCoordinationPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  // 1. Core Engineering Pillars
  const pillars = [
    {
      icon: <FiZap className="text-[#E50914] text-xl" />,
      title: 'High-Bitrate 4K UHD Transport',
      desc: 'Uncompressed multi-camera ingest fed directly into edge-compute encoders running proprietary SRT/Zixi protocols.'
    },
    {
      icon: <FiRadio className="text-[#E50914] text-xl" />,
      title: 'Lossless Audio Transmission',
      desc: '32-bit floating point Dante/AES67 audio streams routed with zero jitter across redundant fiber lines.'
    },
    {
      icon: <FiGlobe className="text-[#E50914] text-xl" />,
      title: 'Hybrid Architecture & Custom CDNs',
      desc: 'Direct peering with tier-1 transit providers and custom edge nodes ensuring sub-500ms latency globally.'
    },
    {
      icon: <FiShield className="text-[#E50914] text-xl" />,
      title: 'Non-Redundant Failover Matrix',
      desc: 'Triple-path automated failover spanning satellite, bond 5G cellular, and dual ISP connections.'
    }
  ];

  // 2. 4-Step Architecture Data
  const steps = [
    {
      num: '01',
      title: 'PRE-PRODUCTION & ON-SITE SETUP',
      desc: 'Site survey, technical rigging, signal calibration, network stress-testing, and primary/secondary encoder synchronization.'
    },
    {
      num: '02',
      title: 'IN-REGION EDGE ENCODING',
      desc: 'Live high-bitrate video ingest converted on hardware accelerators using ultra-low latency HEVC/AV1 encoding profiles.'
    },
    {
      num: '03',
      title: 'MULTI-PLATFORM CLOUD DISTRIBUTION',
      desc: 'Simulcasting across YouTube, Twitch, custom paywall portals, and private enterprise RTMP/SRT endpoints.'
    },
    {
      num: '04',
      title: 'REAL-TIME TELEMETRY & GATE CONTROL',
      desc: 'Active monitoring of frame drop rates, bitrate stability, viewer engagement analytics, and instant failover execution.'
    }
  ];

  // 3. Broadcast Fleet Infrastructure
  const fleetItems = [
    {
      title: 'Cinema Camera Packages',
      desc: 'Full-frame 4K cinema cameras equipped with optical fiber backs and remote tally/shutter controls.',
      specs: [
        { name: 'Sensor Format', val: 'Full Frame 35mm' },
        { name: 'Signal Path', val: '12G-SDI / Optical Fiber' },
        { name: 'Dynamic Range', val: '15+ Stops HDR' },
        { name: 'Lens System', val: 'PL/EF Mount Cinema Glass' }
      ]
    },
    {
      title: 'Deck Equipment & Video Switching',
      desc: 'Enterprise switcher control panels paired with multi-channel slow-mo replay units and instant graphics insertion.',
      specs: [
        { name: 'Switcher Nodes', val: '4ME 4K Production Switcher' },
        { name: 'Replay Engine', val: '8-Channel Instant Replay' },
        { name: 'Graphics Ingest', val: 'Real-time 3D Keying' },
        { name: 'Color Grading', val: 'Live Broadcast LUT Tables' }
      ]
    },
    {
      title: 'Interactive Paywall & Moderation',
      desc: 'Monetized live streaming interfaces integrated with dynamic ticket validation and automated chat moderation.',
      specs: [
        { name: 'Access Control', val: 'Dynamic Tokenized Passes' },
        { name: 'Latency Profile', val: '< 500ms Ultra-Low Latency' },
        { name: 'Security Protocol', val: 'AES-256 DRM Encryption' },
        { name: 'Chat AI Mod', val: 'Automated Language Filtering' }
      ]
    },
    {
      title: 'Multi-Angle Interactive Player',
      desc: 'Custom web video player allowing audience members to switch between multiple live camera feeds in real-time.',
      specs: [
        { name: 'Camera Angles', val: 'Up to 16 Synchronized Feeds' },
        { name: 'Audio Selector', val: 'Multi-language Track Switch' },
        { name: 'Platform Support', val: 'iOS, Android, Web, Smart TV' },
        { name: 'Bandwidth Mode', val: 'Adaptive Bitrate Transcoding' }
      ]
    }
  ];

  

  return (
    <main className="min-h-screen bg-[#FFBF00] text-[#111111] font-sans antialiased selection:bg-[#E50914] selection:text-white">
      
      {/* TOP NAVIGATION BAR */}
      <Navbar/>

      {/* 1. HERO SECTION */}
      <section className="relative px-6 pt-12 pb-20 max-w-7xl mx-auto border-b border-[#111111]/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-7"
          >
            <motion.span variants={fadeInUp} className="text-xs font-mono font-bold text-[#E50914] tracking-widest block mb-2 uppercase">
              LIVE BROADCAST LOGISTICS // ULTRA-LOW LATENCY
            </motion.span>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-[#111111]">
              LOSSLESS, ULTRA- <br />
              <span className="text-[#E50914]">LOW LATENCY</span> <br />
              LIVESTREAM <br />
              COORDINATION
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xs sm:text-sm text-neutral-900 font-medium leading-relaxed max-w-xl mb-8">
              A military-grade live broadcast infrastructure delivering uncompressed 4K video feeds, zero-packet-loss audio routing, and direct CDN syndication for global high-stakes spectacles.
            </motion.p>

            {/* Action Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 mb-10">
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#contact"
                className="bg-[#E50914] hover:bg-red-700 text-white font-black text-xs px-6 py-3.5 rounded transition uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-950/20"
              >
                <FiPlay className="fill-current" /> INITIATE LIVESTREAM
              </motion.a>

              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#architecture"
                className="bg-[#111111] hover:bg-black text-[#FFBF00] font-bold text-xs px-6 py-3.5 rounded transition uppercase tracking-wider flex items-center gap-2"
              >
                SYSTEM ARCHITECTURE <FiArrowRight />
              </motion.a>
            </motion.div>

            {/* Hero Tech Metrics Cards */}
            <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-3">
              <div className="bg-[#111111] text-white p-3.5 rounded-lg border border-black/10">
                <span className="block text-xl font-black text-[#FFBF00]">50 - 150 Mbps</span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mt-0.5">Custom Bitrate Stream</span>
              </div>
              <div className="bg-[#111111] text-white p-3.5 rounded-lg border border-black/10">
                <span className="block text-xl font-black text-[#E50914]">&lt; 350ms</span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mt-0.5">Sub-Second Latency</span>
              </div>
              <div className="bg-[#111111] text-white p-3.5 rounded-lg border border-black/10">
                <span className="block text-xl font-black text-white">Triple Failover</span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mt-0.5">5G / Fiber / Satellite</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Hero Control Room Preview */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="bg-[#111111] rounded-2xl p-3 border-2 border-black/20 shadow-2xl overflow-hidden">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video group">
                <img 
                  src="https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1200&q=80" 
                  alt="Broadcast Control Room" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                
                {/* Overlay Live Telemetry Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-[#E50914] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE FEED 01
                  </span>
                  <span className="bg-black/80 backdrop-blur text-neutral-300 text-[9px] font-mono px-2 py-0.5 rounded border border-neutral-700">
                    4K @ 60 FPS
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                  <div>
                    <span className="text-[10px] font-mono text-[#FFBF00] font-bold block uppercase">BROADCAST HUB</span>
                    <span className="text-xs font-bold uppercase">Main Control Room Terminal</span>
                  </div>
                  <span className="text-[10px] font-mono bg-neutral-900/90 text-neutral-300 px-2 py-1 rounded border border-neutral-700">
                    SRT ENCRYPTION: ACTIVE
                  </span>
                </div>
              </div>

              {/* Status bar underneath preview */}
              <div className="mt-3 bg-[#181818] p-3 rounded-lg border border-neutral-800 flex items-center justify-between text-xs text-neutral-300 font-mono">
                <div className="flex items-center gap-2">
                  <FiCpu className="text-[#FFBF00]" />
                  <span>ENCODER LOAD: 32%</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiZap className="text-emerald-400" />
                  <span>JITTER: 0.4ms</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. ENGINEERING PRECISION BEHIND EVERY FRAME */}
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
              CORE SPECS
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111111]">
              ENGINEERING PRECISION <br />BEHIND EVERY FRAME
            </h2>
          </div>
          <p className="text-xs font-medium text-neutral-900 max-w-md leading-relaxed">
            Eliminating stream drops, latency spikes, and audio desynchronization through dedicated hardware setups and custom protocol routing.
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
              className="bg-[#111111] text-white p-6 rounded-xl border border-black/20 flex flex-col justify-between group shadow-2xl"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#1D1D1D] flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300 border border-neutral-800">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold uppercase mb-3 text-white group-hover:text-[#FFBF00] transition">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>SPEC READY</span>
                <span className="text-[#FFBF00] group-hover:translate-x-1 transition-transform">↗</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>


      {/* 5. RECENT GLOBAL TRANSMISSIONS */}
      <RecentWork scope="Livestream" id="transmissions" eyebrow="FIELD ARCHIVE" title="RECENT LIVESTREAM WORK" />

      {/* 6. CALL TO ACTION BANNER */}
      <section id="contact" className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="bg-[#111111] text-white p-10 md:p-14 rounded-3xl border border-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-2">
              INITIATE BROADCAST OPS
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase mb-3 text-white leading-tight">
              READY TO BROADCAST YOUR NEXT MILESTONE PRODUCTION?
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Connect directly with our lead broadcast engineering crew to reserve equipment, audit venue connectivity, and configure custom ultra-low latency streams.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#E50914] hover:bg-red-700 text-white font-black text-xs uppercase px-8 py-4 rounded-xl transition tracking-wider shadow-xl shadow-red-950/50 whitespace-nowrap"
            >
              BOOK LIVESTREAM FLEET
            </motion.button>
            <Link to="/request-service?service=livestream">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#1D1D1D] hover:bg-neutral-800 text-[#FFBF00] border border-neutral-700 font-bold text-xs uppercase px-6 py-4 rounded-xl transition tracking-wider whitespace-nowrap"
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