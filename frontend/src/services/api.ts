import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),
}

export const documentsApi = {
  health: () => api.get('/documents/health'),

  upload: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  list: (params?: { category?: string; page?: number; limit?: number }) =>
    api.get('/documents', { params }),

  get: (id: number) => api.get(`/documents/${id}`),

  delete: (id: number) => api.delete(`/documents/${id}`),

  search: (query: string) => api.get('/search', { params: { q: query } }),

  timeline: () => api.get('/timeline'),

  relationships: (docId: number) =>
    api.get(`/documents/${docId}/relationships`),
}

export default api
