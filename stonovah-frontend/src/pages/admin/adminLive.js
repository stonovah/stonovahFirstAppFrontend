// src/pages/admin/adminLive.js: helpers for the API-driven admin screens (adminData.js stays for the unconverted pages)
import { useEffect, useState } from 'react';
import { formatNaira, koboToNaira } from '../steps/helpers';

export const moneyK = (kobo) => formatNaira(koboToNaira(kobo));
export const fmtDate = (iso, withTime = true) =>
  iso ? new Date(iso).toLocaleString('en-GB', withTime ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const ago = (iso) => {
  const m = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ${m % 60}m ago` : `${Math.floor(h / 24)}d ago`;
};

// Time left in the review SLA, counted from when the organizer submitted
export const slaInfo = (sinceIso, slaHours, now = Date.now()) => {
  const left = slaHours * 3600000 - (now - new Date(sinceIso).getTime());
  if (left <= 0) return { label: 'Past SLA', level: 'critical', overdue: true };
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  return { label: `${h}h ${String(m).padStart(2, '0')}m`, level: left <= 15 * 60000 ? 'critical' : left <= 3600000 ? 'warn' : 'ok', overdue: false };
};

export const priceRange = (t) => {
  if (!t || t.minPrice === null) return '—';
  if (t.maxPrice === 0) return 'Free';
  if (t.minPrice === t.maxPrice) return moneyK(t.minPrice);
  return `${t.minPrice === 0 ? 'Free' : moneyK(t.minPrice)} – ${moneyK(t.maxPrice)}`;
};

export const EVENT_STATUS = {
  DRAFT: { label: 'Draft', tone: 'grey' }, PENDING: { label: 'Pending', tone: 'red' }, LIVE: { label: 'Live', tone: 'green' },
  UNPUBLISHED: { label: 'Unpublished', tone: 'grey' }, ENDED: { label: 'Ended', tone: 'grey' },
};
export const ORG_STATUS = { ACTIVE: { label: 'Active', tone: 'green' }, PROBATIONARY: { label: 'Probationary', tone: 'amber' }, SUSPENDED: { label: 'Suspended', tone: 'red' } };
export const KYC = { PENDING: { label: 'KYC pending', tone: 'amber' }, VERIFIED: { label: 'KYC verified', tone: 'green' }, REJECTED: { label: 'KYC rejected', tone: 'red' } };

export function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
// src/pages/admin/adminLive.js: add
export const PAYOUT_STATUS = { PENDING: { label: 'Waiting to be paid', tone: 'amber' }, PAID: { label: 'Paid', tone: 'green' }, CANCELLED: { label: 'Cancelled', tone: 'grey' } };
export const ORDER_STATUS = { PENDING: { label: 'Awaiting payment', tone: 'amber' }, PAID: { label: 'Paid', tone: 'green' }, FAILED: { label: 'Failed', tone: 'red' }, REFUNDED: { label: 'Refunded', tone: 'grey' } };
export const shortId = (id) => String(id).slice(-8).toUpperCase();