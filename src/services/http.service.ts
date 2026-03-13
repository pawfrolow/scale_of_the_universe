import axios from 'axios';

export const http = axios.create({
  baseURL: window.location.href,
  timeout: 15000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);