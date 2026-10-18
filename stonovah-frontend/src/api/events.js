// src/api/events.js
import { api } from './apiClient';

const data = (r) => r.data.data;

export const eventsApi = {
  list: (status) => api.get('/api/events/mine', { params: status ? { status } : undefined }).then(data),
  get: (id) => api.get(`/api/events/${id}`).then(data),
  create: (body) => api.post('/api/events', body).then(data),
  update: (id, body) => api.patch(`/api/events/${id}`, body).then(data),
  remove: (id) => api.delete(`/api/events/${id}`).then((r) => r.data),
  submit: (id) => api.post(`/api/events/${id}/submit`).then(data),
  withdraw: (id) => api.post(`/api/events/${id}/withdraw`).then(data),
  setFee: (id, feeHandling) => api.patch(`/api/events/${id}/fee-structure`, { feeHandling }).then(data),
  selectTemplate: (id, templateId) => api.post(`/api/events/${id}/ticket-template`, { templateId }).then(data),
  stats: (id) => api.get(`/api/events/${id}/stats`).then(data),
};

// Prices: send NAIRA, receive KOBO (the backend converts on the way in)
export const tiersApi = {
  list: (eventId) => api.get(`/api/events/${eventId}/tiers/manage`).then(data),
  create: (eventId, body) => api.post(`/api/events/${eventId}/tiers`, body).then(data),
  update: (eventId, tierId, body) => api.patch(`/api/events/${eventId}/tiers/${tierId}`, body).then(data),
  remove: (eventId, tierId) => api.delete(`/api/events/${eventId}/tiers/${tierId}`).then((r) => r.data),
};

export const templatesApi = {
  list: () => api.get('/api/ticket-templates').then(data),
};

export const uploadsApi = {
  // returns the Cloudinary URL
  image: async (file) => {
    const fd = new FormData();
    fd.append('file', file); // field name must be exactly "file"
    return (await api.post('/api/uploads', fd)).data.data.url;
  },
};

export const platformApi = {
  feeRate: () => api.get('/api/platform/fee').then(data).then((d) => d.feeRate),
};