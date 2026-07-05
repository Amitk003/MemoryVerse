import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const documentsApi = {
  health: () => api.get('/documents/health'),

  upload: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  list: (params?: { category?: string; page?: number; limit?: number }) =>
    api.get('/documents', { params }),

  get: (id: number) => api.get(`/documents/${id}`),

  search: (query: string) => api.get('/search', { params: { q: query } }),

  timeline: () => api.get('/timeline'),

  relationships: (docId: number) =>
    api.get(`/documents/${docId}/relationships`),
}

export default api
