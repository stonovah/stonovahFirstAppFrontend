// Public Production API. Everything here is unauthenticated: tokens in the URL are the credential.
import { api } from '../lib/api';

const B = '/api/production';
const data = (p) => p.then((r) => r.data.data);
const whole = (p) => p.then((r) => r.data); // list endpoints: { data, meta, ... }

// catalog and content
export const getContent = () => data(api.get(`${B}/content`));
export const getFaqs = () => data(api.get(`${B}/faqs`));
export const getProjectTypes = () => data(api.get(`${B}/project-types`));
export const getProjectType = (slug) => data(api.get(`${B}/project-types/${slug}`));
export const getServices = (params) => data(api.get(`${B}/services`, { params }));
export const getService = (slug) => data(api.get(`${B}/services/${slug}`));
export const getPastProductions = (params) => whole(api.get(`${B}/past-productions`, { params }));
export const getPastProduction = (slug) => data(api.get(`${B}/past-productions/${slug}`));
export const getBriefOptions = () => data(api.get(`${B}/config/brief-options`));

// package builder ("My Package")
export const createPackage = (body = {}) => data(api.post(`${B}/packages`, body));
export const getPackage = (token) => data(api.get(`${B}/packages/${token}`));
export const patchPackage = (token, body) => data(api.patch(`${B}/packages/${token}`, body));
export const addPackageItem = (token, body) => data(api.post(`${B}/packages/${token}/items`, body));
export const removePackageItem = (token, serviceId) => data(api.delete(`${B}/packages/${token}/items/${serviceId}`));
export const clearPackage = (token) => data(api.delete(`${B}/packages/${token}/items`));

// production brief (request form)
export const createBrief = (body = {}) => data(api.post(`${B}/briefs`, body));
export const getBrief = (token) => data(api.get(`${B}/briefs/${token}`));
export const patchBrief = (token, body) => data(api.patch(`${B}/briefs/${token}`, body));
export const uploadBriefFile = async (token, file, kind = 'SCRIPT', onProgress) => {
  const fd = new FormData();
  fd.append('kind', kind);
  fd.append('file', file); // text fields before the file

  // XHR instead of fetch so the progress bar keeps working. Like fetch, it sends FormData as multipart.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${api.defaults.baseURL}${B}/briefs/${token}/files`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded * 100) / e.total));
    xhr.onload = () => {
      let body = null;
      try { body = JSON.parse(xhr.responseText); } catch { /* not JSON */ }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(body?.data);
      // same shape Axios errors have, so apiErrorMessage(e) keeps working
      reject({ response: { status: xhr.status, data: body } });
    };
    xhr.onerror = () => reject({ message: 'Network error' });
    xhr.send(fd); // never set Content-Type yourself; the browser adds the boundary
  });
};
export const deleteBriefFile = (token, fileId) => api.delete(`${B}/briefs/${token}/files/${fileId}`);
export const submitBrief = (token, body) => data(api.post(`${B}/briefs/${token}/submit`, body));
export const getConfirmation = (reference, token) => data(api.get(`${B}/briefs/confirmation/${reference}`, { params: { token } }));

// tokenised client views
export const getProposal = (token) => data(api.get(`${B}/proposals/${token}`));
export const proposalPdfUrl = (token) => `${api.defaults.baseURL}${B}/proposals/${token}/pdf`;
export const acceptProposal = (token, name) => data(api.post(`${B}/proposals/${token}/accept`, { name }));
export const declineProposal = (token, reason) => data(api.post(`${B}/proposals/${token}/decline`, { reason }));

export const getShortlist = (token) => data(api.get(`${B}/shortlists/${token}`));
export const selectCandidate = (token, roleId, candidateId, picked = true) =>
  data(api.post(`${B}/shortlists/${token}/roles/${roleId}/select`, { candidateId, picked }));

export const getPitch = (token) => data(api.get(`${B}/pitch/${token}`));
export const getPitchFileUrl = (token, fileId) => data(api.get(`${B}/pitch/${token}/files/${fileId}/url`));
export const sendPitchFeedback = (token, body) => data(api.post(`${B}/pitch/${token}/feedback`, body));

export const getUpdate = (token) => data(api.get(`${B}/updates/${token}`));