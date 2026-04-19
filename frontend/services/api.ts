import axios from 'axios'

const API_URL = 'https://interviewsaarthi.onrender.com/api'
const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    window.location.href = '/auth/login'
  }
  return Promise.reject(err)
})

export const authAPI = {
  signup: (data: any) => api.post('/auth/signup', data),
  login:  (data: any) => api.post('/auth/login', data),
  getMe:  ()          => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
}
export const interviewAPI = {
  create:   (data: any)             => api.post('/interviews', data),
  getAll:   ()                      => api.get('/interviews'),
  getOne:   (id: string)            => api.get(`/interviews/${id}`),
  addQA:    (id: string, data: any) => api.put(`/interviews/${id}/qa`, data),
  complete: (id: string, data: any) => api.put(`/interviews/${id}/complete`, data),
  delete:   (id: string)            => api.delete(`/interviews/${id}`),
}
export const aiAPI = {
  generateQuestion: (data: any) => api.post('/ai/question', data),
  evaluateAnswer:   (data: any) => api.post('/ai/evaluate', data),
  generateFollowUp: (data: any) => api.post('/ai/followup', data),
  generateReport:   (data: any) => api.post('/ai/report', data),
  analyzeResume:    (data: any) => api.post('/ai/resume-analyze', data),
}
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}
export default api
