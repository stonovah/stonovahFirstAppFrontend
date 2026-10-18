import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiTicket } from 'react-icons/hi2';
import { 
  FiShield, FiLock, FiCheckCircle, FiArrowRight, 
  FiUserCheck, FiDollarSign, FiZap, FiCheck, FiCpu, FiGlobe, 
  FiAlertTriangle, FiRefreshCw
} from 'react-icons/fi';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import FeaturedEvents from '../components/portfolio/FeaturedEvents';
import { Link } from 'react-router-dom';

export default function TicketingPage() {
  const [activeTab, setActiveTab] = useState('attendees');

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

  // 1. Dual Audience Features
  const attendeeFeatures = [
    {
      num: '01',
      title: 'Guaranteed Authenticity',
      desc: 'Dynamic rotating QR barcodes tied to verified user IDs prevent screenshot fraud, duplicates, and unauthorized resale.'
    },
    {
      num: '02',
      title: 'Fair Market Price Caps',
      desc: 'Secondary transfers are capped directly on-chain at face value, completely eliminating predatory scalp pricing.'
    },
    {
      num: '03',
      title: 'Instant Peer Transfers',
      desc: 'Transfer tickets securely to friends in one tap without exorbitant administrative fees or third-party delay risks.'
    }
  ];

  const organizerFeatures = [
    {
      num: '01',
      title: '0% Unauthorised Resale',
      desc: 'Complete control over secondary market mechanics with programmable royalty enforcement on every single resale.'
    },
    {
      num: '02',
      title: 'Real-Time Gate Telemetry',
      desc: 'Live RFID and QR scan metrics stream directly to your command console for bottleneck monitoring and gate routing.'
    },
    {
      num: '03',
      title: 'Automated Instant Payouts',
      desc: 'Smart contract escrow releases revenue instantly at show time or according to custom milestone schedules.'
    }
  ];


  // 3. Security Bullet Points
  const securityPoints = [
    {
      title: 'Dynamic Time-Based QR Tokens',
      desc: 'Barcodes refresh every 15 seconds. Static screenshots will fail at turnstile readers immediately.'
    },
    {
      title: 'Identity-Linked Passports',
      desc: 'Tickets are tethered to biometric or phone authentication, rendering stolen pass dumps useless.'
    },
    {
      title: 'Encrypted Resale Protocol',
      desc: 'Resale can only occur inside the official venue exchange, preserving full price control and revenue split.'
    }
  ];

  return (
    <main className="min-h-screen bg-[#FFBF00] text-[#111111] font-sans antialiased selection:bg-[#E50914] selection:text-white">
      
      {/* HEADER / NAVIGATION */}
      <Navbar/>

      {/* 1. HERO SECTION */}
      <section className="relative px-6 pt-12 pb-20 max-w-7xl mx-auto border-b border-[#111111]/20">
        <div className="max-w-4xl mx-auto text-center">
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-xs font-mono font-bold text-[#E50914] tracking-widest block mb-3 uppercase">
              SOVEREIGN TICKETING ARCHITECTURE
            </motion.span>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-[#111111]">
              SECURE, ANTI-SCALP TICKETING <br />
              <span className="text-[#E50914]">FOR CULTURAL & LIVE EXPERIENCES</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xs sm:text-sm text-neutral-900 font-medium leading-relaxed max-w-2xl mx-auto mb-8">
              Empowering fans with guaranteed fair prices while giving organizers absolute control over secondary sales, gate verification, and real-time revenue settlement.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center items-center gap-4 mb-10">
              <Link to="/request-service?service=ticketing">
                <motion.span 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#E50914] hover:bg-red-700 text-white font-black text-xs px-6 py-3.5 rounded transition uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-950/20"
                >
                  <HiTicket /> REQUEST A SERVICE
                </motion.span>
              </Link>

              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#security"
                className="bg-[#111111] hover:bg-black text-[#FFBF00] font-bold text-xs px-6 py-3.5 rounded transition uppercase tracking-wider flex items-center gap-2"
              >
                HOW ANTI-SCALP WORKS <FiShield />
              </motion.a>
            </motion.div>

            {/* Quick Banner Stats */}
            <motion.div variants={fadeInUp} className="bg-[#111111] text-white p-4 rounded-2xl border border-black/20 shadow-2xl flex flex-wrap justify-around items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <FiShield className="text-[#FFBF00]" />
                <span>DYNAMIC QR REFRESH (15s)</span>
              </div>
              <div className="flex items-center gap-2">
                <FiLock className="text-[#E50914]" />
                <span>0% BLACK MARKET EXPLOIT</span>
              </div>
              <div className="flex items-center gap-2">
                <FiZap className="text-emerald-400" />
                <span>INSTANT GATE INGRESS</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 2. DUAL AUDIENCE FEATURES (TOGGLE / CARDS) */}
      <section id="features" className="px-6 py-20 max-w-7xl mx-auto border-b border-[#111111]/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-1">
              BUILT FOR SOVEREIGNTY
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111111]">
              ENGINEERED FOR ATTENDEES. <br className="hidden sm:inline" />
              BUILT FOR ORGANIZERS.
            </h2>
          </div>

          {/* Toggle Buttons */}
          <div className="bg-[#111111] p-1.5 rounded-xl flex gap-1 border border-black/20">
            <button
              onClick={() => setActiveTab('attendees')}
              className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                activeTab === 'attendees' 
                  ? 'bg-[#E50914] text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              For Attendees
            </button>
            <button
              onClick={() => setActiveTab('organizers')}
              className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                activeTab === 'organizers' 
                  ? 'bg-[#E50914] text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              For Organizers
            </button>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {(activeTab === 'attendees' ? attendeeFeatures : organizerFeatures).map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6 }}
                className="bg-[#111111] text-white p-7 rounded-2xl border border-black/20 flex flex-col justify-between shadow-2xl hover:border-[#E50914] transition duration-300"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-2xl font-black font-mono text-[#E50914]">
                      {item.num}
                    </span>
                    <span className="text-[10px] font-mono text-[#FFBF00] bg-[#1D1D1D] px-2.5 py-1 rounded border border-neutral-800 uppercase">
                      {activeTab === 'attendees' ? 'FAN PROTECT' : 'HOST CONTROL'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold uppercase mb-3 text-white leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span>SYSTEM GUARANTEE</span>
                  <FiCheckCircle className="text-emerald-400" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 3. FEATURED LIVE EXPERIENCES */}
      <section id="events" className="px-6 py-20 max-w-7xl mx-auto border-b border-[#111111]/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-1">
              OFFICIAL DISPATCH
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111111]">
              FEATURED LIVE EXPERIENCES
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-900 font-bold">
            SECURE CHECKOUT BY PAYSTACK
          </span>
        </motion.div>

        <FeaturedEvents />
      </section>

      {/* 4. ANTI-SCALP SECURITY PROTOCOL */}
      <section id="security" className="px-6 py-20 max-w-7xl mx-auto border-b border-[#111111]/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="bg-[#111111] text-white p-8 md:p-12 rounded-3xl border border-black/20 shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7">
              <span className="bg-[#E50914] text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase inline-block mb-3">
                PROTOCOL EXPLANATION
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase text-white mb-4 leading-tight">
                WHY STONOVAH TICKETS CANNOT BE EXTORTED OR RESOLD ON UNVERIFIED BLACK MARKETS
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                Legacy ticketing systems rely on static barcodes easily duplicated, screenshotted, and scalped at 500% markups. Stonovah locks ticket ownership behind cryptographic identity verification.
              </p>

              <div className="space-y-4">
                {securityPoints.map((pt, pIdx) => (
                  <div key={pIdx} className="bg-[#181818] p-4 rounded-xl border border-neutral-800 flex items-start gap-3">
                    <div className="p-2 rounded bg-[#E50914]/20 text-[#E50914] mt-0.5">
                      <FiShield />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{pt.title}</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{pt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[#181818] p-6 rounded-2xl border border-neutral-800 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E50914]/20 text-[#E50914] flex items-center justify-center text-2xl border border-[#E50914]/40">
                  <FiRefreshCw className="animate-spin" style={{ animationDuration: '6s' }} />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#FFBF00] uppercase font-bold block">LIVE SECURITY STATUS</span>
                  <h4 className="text-sm font-bold text-white uppercase mt-1">DYNAMIC TOKEN ACTIVE</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">Refreshes every 15 seconds to ensure 100% turnstile validity.</p>
                </div>

                <div className="w-full bg-[#111111] p-3 rounded-lg font-mono text-[10px] text-emerald-400 border border-neutral-800 flex justify-between items-center">
                  <span>ENCRYPTION LOG:</span>
                  <span>0x8F9...3B1 [VALID]</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section id="contact" className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="bg-[#111111] text-white p-10 md:p-14 rounded-3xl border border-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-10 -left-10 w-80 h-80 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-2">
              ORGANIZER INTAKE
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase mb-3 text-white leading-tight">
              Ready to sell tickets on the most sovereign platform in entertainment?
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Connect with our ticketing directors to set up fair-market cap rules, dynamic QR access, and automated gate telemetry for your next event.
            </p>
          </div>

          <Link to="/organizer/register">
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#E50914] hover:bg-red-700 text-white font-black text-xs uppercase px-8 py-4 rounded-xl transition tracking-wider shadow-xl shadow-red-950/50 whitespace-nowrap"
              >
                CREATE ORGANIZER ACCOUNT
              </motion.button>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <Footer/>

    </main>
  );
}