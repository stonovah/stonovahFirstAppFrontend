import React from 'react';
import { motion } from 'framer-motion';

export function BarChart({ data, height = 140, format = (v) => v }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = Math.max(1, Math.ceil(data.length / 6));
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => (
          <div key={`${d.label}-${i}`} className="group relative flex-1 min-w-0 h-full flex items-end">
            <span className="pointer-events-none absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded whitespace-nowrap z-10">{d.label}: {format(d.value)}</span>
            <motion.div className={`w-full rounded-t ${d.value ? 'bg-red-600' : 'bg-neutral-800'}`} initial={{ height: 0 }} animate={{ height: `${Math.max((d.value / max) * 100, 2)}%` }} transition={{ duration: 0.7, delay: i * 0.03 }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1 text-[9px] text-neutral-500">
        {data.map((d, i) => <span key={i} className="flex-1 min-w-0 text-center truncate">{i % step === 0 ? d.label : ''}</span>)}
      </div>
    </div>
  );
}

export const last14 = () =>
  Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });