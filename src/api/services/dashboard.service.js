import { rmApi } from '../axios';

// Dashboard builder API:
//   runQuery  — execute a declarative QuerySpec against the report executor (scoped server-side).
//   *Dashboard — CRUD for saved dashboard layouts (account-scoped server-side).
export const dashboardService = {
  runQuery: (spec) => rmApi.post('/reports/query', spec),

  getDashboards:   ()             => rmApi.get('/dashboards'),
  getDashboard:    (id)           => rmApi.get(`/dashboards/${id}`),
  createDashboard: (data)         => rmApi.post('/dashboards', data),
  updateDashboard: (id, data)     => rmApi.put(`/dashboards/${id}`, data),
  deleteDashboard: (id)           => rmApi.delete(`/dashboards/${id}`),
};
