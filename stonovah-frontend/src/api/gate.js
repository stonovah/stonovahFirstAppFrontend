// src/api/gate.js — check-in and attendees
import { api } from './apiClient';

const data = (r) => r.data.data;

export const checkinApi = {
  scan: (eventId, qrToken) => api.post(`/api/events/${eventId}/checkin/scan`, { qrToken }).then(data),
  manual: (eventId, ticketId) => api.post(`/api/events/${eventId}/checkin/manual`, { ticketId }).then(data),
  log: (eventId, limit = 50) => api.get(`/api/events/${eventId}/checkin/log`, { params: { limit } }).then(data),
  stats: (eventId) => api.get(`/api/events/${eventId}/checkin/stats`).then(data),
};

export const attendeesApi = {
  // resolves to { data: [...], meta: { total, page, limit, pages } }
  list: (eventId, params) => api.get(`/api/events/${eventId}/attendees`, { params }).then((r) => r.data),

  // The route needs the Bearer token, so download it as a blob (a plain link can't send it)
  exportCsv: async (eventId, filename = 'attendees.csv') => {
    const r = await api.get(`/api/events/${eventId}/attendees/export`, { responseType: 'blob' });
    const url = URL.createObjectURL(r.data);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
};