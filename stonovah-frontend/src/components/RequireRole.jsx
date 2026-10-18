// src/components/RequireRole.jsx (replaces the previous version)
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, homeFor } from '../config/routes';
import NoAccess from './NoAccess';

export default function RequireRole({ role, permission, children }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#FFBF00] flex items-center justify-center font-mono text-xs font-bold">LOADING…</div>;
  }
  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location.pathname + location.search }} />;

  // Team members (STAFF) share the organizer area
  const inArea = role === 'ORGANIZER' ? user.role === 'ORGANIZER' || user.role === 'STAFF' : user.role === role;
  if (!inArea) return <Navigate to={homeFor(user)} replace />;

  if (user.role === 'ORGANIZER') {
    // KYC never submitted, or rejected -> back to onboarding. PENDING/VERIFIED may use the dashboard.
    const p = user.organizerProfile;
    if (!p?.organizerType || p.kycStatus === 'REJECTED') return <Navigate to={ROUTES.organizerRegister} replace />;
  }

  if (permission && !(user.access?.permissions || []).includes(permission)) return <NoAccess />;
  return children;
}