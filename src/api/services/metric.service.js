import { rmApi } from '../axios';

export const metricService = {
  getAll: (params) => rmApi.get('/metrics', { params }),
  getById: (id) => rmApi.get(`/metrics/${id}`),
  create: (data) => rmApi.post('/metrics', data),
  update: (id, data) => rmApi.put(`/metrics/${id}`, data),
  delete: (id) => rmApi.delete(`/metrics/${id}`),
};
