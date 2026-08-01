import axios from 'axios';

export const http = axios.create({
  baseURL: typeof window === 'undefined' ? '/' : window.location.origin,
  timeout: 15000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);
