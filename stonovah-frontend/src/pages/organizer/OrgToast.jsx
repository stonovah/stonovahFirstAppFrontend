import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { useOrg } from './OrganizerProvider';

export default function OrgToast() {
  const { toast } = useOrg();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-6 right-6 z-[60] bg-black text-white font-mono text-xs px-4 py-3 rounded-xl shadow-2xl border border-neutral-700 flex items-center gap-2 max-w-sm"
        >
          <FiCheck className="text-emerald-400 shrink-0" /> {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}