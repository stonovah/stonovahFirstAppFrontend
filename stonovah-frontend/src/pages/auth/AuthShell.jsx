// src/pages/auth/AuthShell.jsx — shared frame for forgot/reset pages
import React from 'react';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

export default function AuthShell({ title, intro, children }) {
  return (
    <div className="min-h-screen bg-[#FFBF00] text-black font-sans flex flex-col selection:bg-black selection:text-[#FFBF00]">
      <Navbar />
      <main className="flex-1 w-full max-w-xl mx-auto p-4 md:p-8 flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full bg-black text-white rounded-2xl shadow-2xl font-mono overflow-hidden"
        >
          <motion.div className="h-1 bg-red-600" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} />
          <div className="p-6 md:p-10 space-y-6">
            <span className="inline-flex items-center gap-2 bg-neutral-900 text-red-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded">
              <FiShield /> Account recovery
            </span>
            <h1 className="text-3xl font-black font-sans tracking-tight leading-none">{title}</h1>
            {intro && <p className="text-xs text-neutral-400 leading-relaxed">{intro}</p>}
            {children}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}