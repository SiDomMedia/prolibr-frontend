// ProLibr AI API Service Layer
// Secure communication with hardened backend

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ProLibrAPI {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://prolibr-backend-api-f0b2bwe0cdbfa7bx.uksouth-01.azurewebsites.net' 
        : 'http://localhost:3000');
    this.token = null;
    this.refreshPromise = null;
  }

  // Token management
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('prolibr_token', token);
    } else {
      localStorage.removeItem('prolibr_token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('prolibr_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('prolibr_token');
  }

  // HTTP request wrapper with error handling and retry logic
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new ApiError(
          `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          429,
          { retryAfter: parseInt(retryAfter) }
        );
      }

      // Handle authentication errors
      if (response.status === 401) {
        this.clearToken();
        throw new ApiError('Authentication required. Please sign in again.', 401);
      }

      // Handle other HTTP errors
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Unknown error occurred' };
        }
        
        throw new ApiError(
          errorData.error || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      // Return JSON response
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new ApiError('Network error. Please check your connection.', 0);
      }
      
      throw new ApiError('An unexpected error occurred.', 0, error);
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const url = new URL(endpoint, this.baseURL);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    return this.request(url.pathname + url.search);
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Authentication methods
  async mockLogin() {
    try {
      const response = await fetch(`${this.baseURL}/auth/mock-login`);
      const authData = await response.json();
      
      if (authData.success) {
        this.setToken(authData.sessionToken);
        return {
          success: true,
          user: authData.user,
          sessionToken: authData.sessionToken
        };
      } else {
        throw new ApiError('Mock authentication failed', 401);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Authentication request failed', 0, error);
    }
  }

  async getCurrentUser() {
    return this.get('/api/user/profile');
  }

  async signOut() {
    const token = this.getToken();
    if (token) {
      try {
        await this.get(`/auth/logout?session=${token}`);
      } catch (error) {
        console.warn('Logout request failed:', error.message);
      }
    }
    this.clearToken();
  }

  // Health check methods
  async getSystemHealth() {
    return this.get('/health');
  }

  async getDatabaseHealth() {
    return this.get('/api/health/database');
  }

  // Category methods
  async getCategories() {
    return this.get('/api/categories');
  }

  // Prompt methods
  async getPrompts(params = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      visibility
    } = params;

    return this.get('/api/prompts', {
      page,
      limit,
      category,
      search,
      visibility
    });
  }

  async getPrompt(id) {
    return this.get(`/api/prompts/${id}`);
  }

  async createPrompt(promptData) {
    return this.post('/api/prompts', promptData);
  }

  async updatePrompt(id, promptData) {
    return this.put(`/api/prompts/${id}`, promptData);
  }

  async deletePrompt(id) {
    return this.delete(`/api/prompts/${id}`);
  }

  async executePrompt(id, executionData) {
    return this.post(`/api/prompts/${id}/execute`, executionData);
  }

  // Analytics methods
  async getUserAnalytics() {
    return this.get('/api/analytics/user');
  }

  // Utility methods
  isAuthenticated() {
    return !!this.getToken();
  }

  getAuthUrl() {
    return `${this.baseURL}/auth/microsoft`;
  }

  // Error handling helper
  handleApiError(error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          return 'Please sign in to continue.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 429:
          return `Rate limit exceeded. ${error.data?.retryAfter ? `Please try again in ${error.data.retryAfter} seconds.` : 'Please try again later.'}`;
        case 500:
          return 'Server error. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred.';
      }
    }
    return 'An unexpected error occurred.';
  }

  // Batch operations
  async batchDeletePrompts(promptIds) {
    const results = await Promise.allSettled(
      promptIds.map(id => this.deletePrompt(id))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return {
      successful,
      failed,
      total: promptIds.length,
      errors: results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason.message)
    };
  }

  // Search and filtering helpers
  async searchPrompts(query, filters = {}) {
    return this.getPrompts({
      search: query,
      ...filters
    });
  }

  async getPromptsByCategory(categoryId, params = {}) {
    return this.getPrompts({
      category: categoryId,
      ...params
    });
  }

  async getPublicPrompts(params = {}) {
    return this.getPrompts({
      visibility: 'public',
      ...params
    });
  }

  // Export functionality
  async exportPrompts(format = 'json') {
    const allPrompts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getPrompts({ page, limit: 100 });
      allPrompts.push(...response.prompts);
      hasMore = page < response.totalPages;
      page++;
    }

    if (format === 'json') {
      return JSON.stringify(allPrompts, null, 2);
    }
    
    if (format === 'csv') {
      const headers = ['Title', 'Description', 'Content', 'Category', 'Visibility', 'Created', 'Updated'];
      const rows = allPrompts.map(prompt => [
        prompt.title,
        prompt.description || '',
        prompt.content,
        prompt.category_name || '',
        prompt.visibility,
        new Date(prompt.created_at).toLocaleDateString(),
        new Date(prompt.updated_at).toLocaleDateString()
      ]);
      
      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    }

    throw new Error(`Unsupported export format: ${format}`);
  }
}

// Create singleton instance
const api = new ProLibrAPI();

export default api;
export { ApiError };

