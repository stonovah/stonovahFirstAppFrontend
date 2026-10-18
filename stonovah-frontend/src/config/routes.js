// src/config/routes.js — every path in one place. Confirm against your router (see the end).
export const ROUTES = {
  login: '/login',
  organizerRegister: '/organizer/register',
  organizerDashboard: '/organiser-dashboard',
  createEvent: '/create-event',
  myEvents: '/my-events',
  adminHome: '/admin',
};

// Where a logged-in user belongs
export const homeFor = (user, from) => {
  if (user.role === 'STAFF') return from && !from.startsWith('/admin') && from !== ROUTES.login ? from : ROUTES.organizerDashboard;
  const p = user.organizerProfile;
  if (p?.kycStatus === 'VERIFIED') {
    return from && !from.startsWith('/admin') && from !== ROUTES.login ? from : ROUTES.organizerDashboard;
  }
  return ROUTES.organizerRegister; // finish or track KYC
};