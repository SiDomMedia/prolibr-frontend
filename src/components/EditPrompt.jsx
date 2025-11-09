import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { ArrowLeft, Save, Cpu, LogOut, Home } from 'lucide-react';
import '../App.css';

export default function EditPrompt() {
  const { id } = useParams();
  const { user, signOut } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', content: '', categoryId: '', visibility: 'private', isTemplate: false, targetAiModel: 'GPT-4', tags: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => { fetchPrompt(); }, [id]);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/prompts/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch prompt');
      const data = await response.json();
      setFormData({ title: data.title || '', description: data.description || '', content: data.content || '', categoryId: data.category_id || '', visibility: data.visibility || 'private', isTemplate: data.is_template || false, targetAiModel: data.target_ai_model || 'GPT-4', tags: data.tags || [] });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const response = await fetch(`/api/prompts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(formData) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prompt');
      }
      setSuccess(true);
      setTimeout(() => { window.location.href = `/prompts/${id}`; }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); };

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
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button onClick={() => window.location.href = `/prompts/${id}`} variant="outline" className="mb-6 border-cyan-500/50 text-cyan-400"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">Edit Prompt</h1>
        {loading && <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6">✅ Prompt updated! Redirecting...</div>}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">❌ {error}</div>}
        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 backdrop-blur-lg border border-cyan-500/30 rounded-lg p-8">
            <div><label className="block text-cyan-400 text-sm font-medium mb-2">Title *</label><Input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required className="bg-slate-700/50 border-slate-600 text-white" /></div>
            <div><label className="block text-cyan-400 text-sm font-medium mb-2">Description</label><Textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="bg-slate-700/50 border-slate-600 text-white" /></div>
            <div><label className="block text-cyan-400 text-sm font-medium mb-2">Content *</label><Textarea value={formData.content} onChange={(e) => handleChange('content', e.target.value)} required rows={12} className="bg-slate-700/50 border-slate-600 text-white font-mono text-sm" /></div>
            <div><label className="block text-cyan-400 text-sm font-medium mb-2">Visibility *</label><select value={formData.visibility} onChange={(e) => handleChange('visibility', e.target.value)} required className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md px-3 py-2"><option value="private">Private</option><option value="shared">Shared</option><option value="public">Public</option></select></div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1">{saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}</Button>
              <Button type="button" onClick={() => window.location.href = `/prompts/${id}`} variant="outline" className="border-slate-600 text-slate-300">Cancel</Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
