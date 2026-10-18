
import {
  FiUpload, FiBold, FiItalic, FiUnderline, FiList,
  FiLink, FiMapPin, FiClock,
} from 'react-icons/fi';

import React, { useRef, useState } from 'react';
import { apiErrorMessage } from '../../api/apiClient';

export default function BasicDetails({ form, update, ctx }) {
  return (
    <div className="space-y-6">
      {/* CARD 1: GENERAL CONFIGURATION */}
      <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-xs" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Step 1: Event General Configuration
            </h2>
          </div>
          <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-600/30 px-2 py-0.5 rounded font-bold uppercase">
            MANDATORY
          </span>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div>
            <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
              <label>Event Production Name</label>
              <span>{form.eventName.length}/80 chars</span>
            </div>
            <input
              type="text"
              maxLength={80}
              value={form.eventName}
              onChange={(e) => update('eventName', e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#FFBF00]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Primary Category</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FFBF00]"
              >
                <option>Orchestral / Live Concert</option>
                <option>Festival / Outdoor</option>
                <option>Private Showcase</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Broadcasting Protocol</label>
              <select disabled value="public" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-500 cursor-not-allowed">
                <option value="public">Public Ticketed Experience</option>
              </select>
              <span className="text-[9px] text-neutral-500 block mt-1">Private guestlist events are not available yet.</span>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
              <label>Curatorial Premise & Synopsis</label>
              <span>Markdown Supported</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-t-xl px-3 py-2 flex items-center gap-3 border-b border-neutral-800 text-neutral-400 text-xs">
              <button type="button" className="hover:text-white"><FiBold /></button>
              <button type="button" className="hover:text-white"><FiItalic /></button>
              <button type="button" className="hover:text-white"><FiUnderline /></button>
              <span className="text-neutral-700">|</span>
              <button type="button" className="hover:text-white"><FiList /></button>
              <button type="button" className="hover:text-white"><FiLink /></button>
            </div>

            <textarea
              rows={4}
              value={form.synopsis}
              onChange={(e) => update('synopsis', e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-b-xl px-4 py-3 text-white text-xs leading-relaxed focus:outline-none focus:border-[#FFBF00]"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1 uppercase">EVENT STARTS (YOUR LOCAL TIME)</label>
              <div className="relative">
                <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#FFBF00]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1 uppercase">EVENT CONCLUDES</label>
              <div className="relative">
                <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => update('endDate', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#FFBF00]"
                />
              </div>
            </div>
          </div>
          {form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate) && (
            <p className="text-[10px] text-red-400">End time must be after the start time.</p>
          )}

          {/* Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Acoustic Venue & Precision Address</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={form.venueName}
                  onChange={(e) => update('venueName', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#FFBF00]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">&nbsp;</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={form.venueAddress}
                  onChange={(e) => update('venueAddress', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#FFBF00]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: POSTER UPLOADER */}
      <PosterCard posterUrl={form.posterUrl} upload={ctx.uploadPoster} />
    </div>
  );
}

function PosterCard({ posterUrl, upload }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return setError('Use a PNG, JPG or WebP image.');
    if (file.size > 15 * 1024 * 1024) return setError('The image must be 15 MB or smaller.');
    setError(''); setBusy(true);
    try { await upload(file); }
    catch (e) { setError(apiErrorMessage(e, 'Upload failed. Try again.')); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-xs" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Stage Poster & Visual Key</h2>
        </div>
        <span className="text-[9px] font-mono text-neutral-400">Recommended: portrait, 2400 × 3000px</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <div
          onClick={() => !busy && inputRef.current?.click()}
          className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 bg-neutral-950 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition"
        >
          <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-red-500 mb-2"><FiUpload className="text-lg" /></div>
          <span className="text-xs font-bold text-neutral-200 block mb-1">
            {busy ? 'Uploading…' : posterUrl ? 'Replace poster' : 'Click to upload your poster'}
          </span>
          <span className="text-[9px] text-neutral-500">PNG, JPG or WebP up to 15MB</span>
        </div>

        {posterUrl && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
            <img src={posterUrl} alt="Poster preview" className="w-20 h-24 rounded-lg object-cover border border-neutral-700 shrink-0" />
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">UPLOADED</span>
          </div>
        )}
      </div>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}