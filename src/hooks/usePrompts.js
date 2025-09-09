// Prompts management hook for ProLibr AI
import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export function usePrompts(initialParams = {}) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    visibility: '',
    ...initialParams
  });

  // Fetch prompts with current filters and pagination
  const fetchPrompts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        ...filters,
        ...params,
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit
      };

      const response = await api.getPrompts(queryParams);
      
      setPrompts(response.prompts);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      setError(api.handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Initial load
  useEffect(() => {
    fetchPrompts();
  }, []);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchPrompts({ ...newFilters, page: 1 });
  }, [fetchPrompts]);

  // Pagination controls
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
    fetchPrompts({ page });
  }, [fetchPrompts]);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      goToPage(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  }, [pagination.page, goToPage]);

  // Search functionality
  const search = useCallback((query) => {
    updateFilters({ search: query });
  }, [updateFilters]);

  // Filter by category
  const filterByCategory = useCallback((categoryId) => {
    updateFilters({ category: categoryId });
  }, [updateFilters]);

  // Filter by visibility
  const filterByVisibility = useCallback((visibility) => {
    updateFilters({ visibility });
  }, [updateFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      visibility: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPrompts({
      search: '',
      category: '',
      visibility: '',
      page: 1
    });
  }, [fetchPrompts]);

  // Refresh current view
  const refresh = useCallback(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    nextPage,
    prevPage,
    search,
    filterByCategory,
    filterByVisibility,
    clearFilters,
    refresh
  };
}

export function usePrompt(promptId) {
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrompt = useCallback(async () => {
    if (!promptId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.getPrompt(promptId);
      setPrompt(response);
    } catch (error) {
      console.error('Failed to fetch prompt:', error);
      setError(api.handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, [promptId]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  const refresh = useCallback(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  return {
    prompt,
    loading,
    error,
    refresh
  };
}

export function usePromptMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPrompt = useCallback(async (promptData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.createPrompt(promptData);
      return response;
    } catch (error) {
      console.error('Failed to create prompt:', error);
      setError(api.handleApiError(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePrompt = useCallback(async (promptId, promptData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.updatePrompt(promptId, promptData);
      return response;
    } catch (error) {
      console.error('Failed to update prompt:', error);
      setError(api.handleApiError(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePrompt = useCallback(async (promptId) => {
    try {
      setLoading(true);
      setError(null);
      await api.deletePrompt(promptId);
      return true;
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      setError(api.handleApiError(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const executePrompt = useCallback(async (promptId, executionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.executePrompt(promptId, executionData);
      return response;
    } catch (error) {
      console.error('Failed to execute prompt:', error);
      setError(api.handleApiError(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const batchDeletePrompts = useCallback(async (promptIds) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.batchDeletePrompts(promptIds);
      return response;
    } catch (error) {
      console.error('Failed to batch delete prompts:', error);
      setError(api.handleApiError(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    executePrompt,
    batchDeletePrompts
  };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError(api.handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refresh
  };
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getUserAnalytics();
      setAnalytics(response);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError(api.handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh
  };
}

export default usePrompts;

