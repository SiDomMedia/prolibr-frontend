import { useState, useEffect } from 'react';

// Simple authentication hook without Context
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('prolibr_session_token');
      if (token) {
        setSessionToken(token);
        await verifySession(token);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifySession = async (token) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setSessionToken(token);
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      clearAuth();
    }
  };

  const signIn = () => {
    window.location.href = '/auth/microsoft';
  };

  const signOut = async () => {
    try {
      if (sessionToken) {
        await fetch(`/auth/logout?session=${sessionToken}`, {
          method: 'GET'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      window.location.href = '/';
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('prolibr_session_token');
    setUser(null);
    setSessionToken(null);
  };

  return {
    user,
    loading,
    sessionToken,
    signIn,
    signOut,
    isAuthenticated: !!user
  };
};
