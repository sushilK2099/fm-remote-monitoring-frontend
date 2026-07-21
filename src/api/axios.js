import axios from 'axios';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/rm';

export const rmApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RM_API_URL || '/api/remote-monitoring',
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || '/api/auth',
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const masterApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MASTER_API_URL || '/api/master',
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

rmApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = `${BASE_PATH}/login`;
    }
    return Promise.reject(err);
  }
);
