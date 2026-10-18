import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiShield, FiClock, FiFolder, FiCheckSquare, FiCheck, FiCheckCircle,
  FiDisc, FiLock, FiArrowRight, FiList, FiDownload, FiExternalLink,
  FiRadio, FiSmartphone, FiImage, FiBell,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const SLA_MINUTES = 240; // 4h guarantee

const pipeline = [
  { id: '01', title: 'BASICS', sub: 'Metadata & Media' },
  { id: '02', title: 'TICKET TYPE', sub: 'Ticket Type' },
  { id: '03', title: 'SERVICE FEES', sub: 'Service Fee Configuration' },
  { id: '04', title: 'TICKET TEMPLATE', sub: 'Ticket Template' },
  { id: '05', title: 'PUBLISH', sub: 'Publish and awaiting review' },
];

const groundwork = [
  {
    tag: 'TURNSTILES READY',
    icon: FiRadio,
    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
    title: 'Pre-configure Gate Scanners',
    body: 'Assign mobile scanner credentials to ground staff, pair optical hardware, and preload offline emergency attendance manifests.',
    cta: 'Setup Staff Access',
  },
  {
    tag: 'PASS EXPERIENCE',
    icon: FiSmartphone,
    img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=80',
    title: 'Preview Digital Wallet Pass',
    body: 'Inspect attendee Apple Wallet & Google Wallet passes, backstage pass badges, and dynamic NFC tap tokens.',
    cta: 'Inspect 3D Pass Render',
  },
  {
    tag: 'CRYPTOGRAPHIC KIT',
    icon: FiImage,
    img: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=700&q=80',
    title: 'Prepare Promotional Assets',
    body: 'Download approved Stonovah verified ticketing seals, high-res cryptographic badges, and pre-formatted social rollout banners.',
    cta: 'Download Media Kit (.ZIP)',
  },
];

function StatusIcon({ status }) {
  if (status === 'done') return <FiCheckCircle className="text-red-500 text-base shrink-0" />;
  if (status === 'review') return <FiDisc className="text-red-500 text-base shrink-0" />;
  return <FiClock className="text-neutral-500 text-base shrink-0" />;
}

export default function SubmittedForReview({
  form,
  submission,
  onViewEvents,
  onDashboard,
}) {
  // Live SLA clock, updates every 30s
  const [elapsedMin, setElapsedMin] = useState(0);
  useEffect(() => {
    const tick = () =>
      setElapsedMin(Math.max(0, Math.floor((Date.now() - submission.submittedAt) / 60000)));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [submission.submittedAt]);

  const slaPercent = Math.min(100, (elapsedMin / SLA_MINUTES) * 100);
  const elapsedLabel = `${Math.floor(elapsedMin / 60)}h ${String(elapsedMin % 60).padStart(2, '0')}m`;

  const submittedLabel = new Date(submission.submittedAt).toLocaleString('en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const doorLabel = form.startDate
    ? new Date(form.startDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

 const milestones = [
  { label: 'Organizer KYC', badge: 'VERIFIED', status: 'done' },
  { label: 'Event details & ticket types', badge: 'RECEIVED', status: 'done' },
  { label: 'Compliance review', badge: 'IN REVIEW', status: 'review' },
  { label: 'Publication', badge: 'QUEUED', status: 'queued' },
];

  const fade = {
    hidden: { opacity: 0, y: 14 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
    }),
  };

  return (
    <div className="space-y-6">
      {/* PUBLISHING PIPELINE */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fade}
        className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-5 font-mono"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600/20 flex items-center justify-center">
              <FiShield className="text-red-500 text-lg" />
            </div>
            <div>
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold block">
                PUBLISHING PROTOCOL 3.4
              </span>
              <h2 className="text-lg font-black font-sans">Event Submission Pipeline</h2>
            </div>
          </div>

          <span className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            Awaiting review
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {pipeline.map((p) => (
            <div key={p.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <span>{p.id} {p.title}</span>
                <span className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[9px]">
                  <FiCheck />
                </span>
              </div>
              <div className="h-1 bg-red-600 rounded-full" />
              <span className="text-[10px] text-neutral-400 block">{p.sub}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* HERO */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fade}
        className="bg-black text-white p-6 md:p-10 rounded-2xl border border-black shadow-2xl flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-black via-black to-red-950/40"
      >
        {/* Audit ring */}
        <div className="relative w-40 h-40 shrink-0 rounded-2xl bg-neutral-900 flex items-center justify-center">
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          >
            <circle cx="50" cy="50" r="44" fill="none" stroke="#262626" strokeWidth="5" />
            <circle
              cx="50" cy="50" r="44" fill="none" stroke="#dc2626" strokeWidth="5"
              strokeLinecap="round" strokeDasharray="200 277"
            />
          </motion.svg>
          <div className="relative flex flex-col items-center gap-1">
            <FiShield className="text-red-400 text-3xl" />
            <span className="text-[8px] font-bold tracking-widest text-neutral-300">AUDIT MODE</span>
          </div>
        </div>

        <div className="space-y-4 font-mono">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 bg-red-600/20 text-red-300 border border-red-600/30 px-2.5 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Submitted for curatorial review — pending approval
            </span>
            <span className="text-neutral-400">ID: {submission.eventId}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight font-sans leading-[1.05]">
            Your Event Has Been Submitted for Review
          </h1>

          <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl">
            <span className="text-white font-bold">{form.eventName || 'Your event'}</span> (ID:{' '}
            {submission.eventId}) is currently being reviewed by the Stonovah Curation & Compliance
            Council. To safeguard ticket buyers and maintain institutional production standards, all
            public ticket sales undergo statutory verification prior to going live.
          </p>

          <div className="w-28 h-0.5 bg-red-600" />
        </div>
      </motion.div>

      {/* THREE INFO CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA */}
        <motion.div
          custom={2} initial="hidden" animate="visible" variants={fade}
          className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-4 font-mono"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center">
              <FiClock className="text-neutral-300" />
            </div>
            <span className="text-[9px] bg-red-600/20 text-red-300 px-2 py-1 rounded font-bold uppercase tracking-wider">
              Fast-track guarantee
            </span>
          </div>
          <div>
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold block">
              GUARANTEED TURNAROUND SLA
            </span>
            <h3 className="text-xl font-black font-sans leading-tight mt-1">
              Estimated Approval: &lt; 4 Hours
            </h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            You will be notified in the app as soon as a decision is made.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-400">SLA Elapsed Clock</span>
              <span className="font-bold">{elapsedLabel} / 4h 00m</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-600 h-full transition-all" style={{ width: `${Math.max(slaPercent, 3)}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Dossier */}
        <motion.div
          custom={3} initial="hidden" animate="visible" variants={fade}
          className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-4 font-mono"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center">
              <FiFolder className="text-neutral-300" />
            </div>
            <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider">Audit trace</span>
          </div>
          <div>
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold block">
              REVIEW REFERENCE DOSSIER
            </span>
            <h3 className="text-xl font-black font-sans mt-1">{submission.reviewRef}</h3>
          </div>

          <div className="space-y-2 text-[11px]">
            {[
              ['Submitted At', submittedLabel],
              ['Target Door Open', doorLabel],
              ['Reviewed by', submission.curator],
            ].map(([k, v]) => (
              <div key={k} className="bg-neutral-900 rounded-lg px-3 py-2 flex justify-between gap-3">
                <span className="text-neutral-400">{k}</span>
                <span className="font-bold text-right">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-neutral-400">
            <span>Encryption: SHA-256 Validated</span>
            <button type="button" className="hover:text-white underline-offset-2 hover:underline">
              Inspect Proof
            </button>
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          custom={4} initial="hidden" animate="visible" variants={fade}
          className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-4 font-mono"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center">
              <FiCheckSquare className="text-neutral-300" />
            </div>
            <span className="text-[9px] bg-red-600/20 text-red-300 px-2 py-1 rounded font-bold uppercase tracking-wider">
              Stage 3 of 4
            </span>
          </div>
          <div>
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold block">
              VERIFICATION PIPELINE
            </span>
            <h3 className="text-xl font-black font-sans mt-1">Compliance Milestones</h3>
          </div>

          <div className="space-y-3">
            {milestones.map((m) => (
              <div key={m.label} className="flex items-center gap-2 text-xs">
                <StatusIcon status={m.status} />
                <span className={`flex-1 truncate ${m.status === 'queued' ? 'text-neutral-500' : 'text-white'}`}>
                  {m.label}
                </span>
                <span
                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                    m.status === 'done'
                      ? 'bg-neutral-800 text-neutral-300'
                      : m.status === 'review'
                      ? 'bg-red-600/20 text-red-300'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {m.badge}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 text-[11px] text-neutral-400 pt-1">
            <FiLock className="mt-0.5 shrink-0" />
            <span>Auto-publishes to catalog instantly upon clearance.</span>
          </div>
        </motion.div>
      </div>

      {/* GROUNDWORK */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold text-black/70 uppercase tracking-widest block">
              GROUNDWORK LOGISTICS
            </span>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black font-sans">
              What You Can Do While Review Is Pending
            </h2>
          </div>
          <p className="text-xs font-mono text-black/80 md:max-w-xs md:text-right">
            Zero downtime: prepare production operations ahead of ticket launch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {groundwork.map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.div
                key={g.title}
                custom={5 + i} initial="hidden" animate="visible" variants={fade}
                className="bg-black text-white rounded-2xl border border-black shadow-2xl overflow-hidden font-mono flex flex-col"
              >
                <div className="h-44 relative">
                  <img src={g.img} alt={g.title} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    <Icon className="text-xs" /> {g.tag}
                  </span>
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col">
                  <h3 className="text-lg font-black font-sans">{g.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed flex-1">{g.body}</p>
                  <button
                    type="button"
                    className="text-xs font-bold text-[#FFBF00] hover:text-white flex items-center gap-1.5 transition w-fit"
                  >
                    {g.cta} <FiArrowRight />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="bg-black text-white p-5 rounded-2xl border border-black shadow-2xl space-y-4 font-mono text-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onViewEvents}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              <FiList /> View Event in My Events Directory
            </button>
            <button
              type="button"
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              <FiDownload /> Download Submission Summary (PDF)
            </button>
          </div>

          
          <button
            type="button"
            onClick={onDashboard}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-xl transition"
          >
            Return to Organizer Dashboard <FiArrowRight />
          </button>
        </div>

        <div className="bg-neutral-900 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
          <span className="flex items-center gap-2 text-neutral-300">
            <FiBell className="text-red-500" /> Urgent ticket launch deadline scheduled within 6 hours?
          </span>

          <a
            href="mailto:events.review@stonovah.com"
            className="font-bold text-[#FFBF00] hover:text-white flex items-center gap-1.5 transition"
          >
            Contact Priority Curation Desk (events.review@stonovah.com) <FiExternalLink />
          </a>
        </div>
      </div>
    </div>
  );
}