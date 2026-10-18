// src/api/organizer.js — one function per endpoint, unwraps { data }
import { api } from './apiClient';

export const authApi = {
  login: (email, password) => api.post('/api/auth/login', { email, password }).then((r) => r.data), // { accessToken, user }
  logout: () => api.post('/api/auth/logout').then((r) => r.data),
  refresh: () => api.post('/api/auth/refresh-token').then((r) => r.data), // { accessToken }
  me: () => api.get('/api/auth/me').then((r) => r.data.data),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, newPassword) => api.post('/api/auth/reset-password', { token, newPassword }).then((r) => r.data),
  changePassword: (currentPassword, newPassword) => api.post('/api/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
  sessions: () => api.get('/api/auth/sessions').then((r) => r.data.data),
  revokeSession: (id) => api.delete(`/api/auth/sessions/${id}`).then((r) => r.data),
  revokeOtherSessions: () => api.post('/api/auth/sessions/revoke-others').then((r) => r.data),
};

export const organizerApi = {
  register: (body) => api.post('/api/organizers/register', body).then((r) => r.data.data),
  getProfile: () => api.get('/api/organizers/me').then((r) => r.data.data),
  saveDraft: (body) => api.patch('/api/organizers/me/draft', body).then((r) => r.data.data),
  submitBusinessKyc: (body) => api.post('/api/organizers/me/kyc/business', body).then((r) => r.data.data),
  submitIndividualKyc: (body) => api.post('/api/organizers/me/kyc/individual', body).then((r) => r.data.data),
  uploadKycDocuments: (formData) => api.post('/api/organizers/me/kyc/documents', formData).then((r) => r.data.data),
  getKycStatus: () => api.get('/api/organizers/me/kyc/status').then((r) => r.data.data),
};