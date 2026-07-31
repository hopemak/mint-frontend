import axios from 'axios';

// Point to your backend (ml-ai-service on port 5000)
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ML/AI APIs
export const mlAPI = {
  evaluate: (data) => api.post('/ml/evaluate', data),
  predict: (data) => api.post('/ml/predict', data),
  match: (data) => api.post('/ml/match', data),
  chat: (data) => api.post('/ml/chat', data),
  duplicate: (data) => api.post('/ml/duplicate', data),
  getMetrics: () => api.get('/ml/metrics'),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Startup APIs
export const startupsAPI = {
  getAll: () => api.get('/startups'),
  create: (data) => api.post('/startups', data),
  get: (id) => api.get(`/startups/${id}`),
};

export default api;
