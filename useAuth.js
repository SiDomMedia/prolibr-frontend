import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    // Check for existing session on app load
    const token = localStorage.getItem('prolibr_session_token');
    if (token) {
      setSessionToken(token);
      // Verify token with backend
      verifySession(token);
    } else {
      setLoading(false);
    }
  }, []);

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
        // Token invalid, clear it
        localStorage.removeItem('prolibr_session_token');
        setSessionToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      localStorage.removeItem('prolibr_session_token');
      setSessionToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = () => {
    // Redirect to Microsoft OAuth
    window.location.href = '/auth/microsoft';
  };

  const signOut = async () => {
    try {
      if (sessionToken) {
        // Call backend logout
        await fetch(`/auth/logout?session=${sessionToken}`, {
          method: 'GET'
        });
        
        // Clear local storage
        localStorage.removeItem('prolibr_session_token');
      }
      
      setUser(null);
      setSessionToken(null);
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if backend call fails
      setUser(null);
      setSessionToken(null);
      localStorage.removeItem('prolibr_session_token');
      window.location.href = '/';
    }
  };

  const value = {
    user,
    loading,
    sessionToken,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
