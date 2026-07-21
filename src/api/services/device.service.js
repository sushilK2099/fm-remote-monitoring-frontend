import { rmApi } from '../axios';

export const deviceService = {
  getAll: (params) => rmApi.get('/devices', { params }),
  getById: (id) => rmApi.get(`/devices/${id}`),
  create: (data) => rmApi.post('/devices', data),
  update: (id, data) => rmApi.put(`/devices/${id}`, data),
  delete: (id) => rmApi.delete(`/devices/${id}`),
  regenerateKey: (id) => rmApi.post(`/devices/${id}/regenerate-key`),
};
