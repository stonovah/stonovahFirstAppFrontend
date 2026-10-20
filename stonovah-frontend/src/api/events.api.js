import apiClient from './apiClient';

export async function fetchPublicEvents(filters = {}) {
  const { data } = await apiClient.get('/events/public', { params: filters });
  return data.data;
}

export async function fetchPublicEventBySlug(slug) {
  const { data } = await apiClient.get(`/events/public/${slug}`);
  return data.data;
}

export async function fetchPastEvents(filters = {}) {
  const { data } = await apiClient.get('/events/past', { params: filters });
  return data.data;
}