// src/pages/PortfolioDetail.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiX, FiChevronLeft, FiChevronRight, FiPlay } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Media from '../components/portfolio/Media';
import { usePastEvent, coverOf, isVideo, fmtShort } from './public/publicLive';

const Shell = ({ children }) => (
  <main className="min-h-screen bg-[#FFBF00] text-[#111111] font-sans antialiased selection:bg-[#E50914] selection:text-white">
    <Navbar />{children}<Footer />
  </main>
);

function Lightbox({ items, index, onClose, onIndex }) {
  const next = useCallback(() => onIndex((index + 1) % items.length), [index, items.length, onIndex]);
  const prev = useCallback(() => onIndex((index - 1 + items.length) % items.length), [index, items.length, onIndex]);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); else if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose, next, prev]);

  const url = items[index];
  const nav = 'absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer';
  return (
    <div role="dialog" aria-modal="true" aria-label="Gallery" className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"><FiX /></button>
      {items.length > 1 && <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev(); }} className={`${nav} left-4`}><FiChevronLeft /></button>}
      {items.length > 1 && <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); next(); }} className={`${nav} right-4`}><FiChevronRight /></button>}
      <div onClick={(e) => e.stopPropagation()} className="max-w-5xl w-full flex flex-col items-center gap-3">
        {isVideo(url)
          ? <video key={url} src={url} controls autoPlay playsInline className="max-h-[80vh] w-full rounded-lg" />
          : <img key={url} src={url} alt="" className="max-h-[80vh] max-w-full object-contain rounded-lg" />}
        <span className="text-[11px] font-mono text-neutral-400">{index + 1} / {items.length}</span>
      </div>
    </div>
  );
}

export default function PortfolioDetail() {
  const { id } = useParams();
  const { data: p, loading, notFound, error } = usePastEvent(id);
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => { if (p) document.title = `${p.eventName} | Stonovah`; }, [p]);

  if (loading) return <Shell><p className="max-w-7xl mx-auto px-6 py-20 font-mono text-xs font-bold">LOADING…</p></Shell>;
  if (notFound || error || !p) {
    return (
      <Shell><div className="max-w-xl mx-auto px-6 py-20"><div className="bg-[#111111] text-white p-8 rounded-2xl text-center space-y-3">
        <h1 className="text-2xl font-black uppercase">{notFound ? 'Not found' : 'Something went wrong'}</h1>
        <p className="text-xs text-neutral-400">{notFound ? 'This production is no longer in our portfolio.' : error}</p>
        <Link to="/events/past" className="inline-block text-[#FFBF00] text-xs font-bold hover:underline">See all past events</Link>
      </div></div></Shell>
    );
  }

  const media = Array.isArray(p.mediaUrls) ? p.mediaUrls : [];
  const facts = [
    ['CLIENT', p.client], ['OUR ROLE', p.stonovahRole], ['SERVICE', p.serviceScope], ['LOCATION', p.location],
    ['ATTENDANCE', p.attendance], ['YEAR', p.year], ['CONCLUDED', p.dateConcluded ? fmtShort(p.dateConcluded) : null],
  ].filter(([, v]) => v);

  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <Link to="/events/past" className="inline-flex items-center gap-2 text-xs font-mono font-bold hover:underline"><FiArrowLeft /> All past events</Link>

        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#111111] p-3 rounded-2xl shadow-2xl">
            <button type="button" onClick={() => media.length && setOpen(media.indexOf(coverOf(p)))} className="block w-full rounded-xl overflow-hidden bg-black aspect-[16/10] cursor-pointer">
              <Media url={coverOf(p)} alt={p.eventName} className="w-full h-full object-cover" />
            </button>
          </div>
          <div className="lg:col-span-5 space-y-5">
            {p.serviceScope && <span className="bg-[#111111] text-[#FFBF00] text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase inline-block">{p.serviceScope}</span>}
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[0.95] break-words">{p.eventName}</h1>
            <div className="grid grid-cols-2 gap-3">
              {facts.map(([k, v]) => (
                <div key={k} className="bg-[#111111] text-white rounded-xl p-3"><span className="text-[9px] font-mono text-neutral-400 block uppercase">{k}</span><b className="text-xs break-words">{v}</b></div>
              ))}
            </div>
          </div>
        </motion.div>

        {p.testimonial && (
          <motion.section initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#111111] text-white p-8 md:p-10 rounded-2xl shadow-2xl space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block">CLIENT TESTIMONIAL</span>
            <blockquote className="text-base md:text-lg text-neutral-200 leading-relaxed italic whitespace-pre-line">“{p.testimonial}”</blockquote>
            {p.client && <span className="text-xs font-mono text-[#FFBF00] font-bold uppercase block">{p.client}</span>}
          </motion.section>
        )}

        {media.length > 0 && (
          <section className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block">GALLERY • {media.length} FILE{media.length === 1 ? '' : 'S'}</span>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {media.map((u, i) => (
                <button key={u} type="button" onClick={() => setOpen(i)} aria-label={`Open item ${i + 1}`} className="relative aspect-square rounded-xl overflow-hidden bg-black group cursor-pointer">
                  <Media url={u} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  {isVideo(u) && <span className="absolute inset-0 flex items-center justify-center"><span className="w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center"><FiPlay /></span></span>}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="bg-[#111111] text-white p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl md:text-2xl font-black uppercase">Want something like this?</h2>
          <Link to="/request-service" className="bg-[#E50914] hover:bg-red-700 text-white font-black text-xs uppercase px-8 py-3.5 rounded-xl transition tracking-wider whitespace-nowrap">Request a service</Link>
        </div>
      </div>
      {open !== null && <Lightbox items={media} index={open} onClose={close} onIndex={setOpen} />}
    </Shell>
  );
}