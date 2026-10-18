// src/pages/EventDetails.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiTag, FiShare2, FiGlobe, FiMail, FiPhone, FiShield, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import TicketPicker from '../components/tickets/TicketPicker';
import { usePublicEvent, eventFacts, fmtDay, fmtTime, startCheckout } from './public/publicLive';

const fadeInUp = { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] } } };

const icsStamp = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = (s = '') => String(s).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');

function downloadCalendar(e) {
  const start = new Date(e.startAt);
  const end = e.endAt ? new Date(e.endAt) : new Date(start.getTime() + 3 * 3600000);
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stonovah//Events//EN', 'BEGIN:VEVENT',
    `UID:${e.id}@stonovah`, `DTSTAMP:${icsStamp(new Date())}`, `DTSTART:${icsStamp(start)}`, `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsText(e.title)}`, `LOCATION:${icsText([e.venue, e.venueAddress].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${icsText(`Tickets: ${window.location.href}`)}`, 'END:VEVENT', 'END:VCALENDAR',
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = `${e.slug || 'event'}.ics`; a.click();
  URL.revokeObjectURL(url);
}

async function share(e) {
  const url = window.location.href;
  try {
    if (navigator.share) { await navigator.share({ title: e.title, url }); return; }
    await navigator.clipboard.writeText(url);
    toast.success('Link copied');
  } catch { /* cancelled */ }
}

const Shell = ({ children }) => (
  <main className="min-h-screen bg-[#FFBF00] text-[#111111] font-sans antialiased selection:bg-[#E50914] selection:text-white">
    <Navbar />
    {children}
    <Footer />
  </main>
);

export default function EventDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: e, loading, notFound, error } = usePublicEvent(slug);

  useEffect(() => { if (e) document.title = `${e.title} | Stonovah`; }, [e]);

  if (loading) return <Shell><p className="max-w-7xl mx-auto px-6 py-20 font-mono text-xs font-bold">LOADING EVENT…</p></Shell>;
  if (notFound || error || !e) {
    return (
      <Shell>
        <div className="max-w-xl mx-auto px-6 py-20">
          <div className="bg-[#111111] text-white p-8 rounded-2xl text-center space-y-3">
            <h1 className="text-2xl font-black uppercase">{notFound ? 'Event not found' : 'Something went wrong'}</h1>
            <p className="text-xs text-neutral-400">{notFound ? 'This event may have ended or is no longer on sale.' : error}</p>
            <Link to="/events" className="inline-block text-[#FFBF00] text-xs font-bold hover:underline">Browse all events</Link>
          </div>
        </div>
      </Shell>
    );
  }

  const f = eventFacts(e);
  const o = e.organizer;
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.venue, e.venueAddress].filter(Boolean).join(', '))}`;
  const site = o?.website && /^https?:\/\//i.test(o.website) ? o.website : null;
  const badges = [e.hostedByStonovah && 'HOSTED BY STONOVAH', f.ended && 'EVENT ENDED', !f.ended && f.soldOut && 'SOLD OUT', !f.ended && f.almost && 'ALMOST SOLD OUT'].filter(Boolean);

  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link to="/events" className="inline-flex items-center gap-2 text-xs font-mono font-bold hover:underline mb-6"><FiArrowLeft /> All events</Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="bg-[#111111] p-3 rounded-2xl border border-black/20 shadow-2xl">
              <div className="relative rounded-xl overflow-hidden bg-neutral-900 aspect-[16/9]">
                {e.posterUrl
                  ? <img src={e.posterUrl} alt={e.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-red-950" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {badges.length > 0 && (
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {badges.map((b) => <span key={b} className="bg-[#111111]/90 backdrop-blur text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded border border-neutral-700 uppercase">{b}</span>)}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[0.95] break-words">{e.title}</h1>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#111111] text-white p-4 rounded-xl flex items-start gap-3">
                  <FiCalendar className="text-[#E50914] text-lg mt-0.5 shrink-0" />
                  <div><span className="text-[9px] font-mono text-neutral-400 block uppercase">DATE & TIME</span>
                    <span className="text-xs font-bold block mt-0.5">{fmtDay(e.startAt)}</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">{fmtTime(e.startAt)}{e.endAt ? ` – ${fmtTime(e.endAt)}` : ''} (Lagos time)</span></div>
                </div>
                <a href={map} target="_blank" rel="noreferrer" className="bg-[#111111] text-white p-4 rounded-xl flex items-start gap-3 hover:ring-2 hover:ring-[#FFBF00] transition">
                  <FiMapPin className="text-[#FFBF00] text-lg mt-0.5 shrink-0" />
                  <div><span className="text-[9px] font-mono text-neutral-400 block uppercase">VENUE (OPEN MAP)</span>
                    <span className="text-xs font-bold block mt-0.5">{e.venue}</span>
                    {e.venueAddress && <span className="text-[10px] text-neutral-400 block mt-0.5">{e.venueAddress}</span>}</div>
                </a>
                <div className="bg-[#111111] text-white p-4 rounded-xl flex items-start gap-3">
                  <FiTag className="text-emerald-400 text-lg mt-0.5 shrink-0" />
                  <div><span className="text-[9px] font-mono text-neutral-400 block uppercase">ORGANIZED BY</span>
                    <span className="text-xs font-bold block mt-0.5">{o?.name || 'Stonovah'}</span>
                    {f.capacity > 0 && <span className="text-[10px] text-neutral-400 block mt-0.5">{f.left.toLocaleString()} of {f.capacity.toLocaleString()} tickets left</span>}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#111111]/20">
                <button type="button" onClick={() => downloadCalendar(e)} className="bg-[#111111] text-white text-xs font-mono font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-black transition cursor-pointer"><FiCalendar /> Add to Calendar</button>
                <button type="button" onClick={() => share(e)} aria-label="Share this event" className="bg-[#111111] text-white text-xs font-mono font-bold px-3 py-2 rounded-lg hover:bg-black transition cursor-pointer"><FiShare2 /></button>
              </div>
            </motion.div>

            {e.description && (
              <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-[#111111] text-white p-8 rounded-2xl shadow-2xl space-y-3">
                <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block">ABOUT THIS EVENT</span>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{e.description}</p>
              </motion.section>
            )}

            {o && (
              <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-[#111111] text-white p-8 rounded-2xl shadow-2xl space-y-4">
                <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block">THE ORGANIZER</span>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center text-xl font-black text-[#FFBF00]">
                    {o.logoUrl ? <img src={o.logoUrl} alt={o.name} className="w-full h-full object-cover" /> : (o.name || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <h3 className="text-lg font-black uppercase">{o.name}</h3>
                    {o.about && <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">{o.about}</p>}
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-mono text-neutral-400">
                      {site && <a href={site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#FFBF00]"><FiGlobe /> Website</a>}
                      {o.email && <a href={`mailto:${o.email}`} className="flex items-center gap-1.5 hover:text-[#FFBF00]"><FiMail /> {o.email}</a>}
                      {o.phone && <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-[#FFBF00]"><FiPhone /> {o.phone}</a>}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-[#111111] text-white p-8 rounded-2xl shadow-2xl space-y-5">
              <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block">HOW YOUR TICKETS WORK</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  ['Pick your tickets', 'Choose how many of each ticket type you want, then continue to checkout.'],
                  ['Pay securely', 'Payments are processed by Paystack. Free tickets skip payment.'],
                  ['Get them by email', 'Your tickets arrive as a PDF at the email address you enter at checkout.'],
                  ['Show your QR at the gate', 'Every ticket has its own QR code and can be used once. Bring it on your phone or printed.'],
                ].map(([t, d]) => (
                  <div key={t} className="flex items-start gap-3">
                    <div className="p-2 rounded bg-[#1E1E1E] text-[#FFBF00] border border-neutral-800 mt-0.5"><FiCheckCircle /></div>
                    <div><h4 className="text-xs font-bold uppercase">{t}</h4><p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{d}</p></div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-6" id="tickets">
              <motion.div initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="bg-[#111111] text-white p-6 rounded-2xl border-2 border-black/20 shadow-2xl space-y-5">
                <div className="border-b border-neutral-800 pb-4">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase block">TICKETS</span>
                  <h2 className="text-xl font-black uppercase">Select Tickets</h2>
                </div>
                <TicketPicker event={e} ended={f.ended} onContinue={(items) => startCheckout(navigate, e, items)} />
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-neutral-400 pt-3 border-t border-neutral-800">
                  <FiShield className="text-[#FFBF00]" /> Secure checkout with Paystack
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}