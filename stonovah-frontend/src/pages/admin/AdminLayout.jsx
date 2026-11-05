// src/pages/admin/AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiSettings, FiGrid } from 'react-icons/fi';
import { adminApi } from '../../api/admin';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { adminProductionApi } from '../../api/adminProduction';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

const groups = [
  { key: 'production', label: 'Production', badge: '10 SUB', items: [
    ['Overview', '/admin/production/overview'],
    ['Service Requests', '/admin/production/requests', 'prodRequests'],
    ['Proposals & Quotes', '/admin/production/proposals', 'prodProposals'],
    ['Active Projects', '/admin/production/projects'],
    ['Crew & Cast Sourcing', '/admin/production/sourcing', 'prodAlerts'],
    ['Funding & Pitch Materials', '/admin/production/funding', 'prodFunding'],
    ['Services Catalogue', '/admin/production/services'],
    ['Past Productions', '/admin/production/past'],
    ['FAQ & Content', '/admin/production/content'],
    ['Settings', '/admin/production/settings'],
  ] },
  { key: 'events', label: 'Events', badge: '9 SUB', items: [
    ['Overview', '/admin/events/overview'], ['Pending Approvals', '/admin/events/pending', 'pending'],
    ['All Events', '/admin/events'], ['Organizers', '/admin/organizers'], ['Payouts', '/admin/payouts', 'payouts'],
    ['Orders & Refunds', '/admin/orders', 'refunds'], ['Ticket Templates', '/admin/ticket-templates'],
    ['Service Requests', '/admin/service-requests'], ['Past Events', '/admin/past-events'],
  ] },
  { key: 'publishing', label: 'Publishing', badge: 'Soon', items: [['Books Catalog', '/admin/soon/books'], ['DRM Registry', '/admin/soon/drm'], ['Sales & Royalties', '/admin/soon/royalties']] },
  { key: 'courses', label: 'Courses', badge: 'Soon', items: [['Courses', '/admin/soon/courses'], ['Curriculum Master', '/admin/soon/curriculum'], ['1-on-1 Mentorship', '/admin/soon/mentorship']] },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(() => {
  const inProduction = pathname.startsWith('/admin/production');
  return { production: inProduction, events: !inProduction };
  });
  const [badges, setBadges] = useState({});

  useEffect(() => {
    const load = () => {
      adminApi.overview()
        .then((o) => setBadges((b) => ({ ...b, pending: o.pendingApprovals, refunds: o.attention.refunds, payouts: o.pendingPayouts + o.attention.advances })))
        .catch(() => {});
      // An admin without Production access gets a 403 here, which simply leaves the badges off.
      adminProductionApi.counts()
        .then((c) => setBadges((b) => ({ ...b, prodRequests: c.requestsNew, prodProposals: c.proposalsPending, prodAlerts: c.sourcingAlerts, prodFunding: c.fundingNew })))
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);

  const isActive = (to) => {
    if (to === '/admin/events') return pathname === to || /^\/admin\/events\/(?!overview|pending)/.test(pathname);
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const linkCls = (active) =>
    `flex items-center justify-between rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
      active ? 'bg-[#e10613] text-white' : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
    }`;

  const sidebar = (
    <nav className="space-y-6">
      <div>
        <span className={`${mono} mb-2 block px-2 text-[9px] text-white/35`}>Core / overview</span>
        <Link to="/admin" className={`${linkCls(pathname === '/admin')} gap-3 justify-start`}>
          <FiGrid /> Executive Overview
        </Link>
      </div>

      <div>
        <span className={`${mono} mb-2 block px-2 text-[9px] text-white/35`}>Operating modules</span>
        <div className="space-y-1">
          {groups.map((g) => (
            <div key={g.key}>
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [g.key]: !o[g.key] }))}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg px-1.5 py-2.5 ml-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white/80 transition-colors hover:bg-white/[0.05]"
              >
                <span>{g.label}</span>
                <span className="flex items-center gap-2">
                  <span className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[8px] text-white/60">{g.badge}</span>
                  <FiChevronDown className={`text-white/40 transition-transform ${open[g.key] ? 'rotate-180' : ''}`} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open[g.key] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-3 overflow-hidden border-l border-white/10 pl-2"
                  >
                    {g.items.map(([label, to, badge]) => (
                      <Link key={to} to={to} className={`${linkCls(isActive(to))} my-0.5`}>
                        {label}
                        {badge && badges[badge] > 0 && (
                          <motion.span
                            key={badges[badge]}
                            initial={{ scale: 1.5 }}
                            animate={{ scale: 1 }}
                            className="rounded bg-[#e10613] px-1.5 py-0.5 font-mono text-[9px] text-white ring-1 ring-white/30"
                          >
                            {badges[badge]}
                          </motion.span>
                        )}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <Link to="/admin/settings" className={linkCls(isActive('/admin/settings'))}>
        <span className="flex items-center gap-2"><FiSettings /> Settings & Audit</span>
        <span className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[8px] text-white/60">ROOT</span>
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased selection:bg-red-600 selection:text-white">
      <Navbar />
      <div className="flex">
        <aside className="sticky top-[57px] hidden max-h-[calc(100vh-57px)] min-h-[calc(100vh-57px)] w-64 shrink-0 self-start overflow-y-auto border-r border-white/5 bg-[#0d0d0d] p-4 lg:block">
          {sidebar}
        </aside>
        <main className="min-w-0 flex-1 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.10),transparent_50%)] p-4 md:p-8">
          <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <Outlet />
          </motion.div>
        </main>
      </div>
      <Footer />
    </div>
  );
}