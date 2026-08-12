import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000,
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mint_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ============================================================
// AUTH API
// ============================================================
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login/', { email, password }),
  register: (data) => api.post('/api/auth/register/', data),
  logout: () => api.post('/api/auth/logout/'),
  refresh: () => api.post('/api/auth/refresh/'),
  me: () => api.get('/api/auth/me/'),
}

// ============================================================
// USER API
// ============================================================
export const userAPI = {
  getMe: () => api.get('/api/users/me/'),
  updateProfile: (data) => api.put('/api/users/profile/', data),
  getAll: () => api.get('/api/users/'),
  getById: (id) => api.get(`/api/users/${id}/`),
  update: (id, data) => api.put(`/api/users/${id}/`, data),
  delete: (id) => api.delete(`/api/users/${id}/`),
  updateRole: (id, role) => api.put(`/api/users/${id}/role/`, { role }),
  updateStatus: (id, status) => api.put(`/api/users/${id}/status/`, { status }),
  getPermissions: (id) => api.get(`/api/users/${id}/permissions/`),
  getRoles: () => api.get('/api/users/roles/'),
}


// ============================================================
// ML API - Public AI (no auth required)
// ============================================================
export const mlAPI = {
  evaluate: (data) => {
    console.log('📤 Evaluating:', data.title)
    return api.post('/api/public/evaluate', data)
  },
  chat: (message, context) => {
    console.log('💬 Chat message:', message)
    return api.post('/api/public/chat', { message, context: context || {} })
  },
}

// ============================================================
// IDEA API
// ============================================================
export const ideaAPI = {
  submit: (data) => api.post('/api/ideas/', data),
  getAll: () => api.get('/api/ideas'),
  getById: (id) => api.get(`/api/ideas/${id}`),
  update: (id, data) => api.put(`/api/ideas/${id}`, data),
  evaluate: (id) => api.post(`/api/ideas/${id}/evaluate`),
  delete: (id) => api.delete(`/api/ideas/${id}`),
}

// ============================================================
// EVALUATION API
// ============================================================
export const evaluationAPI = {
  getByIdeaId: (ideaId) => api.get(`/api/evaluations/idea/${ideaId}/`),
  create: (data) => api.post('/api/evaluations/', data),
  getAll: () => api.get('/api/evaluations'),
  getById: (id) => api.get(`/api/evaluations/${id}/`),
}

// ============================================================
// DOCUMENT API
// ============================================================
export const documentAPI = {
  getAll: () => api.get('/api/documents'),
  upload: (file, metadata) => {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) formData.append('metadata', JSON.stringify(metadata))
    return api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getById: (id) => api.get('/api/documents/' + id),
  delete: (id) => api.delete('/api/documents/' + id),
}

// ============================================================
// WORKSPACE API
// ============================================================
export const workspaceAPI = {
  getAll: () => api.get('/api/workspace/'),
  getById: (id) => api.get('/api/workspace/' + id),
  getComments: (projectId) => api.get('/api/workspace/' + projectId + '/comments'),
  addComment: (projectId, text, authorName) => api.post('/api/workspace/' + projectId + '/comments', { text, author_name: authorName }),
}

// ============================================================
// STARTUP API
// ============================================================
export const startupAPI = {
  getAll: () => api.get('/api/startups'),
  getById: (id) => api.get('/api/startups/' + id),
  create: (data) => api.post('/api/startups', data),
  update: (id, data) => api.put('/api/startups/' + id, data),
  deleteById: (id) => api.delete('/api/startups/' + id),
  getMyStartups: () => api.get('/api/startups/my'),
  updateStatus: (id, status) => api.put('/api/startups/' + id + '/status', {status: status}),
}

// ============================================================
// FUNDING API
// ============================================================
export const fundingAPI = {
  submit: (data) => api.post('/api/funding/request', data),
  mine: () => api.get('/api/funding/requests/mine'),
  approve: (requestId, approvedAmount) => api.post(`/api/funding/requests/${requestId}/approve`, { approved_amount: approvedAmount }),
  reject: (requestId, reason) => api.post(`/api/funding/requests/${requestId}/reject`, { reason }),
}

// ============================================================
// GRANT API
// ============================================================
export const grantAPI = {
  getAll: () => api.get('/api/grants/'),
  getById: (id) => api.get(`/api/grants/${id}/`),
  create: (data) => api.post('/api/grants/', data),
  update: (id, data) => api.put(`/api/grants/${id}/`, data),
  delete: (id) => api.delete(`/api/grants/${id}/`),
  apply: (grantId, startupId, amountRequested) => api.post('/api/grants/apply', { grant_id: grantId, startup_id: startupId, amount_requested: amountRequested }),
  updateApplicationStatus: (applicationId, status) => api.put(`/api/grants/applications/${applicationId}/status`, { status }),
  match: (startupData) => api.post('/api/grants/match', { startup_data: startupData }),
  getApplications: () => api.get('/api/grants/applications'),
  updateApplicationStatus: (id, status) => api.put(`/api/grants/applications/${id}/status/`, { status }),
}

// ============================================================
// INVESTOR API
// ============================================================
export const investorAPI = {
  getAll: () => api.get('/api/investors'),
  getById: (id) => api.get(`/api/investors/${id}/`),
  create: (data) => api.post('/api/investors/', data),
  update: (id, data) => api.put(`/api/investors/${id}/`, data),
  delete: (id) => api.delete(`/api/investors/${id}/`),
  match: (startupData) => api.post('/api/investors/match', { startup_data: startupData }),
}

// ============================================================
// MENTOR API
// ============================================================
export const mentorAPI = {
  getAll: () => api.get('/api/mentors/'),
  getById: (id) => api.get(`/api/mentors/${id}/`),
  create: (data) => api.post('/api/mentors/', data),
  update: (id, data) => api.put(`/api/mentors/${id}/`, data),
  delete: (id) => api.delete(`/api/mentors/${id}/`),
  match: (startupData) => api.post('/api/mentors/match', { startup_data: startupData }),
}

// ============================================================
// MESSAGE API
// ============================================================
export const messageAPI = {
  getThread: (mentorId) => api.get(`/api/messages/${mentorId}`),
  send: (mentorId, text) => api.post(`/api/messages/${mentorId}`, { text }),
}

// ============================================================
// SESSION API
// ============================================================
export const sessionAPI = {
  getAll: () => api.get('/api/sessions/'),
  getById: (id) => api.get(`/api/sessions/${id}/`),
  create: (data) => api.post('/api/sessions/', data),
  update: (id, data) => api.put(`/api/sessions/${id}/`, data),
  delete: (id) => api.delete(`/api/sessions/${id}/`),
  request: (mentorId) => api.post(`/api/sessions/${mentorId}/request`),
  mine: () => api.get('/api/sessions/mine'),
  all: () => api.get('/api/sessions/all'),
}

// ============================================================
// TASK API
// ============================================================
export const taskAPI = {
  getAll: (startupId) => api.get('/api/tasks/' + (startupId ? '?startup_id=' + startupId : '')),
  getById: (id) => api.get('/api/tasks/' + id),
  create: (data) => api.post('/api/tasks/', data),
  update: (id, data) => api.put('/api/tasks/' + id, data),
  delete: (id) => api.delete('/api/tasks/' + id),
  getBurndown: () => api.get('/api/tasks/burndown'),
}

// ============================================================
// EVENT API
// ============================================================
export const eventAPI = {
  getAll: () => api.get('/api/events/'),
  getById: (id) => api.get(`/api/events/${id}/`),
  create: (data) => api.post('/api/events/', data),
  update: (id, data) => api.put(`/api/events/${id}/`, data),
  delete: (id) => api.delete(`/api/events/${id}/`),
  register: (id) => api.post(`/api/events/${id}/register`),
  unregister: (id) => api.delete(`/api/events/${id}/register`),
}

// ============================================================
// PAPER API
// ============================================================
export const paperAPI = {
  getAll: () => api.get('/api/papers/'),
  getById: (id) => api.get(`/api/papers/${id}/`),
  create: (data) => api.post('/api/papers/', data),
  update: (id, data) => api.put(`/api/papers/${id}/`, data),
  delete: (id) => api.delete(`/api/papers/${id}/`),
  match: (startupData) => api.post('/api/papers/match', { startup_data: startupData }),
}

// ============================================================
// ANALYTICS API
// ============================================================
export const analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard/'),
  getReports: () => api.get('/api/analytics/reports/'),
  getMetrics: () => api.get('/api/analytics/metrics/'),
  getAnalytics: () => api.get('/api/analytics/'),
}

// ============================================================
// DASHBOARD API
// ============================================================
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getTrends: () => api.get('/api/dashboard/trends'),
  getAnalytics: () => api.get('/api/dashboard/analytics'),
}

// ============================================================
// AUDIT API
// ============================================================
export const auditAPI = {
  getLogs: () => api.get('/api/audit/logs/'),
  getUserLogs: (userId) => api.get(`/api/audit/logs/user/${userId}/`),
  getActionLogs: (action) => api.get(`/api/audit/logs/action/${action}/`),
  getSummary: () => api.get('/api/audit/summary/'),
  getSecurityAlerts: () => api.get('/api/audit/security-alerts/'),
}

// ============================================================
// VERSION CONTROL API
// ============================================================
export const versionControlAPI = {
  getAll: () => api.get('/api/version-control/'),
  getById: (id) => api.get(`/api/version-control/${id}/`),
  create: (data) => api.post('/api/version-control/', data),
  update: (id, data) => api.put(`/api/version-control/${id}/`, data),
  delete: (id) => api.delete(`/api/version-control/${id}/`),
}

// ============================================================
// DEFAULT EXPORT
// ============================================================
export default api

export const systemAPI = {
  listRoutes: () => api.get('/api/system/routes'),
}
