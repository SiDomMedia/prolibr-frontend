import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Cpu,
  LogOut,
  Home
} from 'lucide-react';
import '../App.css';
import { getApiUrl } from '../config/api';

export default function PromptLibrary() {
  const { user, signOut } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, [searchTerm, categoryFilter, visibilityFilter, currentPage]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (visibilityFilter) params.append('visibility', visibilityFilter);

      const response = await fetch(getApiUrl(`/api/prompts?\${params}`), {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const data = await response.json();
      setPrompts(data.prompts);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promptId) => {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/prompts/\${promptId}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }

      fetchPrompts();
    } catch (err) {
      alert(`Error deleting prompt: \${err.message}`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getVisibilityBadge = (visibility) => {
    const colors = {
      private: 'bg-slate-700 text-slate-300',
      public: 'bg-green-600 text-white',
      shared: 'bg-blue-600 text-white'
    };
    return colors[visibility] || colors.private;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
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

      <header className="relative z-10 bg-slate-900/80 backdrop-blur-lg border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Cpu className="h-8 w-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white tracking-wider">ProLibr</span>
                <span className="bg-cyan-400 text-slate-900 px-2 py-1 rounded text-xs font-bold">AI</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => window.location.href = '/dashboard'} variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                <Home className="h-4 w-4 mr-2" />Dashboard
              </Button>
              <span className="text-cyan-400 text-sm">Welcome, {user?.displayName}</span>
              <Button onClick={signOut} variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                <LogOut className="h-4 w-4 mr-2" />Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2 tracking-wider">Prompt Library</h1>
            <p className="text-slate-300">Manage and organize your AI prompts</p>
          </div>
          <Button onClick={() => window.location.href = '/prompts/create'} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="h-4 w-4 mr-2" />Create Prompt
          </Button>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30 mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type="text" placeholder="Search prompts..." value={searchTerm} onChange={handleSearchChange} className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" />
              </div>
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                <Filter className="h-4 w-4 mr-2" />Filters
              </Button>
            </div>
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Visibility</label>
                  <select value={visibilityFilter} onChange={(e) => { setVisibilityFilter(e.target.value); setCurrentPage(1); }} className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md px-3 py-2">
                    <option value="">All</option>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {loading && <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div><p className="mt-4 text-slate-300">Loading prompts...</p></div>}
        {error && <Card className="bg-red-900/20 border-red-500/50 mb-6"><CardContent className="pt-6"><p className="text-red-400">Error: {error}</p></CardContent></Card>}
        {!loading && !error && prompts.length === 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30"><CardContent className="pt-6 text-center py-12"><p className="text-slate-300 text-lg mb-4">No prompts found</p><Button onClick={() => window.location.href = '/prompts/create'} className="bg-cyan-600 hover:bg-cyan-700 text-white"><Plus className="h-4 w-4 mr-2" />Create Your First Prompt</Button></CardContent></Card>
        )}
        {!loading && !error && prompts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30 hover:border-cyan-400/50 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-cyan-400 text-lg">{prompt.title}</CardTitle>
                      <span className={`px-2 py-1 rounded text-xs font-bold \${getVisibilityBadge(prompt.visibility)}`}>{prompt.visibility}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm mb-4 line-clamp-3">{prompt.description || 'No description'}</p>
                    <div className="flex gap-2">
                      <Button onClick={() => window.location.href = `/prompts/\${prompt.id}`} variant="outline" size="sm" className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"><Eye className="h-4 w-4 mr-2" />View</Button>
                      <Button onClick={() => window.location.href = `/prompts/\${prompt.id}/edit`} variant="outline" size="sm" className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                      <Button onClick={() => handleDelete(prompt.id)} variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <Button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50"><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
                <span className="text-slate-300">Page {currentPage} of {totalPages}</span>
                <Button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50">Next<ChevronRight className="h-4 w-4 ml-2" /></Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
