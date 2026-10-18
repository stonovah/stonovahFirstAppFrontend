// src/api/team.js
import { api } from './apiClient';

const data = (r) => r.data.data;

export const teamApi = {
  list: () => api.get('/api/team').then(data),
  invite: (body) => api.post('/api/team/invites', body).then(data),
  resend: (id) => api.post(`/api/team/${id}/resend`).then(data),
  setRole: (id, role) => api.patch(`/api/team/${id}`, { role }).then(data),
  remove: (id) => api.delete(`/api/team/${id}`).then((r) => r.data),
  inviteInfo: (token) => api.get(`/api/team/invite/${token}`).then(data),
  accept: (body) => api.post('/api/team/accept-invite', body).then((r) => r.data),
};