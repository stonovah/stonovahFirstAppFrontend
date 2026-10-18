// src/pages/steps/helpers.js — shared by every wizard step
import { useEffect, useState } from 'react';
import { platformApi } from '../../api/events';

// ---------- money (UI works in naira; the API stores kobo) ----------
export const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
export const koboToNaira = (kobo) => (Number(kobo) || 0) / 100;

// ---------- animation ----------
export const containerAnimation = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};
export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

// ---------- tiers ----------
const palette = ['bg-red-600', 'bg-amber-400', 'bg-emerald-400', 'bg-sky-400', 'bg-fuchsia-400', 'bg-neutral-400'];
export const tierColor = (i) => palette[i % palette.length];

let counter = 0;
export const newKey = () => `local-${Date.now()}-${counter++}`;

export const isFreeTier = (t) => t.price !== '' && Number(t.price) === 0;

// Local tier shape: { key, id (server id or null), name, price (naira), total, sold, free }
export const tierFromApi = (t) => ({
  key: t.id, id: t.id, name: t.name, price: koboToNaira(t.price), total: t.quantity, sold: t.quantitySold, free: t.isFree,
});

export const tierBody = (t) => ({
  name: t.name.trim(),
  price: Number(t.price) || 0,
  quantity: Number(t.total),
  isFree: Number(t.price) === 0,
});

// `server` = the last known server version (already in naira)
export const tierChanged = (t, server) =>
  !server || t.name.trim() !== server.name || Number(t.price) !== server.price || Number(t.total) !== server.total;

export const tierError = (t) => {
  if (!String(t.name || '').trim()) return 'Enter a name';
  const price = Number(t.price);
  const qty = Number(t.total);
  if (t.price === '' || Number.isNaN(price) || price < 0) return 'Enter a valid price (0 for a free ticket)';
  if (!Number.isInteger(qty) || qty < 1) return 'Quantity must be a whole number, at least 1';
  if (qty < (t.sold || 0)) return `Quantity cannot be below the ${t.sold} already sold`;
  return '';
};

// ---------- form <-> API ----------
export const DEFAULT_CATEGORY = 'Orchestral / Live Concert';

export const emptyForm = {
  eventName: '', category: DEFAULT_CATEGORY, synopsis: '',
  startDate: '', endDate: '', venueName: '', venueAddress: '', posterUrl: '',
  tiers: [],
  feeOption: 'organizer', // 'organizer' | 'buyer'
  templateId: null,
};

export const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const eventToForm = (event, tiers) => ({
  eventName: event.title || '',
  category: event.category || DEFAULT_CATEGORY,
  synopsis: event.description || '',
  startDate: toLocalInput(event.startAt),
  endDate: toLocalInput(event.endAt),
  venueName: event.venue || '',
  venueAddress: event.venueAddress || '',
  posterUrl: event.posterUrl || '',
  feeOption: event.feeHandling === 'BUYER_ADDED' ? 'buyer' : 'organizer',
  templateId: event.ticketTemplateId || null,
  tiers: tiers.map(tierFromApi),
});

export const eventPayload = (f) => ({
  title: f.eventName.trim(),
  description: f.synopsis.trim(),
  category: f.category,
  venue: f.venueName.trim(),
  venueAddress: f.venueAddress.trim(),
  startAt: f.startDate ? new Date(f.startDate).toISOString() : undefined,
  endAt: f.endDate ? new Date(f.endDate).toISOString() : undefined,
  posterUrl: f.posterUrl || undefined,
});

export const feeHandlingOf = (option) => (option === 'buyer' ? 'BUYER_ADDED' : 'ORGANIZER_ABSORBED');

// ---------- validation ----------
export const titleOk = (f) => f.eventName.trim().length >= 3;
export const datesOk = (f) => !!f.startDate && !!f.endDate && new Date(f.endDate) > new Date(f.startDate);
export const step1Valid = (f) => titleOk(f) && datesOk(f) && !!f.venueName.trim();
export const tiersValid = (f) => f.tiers.length > 0 && f.tiers.every((t) => !tierError(t));

// Mirrors the server's submit rules so the UI can explain what is missing
export const readiness = (f, kycStatus) => [
  { key: 'details', label: 'Event name, venue and dates', ok: step1Valid(f) },
  { key: 'future', label: 'Start time is in the future', ok: !!f.startDate && new Date(f.startDate) > new Date() },
  { key: 'tiers', label: 'At least one valid ticket type', ok: tiersValid(f) },
  { key: 'fee', label: 'Service fee choice', ok: !!f.feeOption },
  { key: 'template', label: 'Ticket template selected', ok: !!f.templateId },
  { key: 'kyc', label: 'Organizer KYC verified', ok: kycStatus === 'VERIFIED' },
];

// ---------- platform fee (public endpoint) ----------
export function useFeeRate() {
  const [rate, setRate] = useState(0.02);
  useEffect(() => {
    let on = true;
    platformApi.feeRate().then((r) => { if (on && typeof r === 'number') setRate(r); }).catch(() => {});
    return () => { on = false; };
  }, []);
  return rate;
}