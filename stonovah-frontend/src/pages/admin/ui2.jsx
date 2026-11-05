import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiTrash2, FiChevronLeft, FiChevronRight, FiChevronDown, FiCheck } from 'react-icons/fi';
import { initials } from './adminExtra';

export const inputCls =
  'w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2.5 text-xs text-white placeholder:text-white/30 [color-scheme:dark] focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/40';

export const sizeLabel = (s) => (typeof s === 'string' ? s : s >= 1e9 ? `${(s / 1e9).toFixed(1)} GB` : `${(s / 1e6).toFixed(1)} MB`);

export function Toggle({ on, onChange, label, disabled }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className={`h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors disabled:opacity-50 ${on ? 'bg-[#e10613]' : 'bg-white/15'}`}
    >
      <motion.span animate={{ x: on ? 20 : 0 }} className="block h-5 w-5 rounded-full bg-white" />
    </button>
  );
}

export const FormField = ({ label, required, right, hint, error, className = '', children }) => (
  <div className={className}>
    <div className="mb-1.5 flex justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
      <span>{label}{required && ' *'}</span>{right}
    </div>
    {children}
    {error ? <p className="mt-1 text-[10px] font-semibold text-red-400">{error}</p> : hint && <p className="mt-1 text-[10px] text-white/35">{hint}</p>}
  </div>
);

export const Avatar = ({ name, className = '' }) => (
  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-xs font-black text-red-400 ${className}`}>{initials(name)}</span>
);

export function Pagination({ page, pages, onPage }) {
  const base = 'flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border text-xs font-bold transition-colors';
  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page" className={`${base} border-white/10 bg-white/[0.03] hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-40`}><FiChevronLeft /></button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" onClick={() => onPage(n)} className={`${base} ${n === page ? 'border-[#e10613] bg-[#e10613] text-white' : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25'}`}>{n}</button>
      ))}
      <button type="button" disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Next page" className={`${base} border-white/10 bg-white/[0.03] hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-40`}><FiChevronRight /></button>
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
        className={`cursor-pointer rounded-xl border border-dashed p-6 text-center transition-colors ${drag ? 'border-red-500/60 bg-red-500/[0.06]' : 'border-white/15 bg-white/[0.02] hover:border-white/35'}`}
      >
        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-red-500"><FiUploadCloud className="text-xl" /></motion.div>
        <b className="block text-sm">{title}</b>
        <span className="mt-1 block text-[10px] text-white/45">{hint}</span>
        <span className="mt-3 inline-block rounded-md bg-white/[0.07] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider">Browse files</span>
      </div>
      {err && <p className="text-[10px] font-semibold text-red-400">{err}</p>}
      {files.map((f, i) => (
        <motion.div key={`${f.name}-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs">
          <FiFileText className="shrink-0 text-red-500" /><span className="flex-1 truncate font-mono">{f.name}</span><span className="text-white/45">{sizeLabel(f.size)}</span>
          <button type="button" aria-label="Remove file" onClick={() => onFiles(files.filter((_, j) => j !== i))} className="cursor-pointer text-white/40 transition-colors hover:text-red-400"><FiTrash2 /></button>
        </motion.div>
      ))}
    </div>
  );
}

export function Select({ value, onChange, options, placeholder = 'Select…', disabled, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2.5 text-left text-xs text-white transition-colors hover:border-white/25 focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={`truncate ${current ? '' : 'text-white/35'}`}>{current ? current.label : placeholder}</span>
        <FiChevronDown className={`shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-64 w-full min-w-[10rem] overflow-y-auto rounded-lg border border-white/10 bg-[#161616] p-1 shadow-2xl shadow-black/60"
        >
          {options.map((o) => {
            const on = o.value === value;
            return (
              <li key={String(o.value)} role="option" aria-selected={on}>
                <button
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors ${
                    on ? 'bg-[#e10613]/15 font-bold text-white' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {on && <FiCheck className="shrink-0 text-red-500" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}