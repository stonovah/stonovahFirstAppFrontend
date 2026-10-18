// src/components/portfolio/FeaturedEvents.jsx: live events for the ticketing page
import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { usePublicEvents, eventFacts, priceLabel, fmtShort } from '../../pages/public/publicLive';

export default function FeaturedEvents() {
  const { data, loading, error } = usePublicEvents();
  const now = Date.now();
  const items = (data || [])
    .filter((e) => !e.endAt || new Date(e.endAt).getTime() >= now)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 3);

  if (loading) return <p className="text-xs font-mono font-bold text-black/70 uppercase">Loading events…</p>;
  if (error || !items.length) {
    return (
      <div className="bg-[#111111] text-white p-8 rounded-2xl text-center space-y-3">
        <p className="text-sm text-neutral-300">{error || 'No events are on sale right now.'}</p>
        <Link to="/events" className="inline-block text-[#FFBF00] text-xs font-bold hover:underline">Browse events</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((ev) => {
        const f = eventFacts(ev);
        return (
          <Link key={ev.id} to={`/events/${ev.slug}`} className="bg-[#111111] text-white rounded-2xl overflow-hidden border border-black/20 shadow-2xl flex flex-col justify-between group hover:-translate-y-1.5 transition">
            <div>
              <div className="h-56 relative overflow-hidden bg-black">
                {ev.posterUrl ? <img src={ev.posterUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80" /> : <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-red-950" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <span className="absolute top-3 left-3 bg-[#E50914] text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase">{f.soldOut ? 'SOLD OUT' : f.almost ? 'ALMOST SOLD OUT' : 'ON SALE'}</span>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-mono text-[#FFBF00] font-bold block mb-1 uppercase">{fmtShort(ev.startAt)} // {ev.venue}</span>
                <h3 className="text-base font-bold uppercase text-white group-hover:text-[#FFBF00] transition leading-snug">{ev.title}</h3>
              </div>
            </div>
            <div className="p-6 pt-0 flex items-center justify-between border-t border-neutral-800/80 mt-2">
              <div className="mt-4"><span className="text-[9px] font-mono text-neutral-500 block uppercase">PRICE</span><span className="text-lg font-black font-mono">{priceLabel(f)}</span></div>
              <span className="mt-4 bg-[#E50914] text-white font-bold text-xs uppercase px-4 py-2.5 rounded flex items-center gap-1.5">{f.soldOut ? 'DETAILS' : 'GET TICKETS'} <FiArrowRight /></span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}