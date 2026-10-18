// src/pages/Portfolio.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { WorkCard } from '../components/portfolio/RecentWork';
import { usePastEvents } from './public/publicLive';

const sel = 'bg-black text-white px-4 py-3 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-red-600 text-xs';

export default function Portfolio() {
  const { data, loading, error } = usePastEvents({ limit: 100 });
  const [q, setQ] = useState('');
  const [year, setYear] = useState('');
  const [scope, setScope] = useState('');
  useEffect(() => { document.title = 'Past Events & Productions | Stonovah'; }, []);

  const all = data || [];
  const years = [...new Set(all.map((p) => p.year).filter(Boolean))].sort((a, b) => b - a);
  const scopes = [...new Set(all.map((p) => p.serviceScope).filter(Boolean))].sort();
  const needle = q.trim().toLowerCase();
  const list = all
    .filter((p) => !year || String(p.year) === year)
    .filter((p) => !scope || p.serviceScope === scope)
    .filter((p) => !needle || `${p.eventName} ${p.client || ''} ${p.location || ''}`.toLowerCase().includes(needle));

  return (
    <main className="min-h-screen bg-[#FFBF00] text-[#111111] font-sans antialiased selection:bg-[#E50914] selection:text-white">
      <Navbar />
      <section className="px-6 pt-12 pb-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest block mb-2 uppercase">PROVEN RECORD</span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-4">PAST EVENTS <br /><span className="text-[#E50914]">& PRODUCTIONS</span></h1>
          <p className="text-xs sm:text-sm text-neutral-900 font-medium leading-relaxed">A look at productions Stonovah has delivered for clients and partners.</p>
        </motion.div>
      </section>

      <section className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by event, client or location…" className={`${sel} w-full pl-10 placeholder:text-neutral-500`} />
          </div>
          <select value={scope} onChange={(e) => setScope(e.target.value)} className={sel} aria-label="Service"><option value="">All services</option>{scopes.map((s) => <option key={s}>{s}</option>)}</select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className={sel} aria-label="Year"><option value="">All years</option>{years.map((y) => <option key={y}>{y}</option>)}</select>
        </div>

        {loading && <p className="text-xs font-mono font-bold text-black/70 uppercase">Loading…</p>}
        {error && <p className="text-xs font-mono font-bold text-red-800">{error}</p>}
        {!loading && !error && (
          <>
            <p className="text-xs font-mono font-bold text-black/70 uppercase mb-4">{list.length} production{list.length === 1 ? '' : 's'}</p>
            {list.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{list.map((p, i) => <WorkCard key={p.id} p={p} index={i % 6} />)}</div>
            ) : (
              <p className="text-xs font-mono font-bold text-black/70 uppercase">{all.length ? 'Nothing matches your search.' : 'Our portfolio is being updated. Check back soon.'}</p>
            )}
          </>
        )}
      </section>

      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="bg-[#111111] text-white p-10 md:p-12 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div><span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-2">YOUR NEXT EVENT</span><h2 className="text-2xl md:text-4xl font-black uppercase leading-tight">Plan it with Stonovah</h2></div>
          <Link to="/request-service" className="bg-[#E50914] hover:bg-red-700 text-white font-black text-xs uppercase px-8 py-4 rounded-xl transition tracking-wider whitespace-nowrap">Request a service</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}