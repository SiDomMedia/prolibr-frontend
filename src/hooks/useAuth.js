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
        
        // Validate token with backend to get REAL user data
        try {
          console.log('Validating token with backend...');
          const response = await fetch('https://prolibr-backend-api-f0b2bwe0cdbfa7bx.uksouth-01.azurewebsites.net/auth/validate', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tokenFromUrl}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.user) {
              const user = {
                id: data.user.id,
                email: data.user.email,
                displayName: data.user.displayName || data.user.email
              };
              authAPI.setUser(user, tokenFromUrl);
              console.log('User authenticated from backend:', user);
              return;
            }
          }
          
          // If validation fails, clear token and show error
          console.error('Token validation failed');
          localStorage.removeItem('authToken');
          authAPI.setLoading(false);
          return;
        } catch (error) {
          console.error('Token validation error:', error);
          // If validation fails, clear token
          localStorage.removeItem('authToken');
          authAPI.setLoading(false);
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
