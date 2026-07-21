import { masterApi } from '../axios';

// Locations live in masters — read them directly from the masters API.
export const locationService = {
  getAll:      (params)    => masterApi.get('/locations', { params }),
  getById:     (id)        => masterApi.get(`/locations/${id}`),
  getRoots:    ()          => masterApi.get('/locations', { params: { parentId: 'null' } }),
  getChildren: (parentId)  => masterApi.get('/locations', { params: { parentId } }),
};
