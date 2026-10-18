// src/pages/steps/TicketTemplate.jsx — real admin-published templates, previewed from their layoutConfig
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';

// Overlays sample text + a QR placeholder on the template background.
// layoutConfig numbers are pixels on the image's NATURAL size, so we convert to % and cqw (container-width units).
export function PassPreview({ template, eventName, tierName }) {
  const [dim, setDim] = useState(null);
  const L = template.layoutConfig || {};
  const pct = (v, total) => `${(v / total) * 100}%`;

  const text = (zone, content) =>
    zone && dim && (
      <span
        className="absolute text-white font-sans whitespace-nowrap leading-none"
        style={{
          left: pct(zone.x, dim.w), top: pct(zone.y, dim.h), transform: 'translateY(-82%)', // y is the text baseline
          fontSize: `${(zone.fontSize / dim.w) * 100}cqw`, textShadow: '0 1px 3px rgba(0,0,0,.6)',
        }}
      >
        {content}
      </span>
    );

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-neutral-900" style={{ containerType: 'inline-size' }}>
      <img
        src={template.backgroundUrl}
        alt={template.name}
        className="w-full h-auto block"
        onLoad={(e) => setDim({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
      />
      {dim && L.qr && (
        <div
          className="absolute bg-white flex items-center justify-center text-black"
          style={{ left: pct(L.qr.x, dim.w), top: pct(L.qr.y, dim.h), width: pct(L.qr.size, dim.w), aspectRatio: '1 / 1' }}
        >
          <BsQrCode className="w-3/4 h-3/4" />
        </div>
      )}
      {text(L.eventName, (eventName || 'Your Event').toUpperCase())}
      {text(L.attendeeName, 'ATTENDEE NAME')}
      {text(L.tierName, (tierName || 'General Admission').toUpperCase())}
    </div>
  );
}

export default function TicketTemplate({ form, update, ctx }) {
  const { templates, templatesLoading } = ctx;
  const selected = templates.find((t) => t.id === form.templateId) || null;
  const firstTier = form.tiers[0]?.name;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-bold text-black/70 uppercase tracking-widest block">DESIGN ATELIER</span>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black font-sans">Step 4: Choose Your Ticket Template</h1>
        <p className="text-xs font-mono text-black/80 max-w-2xl leading-relaxed">
          Every ticket for this event is issued as a PDF using the template you pick, with a unique QR code for entry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GALLERY */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 font-mono">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">Template Gallery</h2>
            <span className="text-[10px] bg-black/10 text-black px-2 py-0.5 rounded font-bold uppercase">{templates.length} available</span>
          </div>

          {templatesLoading && <p className="font-mono text-xs font-bold">LOADING TEMPLATES…</p>}

          {!templatesLoading && templates.length === 0 && (
            <div className="bg-black text-white p-6 rounded-2xl font-mono text-xs space-y-1">
              <b className="text-sm font-sans block">No ticket templates are published yet</b>
              <span className="text-neutral-400">A template is required before an event can be submitted. Please contact Stonovah support to have one published.</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const isSelected = tpl.id === form.templateId;
              return (
                <motion.button
                  key={tpl.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => update('templateId', tpl.id)}
                  className={`bg-black text-white rounded-2xl border overflow-hidden text-left cursor-pointer transition ${isSelected ? 'border-red-600 ring-2 ring-red-600' : 'border-black/40 hover:border-black'}`}
                >
                  <div className="aspect-[2/3] bg-neutral-900 relative">
                    <img src={tpl.backgroundUrl} alt={tpl.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><FiCheck /> SELECTED</span>
                    )}
                  </div>
                  <div className="p-3 font-mono">
                    <span className="text-[9px] text-neutral-400 uppercase font-bold block">{tpl.category}</span>
                    <span className="text-sm font-bold font-sans block truncate">{tpl.name}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* PREVIEW */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Live Pass Preview</h2>
          <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-4 font-mono">
            {selected ? (
              <>
                <PassPreview template={selected} eventName={form.eventName} tierName={firstTier} />
                <p className="text-[10px] text-neutral-500">Approximate preview. The real ticket uses each buyer’s name and a unique QR code.</p>
                <button
                  type="button"
                  onClick={ctx.next}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs shadow-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <FiCheck /> USE THIS TEMPLATE FOR EVENT
                </button>
              </>
            ) : (
              <p className="text-xs text-neutral-400">Select a template to preview your ticket.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}