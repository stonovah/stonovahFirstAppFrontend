import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiMail, FiPhone } from 'react-icons/fi';
import { ProductionProvider, useProduction } from './ProductionContext';
import { ARMS, CONTACT_EMAIL } from './ProdLive';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const subLink = ({ isActive }) =>
  `px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${isActive ? 'text-white' : 'text-white/55 hover:text-white'}`;
const plainLink = 'px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55 hover:text-white';

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    // The target section may still be loading, so try a few times.
    const tries = [100, 600, 1500].map((ms) => setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), ms));
    return () => tries.forEach(clearTimeout);
  }, [pathname, hash]);
  return null;
}

function SubNav() {
  const { count } = useProduction();
  return (
   
    <Navbar/>
  );
}

export default function ProductionLayout() {
  return (
    <ProductionProvider>
      <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
        <ScrollManager />
        <SubNav />
        <main><Outlet /></main>
        <Footer />
      </div>
    </ProductionProvider>
  );
}