// src/pages/admin/AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiSettings, FiGrid, FiCheck } from 'react-icons/fi';
import { adminApi } from '../../api/admin';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const groups = [
  { key: 'events', label: 'Events', badge: '9 SUB', items: [
    ['Overview', '/admin/events/overview'], ['Pending Approvals', '/admin/events/pending', 'pending'],
    ['All Events', '/admin/events'], ['Organizers', '/admin/organizers'], ['Payouts', '/admin/payouts', 'payouts'],
    ['Orders & Refunds', '/admin/orders', 'refunds'], ['Ticket Templates', '/admin/ticket-templates'],
    ['Service Requests', '/admin/service-requests'], ['Past Events', '/admin/past-events'],
  ] },
  { key: 'publishing', label: 'Publishing', badge: 'Soon', items: [['Books Catalog', '/admin/soon/books'], ['DRM Registry', '/admin/soon/drm'], ['Sales & Royalties', '/admin/soon/royalties']] },
  { key: 'courses', label: 'Courses & Mentorship', badge: 'Soon', items: [['Courses', '/admin/soon/courses'], ['Curriculum Master', '/admin/soon/curriculum'], ['1-on-1 Mentorship', '/admin/soon/mentorship']] },
];

export default function AdminLayout() {
  // const { toast } = useAdmin();
  const { pathname } = useLocation();
  const [open, setOpen] = useState({ events: true });
  const [badges, setBadges] = useState({});

  useEffect(() => {
    const load = () => adminApi.overview()
      .then((o) => setBadges({ pending: o.pendingApprovals, refunds: o.attention.refunds, payouts: o.pendingPayouts + o.attention.advances }))
      .catch(() => {});
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);

  const isActive = (to) => {
    if (to === '/admin/events') return pathname === to || /^\/admin\/events\/(?!overview|pending)/.test(pathname);
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const sidebar = (
    <nav className="space-y-5 font-mono text-xs font-bold">
      <div>
        <span className="text-[9px] font-bold uppercase text-black/60 tracking-widest block px-2 mb-2">CORE / OVERVIEW</span>
        <Link to="/admin" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${pathname === '/admin' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-black/10'}`}><FiGrid /> Executive Overview</Link>
      </div>
      <div>
        <span className="text-[9px] font-bold uppercase text-black/60 tracking-widest block px-2 mb-2">OPERATING MODULES</span>
        <div className="space-y-1">
          {groups.map((g) => (
            <div key={g.key}>
              <button type="button" onClick={() => setOpen((o) => ({ ...o, [g.key]: !o[g.key] }))} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-black/10 cursor-pointer">
                <span>{g.label}</span>
                <span className="flex items-center gap-2"><span className="text-[8px] bg-black text-white px-1.5 py-0.5 rounded">{g.badge}</span><FiChevronDown className={`transition-transform ${open[g.key] ? 'rotate-180' : ''}`} /></span>
              </button>
              <AnimatePresence initial={false}>
                {open[g.key] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden ml-3 border-l-2 border-black/20 pl-2">
                    {g.items.map(([label, to, badge]) => (
                      <Link key={to} to={to} className={`flex items-center justify-between px-3 py-2 rounded-lg my-0.5 transition ${isActive(to) ? 'bg-red-600 text-white' : 'hover:bg-black/10'}`}>
                        {label}
                        {badge && badges[badge] > 0 && <motion.span key={badges[badge]} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded ring-1 ring-white/30">{badges[badge]}</motion.span>}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      <Link to="/admin/settings" className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition ${isActive('/admin/settings') ? 'bg-red-600 text-white' : 'hover:bg-black/10'}`}>
        <span className="flex items-center gap-2"><FiSettings /> Settings & Audit</span><span className="text-[8px] bg-black text-white px-1.5 py-0.5 rounded">ROOT</span>
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FFBF00] text-black font-sans selection:bg-black selection:text-[#FFBF00]">
      <Navbar />
      <div className="flex">
        <aside className="hidden lg:block w-64 shrink-0 p-4 border-r-2 border-black/20 min-h-[calc(100vh-57px)] sticky top-[57px] self-start overflow-y-auto max-h-[calc(100vh-57px)]">{sidebar}</aside>
        <main className="flex-1 min-w-0 p-4 md:p-8">
          <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6"><Outlet /></motion.div>
        </main>
      </div>
      {/* <AnimatePresence>
        {toast && (
          <motion.div key={toast.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed bottom-6 right-6 z-[60] bg-black text-white font-mono text-xs px-4 py-3 rounded-xl shadow-2xl border border-neutral-700 flex items-center gap-2 max-w-sm">
            <FiCheck className="text-emerald-400 shrink-0" /> {toast.message}
          </motion.div>
        )}
      </AnimatePresence> */}
      <Footer />
    </div>
  );
}