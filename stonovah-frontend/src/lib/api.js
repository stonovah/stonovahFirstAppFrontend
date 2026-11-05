// src/lib/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

// Turns any axios/network error into a user-friendly string
export function apiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.data) {
    const d = err.response.data;
    if (typeof d === 'string') return d;
    if (d.message) return d.message;
    if (d.error) return typeof d.error === 'string' ? d.error : d.error.message || fallback;
    if (Array.isArray(d.errors) && d.errors.length) {
      return d.errors.map((e) => e.message || e).join(', ');
    }
  }
  if (err?.code === 'ERR_NETWORK') return 'Network error. Check your connection.';
  if (err?.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  return err?.message || fallback;
}