import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiGrid, FiCalendar, FiPlusSquare, FiShield, FiUsers, 
  FiDollarSign, FiCreditCard, FiSliders, FiSettings, FiSearch, 
  FiEdit, FiEye, FiExternalLink, FiDownload, FiMapPin, FiClock,
  FiActivity, FiCheckCircle, FiChevronLeft, FiChevronRight, FiMaximize2
} from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Sidebar from '../components/Sidebar/Sidebar';
import OrganiserEvent from './OrganiserEvent';
import CreateEvent from './CreateEvent';
import CheckIn from './CheckIn';
import { useSearchParams } from 'react-router-dom';
// import { OrganizerProvider } from './organizer/OrganizerProvider';
// import OrgToast from './organizer/OrgToast';
import OrganizerOrders from './organizer/pages/OrganizerOrders';
import OrganizerPayouts from './organizer/pages/OrganizerPayouts';
import OrganizerTemplates from './organizer/pages/OrganizerTemplates';
import OrganizerSettings from './organizer/pages/OrganizerSettings';
import DashboardHome from './organizer/pages/DashboardHome';
import { useAuth } from '../context/AuthContext';
import NoAccess from '../components/NoAccess';
import { useCan } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

function OrganiserDashboardInner() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [, setParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('All Ticket Tiers');

  const changeTab = (tab) => { setParams({}); setActiveTab(tab); };
  const openScanner = (eventId) => { setParams({ event: eventId }); setActiveTab('Gate Check-In & Scanner'); };
  const openCreateEvent = (params) => { setParams(params); setActiveTab('Create Event'); };
  const editEvent = (id, step = 1) => openCreateEvent({ event: id, step: String(step) });

  const openSettlementSettings = () => { setParams({ tab: 'settlement' }); setActiveTab('Settings'); };

  const { user } = useAuth();
  const kyc = user?.organizerProfile?.kycStatus;
  const can = useCan();
  const canWrite = can('events.write')

  // Sample Attendees Data
  const attendees = [
    {
      orderId: 'AORG-892118',
      ref: 'pay_c_882918a',
      name: 'Chubem Okoye',
      type: 'General',
      tierBadge: 'VIP Royal Circle',
      email: 'c.okoye@meridiancap.co.uk',
      tier: 'VIP ROYAL CIRCLE',
      qty: 2,
      gross: '£290.00',
      purchased: 'Today, 11:22',
      status: 'Active Pass'
    },
    {
      orderId: '4000-892119',
      ref: 'pay_c_882940b',
      name: 'Elena Rostova',
      type: 'Direct Purchase',
      email: 'elena.rostova@akutadolar.io',
      tier: 'STANDARD ARENA',
      qty: 4,
      gross: '£220.00',
      purchased: 'Today, 11:05',
      status: 'Active Pass'
    },
    {
      orderId: '4000-892167',
      ref: 'pay_c_884120d',
      name: 'Amina Bello',
      type: 'Direct Purchase',
      email: 'amina.bello@lagosarts.ng',
      tier: 'VIP ROYAL CIRCLE',
      qty: 2,
      gross: '£290.00',
      purchased: 'Yesterday, 19:15',
      status: 'Active Pass'
    },
    {
      orderId: 'AORG-892189',
      ref: 'pay_c_993100a',
      name: 'David O. Sterling',
      type: 'Direct Purchase',
      email: 'david.sterling@crestone.co.uk',
      tier: 'STANDARD ARENA',
      qty: 1,
      gross: '£55.00',
      purchased: 'Nov 12, 14:02',
      status: 'Active Pass'
    }
  ];

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  // Helper function to render page views according to active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardHome onScan={openScanner} onEdit={editEvent} onCreate={() => changeTab('Create Event')} />;

      case 'My Events':
        return <OrganiserEvent onCreate={() => changeTab('Create Event')} onEdit={editEvent} onNavigate={changeTab} onScan={openScanner} />;

      case 'Create Event':
        if (!can('events.write')) return <NoAccess />;
        return <CreateEvent onViewEvents={() => changeTab('My Events')} onDashboard={() => changeTab('Dashboard')} />;

      case 'Gate Check-In & Scanner':
        return <CheckIn />;

      case 'Attendees & Orders':
        return <OrganizerOrders />;

      case 'Payouts & Revenue':
        if (!can('finance.read')) return <NoAccess />;
        return <OrganizerPayouts onOpenSettings={openSettlementSettings} />;

      case 'Ticket Templates':
        return <OrganizerTemplates onUse={openCreateEvent} />;

      case 'Settings':
        return <OrganizerSettings />;
        
      default:
        // Placeholder view for other tabs
        return (
          <div className="bg-black text-white p-8 rounded-2xl border border-black min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-black uppercase text-[#FFBF00] mb-2">{activeTab}</h2>
            <p className="text-neutral-400 font-mono text-xs">
              This section is under management or setup for active events.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FFBF00] text-black font-sans selection:bg-black selection:text-[#FFBF00]">
      {/* GLOBAL TOP NAVIGATION HEADER */}
      <Navbar />

      {/* DASHBOARD LAYOUT */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-53px)]">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 bg-[#FFBF00] border-r-2 border-black/20 p-4 space-y-6 shrink-0">
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[9px] font-mono font-bold uppercase text-black/60 tracking-widest">EVENT OPERATIONS</span>
              <NotificationBell onNavigate={changeTab} />
            </div>
            {/* Pass state and state updater props to Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={changeTab} />
          </div>

          {/* CAPACITY WIDGET AT BOTTOM */}
          <div className="bg-black text-white p-4 rounded-xl border border-black space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-neutral-400">ACCOUNT VERIFICATION</span>
              <span className={`font-bold ${kyc === 'VERIFIED' ? 'text-emerald-400' : kyc === 'REJECTED' ? 'text-red-400' : 'text-[#FFBF00]'}`}>{kyc || '—'}</span>
            </div>
            <span className="text-[9px] font-mono text-neutral-400 block">
              {kyc === 'VERIFIED' ? 'You can submit events for review.' : 'Event submission unlocks once KYC is verified.'}
            </span>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 p-4 md:p-8 space-y-8 overflow-x-hidden">
          {renderTabContent()}
        </main>

      </div>

      {/* DASHBOARD FOOTER */}
      <Footer />
    </div>
  );
}

export default function OrganiserDashboard() {
  return <OrganiserDashboardInner />;
}