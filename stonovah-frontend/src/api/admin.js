// src/api/admin.js
import { api } from './apiClient';

const body = (r) => r.data;
const data = (r) => r.data.data;
const clean = (p = {}) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== '' && v !== undefined && v !== null));
const download = async (url, params, filename) => {
  const r = await api.get(url, { params: clean(params), responseType: 'blob' });
  const href = URL.createObjectURL(r.data);
  const a = document.createElement('a'); a.href = href; a.download = filename; a.click(); URL.revokeObjectURL(href);
};

export const adminApi = {
  overview: () => api.get('/api/admin/overview').then(data),
  activity: () => api.get('/api/admin/overview/activity').then(data),

  events: {
    list: (p) => api.get('/api/admin/events', { params: clean(p) }).then(body),        // { data, meta, counts }
    pending: () => api.get('/api/admin/events/pending').then(data),                      // { slaHours, queue, scheduled }
    get: (id) => api.get(`/api/admin/events/${id}`).then(data),
    approve: (id, b) => api.post(`/api/admin/events/${id}/approve`, b).then(data),
    reject: (id, b) => api.post(`/api/admin/events/${id}/reject`, b).then(data),
    unpublish: (id, b) => api.post(`/api/admin/events/${id}/unpublish`, b).then(data),
    stats: (id) => api.get(`/api/admin/events/${id}/stats`).then(data),
    attendees: (id, p) => api.get(`/api/admin/events/${id}/attendees`, { params: clean(p) }).then(body),
    exportAttendees: (id) => download(`/api/admin/events/${id}/attendees/export`, {}, 'attendees.csv'),
  },

  organizers: {
    list: (p) => api.get('/api/admin/organizers', { params: clean(p) }).then(body),      // { data, meta, counts }
    get: (id) => api.get(`/api/admin/organizers/${id}`).then(data),
    verifyKyc: (id, b) => api.post(`/api/admin/organizers/${id}/kyc/verify`, b).then(data),
    setStatus: (id, b) => api.post(`/api/admin/organizers/${id}/status`, b).then(data),
    audit: (id) => api.get(`/api/admin/organizers/${id}/audit-log`).then(data),
    addNote: (id, note) => api.post(`/api/admin/organizers/${id}/audit-log`, { note }).then(data),
    bankRequests: (p) => api.get('/api/admin/organizers/bank-change-requests', { params: clean(p) }).then(body),
    approveBank: (id, note) => api.post(`/api/admin/organizers/bank-change-requests/${id}/approve`, { note }).then(body),
    rejectBank: (id, note) => api.post(`/api/admin/organizers/bank-change-requests/${id}/reject`, { note }).then(body),
  },

  orders: {
    list: (p) => api.get('/api/admin/orders', { params: clean(p) }).then(body),
    get: (id) => api.get(`/api/admin/orders/${id}`).then(data),
    exportCsv: (p) => download('/api/admin/orders/export', p, 'orders.csv'),
    refunds: (p) => api.get('/api/admin/orders/refund-requests', { params: clean(p) }).then(body),
    approveRefund: (id, note) => api.post(`/api/admin/orders/refund-requests/${id}/approve`, { note }).then(body),
    rejectRefund: (id, note) => api.post(`/api/admin/orders/refund-requests/${id}/reject`, { note }).then(body),
  },

  pastEvents: {
    list: (status) => api.get('/api/admin/past-events', { params: clean({ status }) }).then(data),
    create: (b) => api.post('/api/admin/past-events', b).then(data),
    update: (id, b) => api.patch(`/api/admin/past-events/${id}`, b).then(data),
    addMedia: (id, files) => { const fd = new FormData(); files.forEach((f) => fd.append('files', f)); return api.post(`/api/admin/past-events/${id}/media`, fd).then(data); },
    removeMedia: (id, url) => api.post(`/api/admin/past-events/${id}/media/remove`, { url }).then(data),
    reorderMedia: (id, urls) => api.put(`/api/admin/past-events/${id}/media/order`, { urls }).then(data),
    publish: (id, status) => api.patch(`/api/admin/past-events/${id}/publish`, { status }).then(data),
  },
  // src/api/admin.js: add inside adminApi (next to events / organizers / orders / pastEvents)
  payouts: {
    list: (p) => api.get('/api/admin/payouts', { params: clean(p) }).then(body),             // { data, meta, counts, totals }
    payable: () => api.get('/api/admin/payouts/payable').then(data),
    get: (id) => api.get(`/api/admin/payouts/payout/${id}`).then(data),
    createAdvance: (eventId) => api.post(`/api/admin/payouts/${eventId}/advance`).then(data),
    createSettlement: (eventId) => api.post(`/api/admin/payouts/${eventId}/settle`).then(data),
    markPaid: (id, paymentReference) => api.post(`/api/admin/payouts/payout/${id}/mark-paid`, { paymentReference }).then(data),
    cancel: (id, note) => api.post(`/api/admin/payouts/payout/${id}/cancel`, { note }).then(body),
    advanceRequests: (p) => api.get('/api/admin/payouts/advance-requests', { params: clean(p) }).then(body),
    approveAdvance: (id, note) => api.post(`/api/admin/payouts/advance-requests/${id}/approve`, { note }).then(data),
    rejectAdvance: (id, note) => api.post(`/api/admin/payouts/advance-requests/${id}/reject`, { note }).then(body),
  },
  settings: {
    get: () => api.get('/api/admin/settings').then(data),
    update: (b) => api.patch('/api/admin/settings', b).then(data),
    history: () => api.get('/api/admin/settings/history').then(data),
    health: () => api.get('/api/admin/settings/health').then(data),
    admins: () => api.get('/api/admin/settings/admins').then(data),
  },
  serviceRequests: {
    list: (p) => api.get('/api/admin/service-requests', { params: clean(p) }).then(body),     // { data, meta, counts }
    get: (id) => api.get(`/api/admin/service-requests/${id}`).then(data),
    setStatus: (id, status) => api.patch(`/api/admin/service-requests/${id}/status`, { status }).then(data),
    assign: (id, adminUserId) => api.post(`/api/admin/service-requests/${id}/assign`, { adminUserId }).then(data),
    addNote: (id, note) => api.post(`/api/admin/service-requests/${id}/notes`, { note }).then(data),
    createQuote: (id, b) => api.post(`/api/admin/service-requests/${id}/quotes`, b).then(data),   // amount in NAIRA
    pdf: (id, version) => download(`/api/admin/service-requests/${id}/pdf`, { version }, `stonovah-${version ? `quote-v${version}` : 'request'}.pdf`),
  },
  templates: {
    list: () => api.get('/api/admin/ticket-templates').then(data),
    generate: (prompt) => api.post('/api/admin/ticket-templates/generate', { prompt }, { timeout: 180000 }).then(data),
    create: (b) => api.post('/api/admin/ticket-templates', b).then(data),
    update: (id, b) => api.patch(`/api/admin/ticket-templates/${id}`, b).then(data),
    setActive: (id, isActive) => api.patch(`/api/admin/ticket-templates/${id}/active`, { isActive }).then(data),
    remove: (id) => api.delete(`/api/admin/ticket-templates/${id}`).then(body),
  },
};