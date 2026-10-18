import React from 'react';
import logoImg from '../../assets/Sch remodelled.png'; // Path to your logo image
import { Link } from 'react-router-dom';

export default function Logo({ className = "h-10 w-auto" }) {
  return (
    <Link to="/" className="cursor-pointer">
      <div className="flex items-center gap-2 cursor-pointer">
        <img src={logoImg} alt="Stonovah Creative House" className={className} />
        
        <div className="flex flex-col justify-center leading-none hidden sm:flex">
          <span className="font-extrabold tracking-wider text-white text-lg uppercase">
            STONOVAH
          </span>
          <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#C0201E] uppercase mt-0.5">
            CREATIVE HOUSE
          </span>
        </div>
      </div>
    </Link>
  );
}