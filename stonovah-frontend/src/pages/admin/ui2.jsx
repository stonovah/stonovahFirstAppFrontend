import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { initials } from './adminExtra';

export const inputCls =
  'w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFBF00] placeholder:text-neutral-600';

export const sizeLabel = (s) => (typeof s === 'string' ? s : s >= 1e9 ? `${(s / 1e9).toFixed(1)} GB` : `${(s / 1e6).toFixed(1)} MB`);

export function Toggle({ on, onChange, label, disabled }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0 ${on ? 'bg-red-600' : 'bg-neutral-700'}`}
    >
      <motion.span animate={{ x: on ? 20 : 0 }} className="block w-5 h-5 rounded-full bg-white" />
    </button>
  );
}

export const FormField = ({ label, required, right, hint, error, className = '', children }) => (
  <div className={className}>
    <div className="flex justify-between gap-2 text-[10px] font-bold text-neutral-400 tracking-wider mb-1 uppercase">
      <span>{label}{required && ' *'}</span>{right}
    </div>
    {children}
    {error ? <p className="text-[10px] text-red-400 mt-1">{error}</p> : hint && <p className="text-[10px] text-neutral-500 mt-1">{hint}</p>}
  </div>
);

export const Avatar = ({ name, className = '' }) => (
  <span className={`w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-xs font-black font-sans shrink-0 ${className}`}>{initials(name)}</span>
);

export function Pagination({ page, pages, onPage }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page" className="w-8 h-8 rounded bg-neutral-900 disabled:opacity-40 flex items-center justify-center cursor-pointer"><FiChevronLeft /></button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" onClick={() => onPage(n)} className={`w-8 h-8 rounded font-bold text-xs cursor-pointer ${n === page ? 'bg-red-600' : 'bg-neutral-900 hover:bg-neutral-800'}`}>{n}</button>
      ))}
      <button type="button" disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Next page" className="w-8 h-8 rounded bg-neutral-900 disabled:opacity-40 flex items-center justify-center cursor-pointer"><FiChevronRight /></button>
    </div>
  );
}

/* Stores file metadata only. Upload the real files to your API/storage. */
export function DropZone({ files = [], onFiles, multiple = false, accept, maxMB = 25, title, hint }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState('');

  const take = (list) => {
    const arr = [...list];
    const big = arr.find((f) => f.size > maxMB * 1024 * 1024);
    if (big) { setErr(`${big.name} is larger than ${maxMB}MB`); return; }
    setErr('');
    const meta = arr.map((f) => ({ name: f.name, size: f.size }));
    onFiles(multiple ? [...files, ...meta] : meta.slice(0, 1));
  };

  return (
    <div className="space-y-2">
      <input ref={ref} type="file" multiple={multiple} accept={accept} className="hidden" onChange={(e) => { take(e.target.files); e.target.value = ''; }} />
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${drag ? 'border-[#FFBF00] bg-neutral-900' : 'border-neutral-800 hover:border-neutral-600 bg-neutral-950'}`}
      >
        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} className="w-11 h-11 rounded-xl bg-neutral-900 text-red-500 flex items-center justify-center mx-auto mb-2"><FiUploadCloud className="text-xl" /></motion.div>
        <b className="text-sm font-sans block">{title}</b>
        <span className="text-[10px] text-neutral-400 block mt-1">{hint}</span>
        <span className="inline-block mt-3 text-[10px] bg-neutral-800 px-3 py-1.5 rounded font-bold">BROWSE FILES</span>
      </div>
      {err && <p className="text-[10px] text-red-400">{err}</p>}
      {files.map((f, i) => (
        <motion.div key={`${f.name}-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 flex items-center gap-3 text-xs">
          <FiFileText className="text-red-400 shrink-0" /><span className="flex-1 truncate font-mono">{f.name}</span><span className="text-neutral-400">{sizeLabel(f.size)}</span>
          <button type="button" aria-label="Remove file" onClick={() => onFiles(files.filter((_, j) => j !== i))} className="text-neutral-400 hover:text-red-500 cursor-pointer"><FiTrash2 /></button>
        </motion.div>
      ))}
    </div>
  );
}