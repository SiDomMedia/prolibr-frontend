// Authentication hook for ProLibr AI
import { useState, useEffect, useContext, createContext } from 'react';
import api from '../lib/api.js';

// Create authentication context
const AuthContext = createContext();

// Authentication provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!api.isAuthenticated()) {
        setUser(null);
        return;
      }

      const response = await api.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setError(error.message);
      
      // Clear invalid token
      if (error.status === 401) {
        api.clearToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = () => {
    // Redirect to Microsoft OAuth
    window.location.href = api.getAuthUrl();
  };

  const mockSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authResult = await api.mockLogin();
      
      if (authResult.success) {
        setUser(authResult.user);
        return authResult;
      }
    } catch (error) {
      console.error('Mock sign in failed:', error);
      setError(api.handleApiError(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await api.signOut();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('User refresh failed:', error);
      if (error.status === 401) {
        api.clearToken();
        setUser(null);
      }
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    mockSignIn,
    signOut,
    refreshUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      auth.signIn();
    }
  }, [auth.loading, auth.isAuthenticated, auth]);

  return auth;
}

// Hook for handling authentication in URL (callback)
export function useAuthCallback() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionToken = urlParams.get('session');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        return;
      }

      if (sessionToken) {
        setProcessing(true);
        try {
          api.setToken(sessionToken);
          
          // Verify the token works
          await api.getCurrentUser();
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Redirect to dashboard or intended page
          window.location.href = '/dashboard';
        } catch (error) {
          console.error('Token verification failed:', error);
          setError('Authentication verification failed. Please try again.');
          api.clearToken();
        } finally {
          setProcessing(false);
        }
      }
    };

    handleCallback();
  }, []);

  return { processing, error };
}

export default useAuth;

