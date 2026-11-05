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

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';
const card = 'rounded-xl border border-white/[0.07] bg-[#161616]';

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
  <main className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased selection:bg-red-600 selection:text-white">
    <Navbar />
    {children}
    <Footer />
  </main>
);

const Eyebrow = ({ children }) => (
  <p className={`flex items-center gap-2 ${mono} text-red-500`}>
    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
    {children}
  </p>
);

export default function EventDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: e, loading, notFound, error } = usePublicEvent(slug);

  useEffect(() => { if (e) document.title = `${e.title} | Stonovah`; }, [e]);

  if (loading) {
    return (
      <Shell>
        <p className={`${mono} mx-auto max-w-7xl px-5 py-24 text-center text-white/40`}>Loading event…</p>
      </Shell>
    );
  }
  if (notFound || error || !e) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl px-5 py-24">
          <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
            <h1 className="text-xl font-bold">{notFound ? 'Event not found' : 'Something went wrong'}</h1>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/50">
              {notFound ? 'This event may have ended or is no longer on sale.' : error}
            </p>
            <Link to="/events" className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#e10613] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510]">
              Browse all events
            </Link>
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
      {/* top glow */}
      <div className="bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.14),transparent_50%)]">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <Link to="/events" className={`${mono} mb-6 inline-flex items-center gap-2 text-white/50 transition-colors hover:text-white`}>
            <FiArrowLeft /> All events
          </Link>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              {/* poster */}
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className={`${card} p-2`}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-[linear-gradient(135deg,#2a0508,#0f0f0f_70%)]">
                  {e.posterUrl && <img src={e.posterUrl} alt={e.title} className="h-full w-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {badges.length > 0 && (
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {badges.map((b) => (
                        <span
                          key={b}
                          className={`inline-block rounded px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] backdrop-blur ${b === 'HOSTED BY STONOVAH' ? 'bg-[#e10613] text-white' : 'bg-black/70 text-white/80'}`}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* title + facts */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
                <Eyebrow>Event details</Eyebrow>
                <h1 className="break-words text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">{e.title}</h1>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className={`${card} flex items-start gap-3 p-4`}>
                    <FiCalendar className="mt-0.5 shrink-0 text-lg text-red-500" />
                    <div>
                      <span className={`${mono} block text-[9px] text-white/40`}>Date & time</span>
                      <span className="mt-1 block text-xs font-bold">{fmtDay(e.startAt)}</span>
                      <span className="mt-0.5 block text-[10px] text-white/45">{fmtTime(e.startAt)}{e.endAt ? ` – ${fmtTime(e.endAt)}` : ''} (Lagos time)</span>
                    </div>
                  </div>
                  <a href={map} target="_blank" rel="noreferrer" className={`${card} flex items-start gap-3 p-4 transition-colors hover:border-white/25`}>
                    <FiMapPin className="mt-0.5 shrink-0 text-lg text-red-500" />
                    <div>
                      <span className={`${mono} block text-[9px] text-white/40`}>Venue (open map)</span>
                      <span className="mt-1 block text-xs font-bold">{e.venue}</span>
                      {e.venueAddress && <span className="mt-0.5 block text-[10px] text-white/45">{e.venueAddress}</span>}
                    </div>
                  </a>
                  <div className={`${card} flex items-start gap-3 p-4`}>
                    <FiTag className="mt-0.5 shrink-0 text-lg text-red-500" />
                    <div>
                      <span className={`${mono} block text-[9px] text-white/40`}>Organized by</span>
                      <span className="mt-1 block text-xs font-bold">{o?.name || 'Stonovah'}</span>
                      {f.capacity > 0 && <span className="mt-0.5 block text-[10px] text-white/45">{f.left.toLocaleString()} of {f.capacity.toLocaleString()} tickets left</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
                  <button type="button" onClick={() => downloadCalendar(e)} className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white/[0.07] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/[0.12]">
                    <FiCalendar /> Add to calendar
                  </button>
                  <button type="button" onClick={() => share(e)} aria-label="Share this event" className="cursor-pointer rounded-md bg-white/[0.07] px-3.5 py-2.5 text-white transition-colors hover:bg-white/[0.12]">
                    <FiShare2 />
                  </button>
                </div>
              </motion.div>

              {/* about */}
              {e.description && (
                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className={`${card} space-y-3 p-8`}>
                  <Eyebrow>About this event</Eyebrow>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-white/65">{e.description}</p>
                </motion.section>
              )}

              {/* organizer */}
              {o && (
                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className={`${card} space-y-4 p-8`}>
                  <Eyebrow>The organizer</Eyebrow>
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] text-xl font-black text-red-500">
                      {o.logoUrl ? <img src={o.logoUrl} alt={o.name} className="h-full w-full object-cover" /> : (o.name || '?').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-2">
                      <h3 className="text-lg font-bold">{o.name}</h3>
                      {o.about && <p className="whitespace-pre-line text-xs leading-relaxed text-white/60">{o.about}</p>}
                      <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-white/50">
                        {site && <a href={site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white"><FiGlobe className="text-red-500" /> Website</a>}
                        {o.email && <a href={`mailto:${o.email}`} className="flex items-center gap-1.5 hover:text-white"><FiMail className="text-red-500" /> {o.email}</a>}
                        {o.phone && <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-white"><FiPhone className="text-red-500" /> {o.phone}</a>}
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* how tickets work */}
              <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className={`${card} space-y-5 p-8`}>
                <Eyebrow>How your tickets work</Eyebrow>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {[
                    ['Pick your tickets', 'Choose how many of each ticket type you want, then continue to checkout.'],
                    ['Pay securely', 'Payments are processed by Paystack. Free tickets skip payment.'],
                    ['Get them by email', 'Your tickets arrive as a PDF at the email address you enter at checkout.'],
                    ['Show your QR at the gate', 'Every ticket has its own QR code and can be used once. Bring it on your phone or printed.'],
                  ].map(([t, d]) => (
                    <div key={t} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-red-500"><FiCheckCircle /></span>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide">{t}</h4>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">{d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* ticket sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-20 space-y-6" id="tickets">
                <motion.div
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-5 rounded-xl border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.14),#161616_60%)] p-6"
                >
                  <div className="border-b border-white/10 pb-4">
                    <span className={`${mono} block text-[9px] text-red-400`}>Tickets</span>
                    <h2 className="mt-1 text-xl font-black uppercase">Select tickets</h2>
                  </div>
                  <TicketPicker event={e} ended={f.ended} onContinue={(items) => startCheckout(navigate, e, items)} />
                  <div className="flex items-center justify-center gap-1.5 border-t border-white/10 pt-3 font-mono text-[9px] text-white/45">
                    <FiShield className="text-red-500" /> Secure checkout with Paystack
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}