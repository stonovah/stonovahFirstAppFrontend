// src/api/sales.js
import { api } from './apiClient';

const data = (r) => r.data.data;
// '' / undefined params are removed (the API treats a missing param as "no filter")
const clean = (p = {}) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== '' && v !== undefined && v !== null));

const download = async (url, params, filename) => {
  const r = await api.get(url, { params: clean(params), responseType: 'blob' }); // needs the Bearer token, so no plain link
  const href = URL.createObjectURL(r.data);
  const a = document.createElement('a');
  a.href = href; a.download = filename; a.click();
  URL.revokeObjectURL(href);
};

export const salesApi = {
  summary: (params) => api.get('/api/organizer/orders/summary', { params: clean(params) }).then(data),
  orders: (params) => api.get('/api/organizer/orders', { params: clean(params) }).then((r) => r.data), // { data, meta }
  order: (id) => api.get(`/api/organizer/orders/${id}`).then(data),
  resend: (id) => api.post(`/api/organizer/orders/${id}/resend`).then((r) => r.data),
  refund: (id, reason) => api.post(`/api/organizer/orders/${id}/refund-request`, { reason }).then(data),
  attendees: (params) => api.get('/api/organizer/attendees', { params: clean(params) }).then((r) => r.data),
  exportOrders: (params) => download('/api/organizer/orders/export', params, 'orders.csv'),
  exportAttendees: (params) => download('/api/organizer/attendees/export', params, 'attendees.csv'),
};