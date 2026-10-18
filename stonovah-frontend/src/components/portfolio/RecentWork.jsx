// src/components/portfolio/RecentWork.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin } from 'react-icons/fi';
import { usePastEvents, coverOf } from '../../pages/public/publicLive';
import Media from './Media';

export function WorkCard({ p, index = 0 }) {
  const meta = [p.client, p.attendance && `Attendance ${p.attendance}`].filter(Boolean).join(' • ');
  return (
    <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }} whileHover={{ y: -6 }} className="h-full">
      <Link to={`/events/past/${p.id}`} className="block h-full bg-[#111111] text-white rounded-2xl overflow-hidden border border-black/20 shadow-2xl group">
        <div className="h-48 relative overflow-hidden bg-black">
          <Media url={coverOf(p)} alt={p.eventName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          {p.serviceScope && <span className="absolute top-3 left-3 bg-[#E50914] text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase">{p.serviceScope}</span>}
          {p.year && <span className="absolute bottom-3 right-3 bg-black/80 text-[#FFBF00] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-neutral-700">{p.year}</span>}
        </div>
        <div className="p-6 space-y-1.5">
          {p.location && <span className="text-[10px] font-mono text-neutral-400 uppercase flex items-center gap-1"><FiMapPin className="shrink-0" /> {p.location}</span>}
          <h3 className="text-base font-bold uppercase text-white group-hover:text-[#FFBF00] transition leading-snug">{p.eventName}</h3>
          {meta && <span className="text-[11px] font-mono text-neutral-400 block">{meta}</span>}
        </div>
      </Link>
    </motion.div>
  );
}

// A strip of the newest published work. Renders nothing until there is something to show.
export default function RecentWork({
  scope, limit = 3, id = 'recent-work', eyebrow = 'PROVEN RECORD', title = 'RECENT WORK',
  className = 'px-6 py-20 max-w-7xl mx-auto border-b border-[#111111]/20',
}) {
  const { data, loading, error } = usePastEvents({ limit: 12, ...(scope ? { serviceScope: scope } : {}) });
  const items = (data || []).slice(0, limit);
  if (loading || error || !items.length) return null;

  return (
    <section id={id} className={className}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-1">{eyebrow}</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111111]">{title}</h2>
        </div>
        <Link to="/events/past" className="text-xs font-mono text-black font-bold underline underline-offset-4 hover:text-red-700 uppercase shrink-0">View all work →</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((p, i) => <WorkCard key={p.id} p={p} index={i} />)}
      </div>
    </section>
  );
}