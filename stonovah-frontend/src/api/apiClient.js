// src/lib/api.js — shared axios client (token in memory, cookie sent automatically)
import axios from 'axios';

let accessToken = null;
let onAuthFailure = () => {};
export const setAccessToken = (t) => { accessToken = t; };
export const setAuthFailureHandler = (fn) => { onAuthFailure = fn; };

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true, // sends/receives the refreshToken cookie
});

api.interceptors.request.use((cfg) => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

let refreshing = null; // single-flight refresh
api.interceptors.response.use(undefined, async (error) => {
  const original = error.config;
  const url = original?.url || '';
  const skip = url.includes('/auth/refresh-token') || url.includes('/auth/login');
  if (error.response?.status === 401 && !original._retry && !skip) {
    original._retry = true;
    refreshing ??= api.post('/api/auth/refresh-token')
      .then((r) => r.data.accessToken) // NOT wrapped in { data }
      .finally(() => { refreshing = null; });
    try {
      const token = await refreshing;
      setAccessToken(token);
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      setAccessToken(null);
      onAuthFailure();
    }
  }
  return Promise.reject(error);
});

// ---------- error helpers ----------
export const apiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (!err?.response) return 'Cannot reach the server. Check your connection.';
  return err.response.data?.message || fallback;
};

// Zod errors -> { field: 'first message' }
export const apiFieldErrors = (err) => {
  const e = err?.response?.data?.errors;
  if (!e) return {};
  return Object.fromEntries(Object.entries(e).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]));
};