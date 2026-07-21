import { authApi } from '../axios';

export const authService = {
  login:  (data) => authApi.post('/login', data),
  me:     ()     => authApi.get('/me'),
  logout: ()     => authApi.post('/logout'),
};
