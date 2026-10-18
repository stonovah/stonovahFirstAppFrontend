// src/pages/steps/ReviewPublish.jsx
import React from 'react';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { formatNaira, isFreeTier } from './helpers';

function Section({ title, step, goTo, children }) {
  return (
    <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-xs" />
          <h3 className="text-sm font-bold uppercase tracking-wider">{title}</h3>
        </div>
        <button type="button" onClick={() => goTo(step)} className="text-[10px] font-bold text-[#FFBF00] hover:text-white flex items-center gap-1 transition cursor-pointer">
          <FiEdit2 /> EDIT
        </button>
      </div>
      {children}
    </div>
  );
}

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-xs">
    <span className="text-neutral-500 uppercase text-[10px] font-bold shrink-0">{label}</span>
    <span className="text-white text-right">{value || '—'}</span>
  </div>
);

export default function ReviewPublish({ form, goTo, ctx }) {
  const fmt = (d) => (d ? new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '');
  const template = ctx.templates.find((t) => t.id === form.templateId);
  const rate = Number((ctx.feeRate * 100).toFixed(2));

  const totalCapacity = form.tiers.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
  const freeCount = form.tiers.filter(isFreeTier).length;
  const missing = ctx.checks.filter((c) => !c.ok);

  return (
    <div className="space-y-6">
      {/* READINESS */}
      <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider">Submission Checklist</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${missing.length ? 'bg-red-600/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
            {missing.length ? `${missing.length} item${missing.length > 1 ? 's' : ''} to fix` : 'Ready to submit'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {ctx.checks.map((c) => (
            <span key={c.key} className={`flex items-center gap-2 ${c.ok ? 'text-white' : 'text-red-300'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 ${c.ok ? 'bg-emerald-500 text-black' : 'bg-red-600 text-white'}`}>{c.ok ? <FiCheck /> : <FiX />}</span>
              {c.label}
            </span>
          ))}
        </div>
        {ctx.kycStatus !== 'VERIFIED' && (
          <p className="text-[11px] text-[#FFBF00]">Submission stays locked until your organizer KYC is verified. Your draft is saved and you can come back any time.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Section title="1. Basic Details" step={1} goTo={goTo}>
            <div className="space-y-2">
              <Row label="Event" value={form.eventName} />
              <Row label="Category" value={form.category} />
              <Row label="Starts" value={fmt(form.startDate)} />
              <Row label="Concludes" value={fmt(form.endDate)} />
              <Row label="Venue" value={form.venueName} />
              <Row label="Address" value={form.venueAddress} />
            </div>
            {form.synopsis && <p className="text-[11px] text-neutral-400 leading-relaxed border-t border-neutral-800 pt-3">{form.synopsis}</p>}
          </Section>

          <Section title="4. Ticket Template" step={4} goTo={goTo}>
            <div className="space-y-2">
              <Row label="Template" value={template?.name} />
              <Row label="Category" value={template?.category} />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="2. Ticket Types" step={2} goTo={goTo}>
            <div className="space-y-2">
              {form.tiers.map((t) => (
                <div key={t.key} className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs">
                  <div>
                    <span className="font-bold block">{t.name}</span>
                    <span className="text-[10px] text-neutral-400">{(Number(t.total) || 0).toLocaleString()} tickets</span>
                  </div>
                  <span className="font-black text-[#FFBF00]">{isFreeTier(t) ? 'FREE' : formatNaira(t.price)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-neutral-800 pt-3">
              <Row label="Total capacity" value={`${totalCapacity.toLocaleString()} tickets`} />
              <Row label="Paid tiers" value={form.tiers.length - freeCount} />
              <Row label="Free tiers" value={freeCount} />
            </div>
          </Section>

          <Section title="3. Service Fee" step={3} goTo={goTo}>
            <div className="space-y-2">
              <Row label="Fee rate" value={`${rate}%`} />
              <Row label="Paid by" value={form.feeOption === 'organizer' ? 'Organizer (deducted from sales)' : 'Buyer (added at checkout)'} />
              <Row label="Free tiers" value="Fee exempt" />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}