import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
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

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Products
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile');
export const verifyPhone = (data) => api.post('/auth/verify-phone', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

// Stats
export const getStats = () => api.get('/statistics');

// Buyers
export const getBuyerOrders = () => api.get('/buyers/orders');
export const getBuyerReviews = () => api.get('/buyers/reviews');
export const createReview = (data) => api.post('/reviews', data);

// Sellers
export const getSellerProducts = () => api.get('/sellers/products');
export const getSellerOrders = () => api.get('/sellers/orders');
export const getSellerStats = () => api.get('/sellers/stats');

export default api; 