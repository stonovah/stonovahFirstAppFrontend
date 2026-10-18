import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiShield, FiClock, FiMail, FiMessageSquare, FiCheck, FiRefreshCw, FiLock,
  FiCopy, FiArrowRight, FiDownload, FiPlusCircle, FiLayers, FiDollarSign,
  FiHelpCircle, FiExternalLink, FiHome, FiGrid, FiUsers,
} from 'react-icons/fi';
import { Card, Badge, fadeUp } from './shared';
import { ROUTES } from '../../../config/routes';

// PLACEHOLDER statuses. Replace with real review state from your API.
const registry = [
  { title: 'Corporate / Identity Registry Check', status: 'QUEUED', body: 'Your registration details are queued for manual review by the Compliance team.', foot: 'REVIEW PENDING', state: 'queued' },
  { title: 'Submitted Documents', status: 'RECEIVED', body: 'Your uploaded documents were received and attached to your review dossier.', state: 'done' },
  { title: 'Tax & Identity Number Verification (TIN / NIN)', status: 'QUEUED', body: 'Your tax and identity numbers will be checked during manual review.', state: 'queued' },
  { title: 'Sanctions & AML Screening', status: 'QUEUED', body: 'Screening happens as part of the compliance review.', state: 'queued' },
];

const sandbox = [
  { icon: FiPlusCircle, t: 'Draft Your First Event', d: 'Configure seating manifests, VIP tables, soundstage line-ups, and early-bird quotas in non-broadcast sandbox.', to: '/create-event' },
  { icon: FiLayers, t: 'Select Ticket Pass Foil Designs', d: 'Choose between Obsidian Minimalist, Sovereign Gala Hologram, and Neon Soundstage wallet passes.', to: '/create-event?step=4' },
  { icon: FiDollarSign, t: 'Review Advance Payout Rules', d: 'Understand how Stonovah issues automated production advances before concert execution dates.', to: '#' },
];

const why = [
  { icon: FiHome, t: 'Direct Escrow Isolation', d: 'Gross ticket receipts are ring-fenced within regulated settlement accounts, protecting both organizers and ticket buyers against payment gate disruptions.' },
  { icon: FiGrid, t: 'Anti-Scalp & Anti-Counterfeit Gate', d: 'Each ticket pass minted under a verified organizer uses dynamic offline cryptosequences, eliminating gate scalping and duplicate barcodes.' },
  { icon: FiUsers, t: 'Consortium Sponsor Clearance', d: "Verified organizers gain access to Stonovah's brand sponsorship pool, unlocking direct FMCG and fintech stage activation budgets." },
];

export default function KycPending({ form, submission }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(submission.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const digits = form.phone.replace(/\s/g, '');
  const maskedPhone = `${form.dialCode} ${digits.slice(0, 3)} •••• ${digits.slice(-3)}`;
  const when = new Date(submission.submittedAt).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });
  const verified = registry.filter((r) => r.state === 'done').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* HERO */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp}
          className="lg:col-span-7 bg-gradient-to-br from-black via-black to-red-950/50 text-white p-6 md:p-8 rounded-2xl border border-black shadow-2xl font-mono space-y-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-neutral-900 flex items-center justify-center">
              <motion.svg
                viewBox="0 0 100 100" className="absolute inset-1.5 w-[calc(100%-0.75rem)] h-[calc(100%-0.75rem)]"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              >
                <circle cx="50" cy="50" r="44" fill="none" stroke="#262626" strokeWidth="5" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" strokeDasharray="190 277" />
              </motion.svg>
              <FiShield className="relative text-red-400 text-2xl" />
            </div>
            <div className="text-right space-y-1">
              <span className="inline-flex items-center gap-2 bg-red-600/20 text-red-300 border border-red-600/30 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Under regulatory review
              </span>
              <span className="block text-[10px] text-neutral-400">Queue Sequence #{submission.queue}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-sans tracking-tight">Verification in Progress</h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            We have received your organizer KYC compliance dossier. The Stonovah Regulatory Compliance Syndicate
            is actively querying statutory registry databases and confirming corporate ownership tokens.
          </p>

          <div className="bg-neutral-900 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] font-bold tracking-widest text-neutral-500 block">TRACKING REFERENCE DOSSIER</span>
              <button type="button" onClick={copy} className="font-bold text-sm flex items-center gap-2 hover:text-[#FFBF00] transition cursor-pointer text-left">
                {submission.reference} {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy className="text-neutral-400" />}
              </button>
            </div>
            <div className="sm:text-right">
              <span className="text-[9px] font-bold tracking-widest text-neutral-500 block">INGESTION TIMESTAMP</span>
              <span className="font-bold text-sm">{when}</span>
            </div>
          </div>
        </motion.div>

        {/* SLA */}
        <Card index={2} className="lg:col-span-5" icon={FiClock} title="Guaranteed Turnaround SLA">
          <div className="bg-neutral-900 rounded-xl p-5">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black font-sans">&lt; 24</span>
              <span className="text-xl font-black text-red-500 font-sans mb-1">HOURS</span>
            </div>
            <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
              Standard review window. Most commercial organizer accounts are approved within 2 to 4 business hours
              during Lagos trading hours.
            </p>
          </div>
          <span className="text-[9px] font-bold tracking-widest text-neutral-500 block">AUTOMATED WEBHOOKS & ALERTS BOUND TO:</span>
          {[
            { icon: FiMail, k: 'PRIMARY LEGAL EMAIL', v: form.email },
            { icon: FiMessageSquare, k: 'URGENT PRODUCTION SMS GATE', v: maskedPhone },
          ].map((w) => (
            <div key={w.k} className="bg-neutral-900 rounded-xl px-3 py-2.5 flex items-center gap-3">
              <w.icon className="text-neutral-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-neutral-500 block">{w.k}</span>
                <span className="text-xs truncate block">{w.v}</span>
              </div>
              <FiCheck className="text-emerald-400 shrink-0" />
            </div>
          ))}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TELEMETRY */}
        <Card
          index={3} className="lg:col-span-7" icon={FiShield} title="Registry Dispatch Telemetry"
          badge={<Badge>{verified} of {registry.length} verified</Badge>}
        >
          <div className="space-y-3">
            {registry.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.12 }}
                className="bg-neutral-900 rounded-xl p-4 flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0">
                  {r.state === 'querying' && (
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }} className="text-red-400">
                      <FiRefreshCw />
                    </motion.span>
                  )}
                  {r.state === 'done' && <FiCheck className="text-emerald-400" />}
                  {r.state === 'queued' && <FiClock className="text-neutral-500" />}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold font-sans text-sm">{r.title}</span>
                    <span className={`text-[9px] font-bold ${r.state === 'done' ? 'text-emerald-400' : r.state === 'querying' ? 'text-red-400' : 'text-neutral-500'}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-snug">{r.body}</p>
                  {r.foot && <span className="text-[9px] font-bold text-neutral-500 block">{r.foot}</span>}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(ROUTES.organizerDashboard)}
              className="flex-1 bg-red-600 hover:bg-red-700 font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer"
            >
              Explore Organizer Dashboard (Sandbox Mode) <FiArrowRight />
            </motion.button>
            <button
              type="button"
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <FiDownload /> Download KYC Submission Receipt (PDF)
            </button>
          </div>
        </Card>

        {/* SANDBOX + URGENT */}
        <div className="lg:col-span-5 space-y-6">
          <Card index={4} title="What You Can Do While Waiting" badge={<Badge tone="grey">Sandbox enabled</Badge>}>
            <p className="text-[11px] text-neutral-400 leading-relaxed -mt-2">
              Your sandbox access is active right now. Prepare your stage visual keys, ticket tiers, and gate
              parameters so you can deploy instantly the moment statutory verification completes.
            </p>
            {sandbox.map((s) => (
              <motion.button
                key={s.t} type="button" whileHover={{ x: 4 }}
                onClick={() => s.to !== '#' && navigate(s.to)}
                className="w-full text-left bg-neutral-900 hover:bg-neutral-800 rounded-xl p-3 flex gap-3 transition cursor-pointer"
              >
                <s.icon className="text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold font-sans text-sm block">{s.t}</span>
                  <span className="text-[10px] text-neutral-400 leading-snug block">{s.d}</span>
                </div>
                <FiArrowRight className="text-neutral-500 mt-1" />
              </motion.button>
            ))}
          </Card>

          <Card index={5} icon={FiHelpCircle} title="Urgent Production Deadline?">
            <p className="text-[11px] text-neutral-400 leading-relaxed -mt-2">
              If your live ticket on-sale begins within the next 12 hours, you may request priority syndicate
              dispatch directly via Compliance Operations.
            </p>
            <a href="mailto:compliance@stonovah.com" className="text-[#FFBF00] font-bold text-xs flex items-center gap-1.5 hover:text-white transition">
              compliance@stonovah.com <FiExternalLink />
            </a>
          </Card>
        </div>
      </div>

      {/* WHY */}
      <Card index={6} className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold tracking-widest text-red-400 block">STATUTORY ARCHITECTURE • TRUST INFRASTRUCTURE</span>
            <h2 className="text-2xl md:text-3xl font-black font-sans">Why Stonovah Verifies Every Commercial Organizer</h2>
          </div>
          <p className="text-[11px] text-neutral-400 max-w-sm">
            To protect attendees, tier-1 brand sponsors, and ticket holders, all live productions on the
            Stonovah network operate under statutory bond and NDPR sovereign standards.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {why.map((w, i) => (
            <motion.div
              key={w.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-neutral-900 border-l-2 border-red-600 rounded-xl p-5 space-y-2"
            >
              <w.icon className="text-neutral-300 text-lg" />
              <span className="font-bold font-sans block">{w.t}</span>
              <p className="text-[10px] text-neutral-400 leading-relaxed">{w.d}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}