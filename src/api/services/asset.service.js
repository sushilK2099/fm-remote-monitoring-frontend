import { masterApi } from '../axios';

export const assetService = {
  getAll: (params) => masterApi.get('/assets', { params }),
  getById: (id) => masterApi.get(`/assets/${id}`),
};
