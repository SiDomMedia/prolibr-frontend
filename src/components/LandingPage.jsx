// Landing page component for ProLibr AI
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Shield, Zap, Database, BarChart3, Lock, Cpu } from 'lucide-react';
import '../App.css';

export default function LandingPage() {
  const { signIn, mockSignIn, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      // Use mock authentication for development
      if (process.env.NODE_ENV === 'development') {
        const response = await fetch('http://localhost:3000/auth/mock-login');
        const authData = await response.json();
        
        if (authData.success) {
          // Store the session token
          localStorage.setItem('prolibr_token', authData.sessionToken);
          // Reload the page to update authentication state
          window.location.reload();
        } else {
          throw new Error('Mock authentication failed');
        }
      } else {
        signIn();
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleDashboardClick = () => {
    // FIXED: Don't trigger signIn, just navigate
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      // Navigate to login page instead of triggering OAuth
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  // FIXED: Don't auto-redirect, let user click dashboard button
  // Remove the automatic redirect that was here

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Circuit board background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 98%, #00ffff15 99%),
            linear-gradient(0deg, transparent 98%, #00ffff15 99%),
            radial-gradient(circle at 20% 20%, #00ffff20 2px, transparent 3px),
            radial-gradient(circle at 80% 20%, #00ffff15 1px, transparent 2px),
            radial-gradient(circle at 20% 80%, #00ffff20 2px, transparent 3px),
            radial-gradient(circle at 80% 80%, #00ffff15 1px, transparent 2px)
          `,
          backgroundSize: '120px 120px, 120px 120px, 300px 300px, 200px 200px, 300px 300px, 200px 200px'
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-900/80 backdrop-blur-lg border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Cpu className="h-8 w-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white tracking-wider">ProLibr</span>
                <span className="bg-cyan-400 text-slate-900 px-2 py-1 rounded text-xs font-bold">AI</span>
              </div>
              <div className="bg-green-500 text-slate-900 px-2 py-1 rounded text-xs font-bold">
                SECURE
              </div>
            </div>
            {/* Header buttons - conditional based on auth status */}
            {isAuthenticated ? (
              <Button 
                onClick={handleDashboardClick}
                className="bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button 
                onClick={handleSignIn}
                className="bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500"
              >
                Sign in with Microsoft
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero section */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-8xl font-bold text-cyan-400 mb-6 tracking-wider">
              ProLibr AI
            </h1>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
          </div>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your secure AI prompt management platform. Enterprise-grade security with 
            rate limiting, input validation, and comprehensive logging. Sign in to access your command center.
          </p>
          {/* Main CTA button - conditional */}
          {isAuthenticated ? (
            <Button 
              onClick={handleDashboardClick}
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Access Command Center
            </Button>
          ) : (
            <Button 
              onClick={handleSignIn}
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Sign In to Access Command Center
            </Button>
          )}
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="ENTERPRISE SECURITY"
            description="Rate limiting and input validation"
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="AI PROMPTS"
            description="Manage and organize AI prompts"
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="ANALYTICS"
            description="Track performance and usage"
          />
          <FeatureCard
            icon={<Database className="h-8 w-8" />}
            title="PRODUCTION READY"
            description="Hardened for enterprise deployment"
          />
        </div>

        {/* Security features */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-cyan-500/30 rounded-lg p-8 mb-20">
          <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SecurityFeature
              title="Rate Limiting"
              description="Multi-tier protection against abuse and DoS attacks"
            />
            <SecurityFeature
              title="Input Validation"
              description="Comprehensive validation with Joi schemas"
            />
            <SecurityFeature
              title="Enhanced Logging"
              description="Winston logger with structured JSON output"
            />
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join the secure AI prompt management revolution
          </p>
          {/* Bottom CTA button - conditional */}
          {isAuthenticated ? (
            <Button 
              onClick={handleDashboardClick}
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-lg px-12 py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              <Lock className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
          ) : (
            <Button 
              onClick={handleSignIn}
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-lg px-12 py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              <Lock className="h-5 w-5 mr-2" />
              Secure Sign In
            </Button>
          )}
        </div>
      </main>

      {/* Status indicator */}
      <div className="fixed bottom-6 right-6 bg-slate-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-lg px-4 py-2 flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-slate-300">SECURE SYSTEM ONLINE</span>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="text-cyan-400 mb-4">{icon}</div>
      <h3 className="text-white font-bold text-sm mb-2 tracking-wider">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function SecurityFeature({ title, description }) {
  return (
    <div className="text-center">
      <h3 className="text-white font-bold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}