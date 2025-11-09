// ProLibr Frontend API Client
// Simple axios-based API client for frontend-backend communication

const API_BASE_URL = 'https://prolibr-backend-api-f0b2bwe0cdbfa7bx.uksouth-01.azurewebsites.net';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create API client with auth header
const createHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...createHeaders(),
      ...options.headers,
    },
  };
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }
  
  return response.json();
};

// API methods
const api = {
  // Health check
  health: () => apiFetch('/api/health'),
  
  // Prompts
  prompts: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiFetch(`/api/prompts${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiFetch(`/api/prompts/${id}`),
    create: (data) => apiFetch('/api/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => apiFetch(`/api/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => apiFetch(`/api/prompts/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // Categories
  categories: {
    getAll: () => apiFetch('/api/categories'),
    getById: (id) => apiFetch(`/api/categories/${id}`),
    create: (data) => apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => apiFetch(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => apiFetch(`/api/categories/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // Executions
  executions: {
    getByPromptId: (promptId) => apiFetch(`/api/prompts/${promptId}/executions`),
    create: (promptId, data) => apiFetch(`/api/prompts/${promptId}/executions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  
  // Stats
  stats: {
    get: () => apiFetch('/api/stats'),
  },
};

export default api;
