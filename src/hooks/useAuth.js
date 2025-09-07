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
    window.location.href = '/auth/microsoft';
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

// OAuth callback hook
export const useAuthCallback = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        authAPI.setLoading(true);
        
        // Extract parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const urlError = urlParams.get('error');

        if (urlError) {
          setError(`Authentication failed: ${urlError}`);
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setIsProcessing(false);
          return;
        }

        // Exchange code for tokens with your backend
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Set user data and tokens
        authAPI.setUser(data.user, data.token);
        
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect to dashboard or intended destination
        const redirectTo = localStorage.getItem('redirectAfterAuth') || '/dashboard';
        localStorage.removeItem('redirectAfterAuth');
        window.location.href = redirectTo;

      } catch (err) {
        setError(err.message);
      } finally {
        setIsProcessing(false);
        authAPI.setLoading(false);
      }
    };

    processAuthCallback();
  }, []);

  return {
    isProcessing,
    error,
    user: globalAuthState.user,
    retry: () => {
      setIsProcessing(true);
      setError(null);
    }
  };
};

// Initialize auth state from localStorage on app start
const initializeAuth = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // In a real app, you'd validate this token with your backend
    // For now, just set the authenticated state
    globalAuthState = {
      ...globalAuthState,
      token,
      isAuthenticated: true
    };
  }
};

// Call initialization
initializeAuth();
