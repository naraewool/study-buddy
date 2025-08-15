import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: { email: string; password: string; name: string; role: string; parentId?: string }) =>
    api.post('/auth/register', userData),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

export const studyPlanAPI = {
  getStudyPlans: (params?: { status?: string; date?: string; studentId?: string }) =>
    api.get('/study-plans', { params }),
  
  getStudyPlan: (id: string) =>
    api.get(`/study-plans/${id}`),
  
  createStudyPlan: (data: any) =>
    api.post('/study-plans', data),
  
  updateStudyPlan: (id: string, data: any) =>
    api.put(`/study-plans/${id}`, data),
  
  deleteStudyPlan: (id: string) =>
    api.delete(`/study-plans/${id}`),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/study-plans/${id}/status`, { status }),
};

export const studyRecordAPI = {
  createRecord: (formData: FormData) =>
    api.post('/study-records', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getRecords: (params?: { planId?: string; date?: string; studentId?: string }) =>
    api.get('/study-records', { params }),
  
  getRecord: (id: string) =>
    api.get(`/study-records/${id}`),
  
  updateRecord: (id: string, formData: FormData) =>
    api.put(`/study-records/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const notificationAPI = {
  getNotifications: (params?: { isRead?: boolean; type?: string }) =>
    api.get('/notifications', { params }),
  
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
};

export const reportAPI = {
  generateDailyReport: (studentId: string, date: string) =>
    api.post('/reports/daily', { studentId, date }),
  
  getDailyReports: (params?: { studentId?: string; startDate?: string; endDate?: string }) =>
    api.get('/reports/daily', { params }),
  
  getStatistics: (params?: { studentId?: string; period?: string }) =>
    api.get('/reports/statistics', { params }),
};

export const userAPI = {
  getChildren: () =>
    api.get('/users/children'),
};

export default api;