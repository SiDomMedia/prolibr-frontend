import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { ArrowLeft, Edit, Trash2, Copy, Cpu, LogOut, Home, Calendar, Tag } from 'lucide-react';
import ExecutionLogger from './ExecutionLogger.jsx';
import ExecutionHistory from './ExecutionHistory.jsx';
import '../App.css';
import { getApiUrl } from '../config/api';

export default function PromptDetail() {
  const { id } = useParams();
  const { user, signOut } = useAuth();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchPrompt(); }, [id]);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/api/prompts/${id}`), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch prompt');
      const data = await response.json();
      setPrompt(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (prompt?.content) {
      navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    try {
      const response = await fetch(getApiUrl(`/api/prompts/${id}`), { method: 'DELETE', credentials: 'include' });
      if (!response.ok) throw new Error('Failed to delete prompt');
      window.location.href = '/prompts';
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <header className="relative z-10 bg-slate-900/80 backdrop-blur-lg border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2"><Cpu className="h-8 w-8 text-cyan-400" /><span className="text-2xl font-bold">ProLibr</span><span className="bg-cyan-400 text-slate-900 px-2 py-1 rounded text-xs font-bold">AI</span></div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => window.location.href = '/dashboard'} variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400"><Home className="h-4 w-4 mr-2" />Dashboard</Button>
              <Button onClick={signOut} variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400"><LogOut className="h-4 w-4 mr-2" />Sign Out</Button>
            </div>
          </div>
        </div>
      </header>
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button onClick={() => window.location.href = '/prompts'} variant="outline" className="mb-6 border-cyan-500/50 text-cyan-400"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        {loading && <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>}
        {error && <Card className="bg-red-900/20 border-red-500/50"><CardContent className="pt-6"><p className="text-red-400">Error: {error}</p></CardContent></Card>}
        {!loading && !error && prompt && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-3xl text-cyan-400">{prompt.title}</CardTitle>
                <p className="text-slate-300">{prompt.description || 'No description'}</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => window.location.href = `/prompts/${id}/edit`} className="bg-blue-600 hover:bg-blue-700"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                  <Button onClick={handleCopy} variant="outline" className="border-cyan-500/50 text-cyan-400"><Copy className="h-4 w-4 mr-2" />{copied ? 'Copied!' : 'Copy'}</Button>
                  <Button onClick={handleDelete} variant="outline" className="border-red-500/50 text-red-400"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30">
              <CardHeader><CardTitle className="text-cyan-400">Content</CardTitle></CardHeader>
              <CardContent><div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700"><pre className="whitespace-pre-wrap text-slate-200 font-mono text-sm">{prompt.content}</pre></div></CardContent>
            </Card>
            <ExecutionLogger promptId={id} onExecutionLogged={fetchPrompt} />
            <ExecutionHistory promptId={id} />
          </div>
        )}
      </main>
    </div>
  );
}
