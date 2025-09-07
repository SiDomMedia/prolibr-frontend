// Dashboard component for ProLibr AI
import { useAuth } from '../hooks/useAuth.js';
import { useAnalytics } from '../hooks/usePrompts.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { 
  Plus, 
  FileText, 
  Tag, 
  User, 
  BarChart3, 
  Calendar, 
  Eye, 
  Play,
  LogOut,
  Cpu,
  Shield
} from 'lucide-react';
import { formatNumber } from '../lib/utils.js';
import '../App.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { analytics, loading: analyticsLoading } = useAnalytics();

  const handleCreatePrompt = () => {
    window.location.href = '/prompts/create';
  };

  const handleViewPrompts = () => {
    window.location.href = '/prompts';
  };

  const handleViewCategories = () => {
    window.location.href = '/categories';
  };

  const handleViewProfile = () => {
    alert(`User Profile:\n${JSON.stringify(user, null, 2)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Circuit board background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 98%, #00ffff15 99%),
            radial-gradient(circle at 25% 25%, #00ffff20 2px, transparent 3px),
            linear-gradient(45deg, transparent 24%, #00ffff08 25%, #00ffff08 26%, transparent 27%)
          `,
          backgroundSize: '100px 100px, 200px 200px, 60px 60px'
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
            <div className="flex items-center space-x-4">
              <span className="text-cyan-400 text-sm">Welcome, {user?.displayName}</span>
              <Button 
                onClick={signOut}
                variant="outline"
                size="sm"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-cyan-500/30 rounded-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-cyan-400 mb-4 tracking-wider">
              Secure AI Command Center
            </h1>
            <p className="text-slate-300 text-lg">
              Welcome to your ProLibr AI dashboard, {user?.displayName}. Your secure prompt management platform is ready for action.
            </p>
          </div>
        </div>

        {/* Analytics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Prompts"
            value={analyticsLoading ? '...' : formatNumber(analytics?.total_prompts || 0)}
            icon={<FileText className="h-6 w-6" />}
            loading={analyticsLoading}
          />
          <StatCard
            title="This Week"
            value={analyticsLoading ? '...' : formatNumber(analytics?.prompts_this_week || 0)}
            icon={<Calendar className="h-6 w-6" />}
            loading={analyticsLoading}
          />
          <StatCard
            title="Public Prompts"
            value={analyticsLoading ? '...' : formatNumber(analytics?.public_prompts || 0)}
            icon={<Eye className="h-6 w-6" />}
            loading={analyticsLoading}
          />
          <StatCard
            title="Total Executions"
            value={analyticsLoading ? '...' : formatNumber(analytics?.total_executions || 0)}
            icon={<Play className="h-6 w-6" />}
            loading={analyticsLoading}
          />
        </div>

        {/* Quick actions */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400 text-xl tracking-wider">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionButton
                onClick={handleCreatePrompt}
                icon={<Plus className="h-5 w-5" />}
                title="Create Prompt"
                description="Add a new AI prompt to your library"
              />
              <ActionButton
                onClick={handleViewPrompts}
                icon={<FileText className="h-5 w-5" />}
                title="View Prompts"
                description="Browse your prompt collection"
              />
              <ActionButton
                onClick={handleViewCategories}
                icon={<Tag className="h-5 w-5" />}
                title="Categories"
                description="Manage prompt categories"
              />
              <ActionButton
                onClick={handleViewProfile}
                icon={<User className="h-5 w-5" />}
                title="User Profile"
                description="Manage your account settings"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional analytics */}
        {analytics && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricRow
                  label="Average Quality Rating"
                  value={`${(analytics.avg_quality_rating || 0).toFixed(1)}/5.0`}
                />
                <MetricRow
                  label="Total Tokens Used"
                  value={formatNumber(analytics.total_tokens_used || 0)}
                />
                <MetricRow
                  label="Estimated Cost"
                  value={`$${(analytics.total_cost_estimate || 0).toFixed(2)}`}
                />
                <MetricRow
                  label="Executions This Week"
                  value={formatNumber(analytics.executions_this_week || 0)}
                />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SecurityStatus label="Rate Limiting" status="Active" />
                <SecurityStatus label="Input Validation" status="Active" />
                <SecurityStatus label="Authentication" status="Verified" />
                <SecurityStatus label="Session Security" status="Encrypted" />
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Status indicator */}
      <div className="fixed bottom-6 right-6 bg-slate-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-lg px-4 py-2 flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-slate-300">SECURE SYSTEM ONLINE</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }) {
  return (
    <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium tracking-wider uppercase">{title}</p>
            <p className="text-2xl font-bold text-cyan-400 mt-2">
              {loading ? (
                <div className="animate-pulse bg-slate-600 h-8 w-16 rounded"></div>
              ) : (
                value
              )}
            </p>
          </div>
          <div className="text-cyan-400">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButton({ onClick, icon, title, description }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="h-auto p-4 border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-left flex flex-col items-start space-y-2 transition-all duration-300"
    >
      <div className="flex items-center space-x-2 text-cyan-400">
        {icon}
        <span className="font-bold">{title}</span>
      </div>
      <p className="text-slate-400 text-sm">{description}</p>
    </Button>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-cyan-400 font-medium">{value}</span>
    </div>
  );
}

function SecurityStatus({ label, status }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-green-400 font-medium flex items-center">
        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
        {status}
      </span>
    </div>
  );
}

