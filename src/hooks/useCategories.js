// Categories hook for ProLibr AI
import { useState, useEffect } from 'react';
import api from '../lib/api.js';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = () => {
    loadCategories();
  };

  return {
    categories,
    loading,
    error,
    refreshCategories
  };
}

export default useCategories;

