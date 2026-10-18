import React from 'react';
import { 
  FiSliders, FiMusic, FiUsers, FiGlobe, 
  FiBookOpen, FiCompass, FiCheckCircle, 
  FiArrowRight, FiTv, FiSearch 
} from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import { Link } from 'react-router-dom';

export default function GeneralLandingPage() {
  // Operational Arms Grid Data (Including Courses as requested)
  const arms = [
    {
      code: '01 / PROD',
      title: 'PRODUCTION',
      tag: 'STUDIO SPEC / RECORD',
      desc: 'High-end audio/visual execution, commercial direction, multi-cam broadcast rigging, and mastering crafted for global theatrical and streaming release.',
      link: '#'
    },
    {
      code: '02 / MUS',
      title: 'MUSIC',
      tag: 'CATALOG VAULT',
      desc: 'A&R house, record label operations, acoustic engineering, sync scoring, and turning original audio into global IP.',
      link: '#'
    },
    {
      code: '03 / TALENT',
      title: 'TALENT MANAGEMENT',
      tag: 'ROSTER DIRECTORY',
      desc: 'Executive representation, tour hospitality, press marketing, multi-territory process management, and strategic brand partnership development.',
      link: '#'
    },
    {
      code: '04 / DIST',
      title: 'DISTRIBUTION',
      tag: 'GLOBAL PIPELINE',
      desc: 'Global direct distribution across theatrical networks, DSP platforms, streaming channels, and physical media fulfillment infrastructure.',
      link: '#'
    },
    {
      code: '05 / PUB',
      title: 'PUBLISHING',
      tag: 'DSP TRACK & LICENSE',
      desc: 'Ecosystem protection, worldwide royalty collection, synchronization rights, metadata management, and rights holder administration.',
      link: '#'
    },
    {
      code: '06 / EVENT',
      title: 'EVENTS',
      tag: 'TICKET & TURNSTILE',
      desc: 'Turnkey event logistics, high-throughput gate control systems, live broadcast integration, and arena-scale technical management.',
      link: '/events'
    },
    {
      code: '07 / EDU',
      title: 'COURSES',
      tag: 'ACADEMY & TRAINING',
      desc: 'Technical masterclasses in broadcast engineering, stage design, music business, and media logistics led by industry veterans.',
      link: '#'
    }
  ];

  // Live Now & Featured Releases Data
  const releases = [
    {
      badge: 'LIVESTREAM / BROADCAST',
      title: 'Stonovah Global Soundstage 2025',
      desc: 'The master gateway for independent artists to showcase, connect, and stream live 4K broadcasts to over 42 countries, completely uncompressed.',
      tag: 'Watch Live Stream & Preview →',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'
    },
    {
      badge: 'PUBLISHING / ESSENCE',
      title: 'The Architecture of Sound & Story',
      desc: 'A definitive manuscript on sonic branding, sound design systems, and modern royalty tracking across decentralized media channels.',
      tag: 'Explore Publishing Catalog →',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
    },
    {
      badge: 'ACADEMY / BROADCAST',
      title: 'Executive Creative Direction Masterclass',
      desc: 'Advanced curriculum in live broadcast management, spatial audio engineering, and IP syndication taught by industry leaders.',
      tag: 'Explore Studio Courses →',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FACC15] text-[#0A0A0A] font-sans">
      
      {/* 1. NAVBAR */}
      <Navbar/>

      {/* 2. HERO SECTION */}
      <section className="px-8 pt-16 pb-12 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-none mb-4">
          STONOVAH CREATIVE HOUSE<br />LIMITED
        </h1>
        <p className="text-sm md:text-base font-bold text-neutral-800 max-w-2xl mx-auto mb-8">
          A multimedia and distribution powerhouse partnering with creative individuals and brands.
        </p>

        <div className="flex justify-center items-center gap-4 mb-14">
          <a href="#arms">
            <button className="bg-[#0A0A0A] text-white text-xs font-bold uppercase px-6 py-3.5 rounded flex items-center gap-2">
              EXPLORE THE 7 ARMS <FiArrowRight />
            </button>
          </a>
          <button className="bg-[#C0201E] text-white text-xs font-bold uppercase px-6 py-3.5 rounded flex items-center gap-2">
            REQUSET A SERVICE
          </button>
        </div>

        {/* 4 HERO METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-[#0A0A0A] text-white p-5 rounded-lg text-left">
            <span className="text-[10px] font-mono font-bold text-[#FACC15] block uppercase">GLOBAL FOOTPRINT</span>
            <span className="text-2xl font-black block my-1">42+ Active</span>
            <span className="text-[10px] text-neutral-400 font-medium">Territories worldwide</span>
          </div>

          <div className="bg-[#0A0A0A] text-white p-5 rounded-lg text-left">
            <span className="text-[10px] font-mono font-bold text-[#FACC15] block uppercase">MASTER CATALOG</span>
            <span className="text-2xl font-black block my-1">180K+ Titles</span>
            <span className="text-[10px] text-neutral-400 font-medium">Monetized globally</span>
          </div>

          <div className="bg-[#0A0A0A] text-white p-5 rounded-lg text-left">
            <span className="text-[10px] font-mono font-bold text-[#FACC15] block uppercase">DISTRIBUTION</span>
            <span className="text-2xl font-black block my-1">14.8M Direct</span>
            <span className="text-[10px] text-neutral-400 font-medium">Pushed streaming listeners</span>
          </div>

          <div className="bg-[#0A0A0A] text-white p-5 rounded-lg text-left">
            <span className="text-[10px] font-mono font-bold text-[#FACC15] block uppercase">BROADCAST PIPELINE</span>
            <span className="text-2xl font-black block my-1">4K UHD HDR</span>
            <span className="text-[10px] text-neutral-400 font-medium">Uncompressed feed</span>
          </div>
        </div>
      </section>

      <hr className="border-[#0A0A0A]/20" />

      {/* 3. OPERATIONAL ARMS GRID SECTION */}
      <section className="px-8 py-16 max-w-7xl mx-auto" id="arms">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="inline-block bg-[#0A0A0A] text-[#FACC15] text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase mb-2">
              ARCHITECTURAL OVERVIEW
            </span>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              THE SEVEN OPERATIONAL ARMS
            </h2>
          </div>
          <p className="text-xs font-bold text-neutral-800 max-w-md leading-relaxed">
            Synchronized creative arms structured for cinematic audio, sonic engineering, sovereign publishing, and event impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arms.map((arm, idx) => (
            <Link to={arm.link} key={idx} className="block group">
                <div className="bg-[#0A0A0A] cursor-pointer text-white p-6 rounded-xl border border-neutral-800 flex flex-col justify-between h-full">
                <div>
                    <div className="flex justify-between items-center mb-6">
                    <div className="p-2 bg-neutral-900 border border-neutral-800 rounded">
                        <FiSliders className="text-[#FACC15] text-lg" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#C0201E] tracking-widest uppercase">
                        {arm.code}
                    </span>
                    </div>

                    <h3 className="text-lg font-black uppercase mb-3 tracking-wide">{arm.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                    {arm.desc}
                    </p>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#FACC15] uppercase font-bold">{arm.tag}</span>
                    {/* ✅ FIXED: Replaced nested <a> with a <span> */}
                    <span className="text-white group-hover:text-[#FACC15] flex items-center gap-1 transition-colors">
                    →
                    </span>
                </div>
                </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. LIVE NOW & FEATURED RELEASES (DARK SECTION) */}
      <section className="bg-[#0A0A0A] text-white px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C0201E] uppercase tracking-widest block mb-1">
                STREAMING & DISPATCH PIPELINE
              </span>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                LIVE NOW & FEATURED RELEASES
              </h2>
            </div>
            <a href="#" className="text-xs font-mono text-neutral-400 hover:text-white uppercase">
              Browse All Releases (42) →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {releases.map((rel, idx) => (
              <div key={idx} className="bg-[#121212] rounded-xl border border-neutral-800 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-44 relative overflow-hidden bg-neutral-900">
                    <img src={rel.image} alt={rel.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-[#C0201E] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      {rel.badge}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-base font-bold uppercase mb-2 leading-snug">{rel.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">{rel.desc}</p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <a href="#" className="text-xs font-mono text-[#FACC15] hover:underline font-bold block">
                    {rel.tag}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BLACK BANNER CALLOUT */}
      <section className="bg-[#FACC15] px-8 py-12">
        <div className="max-w-7xl mx-auto bg-[#0A0A0A] text-white p-8 md:p-10 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase tracking-widest block mb-2">
              EXECUTIVE & ENTERPRISE
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 tracking-tight">
              STONOVAH CREATIVE HOUSE
            </h2>
            <p className="text-xs text-neutral-400 max-w-xl">
              Partner directly with our board of directors and division heads for state co-productions, enterprise distribution deals, and exclusive talent representation.
            </p>
          </div>
          <button className="bg-[#C0201E] text-white font-bold text-xs uppercase px-6 py-3 rounded whitespace-nowrap">
            REQUEST A SERVICE
          </button>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-[#0A0A0A] text-white px-8 pt-12 pb-8 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-black tracking-tighter text-base">STONOVAH</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed mb-4">
              An ecosystem tailored for engineering prestigious productions, audio masters, live events, talent representation, and media distribution.
            </p>
            <span className="text-[10px] font-mono text-[#FACC15]">STONOVAH CREATIVE HOUSE LIMITED</span>
          </div>

          <div>
            <h4 className="font-mono text-[#FACC15] text-[10px] font-bold uppercase mb-3">OPERATIONAL ARMS</h4>
            <ul className="space-y-2 text-neutral-400 text-[11px]">
              <li><a href="#" className="hover:text-white">01 // Production</a></li>
              <li><a href="#" className="hover:text-white">02 // Music</a></li>
              <li><a href="#" className="hover:text-white">03 // Talent Management</a></li>
              <li><a href="#" className="hover:text-white">04 // Distribution</a></li>
              <li><a href="#" className="hover:text-white">05 // Publishing</a></li>
              <li><a href="#" className="hover:text-white">06 // Events</a></li>
              <li><a href="#" className="hover:text-white">07 // Courses</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[#FACC15] text-[10px] font-bold uppercase mb-3">HQ & DIRECT LINES</h4>
            <p className="text-neutral-400 text-[11px] mb-2">Executive Suites & Studio Group</p>
            <a href="mailto:contact@stonovah.com" className="text-white hover:underline block mb-1">contact@stonovah.com</a>
            <p className="text-neutral-400 text-[11px]">+1 (800) 540 - 7748</p>
            <span className="inline-block bg-neutral-900 text-neutral-400 text-[9px] font-mono px-2 py-1 rounded mt-3">24/7 Exec Desk Active</span>
          </div>

          <div>
            <h4 className="font-mono text-[#FACC15] text-[10px] font-bold uppercase mb-3">NETWORKS & PORTALS</h4>
            <ul className="space-y-2 text-neutral-400 text-[11px]">
              <li><a href="#" className="hover:text-white">Virtual Showroom</a></li>
              <li><a href="#" className="hover:text-white">SoundCloud Portal</a></li>
              <li><a href="#" className="hover:text-white">Unison Engine</a></li>
              <li><a href="#" className="hover:text-white">Enterprise Audio</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-neutral-900 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-500 font-mono gap-4">
          <p>© 2025 Stonovah Creative House Limited. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-300">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-300">Terms of Service</a>
            <a href="#" className="hover:text-neutral-300">Distribution Agreement</a>
          </div>
        </div>
      </footer>

    </div>
  );
}