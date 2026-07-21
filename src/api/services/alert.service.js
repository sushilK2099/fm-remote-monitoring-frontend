import { rmApi } from '../axios';

export const alertRuleService = {
  getAll: (params) => rmApi.get('/alert-rules', { params }),
  create: (data) => rmApi.post('/alert-rules', data),
  update: (id, data) => rmApi.put(`/alert-rules/${id}`, data),
  delete: (id) => rmApi.delete(`/alert-rules/${id}`),
};

export const alertEventService = {
  getAll: (params) => rmApi.get('/alert-events', { params }),
  acknowledge: (id) => rmApi.post(`/alert-events/${id}/acknowledge`),
};
