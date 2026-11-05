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
    whileHover={hover ? { y: -3 } : undefined}
    className={`rounded-xl border border-white/[0.07] bg-[#161616] text-white ${className}`}
    {...rest}
  >
    {children}
  </motion.div>
);

const tones = {
  red: 'bg-red-600/15 text-red-300 border border-red-500/30',
  green: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  grey: 'bg-white/[0.06] text-white/70 border border-white/10',
  solid: 'bg-[#e10613] text-white',
};
export const Pill = ({ tone = 'grey', className = '', children }) => (
  <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${tones[tone]} ${className}`}>
    {children}
  </span>
);

const variants = {
  primary: 'bg-[#e10613] hover:bg-[#c40510] text-white',
  dark: 'bg-white/[0.07] hover:bg-white/[0.12] text-white',
  soft: 'bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10',
  outline: 'bg-white/[0.03] hover:border-white/30 text-white border border-white/15',
};
export const Btn = ({ variant = 'primary', className = '', disabled, ...p }) => (
  <motion.button
    whileHover={disabled ? undefined : { scale: 1.02 }}
    whileTap={disabled ? undefined : { scale: 0.97 }}
    disabled={disabled}
    className={`${variants[variant]} inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...p}
  />
);

export function PageHeader({ eyebrow, title, desc, children }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}
      className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div className="min-w-0 space-y-2">
        {eyebrow && (
          <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        {desc && <p className="max-w-2xl text-sm leading-relaxed text-white/55">{desc}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
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
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog" aria-modal="true"
            initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ duration: 0.25 }}
            className={`relative my-8 w-full ${width} overflow-hidden rounded-xl border border-white/10 bg-[#161616] text-white shadow-2xl`}
          >
            <div className="h-1 bg-[#e10613]" />
            <button type="button" onClick={onClose} aria-label="Close"
              className="absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/[0.07] transition-colors hover:bg-white/[0.14]">
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
  return bad ? <div className={`${className} bg-white/[0.06]`} /> :
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

export const Bar = ({ percent, color = 'bg-[#e10613]' }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
    <motion.div className={`h-full ${color}`} initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, percent)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
  </div>
);