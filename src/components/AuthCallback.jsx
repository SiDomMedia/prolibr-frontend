// Authentication callback component for ProLibr AI
import { useEffect } from 'react';
import { useAuthCallback } from '../hooks/useAuth.js';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const { processing, error } = useAuthCallback();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Failed</h1>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-cyan-400 mb-4">Completing Sign In</h1>
        <p className="text-cyan-300">
          {processing ? 'Verifying your credentials...' : 'Redirecting to dashboard...'}
        </p>
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

