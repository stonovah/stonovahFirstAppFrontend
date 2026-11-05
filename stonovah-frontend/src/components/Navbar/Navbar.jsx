import React, { useState } from 'react';
import Logo from './Logo';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, homeFor } from '../../config/routes';

// ',Add a lin`k to `the Product```ion dropdown by adding one line here.
const PRODUCTION_MENU = [
  {
    heading: 'Project types',
    items: [
      { name: 'Film', to: '/production/types/film' },
      { name: 'TV', to: '/production/types/tv' },
      { name: 'Commercials', to: '/production/types/commercials' },
    ],
  },
  {
    heading: 'Production',
    items: [
      { name: 'Production Home', to: '/production' },
      { name: 'Services', to: '/production/services' },
      { name: 'Full Production Packaging', to: '/production/services/full-production' },
      { name: 'Projects', to: '/production/projects' },
      { name: 'Who We Work With', to: '/production#who-we-work-with' },
      { name: 'Build Your Package', to: '/production/build-package' },
      { name: 'Request a Production Service', to: '/production/request' },
     + { name: 'About the Studio', to: '/about' }, // change to your real About route
    ],
  },
];

const navLinks = [
  { name: 'PRODUCTION', to: '/production', menu: PRODUCTION_MENU },
  { name: 'MUSIC', href: '/#arms' },
  { name: 'TALENT MANAGEMENT', href: '/#arms' },
  { name: 'DISTRIBUTION', href: '/#arms' },
  { name: 'PUBLISHING', href: '/#arms' },
  { name: 'EVENTS', to: '/events' },
  { name: 'LEARNING', href: '/#arms' },
  { name: 'CONTACT', to: '/request-service' },
];

function NavItem({ link, className, onClick }) {
  return link.to
    ? <Link to={link.to} onClick={onClick} className={className}>{link.name}</Link>
    : <a href={link.href} onClick={onClick} className={className}>{link.name}</a>;
}

function DesktopMenu({ link }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <Link to={link.to} onClick={() => setOpen(false)} className="flex items-center gap-1 hover:text-[#C0201E] transition-colors cursor-pointer">
        {link.name} <FiChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </Link>
      {open && (
        <div className="absolute left-0 top-full pt-3">
          <div className="w-64 rounded-lg border border-neutral-800 bg-[#0A0A0A] p-2 shadow-2xl">
            {link.menu.map((g) => (
              <div key={g.heading} className="py-1">
                <p className="px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">{g.heading}</p>
                {g.items.map((it) => (
                  <Link key={it.name} to={it.to} onClick={() => setOpen(false)} className="block rounded px-3 py-2 text-[11px] font-bold tracking-wider text-white/80 hover:bg-white/5 hover:text-[#C0201E]">
                    {it.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ link, close }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between hover:text-[#C0201E]">
        {link.name} <FiChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2 border-l border-neutral-800 pl-4">
          {link.menu.flatMap((g) => g.items).map((it) => (
            <Link key={it.name} to={it.to} onClick={close} className="text-xs font-semibold text-white/75 hover:text-[#C0201E]">{it.name}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  const ghostBtn = 'bg-transparent border border-[#FFBF00] text-[#FFBF00] font-bold text-xs px-4 py-2 rounded hover:bg-[#FFBF00] hover:text-black transition-all text-center';
  const solidBtn = 'bg-red-600 text-white font-bold text-xs px-4 py-2 rounded hover:bg-red-700 transition-all text-center';

  // Same buttons for desktop and the mobile drawer
  const actions = user ? (
    <>
      <Link to={homeFor(user)} onClick={() => setIsOpen(false)} className={ghostBtn}>
        {user.role === 'ADMIN' ? 'ADMIN CONSOLE' : 'DASHBOARD'}
      </Link>
      <button type="button" onClick={handleLogout} className={`${solidBtn} cursor-pointer`}>LOG OUT</button>
    </>
  ) : (
    <>
      <Link to={ROUTES.login} onClick={() => setIsOpen(false)} className={ghostBtn}>LOGIN</Link>
      <Link to={ROUTES.organizerRegister} onClick={() => setIsOpen(false)} className={solidBtn}>CREATE ORGANIZER ACCOUNT</Link>
    </>
  );

  return (
    <nav className="bg-[#0A0A0A] text-white sticky top-0 z-50 px-6 py-4 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />

        <div className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wider">
          {navLinks.map((link) =>
            link.menu
              ? <DesktopMenu key={link.name} link={link} />
              : <NavItem key={link.name} link={link} className="hover:text-[#C0201E] transition-colors cursor-pointer" />
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">{actions}</div>

        <button type="button" aria-label="Menu" className="lg:hidden text-2xl text-white cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden mt-4 bg-[#0A0A0A] p-4 rounded border border-neutral-800 flex flex-col gap-3 text-sm font-bold">
          {navLinks.map((link) =>
            link.menu
              ? <MobileMenu key={link.name} link={link} close={() => setIsOpen(false)} />
              : <NavItem key={link.name} link={link} onClick={() => setIsOpen(false)} className="hover:text-[#C0201E]" />
          )}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">{actions}</div>
        </div>
      )}
    </nav>
  );
}