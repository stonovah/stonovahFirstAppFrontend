// src/components/NoAccess.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';

export default function NoAccess({ message }) {
  return (
    <div className="bg-black text-white p-8 rounded-2xl font-mono text-center space-y-3 max-w-xl mx-auto">
      <h2 className="text-xl font-black font-sans">You don’t have access to this</h2>
      <p className="text-xs text-neutral-400">{message || 'Your role on this team can’t open this page. Ask the account owner if you need access.'}</p>
      <Link to={ROUTES.organizerDashboard} className="text-[#FFBF00] text-xs font-bold hover:underline inline-block">Back to the dashboard</Link>
    </div>
  );
}