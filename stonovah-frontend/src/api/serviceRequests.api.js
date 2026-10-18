import apiClient from './apiClient';

export async function createServiceRequest(payload) {
  const { data } = await apiClient.post('/service-requests', payload);
  return data.data;
}