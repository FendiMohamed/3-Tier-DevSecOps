// src/axios.js
import axios from 'axios';

// Dynamic base URL: in local dev (CRA dev server) call backend directly, in prod use same-origin /api.
const baseURL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

const instance = axios.create({ baseURL });

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export default instance;

