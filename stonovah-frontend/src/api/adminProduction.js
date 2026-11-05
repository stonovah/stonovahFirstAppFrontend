// Production admin API. Base: /api/admin/production
import { api } from './apiClient';

const B = '/api/admin/production';
const d = (p) => p.then((r) => r.data.data); // { data }
const whole = (p) => p.then((r) => r.data); // lists: { data, meta, counts, ... }
const get = (url, params) => d(api.get(`${B}${url}`, { params }));
const list = (url, params) => whole(api.get(`${B}${url}`, { params }));
const post = (url, body) => d(api.post(`${B}${url}`, body ?? {}));
const patch = (url, body) => d(api.patch(`${B}${url}`, body));
const put = (url, body) => d(api.put(`${B}${url}`, body));
const del = (url) => api.delete(`${B}${url}`).then((r) => r.data?.data);

// multipart: the browser must add the boundary itself
const upload = (url, file, fields = {}, onProgress) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => v !== undefined && v !== null && fd.append(k, v)); // text fields before the file
  fd.append('file', file);
  return d(api.post(`${B}${url}`, fd, {
    headers: { 'Content-Type': false },
    onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
  }));
};

// PDFs need the access token, so they are fetched as a blob and saved.
export async function downloadPdf(url, fallbackName = 'document.pdf') {
  const r = await api.get(`${B}${url}`, { responseType: 'blob' });
  const name = /filename="?([^"]+)"?/.exec(r.headers['content-disposition'] ?? '')?.[1] ?? fallbackName;
  const href = URL.createObjectURL(r.data);
  const a = Object.assign(document.createElement('a'), { href, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(href);
}

// Private files: ask for a short-lived link, then open it.
export async function openSigned(urlPromise) {
  const { url } = await urlPromise;
  window.open(url, '_blank', 'noopener');
}

export const adminProductionApi = {
  // overview, search, audit, staff
  me: () => get('/me'),
  overview: (days) => get('/overview', { days }),
  trend: (interval) => get('/overview/trend', { interval }),
  stageProjects: (stage) => get(`/overview/pipeline/${stage}`),
  counts: () => get('/counts'),
  search: (q) => get('/search', { q }),
  audit: (params) => list('/audit', params),
  producers: () => get('/producers'),
  staff: () => get('/staff'),
  updateStaff: (userId, body) => patch(`/staff/${userId}`, body),

  // service requests
  requests: (params) => list('/requests', params),
  request: (id) => get(`/requests/${id}`),
  setRequestStatus: (id, body) => patch(`/requests/${id}/status`, body),
  assignRequest: (id, adminUserId) => patch(`/requests/${id}/assign`, { adminUserId }),
  bulkAssign: (ids, adminUserId) => post('/requests/bulk/assign', { ids, adminUserId }),
  addRequestNote: (id, body) => post(`/requests/${id}/notes`, { body }),
  scheduleCall: (id, body) => post(`/requests/${id}/discovery-call`, body),
  emailClient: (id, body) => post(`/requests/${id}/email`, body),
  resendReceipt: (id) => post(`/requests/${id}/resend-receipt`),
  requestFileUrl: (id, fileId) => get(`/requests/${id}/files/${fileId}/url`),

  // proposals
  proposals: (params) => list('/proposals', params),
  proposalStats: () => get('/proposals/stats'),
  proposal: (id) => get(`/proposals/${id}`),
  createProposal: (body) => post('/proposals', body),
  patchProposal: (id, body) => patch(`/proposals/${id}`, body),
  duplicateProposal: (id) => post(`/proposals/${id}/duplicate`),
  addProposalItem: (id, body) => post(`/proposals/${id}/items`, body),
  updateProposalItem: (id, itemId, body) => patch(`/proposals/${id}/items/${itemId}`, body),
  removeProposalItem: (id, itemId) => api.delete(`${B}/proposals/${id}/items/${itemId}`).then((r) => r.data.data),
  proposalPdf: (id) => downloadPdf(`/proposals/${id}/pdf`, 'proposal.pdf'),
  sendProposal: (id) => post(`/proposals/${id}/send`),
  revokeProposalLink: (id) => post(`/proposals/${id}/token/revoke`),
  setProposalStatus: (id, body) => patch(`/proposals/${id}/status`, body),
  convertProposal: (id) => post(`/proposals/${id}/convert`),

  // projects
  projects: (params) => list('/projects', params),
  projectStats: () => get('/projects/stats'),
  project: (id) => get(`/projects/${id}`),
  createProject: (body) => post('/projects', body),
  patchProject: (id, body) => patch(`/projects/${id}`, body),
  setProjectStage: (id, stage) => patch(`/projects/${id}/stage`, { stage }),
  setProjectStatus: (id, body) => patch(`/projects/${id}/status`, body),
  setContract: (id, contract) => patch(`/projects/${id}/contract`, { contract }),
  sowItems: (id) => get(`/projects/${id}/sow-items`),
  addSow: (id, body) => post(`/projects/${id}/sow-items`, body),
  updateSow: (id, itemId, body) => patch(`/projects/${id}/sow-items/${itemId}`, body),
  updateSowMoney: (id, itemId, body) => patch(`/projects/${id}/sow-items/${itemId}/finance`, body),
  removeSow: (id, itemId) => api.delete(`${B}/projects/${id}/sow-items/${itemId}`).then((r) => r.data.data),
  milestones: (id) => get(`/projects/${id}/milestones`),
  addMilestone: (id, body) => post(`/projects/${id}/milestones`, body),
  updateMilestone: (id, mid, body) => patch(`/projects/${id}/milestones/${mid}`, body),
  removeMilestone: (id, mid) => api.delete(`${B}/projects/${id}/milestones/${mid}`).then((r) => r.data.data),
  budget: (id) => get(`/projects/${id}/budget`),
  addTranche: (id, body) => post(`/projects/${id}/tranches`, body),
  updateTranche: (id, tid, body) => patch(`/projects/${id}/tranches/${tid}`, body),
  payTranche: (id, tid, body) => post(`/projects/${id}/tranches/${tid}/pay`, body),
  cancelTranche: (id, tid, reason) => post(`/projects/${id}/tranches/${tid}/cancel`, { reason }),
  projectFiles: (id) => get(`/projects/${id}/files`),
  uploadProjectFile: (id, file, kind, onProgress) => upload(`/projects/${id}/files`, file, { kind }, onProgress),
  projectFileUrl: (id, fileId) => get(`/projects/${id}/files/${fileId}/url`),
  removeProjectFile: (id, fileId) => del(`/projects/${id}/files/${fileId}`),
  projectUpdates: (id) => get(`/projects/${id}/updates`),
  dispatchUpdate: (id, body) => post(`/projects/${id}/updates`, body),
  requestSourcing: (id) => post(`/projects/${id}/sourcing`),
  archiveProject: (id) => post(`/projects/${id}/archive`),

  // sourcing
  sourcing: (params) => list('/sourcing', params),
  sourcingStats: () => get('/sourcing/stats'),
  dossier: (id) => get(`/sourcing/${id}`),
  createDossier: (body) => post('/sourcing', body),
  patchDossier: (id, body) => patch(`/sourcing/${id}`, body),
  setDossierStatus: (id, status) => patch(`/sourcing/${id}/status`, { status }),
  sendShortlist: (id) => post(`/sourcing/${id}/send-shortlist`),
  addRole: (id, body) => post(`/sourcing/${id}/roles`, body),
  updateRole: (id, roleId, body) => patch(`/sourcing/${id}/roles/${roleId}`, body),
  removeRole: (id, roleId) => api.delete(`${B}/sourcing/${id}/roles/${roleId}`).then((r) => r.data.data),
  addCandidate: (id, roleId, body) => post(`/sourcing/${id}/roles/${roleId}/candidates`, body),
  updateCandidate: (id, cid, body) => patch(`/sourcing/${id}/candidates/${cid}`, body),
  bookRole: (id, roleId, body) => post(`/sourcing/${id}/roles/${roleId}/book`, body),
  contractRole: (id, roleId) => post(`/sourcing/${id}/roles/${roleId}/contract`),
  dropout: (id, roleId, body) => post(`/sourcing/${id}/roles/${roleId}/dropout`, body),

  // services catalogue
  services: (params) => whole(api.get(`${B}/services`, { params })),
  service: (id) => get(`/services/${id}`),
  createService: (body) => post('/services', body),
  saveServiceDraft: (id, body) => patch(`/services/${id}`, body),
  publishService: (id) => post(`/services/${id}/publish`),
  setServiceVisibility: (id, body) => patch(`/services/${id}/visibility`, body),
  reorderServices: (ids) => put('/services/reorder', { ids }),
  archiveService: (id) => del(`/services/${id}`),
  restoreService: (id) => post(`/services/${id}/restore`),
  addServiceMedia: (id, file, kind = 'STILL', caption) => upload(`/services/${id}/media`, file, { kind, caption }),
  removeServiceMedia: (id, mediaId) => del(`/services/${id}/media/${mediaId}`),

  // past productions
  past: (params) => list('/past-productions', params),
  pastStats: () => get('/past-productions/stats'),
  pastOne: (id) => get(`/past-productions/${id}`),
  createPast: (body) => post('/past-productions', body),
  patchPast: (id, body) => patch(`/past-productions/${id}`, body),
  removePast: (id) => del(`/past-productions/${id}`),
  publishPast: (id) => post(`/past-productions/${id}/publish`),
  setPastVisibility: (id, visible) => patch(`/past-productions/${id}/visibility`, { visible }),
  setPastFeatured: (id, body) => patch(`/past-productions/${id}/feature`, body),
  reorderPast: (ids) => put('/past-productions/reorder', { ids }),
  addClearance: (id, file, fields) => upload(`/past-productions/${id}/clearance`, file, fields),
  revokeClearance: (id) => del(`/past-productions/${id}/clearance`),
  clearanceUrl: (id) => get(`/past-productions/${id}/clearance/url`),
  addPastMedia: (id, file, fields) => upload(`/past-productions/${id}/media`, file, fields),
  updatePastMedia: (id, mediaId, body) => patch(`/past-productions/${id}/media/${mediaId}`, body),
  reorderPastMedia: (id, ids) => put(`/past-productions/${id}/media/reorder`, { ids }),
  removePastMedia: (id, mediaId) => api.delete(`${B}/past-productions/${id}/media/${mediaId}`).then((r) => r.data.data),

  // funding and pitch
  funding: (params) => list('/funding', params),
  fundingStats: () => get('/funding/stats'),
  fundingCalendar: (params) => get('/funding/calendar', params),
  pitch: (id) => get(`/funding/${id}`),
  createPitch: (body) => post('/funding', body),
  patchPitch: (id, body) => patch(`/funding/${id}`, body),
  updateDeliverable: (id, key, body) => patch(`/funding/${id}/deliverables/${key}`, body),
  addVersion: (id, key, file, fields, onProgress) => upload(`/funding/${id}/deliverables/${key}/versions`, file, fields, onProgress),
  addVisual: (id, file) => upload(`/funding/${id}/visuals`, file),
  removeVisual: (id, fileId) => del(`/funding/${id}/visuals/${fileId}`),
  pitchFileUrl: (id, fileId) => get(`/funding/${id}/files/${fileId}/url`),
  addPitchNote: (id, body) => post(`/funding/${id}/notes`, { body }),
  issuePitchLink: (id, sendEmail) => post(`/funding/${id}/link`, { sendEmail }),
  revokePitchLink: (id) => post(`/funding/${id}/link/revoke`),
  deliverPitch: (id) => post(`/funding/${id}/deliver`),
  reopenPitch: (id, body) => post(`/funding/${id}/reopen`, body),

  // landing content and FAQs
  content: () => get('/content'),
  contentVersions: () => get('/content/versions'),
  saveContentDraft: (body) => patch('/content', body),
  discardContentDraft: () => del('/content/draft'),
  publishContent: () => post('/content/publish'),
  faqs: () => get('/faqs'),
  createFaq: (body) => post('/faqs', body),
  updateFaq: (id, body) => patch(`/faqs/${id}`, body),
  removeFaq: (id) => del(`/faqs/${id}`),
  reorderFaqs: (ids) => put('/faqs/reorder', { ids }),

  // settings (mounted at /settings)
  settings: () => get('/settings'),
  saveSettings: (body) => patch('/settings', body),
  resetSettings: () => post('/settings/reset'),
  settingsHistory: (params) => list('/settings/history', params),
  testEmail: (to) => post('/settings/email-template/test', { to }),
};