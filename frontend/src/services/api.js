import axios from 'axios';
import { getBackendUrl } from '../config';

const api = axios.create({
  baseURL: getBackendUrl(),
  withCredentials: true,
});

export const contactsApi = {
  getAll: () => api.get('/contacts'),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (contact) => api.post('/contacts', contact),
  update: (id, contact) => api.put(`/contacts/${id}`, contact),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export const tagsApi = {
  getAll: () => api.get('/tags'),
  create: (tag) => api.post('/tags', tag),
  delete: (id) => api.delete(`/tags/${id}`),
};

export default api;
