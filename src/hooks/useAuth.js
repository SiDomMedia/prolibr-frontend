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
        
        // Decode token to get user info (basic JWT decode)
        try {
          const tokenParts = tokenFromUrl.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const user = {
              id: payload.sub || payload.id,
              email: payload.email,
              displayName: payload.name || payload.email
            };
            authAPI.setUser(user, tokenFromUrl);
            console.log('User authenticated from token:', user);
            return;
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          // Token might not be JWT, try to validate with backend
          await validateTokenWithBackend(tokenFromUrl);
          return;
        }
      }
      
      // No token in URL, check localStorage
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        console.log('Found stored authentication');
        try {
          const user = JSON.parse(storedUser);
          authAPI.setUser(user, storedToken);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      } else if (storedToken) {
        // Have token but no user, validate with backend
        await validateTokenWithBackend(storedToken);
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

// Helper function to validate token with backend
async function validateTokenWithBackend(token) {
  try {
    const response = await fetch('https://prolibr-backend-api-f0b2bwe0cdbfa7bx.uksouth-01.azurewebsites.net/api/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      authAPI.setUser(userData, token);
      console.log('Token validated with backend:', userData);
    } else {
      console.error('Token validation failed');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      authAPI.setLoading(false);
    }
  } catch (error) {
    console.error('Error validating token:', error);
    authAPI.setLoading(false);
  }
}

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
