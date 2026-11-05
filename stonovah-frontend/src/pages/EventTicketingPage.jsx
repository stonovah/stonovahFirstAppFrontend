import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiTicket } from 'react-icons/hi2';
import { FiShield, FiLock, FiCheckCircle, FiArrowRight, FiZap, FiRefreshCw } from 'react-icons/fi';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import FeaturedEvents from '../components/portfolio/FeaturedEvents';
import { Link } from 'react-router-dom';

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

const attendeeFeatures = [
  { num: '01', title: 'Guaranteed Authenticity', desc: 'Dynamic rotating QR barcodes tied to verified user IDs prevent screenshot fraud, duplicates, and unauthorized resale.' },
  { num: '02', title: 'Fair Market Price Caps', desc: 'Secondary transfers are capped directly on-chain at face value, completely eliminating predatory scalp pricing.' },
  { num: '03', title: 'Instant Peer Transfers', desc: 'Transfer tickets securely to friends in one tap without exorbitant administrative fees or third-party delay risks.' },
];

const organizerFeatures = [
  { num: '01', title: '0% Unauthorised Resale', desc: 'Complete control over secondary market mechanics with programmable royalty enforcement on every single resale.' },
  { num: '02', title: 'Real-Time Gate Telemetry', desc: 'Live RFID and QR scan metrics stream directly to your command console for bottleneck monitoring and gate routing.' },
  { num: '03', title: 'Automated Instant Payouts', desc: 'Smart contract escrow releases revenue instantly at show time or according to custom milestone schedules.' },
];

const securityPoints = [
  { title: 'Dynamic Time-Based QR Tokens', desc: 'Barcodes refresh every 15 seconds. Static screenshots will fail at turnstile readers immediately.' },
  { title: 'Identity-Linked Passports', desc: 'Tickets are tethered to biometric or phone authentication, rendering stolen pass dumps useless.' },
  { title: 'Encrypted Resale Protocol', desc: 'Resale can only occur inside the official venue exchange, preserving full price control and revenue split.' },
];

const bannerStats = [
  { icon: FiShield, label: 'Dynamic QR refresh (15s)' },
  { icon: FiLock, label: '0% black market exploit' },
  { icon: FiZap, label: 'Instant gate ingress' },
];

export default function TicketingPage() {
  const [activeTab, setActiveTab] = useState('attendees');

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* 1. HERO */}
      <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.18),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-14">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-4xl text-center">
            <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Sovereign ticketing architecture
            </motion.span>

            <motion.h1 variants={fadeInUp} className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Secure, anti-scalp ticketing <br />
              <span className="text-red-500">for cultural & live experiences</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65">
              Empowering fans with guaranteed fair prices while giving organizers absolute control over secondary sales, gate verification, and real-time revenue settlement.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/request-service?service=ticketing" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e10613] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]">
                <HiTicket className="text-sm" /> Request a service
              </Link>
              <a href="#security" className="inline-flex items-center justify-center gap-2 rounded-md bg-white/[0.07] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/[0.12]">
                How anti-scalp works <FiShield className="text-sm" />
              </a>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-14 flex flex-wrap items-center justify-around gap-4 border-t border-white/10 pt-8 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
              {bannerStats.map(({ icon: StatIcon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <StatIcon className="text-red-500" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. DUAL AUDIENCE FEATURES */}
      <section id="features" className="bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Built for sovereignty</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Engineered for Attendees. <br className="hidden sm:inline" />
                Built for Organizers.
              </h2>
            </div>

            <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
              {[['attendees', 'For attendees'], ['organizers', 'For organizers']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`cursor-pointer rounded-md px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                    activeTab === key ? 'bg-[#e10613] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-5 md:grid-cols-3"
            >
              {(activeTab === 'attendees' ? attendeeFeatures : organizerFeatures).map((item) => (
                <motion.div
                  key={item.num}
                  whileHover={{ y: -4 }}
                  className="flex flex-col justify-between rounded-xl border border-white/[0.07] bg-[#161616] p-7 transition-colors hover:border-white/25"
                >
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-red-500">{item.num}</span>
                      <span className="rounded bg-black/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/70">
                        {activeTab === 'attendees' ? 'Fan protect' : 'Host control'}
                      </span>
                    </div>
                    <h3 className="mb-3 text-lg font-bold leading-snug">{item.title}</h3>
                    <p className="mb-6 text-xs leading-relaxed text-white/50">{item.desc}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 font-mono text-[10px] text-white/35">
                    <span>SYSTEM GUARANTEE</span>
                    <FiCheckCircle className="text-red-500" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 3. FEATURED LIVE EXPERIENCES */}
      <section id="events" className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Official dispatch</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Featured Live Experiences</h2>
            </div>
            <span className={`${mono} text-white/50`}>Secure checkout by Paystack</span>
          </motion.div>

          <FeaturedEvents />
        </div>
      </section>

      {/* 4. SECURITY PROTOCOL */}
      <section id="security" className="bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="rounded-xl border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.14),#161616_60%)] p-8 md:p-12"
          >
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="mb-3 inline-block rounded bg-[#e10613] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                  Protocol explanation
                </span>
                <h2 className="mb-4 text-2xl font-black uppercase leading-tight tracking-tight md:text-3xl">
                  Why Stonovah tickets cannot be extorted or resold on unverified black markets
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-white/60">
                  Legacy ticketing systems rely on static barcodes easily duplicated, screenshotted, and scalped at 500% markups. Stonovah locks ticket ownership behind cryptographic identity verification.
                </p>

                <div className="space-y-3">
                  {securityPoints.map((pt) => (
                    <div key={pt.title} className="flex items-start gap-3 rounded-lg border border-white/[0.07] bg-black/30 p-4">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-red-500">
                        <FiShield />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide">{pt.title}</h4>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">{pt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-white/[0.07] bg-black/30 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-2xl text-red-500">
                    <FiRefreshCw className="animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <span className={`${mono} block text-[9px] text-red-400`}>Live security status</span>
                    <h4 className="mt-1 text-sm font-bold uppercase">Dynamic token active</h4>
                    <p className="mt-1 text-[11px] text-white/50">Refreshes every 15 seconds to ensure 100% turnstile validity.</p>
                  </div>
                  <div className="flex w-full items-center justify-between rounded-lg border border-white/[0.07] bg-[#0a0a0a] p-3 font-mono text-[10px] text-white/60">
                    <span>ENCRYPTION LOG:</span>
                    <span className="text-red-400">0x8F9...3B1 [VALID]</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. CTA */}
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
              <p className={`${mono} text-red-400`}>Organizer intake</p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl">
                Ready to sell tickets on the most sovereign platform in entertainment?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Connect with our ticketing directors to set up fair-market cap rules, dynamic QR access, and automated gate telemetry for your next event.
              </p>
            </div>
            <Link
              to="/organizer/register"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#e10613] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]"
            >
              Create organizer account <FiArrowRight className="text-sm" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}