import { rmApi } from '../axios';

export const readingService = {
  create: (data) => rmApi.post('/readings', data),
  query: (data) => rmApi.post('/readings/query', data),
  latest: (params) => rmApi.get('/readings/latest', { params }),
};
