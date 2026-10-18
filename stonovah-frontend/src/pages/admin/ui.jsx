import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' } }),
};

export const Card = ({ index = 0, className = '', hover = false, children, ...rest }) => (
  <motion.div
    custom={index} initial="hidden" animate="visible" variants={fadeUp}
    whileHover={hover ? { y: -4 } : undefined}
    className={`bg-black text-white rounded-2xl border border-black shadow-2xl font-mono ${className}`}
    {...rest}
  >
    {children}
  </motion.div>
);

const tones = {
  red: 'bg-red-600/20 text-red-300 border border-red-600/30',
  green: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  grey: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
  solid: 'bg-red-600 text-white',
};
export const Pill = ({ tone = 'grey', className = '', children }) => (
  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${tones[tone]} ${className}`}>
    {children}
  </span>
);

const variants = {
  primary: 'bg-red-600 hover:bg-red-700 text-white shadow-lg',
  dark: 'bg-black hover:bg-neutral-800 text-white',
  soft: 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800',
  outline: 'bg-black/10 hover:bg-black/20 text-black border border-black/30',
};
export const Btn = ({ variant = 'primary', className = '', disabled, ...p }) => (
  <motion.button
    whileHover={disabled ? undefined : { scale: 1.03 }}
    whileTap={disabled ? undefined : { scale: 0.97 }}
    disabled={disabled}
    className={`${variants[variant]} font-mono font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...p}
  />
);

export function PageHeader({ eyebrow, title, desc, children }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}
      className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div className="space-y-2 min-w-0">
        {eyebrow && (
          <span className="inline-block bg-black text-red-400 text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-black tracking-tight font-sans">{title}</h1>
        {desc && <p className="text-xs md:text-sm font-mono text-black/80 max-w-2xl leading-relaxed">{desc}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
    </motion.div>
  );
}

export function Modal({ open, onClose, width = 'max-w-3xl', children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-black/75 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog" aria-modal="true"
            initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ duration: 0.25 }}
            className={`relative w-full ${width} my-8 bg-neutral-900 text-white rounded-2xl border border-neutral-800 shadow-2xl font-mono overflow-hidden`}
          >
            <div className="h-1 bg-red-600" />
            <button type="button" onClick={onClose} aria-label="Close"
              className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center cursor-pointer">
              <FiX />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CountUp({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, value, { duration: 1, ease: 'easeOut', onUpdate: setV });
    return () => c.stop();
  }, [value]);
  return (
    <>
      {prefix}
      {v.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </>
  );
}

export function Img({ src, alt = '', className = '' }) {
  const [bad, setBad] = useState(false);
  return bad ? <div className={`${className} bg-neutral-800`} /> :
    <img src={src} alt={alt} className={className} onError={() => setBad(true)} />;
}

export function useNow(ms = 60000) {
  const [n, setN] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setN(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return n;
}

export const Bar = ({ percent, color = 'bg-red-600' }) => (
  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
    <motion.div className={`h-full ${color}`} initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, percent)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
  </div>
);