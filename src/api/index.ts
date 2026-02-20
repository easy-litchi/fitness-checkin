import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { username: string; nickname: string; password: string }) =>
    api.post<{ token: string; user: { id: number; username: string; nickname: string } }>('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post<{ token: string; user: { id: number; username: string; nickname: string } }>('/auth/login', data),
  getMe: () => api.get<{ user: { id: number; username: string; nickname: string } }>('/auth/me'),
};

export const checkinApi = {
  checkIn: () => api.post<{ date: string; created: boolean }>('/checkins'),
  getByMonth: (month: string) => api.get<string[]>('/checkins', { params: { month } }),
};

export const statsApi = {
  getSummary: () =>
    api.get<{ currentStreak: number; bestStreak: number; monthlyCount: number; completionRate: number }>('/stats/summary'),
  getTrend: (months = 6) =>
    api.get<Array<{ month: string; count: number }>>('/stats/trend', { params: { months } }),
};
