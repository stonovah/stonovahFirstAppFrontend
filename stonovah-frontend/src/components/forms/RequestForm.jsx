// src/components/forms/requestForm.jsx
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUploadCloud, FiTrash2, FiFileText } from 'react-icons/fi';
import { publicApi } from '../../api/public';
import { apiErrorMessage } from '../../api/apiClient';

export const MAX_FILES = 5;
export const MAX_MB = 15;
const FILE_OK = /^(application\/pdf|image\/(png|jpe?g|webp)|application\/(zip|x-zip-compressed|msword)|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;

export const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
export const today = () => new Date().toISOString().slice(0, 10);
export const inputCls = 'w-full bg-neutral-900 border border-neutral-700 text-white px-3.5 py-3 rounded-lg text-xs focus:border-[#FFBF00] focus:outline-none';

export const Field = ({ label, error, hint, children }) => (
  <label className="block text-xs">
    <span className="block font-mono text-neutral-400 mb-1.5 uppercase">{label}</span>
    {children}
    {error ? <span className="block mt-1 text-red-400">{error}</span> : hint && <span className="block mt-1 text-neutral-500">{hint}</span>}
  </label>
);

export const Step = ({ n, title, sub, children }) => (
  <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
    className="bg-black text-white p-6 md:p-8 rounded-2xl border border-black shadow-2xl space-y-4">
    <div className="border-b border-neutral-800 pb-3">
      <span className="text-[10px] font-mono text-[#FFBF00] font-bold uppercase tracking-widest block mb-1">STEP {n}</span>
      <h2 className="text-xl font-black uppercase">{title}</h2>
      {sub && <p className="text-[11px] text-neutral-400 mt-1">{sub}</p>}
    </div>
    {children}
  </motion.section>
);

export const Chip = ({ on, onClick, children, className = '' }) => (
  <button type="button" onClick={onClick} aria-pressed={on}
    className={`text-left p-4 rounded-xl border transition cursor-pointer ${on ? 'bg-[#FFBF00] text-black border-[#FFBF00]' : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600'} ${className}`}>
    {children}
  </button>
);

export function AttachmentPicker({ files, onChange }) {
  const ref = useRef(null);
  const [err, setErr] = useState('');
  const add = (list) => {
    const next = [...files];
    for (const f of list) {
      if (!FILE_OK.test(f.type)) return setErr(`“${f.name}” is not supported. Use PDF, Word, PNG, JPG, WebP or ZIP (zip CAD files).`);
      if (f.size > MAX_MB * 1024 * 1024) return setErr(`“${f.name}” is larger than ${MAX_MB} MB.`);
      if (next.length >= MAX_FILES) return setErr(`You can attach up to ${MAX_FILES} files.`);
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    setErr('');
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <input ref={ref} type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.zip" onChange={(e) => { add([...e.target.files]); e.target.value = ''; }} />
      <button type="button" onClick={() => ref.current?.click()} className="w-full border border-dashed border-neutral-700 bg-neutral-900/40 p-4 rounded-xl text-center hover:border-[#FFBF00] transition cursor-pointer">
        <span className="text-[11px] font-mono text-neutral-400 flex items-center justify-center gap-2"><FiUploadCloud className="text-lg text-[#FFBF00]" /> Attach riders, venue plans or briefs (optional). Up to {MAX_FILES} files, {MAX_MB} MB each.</span>
      </button>
      {err && <p className="text-[11px] text-red-400">{err}</p>}
      {files.map((f) => (
        <div key={`${f.name}-${f.size}`} className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 flex items-center gap-3 text-xs">
          <FiFileText className="text-[#FFBF00] shrink-0" /><span className="flex-1 truncate font-mono">{f.name}</span><span className="text-neutral-500">{(f.size / 1048576).toFixed(1)} MB</span>
          <button type="button" aria-label={`Remove ${f.name}`} onClick={() => onChange(files.filter((x) => x !== f))} className="text-neutral-400 hover:text-red-500 cursor-pointer"><FiTrash2 /></button>
        </div>
      ))}
    </div>
  );
}

// Sends the request first, then each file one by one. A failed file never loses the request.
export function useRequestSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null); // { ref, failed: [names] }
  const trap = useRef('');
  const trapProps = {
    name: 'website', tabIndex: -1, autoComplete: 'off', 'aria-hidden': true,
    onChange: (e) => { trap.current = e.target.value; },
    style: { position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 },
  };

  const submit = async ({ body, files = [] }) => {
    if (trap.current) { setDone({ ref: 'RECEIVED', failed: [] }); return; } // a bot filled the hidden field: pretend it worked
    setBusy(true); setError('');
    let id;
    try { id = (await publicApi.createServiceRequest(body)).id; }
    catch (e) { setError(apiErrorMessage(e, 'We could not send your request. Please try again.')); setBusy(false); return; }
    const failed = [];
    for (const f of files) { try { await publicApi.attachToRequest(id, f); } catch { failed.push(f.name); } }
    setDone({ ref: String(id).slice(-8).toUpperCase(), failed });
    setBusy(false);
  };
  return { submit, busy, error, done, reset: () => setDone(null), trapProps };
}

export function RequestSuccess({ done, email, onClose }) {
  return (
    <AnimatePresence>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black border-2 border-[#FFBF00] text-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl space-y-3">
            <div className="w-16 h-16 bg-[#FFBF00] text-black rounded-full flex items-center justify-center text-3xl mx-auto font-black">✓</div>
            <span className="text-[10px] font-mono text-[#FFBF00] font-bold uppercase tracking-widest block">REFERENCE {done.ref}</span>
            <h3 className="text-2xl font-black uppercase">Request received</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">Our team will review your request and reply to you by email. Quote this reference if you contact us.</p>
            {done.failed.length > 0 && (
              <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-left">
                Your request was sent, but these files did not upload: {done.failed.join(', ')}. Please email them to contact@stonovah.com with reference {done.ref}.
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border border-neutral-700 hover:border-white text-white font-bold text-xs uppercase py-3 rounded-xl transition cursor-pointer">Close</button>
              <Link to="/" className="flex-1 bg-[#FFBF00] text-black font-black text-xs uppercase py-3 rounded-xl hover:bg-amber-400 transition">Back to home</Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}