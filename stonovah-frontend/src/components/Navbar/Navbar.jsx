// src/components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import Logo from './Logo';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, homeFor } from '../../config/routes';

const navLinks = [
  { name: 'PRODUCTION', href: '/#arms' },
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
          {navLinks.map((link) => <NavItem key={link.name} link={link} className="hover:text-[#C0201E] transition-colors cursor-pointer" />)}
        </div>

        <div className="hidden md:flex items-center gap-3">{actions}</div>

        <button type="button" aria-label="Menu" className="lg:hidden text-2xl text-white cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden mt-4 bg-[#0A0A0A] p-4 rounded border border-neutral-800 flex flex-col gap-3 text-sm font-bold">
          {navLinks.map((link) => <NavItem key={link.name} link={link} onClick={() => setIsOpen(false)} className="hover:text-[#C0201E]" />)}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">{actions}</div>
        </div>
      )}
    </nav>
  );
}