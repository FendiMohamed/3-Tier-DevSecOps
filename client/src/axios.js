import axios from 'axios';

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

