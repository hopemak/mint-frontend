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

// ============================================================
// ML API - AI Evaluation and Chat
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
// DOCUMENT API - For document management
// ============================================================
export const documentAPI = {
  // Upload a document
  upload: (file, metadata) => {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }
    return api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // Get all documents
  getAll: () => {
    return api.get('/api/documents')
  },
  
  // Get document by ID
  getById: (id) => {
    return api.get(`/api/documents/${id}`)
  },
  
  // Delete document
  delete: (id) => {
    return api.delete(`/api/documents/${id}`)
  },
  
  // Update document
  update: (id, data) => {
    return api.put(`/api/documents/${id}`, data)
  },
  
  // Download document
  download: (id) => {
    return api.get(`/api/documents/${id}/download`, {
      responseType: 'blob',
    })
  },
}

// ============================================================
// WORKSPACE API - For workspace management
// ============================================================
export const workspaceAPI = {
  // Get all workspaces
  getAll: () => {
    return api.get('/api/workspace')
  },
  
  // Get workspace by ID
  getById: (id) => {
    return api.get(`/api/workspace/${id}`)
  },
  
  // Create workspace
  create: (data) => {
    return api.post('/api/workspace', data)
  },
  
  // Update workspace
  update: (id, data) => {
    return api.put(`/api/workspace/${id}`, data)
  },
  
  // Delete workspace
  delete: (id) => {
    return api.delete(`/api/workspace/${id}`)
  },
  
  // Get workspace members
  getMembers: (id) => {
    return api.get(`/api/workspace/${id}/members`)
  },
  
  // Add member to workspace
  addMember: (id, userId) => {
    return api.post(`/api/workspace/${id}/members`, { userId })
  },
  
  // Remove member from workspace
  removeMember: (id, userId) => {
    return api.delete(`/api/workspace/${id}/members/${userId}`)
  },
  
  // Get workspace projects
  getProjects: (id) => {
    return api.get(`/api/workspace/${id}/projects`)
  },
}

// ============================================================
// USER API - User management
// ============================================================
export const userAPI = {
  // Get current user
  getMe: () => {
    return api.get('/api/users/me')
  },
  
  // Update user profile
  updateProfile: (data) => {
    return api.put('/api/users/profile', data)
  },
  
  // Get all users (admin)
  getAll: () => {
    return api.get('/api/users')
  },
}

// ============================================================
// AUTH API - Authentication
// ============================================================
export const authAPI = {
  // Login
  login: (email, password) => {
    return api.post('/api/auth/login', { email, password })
  },
  
  // Register
  register: (data) => {
    return api.post('/api/auth/register', data)
  },
  
  // Logout
  logout: () => {
    return api.post('/api/auth/logout')
  },
  
  // Refresh token
  refresh: () => {
    return api.post('/api/auth/refresh')
  },
}

// ============================================================
// IDEA API - Idea management
// ============================================================
export const ideaAPI = {
  // Submit idea
  submit: (data) => {
    return api.post('/api/ideas', data)
  },
  
  // Get all ideas
  getAll: () => {
    return api.get('/api/ideas')
  },
  
  // Get idea by ID
  getById: (id) => {
    return api.get(`/api/ideas/${id}`)
  },
  
  // Update idea
  update: (id, data) => {
    return api.put(`/api/ideas/${id}`, data)
  },
  
  // Delete idea
  delete: (id) => {
    return api.delete(`/api/ideas/${id}`)
  },
}

// ============================================================
// EVALUATION API - Evaluation management
// ============================================================
export const evaluationAPI = {
  // Get evaluation for idea
  getByIdeaId: (ideaId) => {
    return api.get(`/api/evaluations/idea/${ideaId}`)
  },
  
  // Create evaluation
  create: (data) => {
    return api.post('/api/evaluations', data)
  },
}

// ============================================================
// DEFAULT EXPORT
// ============================================================
export default api
