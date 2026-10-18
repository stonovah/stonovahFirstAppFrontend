// src/api/finance.js
import { api } from './apiClient';

const data = (r) => r.data.data;

export const financeApi = {
  overview: () => api.get('/api/organizer/finance/overview').then(data),
  settlementAccount: () => api.get('/api/organizer/finance/settlement-account').then(data),
  requestBankChange: (body) => api.post('/api/organizer/finance/settlement-account/change-request', body).then(data),
  requestAdvance: (eventId) => api.post(`/api/organizer/finance/events/${eventId}/advance-request`).then(data),
};