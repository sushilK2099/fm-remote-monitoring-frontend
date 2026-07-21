import { masterApi } from '../axios';

export const roleService = {
  getAll: (params) => masterApi.get('/roles', { params }),
};
