import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiAlertTriangle, FiInbox } from 'react-icons/fi';
import { iconFor } from './ProdLive';

export const Icon = ({ name, className }) => {
  const C = iconFor(name);
  return <C className={className} />;
};

export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay }}
    >
      {children}
    </motion.div>
  );
}

export const Eyebrow = ({ children, className = '' }) => (
  <p className={`flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 ${className}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
    {children}
  </p>
);

export function SectionHead({ eyebrow, title, sub, right }) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        {sub && <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Btn({ to, href, onClick, variant = 'primary', arrow, className = '', children, ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  const v = {
    primary: 'bg-[#e10613] text-white hover:bg-[#c40510]',
    ghost: 'border border-white/15 bg-white/[0.03] text-white hover:border-white/30',
    dark: 'bg-white/[0.07] text-white hover:bg-white/[0.12]',
  }[variant];
  const cls = `${base} ${v} ${className}`;
  const inner = (<>{children}{arrow && <FiArrowRight className="text-sm" />}</>);
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>;
  return <button type="button" onClick={onClick} className={cls} {...rest}>{inner}</button>;
}

export const Card = ({ className = '', children, ...rest }) => (
  <div className={`rounded-xl border border-white/[0.07] bg-[#161616] ${className}`} {...rest}>{children}</div>
);

export const Chip = ({ children, className = '' }) => (
  <span className={`inline-block rounded bg-black/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur ${className}`}>{children}</span>
);

export const Loading = ({ label = 'Loading' }) => (
  <p className="py-16 text-center font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">{label}…</p>
);

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="my-8 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/[0.07] p-4 text-sm text-red-200">
      <FiAlertTriangle className="shrink-0 text-red-400" />
      <span className="flex-1">{message}</span>
      {onRetry && <button onClick={onRetry} className="text-[11px] font-bold uppercase tracking-wider text-white underline">Retry</button>}
    </div>
  );
}

export function EmptyState({ icon: IconC = FiInbox, title, message, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <IconC className="text-xl text-white/40" />
      </div>
      <h3 className="mt-5 text-base font-bold">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/50">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Breadcrumb({ items }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
      {items.map((it, i) => (
        <span key={it.label} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {it.to ? <Link to={it.to} className="hover:text-white">{it.label}</Link> : <span className="text-white/70">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}