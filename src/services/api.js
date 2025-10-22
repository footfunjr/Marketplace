import axios from 'axios';

const API_URL = 'https://ton-backend.render.com/api';

// Configuration d'axios
const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
};

// Services des annonces
export const adService = {
  getAll: (params = {}) => api.get('/ads', { params }),
  getById: (id) => api.get(`/ads/${id}`),
  create: (adData) => {
    const formData = new FormData();
    Object.keys(adData).forEach(key => {
      if (key === 'images') {
        adData.images.forEach(image => {
          formData.append('images', image);
        });
      } else {
        formData.append(key, adData[key]);
      }
    });
    return api.post('/ads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, adData) => {
    const formData = new FormData();
    Object.keys(adData).forEach(key => {
      if (key === 'images') {
        adData.images.forEach(image => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else {
        formData.append(key, adData[key]);
      }
    });
    return api.put(`/ads/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/ads/${id}`),
  report: (id, reason) => api.post(`/ads/${id}/report`, { reason }),
};

// Services des messages
export const messageService = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
  sendMessage: (conversationId, content) => api.post('/messages', { conversationId, content }),
  startConversation: (adId, content) => api.post('/messages/conversations', { adId, content }),
};

// Services des avis
export const reviewService = {
  create: (adId, reviewData) => api.post('/reviews', { adId, ...reviewData }),
  getByAd: (adId) => api.get(`/reviews/ad/${adId}`),
};

export default api;
