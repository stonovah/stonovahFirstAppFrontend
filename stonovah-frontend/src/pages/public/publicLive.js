// src/pages/public/publicLive.js
import { useEffect, useState } from 'react';
import { publicApi } from '../../api/public';
import { apiErrorMessage } from '../../api/apiClient';
import { formatNaira, koboToNaira } from '../steps/helpers';

export const naira = (kobo) => formatNaira(koboToNaira(kobo));

// All event times are shown in Lagos time
const fmt = (iso, o) => (iso ? new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', ...o }) : '—');
export const fmtDay = (iso) => fmt(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const fmtShort = (iso) => fmt(iso, { day: '2-digit', month: 'short', year: 'numeric' });
export const fmtTime = (iso) => fmt(iso, { hour: '2-digit', minute: '2-digit' });

export const remaining = (t) => Math.max(0, (t.quantity || 0) - (t.quantitySold || 0));

export function eventFacts(e) {
  const tiers = e.tiers || [];
  const capacity = tiers.reduce((s, t) => s + (t.quantity || 0), 0);
  const left = tiers.reduce((s, t) => s + remaining(t), 0);
  const pool = tiers.some((t) => remaining(t) > 0) ? tiers.filter((t) => remaining(t) > 0) : tiers;
  const prices = pool.map((t) => t.price);
  const sold = capacity - left;
  return {
    capacity, left, sold,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    free: tiers.length > 0 && tiers.every((t) => t.price === 0),
    soldOut: tiers.length > 0 && left === 0,
    almost: capacity > 0 && left > 0 && sold / capacity >= 0.9,
    ended: !!e.endAt && new Date(e.endAt).getTime() < Date.now(),
  };
}

export function priceLabel(f) {
  if (f.free) return 'FREE';
  if (f.minPrice === f.maxPrice) return naira(f.minPrice);
  return f.minPrice === 0 ? `Free – ${naira(f.maxPrice)}` : `From ${naira(f.minPrice)}`;
}

function useFetch(fn, deps) {
  const [s, set] = useState({ data: null, error: '', loading: true, notFound: false });
  useEffect(() => {
    let live = true;
    set({ data: null, error: '', loading: true, notFound: false });
    fn()
      .then((data) => live && set({ data, error: '', loading: false, notFound: false }))
      .catch((e) => live && set({ data: null, loading: false, notFound: e?.response?.status === 404, error: e?.response?.status === 404 ? '' : apiErrorMessage(e, 'Could not load this page. Please try again.') }));
    return () => { live = false; };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return s;
}

export const usePublicEvents = () => useFetch(() => publicApi.events(), []);
export const usePublicEvent = (slug) => useFetch(() => (slug ? publicApi.event(slug) : Promise.resolve(null)), [slug]);

// Hands the chosen tickets to the checkout page (built in Part 2). Survives a page refresh.
export const CART_KEY = 'stonovah_cart';
export function startCheckout(navigate, event, items) {
  try { sessionStorage.setItem(CART_KEY, JSON.stringify({ slug: event.slug, items, at: Date.now() })); } catch { /* private mode */ }
  navigate('/checkout', { state: { slug: event.slug, items } });
}
export const PENDING_KEY = 'stonovah_pending_order';
export function readCart(state) {
  if (state?.slug && state?.items?.length) return { slug: state.slug, items: state.items };
  try {
    const c = JSON.parse(sessionStorage.getItem(CART_KEY) || 'null');
    if (c?.slug && c?.items?.length && Date.now() - c.at < 6 * 3600000) return c;
  } catch { /* ignore */ }
  return null;
}
export const isVideo = (u) => /\.(mp4|mov|webm)(\?|$)/i.test(u || '');
export const coverOf = (p) => {
  const m = Array.isArray(p.mediaUrls) ? p.mediaUrls : [];
  return m.find((u) => !isVideo(u)) || m[0] || null; // prefer a photo as the cover
};
export const usePastEvents = (params = {}) => useFetch(() => publicApi.pastEvents(params), [JSON.stringify(params)]);
export const usePastEvent = (id) => useFetch(() => (id ? publicApi.pastEvent(id) : Promise.resolve(null)), [id]);