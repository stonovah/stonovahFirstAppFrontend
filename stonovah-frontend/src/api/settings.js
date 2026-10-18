// src/api/settings.js
import { api } from './apiClient';

const data = (r) => r.data.data;

export const settingsApi = {
  get: () => api.get('/api/organizer/settings').then(data),
  update: (body) => api.patch('/api/organizer/settings', body).then(data),
};

export const templateLibraryApi = {
  list: () => api.get('/api/organizer/templates').then(data),
  update: (id, body) => api.patch(`/api/organizer/templates/${id}`, body).then(data),
};

export const notificationsApi = {
  list: (limit = 20) => api.get('/api/notifications', { params: { limit } }).then(data),
  unread: () => api.get('/api/notifications/unread-count').then(data).then((d) => d.count),
  markRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllRead: () => api.patch('/api/notifications/read-all'),
};