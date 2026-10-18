// src/api/public.js
import { api } from './apiClient';

const data = (r) => r.data.data;

export const publicApi = {
  events: () => api.get('/api/events/public').then(data),                                  // array of live events, tiers included
  event: (slug) => api.get(`/api/events/public/${encodeURIComponent(slug)}`).then(data),
  createOrder: (body) => api.post('/api/orders', body).then(data),
  startPayment: (orderId) => api.post(`/api/orders/${orderId}/checkout`).then(data),   // { authorizationUrl, reference } | { free: true, orderId }
  verifyOrder: (orderId) => api.post(`/api/orders/${orderId}/verify`).then(data),
  order: (orderId) => api.get(`/api/orders/${orderId}`).then(data),
  joinWaitlist: (eventId, tierId, body) => api.post(`/api/events/${eventId}/tiers/${tierId}/waitlist`, body).then((r) => r.data),
  createServiceRequest: (body) => api.post('/api/service-requests', body).then(data),   // { id }
  attachToRequest: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/api/service-requests/${id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }).then(data);
  },
  pastEvents: (params) => api.get('/api/past-events', { params }).then(data),
  pastEvent: (id) => api.get(`/api/past-events/${id}`).then(data),
};