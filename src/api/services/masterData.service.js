import { masterApi } from '../axios';

// Read-only masters data the monitoring module attaches to (assets/locations/users/roles).
export const masterDataService = {
  getAssets:    (params) => masterApi.get('/assets', { params }),
  getAsset:     (id)     => masterApi.get(`/assets/${id}`),
  getLocations: (params) => masterApi.get('/locations', { params }),
  getLocation:  (id)     => masterApi.get(`/locations/${id}`),
  getUsers:     (params) => masterApi.get('/users', { params }),
  getRoles:     (params) => masterApi.get('/roles', { params }),
};
