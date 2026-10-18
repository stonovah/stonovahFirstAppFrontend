// src/components/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white px-8 pt-12 pb-8 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-xs">
        <div>
          <span className="font-black tracking-tighter text-base block mb-3">STONOVAH</span>
          <p className="text-neutral-400 text-[11px] leading-relaxed mb-4">
            An ecosystem tailored for engineering prestigious productions, audio masters, live events, talent representation, and media distribution.
          </p>
          <span className="text-[10px] font-mono text-[#FACC15]">STONOVAH CREATIVE HOUSE LIMITED</span>
        </div>

        <div>
          <h4 className="font-mono text-[#FACC15] text-[10px] font-bold uppercase mb-3">OPERATIONAL ARMS</h4>
          <ul className="space-y-2 text-neutral-400 text-[11px]">
            {['01 // Production', '02 // Music', '03 // Talent Management', '04 // Distribution', '05 // Publishing'].map((t) => (
              <li key={t}><a href="/#arms" className="hover:text-white">{t}</a></li>
            ))}
            <li><Link to="/events" className="hover:text-white">06 // Events</Link></li>
            <li><a href="/#arms" className="hover:text-white">07 // Courses</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[#FACC15] text-[10px] font-bold uppercase mb-3">HQ & DIRECT LINES</h4>
          <p className="text-neutral-400 text-[11px] mb-2">Executive Suites & Studio Group</p>
          <a href="mailto:contact@stonovah.com" className="text-white hover:underline block mb-1">contact@stonovah.com</a>
          <p className="text-neutral-400 text-[11px]">+1 (800) 540 - 7748</p>
        </div>

        <div>
          <h4 className="font-mono text-[#FACC15] text-[10px] font-bold uppercase mb-3">PLATFORM</h4>
          <ul className="space-y-2 text-neutral-400 text-[11px]">
            <li><Link to="/events" className="hover:text-white">Browse events</Link></li>
            <li><Link to="/request-service" className="hover:text-white">Request a service</Link></li>
            <li><Link to="/organizer/register" className="hover:text-white">Create an organizer account</Link></li>
            <li><Link to="/login" className="hover:text-white">Log in</Link></li>
            <li><Link to="/events/past" className="hover:text-white">Past events & portfolio</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-neutral-900 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-500 font-mono gap-4">
        <p>© {new Date().getFullYear()} STONOVAH CREATIVE HOUSE LIMITED. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-neutral-300">Privacy Policy</a>
          <a href="#" className="hover:text-neutral-300">Terms of Service</a>
          <a href="#" className="hover:text-neutral-300">Distribution Agreement</a>
        </div>
      </div>
    </footer>
  );
}