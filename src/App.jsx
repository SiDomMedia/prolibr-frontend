// ProLibr AI React Application - TEMPORARY FIX FOR TESTING
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import LandingPage from './components/LandingPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import CreatePrompt from './components/CreatePrompt.jsx';
import './App.css';

// TEMPORARILY DISABLED - Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }
  
  // TEMPORARILY COMMENTED OUT FOR TESTING
  // if (!isAuthenticated) {
  //   return <Navigate to="/" replace />;
  // }
  
  return children;
}

// Public route wrapper (redirects to dashboard if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }
  
  // TEMPORARILY COMMENTED OUT FOR TESTING
  // if (isAuthenticated) {
  //   return <Navigate to="/dashboard" replace />;
  // }
  
  return children;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />
          
          {/* TEMPORARY: Added login route that redirects to dashboard */}
          <Route 
            path="/login" 
            element={<Navigate to="/dashboard" replace />} 
          />
                              
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Placeholder routes for future implementation */}
          <Route 
            path="/prompts" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center text-white">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-cyan-400 mb-4">Prompts Management</h1>
                    <p className="text-slate-300">Coming soon in Phase 3...</p>
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/prompts/create" 
            element={
              <ProtectedRoute>
                <CreatePrompt />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center text-white">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-cyan-400 mb-4">Categories</h1>
                    <p className="text-slate-300">Coming soon in Phase 3...</p>
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
