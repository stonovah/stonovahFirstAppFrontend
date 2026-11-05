import { useEffect, useState } from 'react';
import {
  FiFilm, FiLayers, FiFileText, FiCalendar, FiUsers, FiDollarSign, FiVideo, FiClipboard, FiSliders, FiShield, FiAward, FiVolume2,
} from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';

export const CONTACT_EMAIL = 'stonovahcreativehouse@gmail.com';

export const FORMAT_LABEL = {
  FEATURE_FILM: 'Feature Film', DOCUMENTARY: 'Documentary', TV_SERIES: 'TV Series', COMMERCIAL: 'Commercial', MUSIC_VIDEO: 'Music Video',
};

// Edit the paths to match your real routes for the other arms.
export const ARMS = [
  { label: 'Production', to: '/production' },
  { label: 'Music', to: '/music' },
  { label: 'Talent Management', to: '/talent' },
  { label: 'Publishing', to: '/publishing' },
  { label: 'Distribution', to: '/distribution' },
  { label: 'Events', to: '/events' },
  { label: 'Academy', to: '/academy' },
];

export const STAGE_NO = { DEVELOP: 1, PREPARE: 2, SHOOT: 3, FINISH: 4, RELEASE: 5 };

const ICONS = {
  layers: FiLayers, 'file-text': FiFileText, calendar: FiCalendar, users: FiUsers, 'dollar-sign': FiDollarSign, video: FiVideo,
  clipboard: FiClipboard, sliders: FiSliders, shield: FiShield, award: FiAward, film: FiFilm, clapperboard: FiFilm, megaphone: FiVolume2,
};
export const iconFor = (key, fallback = FiFilm) => ICONS[key] ?? fallback;

// Kobo to a short naira label: 11500000000 -> ₦115M
export function ngn(kobo, { full = false } = {}) {
  if (kobo === null || kobo === undefined) return '';
  const n = Number(kobo) / 100;
  if (full) return '₦' + new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(n);
  const trim = (v) => String(+v.toFixed(1));
  if (n >= 1e9) return `₦${trim(n / 1e9)}B`;
  if (n >= 1e6) return `₦${trim(n / 1e6)}M`;
  if (n >= 1e3) return `₦${trim(n / 1e3)}K`;
  return `₦${n}`;
}

export const fmtDate = (d) => (d ? new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeZone: 'Africa/Lagos' }).format(new Date(d)) : '');

export function usePageTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}

// Loads once, and again when deps change or reload() is called.
export function useProdData(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [n, setN] = useState(0);
  useEffect(() => {
    let off = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => !off && setState({ data, loading: false, error: null }))
      .catch((e) => !off && setState({ data: null, loading: false, error: apiErrorMessage(e) }));
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n]);
  return { ...state, reload: () => setN((x) => x + 1) };
}

// localStorage that never throws (private mode, blocked storage).
export const tokenStore = (key) => ({
  get: () => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (v) => { try { localStorage.setItem(key, v); } catch { /* ignore */ } },
  clear: () => { try { localStorage.removeItem(key); } catch { /* ignore */ } },
});