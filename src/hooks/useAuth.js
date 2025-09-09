import { useState, useEffect } from 'react';

// Global authentication state (no Context needed)
let globalAuthState = {
  user: null,
  loading: true, // Start as true while checking auth
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
    localStorage.removeItem('user');
    notifyListeners();
    window.location.href = '/';
  },
  
  setUser: (user, token) => {
    globalAuthState = {
      ...globalAuthState,
      user,
      token,
      isAuthenticated: !!user,
      loading: false
    };
    if (token) {
      localStorage.setItem('authToken', token);
      // Set default authorization header for all API requests
      if (window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          if (args[0] && args[0].includes('prolibr-backend-api')) {
            args[1] = args[1] || {};
            args[1].headers = {
              ...args[1].headers,
              'Authorization': `Bearer ${token}`
            };
          }
          return originalFetch.apply(this, args);
        };
      }
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
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
  
  getState: () => globalAuthState,
  
  // Initialize auth state from URL or localStorage
  initialize: async () => {
    console.log('Initializing auth...');
    authAPI.setLoading(true);
    
    try {
      // Check URL for token from OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      
      if (tokenFromUrl) {
        console.log('Token found in URL, processing...');
        
        // Store token
        localStorage.setItem('authToken', tokenFromUrl);
        
        // Clean URL (remove token parameter)
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Try to decode token to get user info (JWT decode)
        try {
          const tokenParts = tokenFromUrl.split('.');
          if (tokenParts.length === 3) {
            // Decode JWT payload
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('Decoded JWT payload:', payload);
            
            const user = {
              id: payload.sub || payload.id || payload.oid || 'unknown',
              email: payload.email || payload.preferred_username || payload.upn || 'user@prolibr.ai',
              displayName: payload.name || payload.given_name || payload.email || 'ProLibr User'
            };
            
            authAPI.setUser(user, tokenFromUrl);
            console.log('User authenticated from token:', user);
            return;
          } else {
            // Not a JWT, create basic user object
            console.log('Token is not JWT format, creating basic user');
            const user = {
              id: 'user-' + Date.now(),
              email: 'user@prolibr.ai',
              displayName: 'ProLibr User'
            };
            authAPI.setUser(user, tokenFromUrl);
            return;
          }
        } catch (decodeError) {
          console.log('Token decode error (non-fatal):', decodeError);
          // Even if decode fails, we have a token so user is authenticated
          const user = {
            id: 'user-' + Date.now(),
            email: 'user@prolibr.ai',
            displayName: 'ProLibr User'
          };
          authAPI.setUser(user, tokenFromUrl);
          return;
        }
      }
      
      // No token in URL, check localStorage
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken) {
        console.log('Found stored authentication');
        try {
          let user;
          if (storedUser) {
            user = JSON.parse(storedUser);
          } else {
            // Create default user if not stored
            user = {
              id: 'user-' + Date.now(),
              email: 'user@prolibr.ai',
              displayName: 'ProLibr User'
            };
          }
          authAPI.setUser(user, storedToken);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          // Create default user
          const user = {
            id: 'user-' + Date.now(),
            email: 'user@prolibr.ai',
            displayName: 'ProLibr User'
          };
          authAPI.setUser(user, storedToken);
        }
      } else {
        console.log('No authentication found');
        authAPI.setLoading(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      authAPI.setLoading(false);
    }
  }
};

// Initialize auth on app load
if (typeof window !== 'undefined') {
  authAPI.initialize();
}

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

// Export API for direct access if needed
export const authService = authAPI;
