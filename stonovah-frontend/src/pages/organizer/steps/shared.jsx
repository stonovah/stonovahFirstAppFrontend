import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiTrash2, FiArrowRight } from 'react-icons/fi';

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
  }),
};

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe',
  'Zamfara',
];

/* ---------- Black card with animated red accent line ---------- */
export function Card({ title, subtitle, icon: Icon, badge, index = 0, className = '', children }) {
  return (
    <motion.section
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className={`relative bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-5 font-mono overflow-hidden ${className}`}
    >
      <motion.span
        initial={{ width: 0 }}
        animate={{ width: 64 }}
        transition={{ delay: 0.3 + index * 0.07, duration: 0.6 }}
        className="absolute top-0 left-6 h-0.5 bg-red-600"
      />
      {title && (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0">
                <Icon className="text-neutral-300" />
              </div>
            )}
            <div>
              <h2 className="text-base font-black font-sans leading-tight">{title}</h2>
              {subtitle && <p className="text-[10px] text-neutral-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {badge}
        </div>
      )}
      {children}
    </motion.section>
  );
}

export const Badge = ({ children, tone = 'red' }) => (
  <span
    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
      tone === 'red'
        ? 'bg-red-600/20 text-red-300 border border-red-600/30'
        : tone === 'green'
        ? 'bg-emerald-500/20 text-emerald-300'
        : 'bg-neutral-800 text-neutral-300'
    }`}
  >
    {children}
  </span>
);

/* ---------- Input / select with label, icon, hint and error ---------- */
export function Field({
  label, required, right, hint, icon: Icon, error, as = 'input', children, className = '', ...props
}) {
  const base = `w-full bg-neutral-900 border rounded-xl py-2.5 text-white text-xs focus:outline-none focus:border-[#FFBF00] placeholder:text-neutral-600 transition ${
    Icon ? 'pl-9 pr-3' : 'px-3'
  } ${error ? 'border-red-500' : 'border-neutral-800'}`;

  return (
    <div className={className}>
      <div className="flex justify-between items-center text-[10px] text-neutral-400 mb-1 font-mono">
        <label>
          {label}
          {required && ' *'}
        </label>
        {right}
      </div>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />}
        {as === 'select' ? (
          <select className={base} {...props}>{children}</select>
        ) : (
          <input className={base} {...props} />
        )}
      </div>
      {error ? (
        <p className="text-[10px] text-red-400 mt-1">{error}</p>
      ) : (
        hint && <p className="text-[10px] text-neutral-500 mt-1">{hint}</p>
      )}
    </div>
  );
}

/* ---------- Animated circular progress ---------- */
export function ProgressRing({ percent, label = 'READINESS', size = 140 }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="-rotate-90 w-full h-full">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#262626" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none" stroke="#dc2626" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - percent / 100) }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black font-sans">
          {percent}
          <span className="text-base">%</span>
        </span>
        <span className="text-[8px] tracking-widest text-neutral-400 font-bold">{label}</span>
      </div>
    </div>
  );
}

/* ---------- Drag & drop upload with file card ---------- */
export function UploadZone({ file, onFile, title, hint, accept = '.pdf,.png,.jpg,.jpeg', maxMB = 15 }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');

  const handle = (f) => {
    if (!f) return;
    if (f.size > maxMB * 1024 * 1024) {
      setError(`File is larger than ${maxMB}MB`);
      return;
    }
    setError('');
    onFile(f);
  };

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      <AnimatePresence mode="wait" initial={false}>
        {file ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-red-500 shrink-0">
              <FiFileText />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold block truncate">{file.name}</span>
              <span className="text-[10px] text-emerald-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB • READY TO SUBMIT
              </span>
            </div>
            <button
              type="button"
              onClick={() => onFile(null)}
              className="text-neutral-400 hover:text-red-500 transition cursor-pointer p-2"
              aria-label="Remove file"
            >
              <FiTrash2 />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="drop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files?.[0]); }}
            onClick={() => ref.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              drag ? 'border-[#FFBF00] bg-neutral-900' : 'border-neutral-800 hover:border-neutral-600 bg-neutral-950'
            }`}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center text-red-500 mx-auto mb-3"
            >
              <FiUploadCloud className="text-xl" />
            </motion.div>
            <span className="text-sm font-bold block">{title}</span>
            <span className="text-[10px] text-neutral-400 block mt-1 max-w-sm mx-auto">{hint}</span>
            <span className="inline-block mt-3 text-[10px] bg-neutral-800 px-3 py-1.5 rounded font-bold">
              BROWSE LOCAL STORAGE
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

/* ---------- Bottom action bar used by every step ---------- */
export function ActionBar({ left, note, onSave, onNext, nextLabel, disabled }) {
  return (
    <motion.div
      initial="hidden" animate="visible" variants={fadeUp} custom={6}
      className="flex flex-col md:flex-row items-center justify-between gap-4 bg-black text-white p-4 rounded-2xl font-mono text-xs shadow-2xl"
    >
      <div className="flex items-center gap-4">
        {left}
        {note && <span className="text-[10px] text-neutral-400 uppercase font-bold">{note}</span>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          Save Draft
        </button>
        <motion.button
          type="button"
          whileHover={disabled ? {} : { scale: 1.03 }}
          whileTap={disabled ? {} : { scale: 0.97 }}
          onClick={onNext}
          disabled={disabled}
          className="bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nextLabel} <FiArrowRight />
        </motion.button>
      </div>
    </motion.div>
  );
}