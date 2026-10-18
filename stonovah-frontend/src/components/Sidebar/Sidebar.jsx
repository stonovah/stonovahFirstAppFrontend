// components/Sidebar/Sidebar.jsx
import React from 'react';
import { FiGrid, FiCalendar, FiPlusSquare, FiShield, FiUsers, FiDollarSign, FiCreditCard, FiSettings } from 'react-icons/fi';
import { useCan } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', icon: FiGrid },
  { name: 'My Events', icon: FiCalendar },
  { name: 'Create Event', icon: FiPlusSquare, perm: 'events.write' },
  { name: 'Gate Check-In & Scanner', icon: FiShield },
  { name: 'Attendees & Orders', icon: FiUsers },
  { name: 'Payouts & Revenue', icon: FiDollarSign, perm: 'finance.read' },
  { name: 'Ticket Templates', icon: FiCreditCard },
  { name: 'Settings', icon: FiSettings },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const can = useCan();
  return (
    <nav className="space-y-1 text-xs font-bold font-mono">
      {navItems.filter((item) => !item.perm || can(item.perm)).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.name;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => setActiveTab(item.name)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${isActive ? 'bg-red-600 text-white shadow-md' : 'text-black hover:bg-black/10'}`}
          >
            <Icon className="text-sm shrink-0" />
            <span>{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}