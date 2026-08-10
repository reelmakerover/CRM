import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ds_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ds_token');
      localStorage.removeItem('ds_user');
      window.location.href = '/login';
    } else if (err.response?.status === 403) {
      toast.error(err.response?.data?.message || 'Access Denied: You do not have permission for this action');
    }
    return Promise.reject(err);
  }
);

export const getImgSrc = (url) => {
  if (!url || typeof url !== 'string') return '';
  const dataIndex = url.indexOf('data:image/');
  if (dataIndex !== -1) {
    return url.substring(dataIndex);
  }
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return `${window.location.protocol}//${window.location.hostname}:5000${url.startsWith('/') ? url : '/' + url}`;
  }
  return url.startsWith('/') ? url : `/${url}`;
};

export default api;
