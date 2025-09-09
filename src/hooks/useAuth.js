import { useState, useEffect } from 'react';

// Global authentication state (no Context needed)
let globalAuthState = {
  user: null,
  loading: false,
  token: null,
  isAuthenticated: false
};

// State change listeners
const authListeners = new Set();

// Notify all listeners of state changes
const notifyListeners = () => {
  authListeners.forEach(listener => listener(globalAuthState));
};

// Authentication API
const authAPI = {
  signIn: () => {
    window.location.href = 'https://prolibr-backend-api-f0b2bwe0cdbfa7bx.uksouth-01.azurewebsites.net/auth/login';
  },

  signOut: () => {
    globalAuthState = {
      user: null,
      loading: false,
      token: null,
      isAuthenticated: false
    };
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    notifyListeners();
    window.location.href = '/';
  },

  setUser: (user, token) => {
    globalAuthState = {
      ...globalAuthState,
      user,
      token,
      isAuthenticated: !!user
    };
    if (token) {
      localStorage.setItem('authToken', token);
    }
    notifyListeners();
  },

  setLoading: (loading) => {
    globalAuthState = {
      ...globalAuthState,
      loading
    };
    notifyListeners();
  },

  getState: () => globalAuthState
};

// Hook to use authentication (no Context needed)
export const useAuth = () => {
  const [authState, setAuthState] = useState(globalAuthState);

  useEffect(() => {
    // Subscribe to auth changes
    const listener = (newState) => {
      setAuthState({ ...newState });
    };
    
    authListeners.add(listener);
    
    // Initial state sync
    setAuthState({ ...globalAuthState });
    
    // Cleanup
    return () => {
      authListeners.delete(listener);
    };
  }, []);

  return {
    ...authState,
    signIn: authAPI.signIn,
    signOut: authAPI.signOut,
    setUser: authAPI.setUser
  };
};

// OAuth ca
