import React, { useState } from 'react';
import { usePromptMutations } from '../hooks/usePrompts.js';
import { useCategories } from '../hooks/useCategories.js';

const CreatePrompt = () => {
  const { createPrompt } = usePromptMutations();
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    categoryId: '',
    visibility: 'private',
    isTemplate: false,
    templateVariables: {},
    targetAiModel: 'GPT-4',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await createPrompt(formData);
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        content: '',
        categoryId: '',
        visibility: 'private',
        isTemplate: false,
        templateVariables: {},
        targetAiModel: 'GPT-4',
        tags: []
      });
      setTimeout(() => setSuccess(false), 3000);
      console.log('Prompt created successfully:', response);
    } catch (error) {
      setError('Failed to create prompt: ' + error.message);
      console.error('Failed to create prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Create New AI Prompt</h1>
          <p className="text-slate-300">Build and organize your AI prompt library</p>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6">
            ✅ Prompt created successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-cyan-400 text-sm font-medium mb-2">
              Prompt Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="e.g., Content Creation Assistant"
              className="w-full p-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-cyan-400 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              placeholder="Brief description of what this prompt does..."
              className="w-full p-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none resize-vertical"
            />
          </div>

          <div>
            <label className="block text-cyan-400 text-sm font-medium mb-2">
              AI Prompt Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              required
              rows={8}
              placeholder="You are an expert assistant that helps with..."
              className="w-full p-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none resize-vertical font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-cyan-400 text-sm font-medium mb-2">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="w-full p-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-cyan-400 text-sm font-medium mb-2">
                Target AI Model
              </label>
              <select
                value={formData.targetAiModel}
                onChange={(e) => handleChange('targetAiModel', e.target.value)}
                className="w-full p-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="GPT-4">GPT-4</option>
                <option value="GPT-3.5">GPT-3.5</option>
                <option value="Claude">Claude</option>
                <option value="Gemini">Gemini</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-cyan-400 text-sm font-medium mb-2">
                Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => handleChange('visibility', e.target.value)}
                className="w-full p-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="team">Team</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-6">
            <button
              type="button"
              onClick={() => setFormData({
                title: '',
                description: '',
                content: '',
                categoryId: '',
                visibility: 'private',
                isTemplate: false,
                templateVariables: {},
                targetAiModel: 'GPT-4',
                tags: []
              })}
              className="px-6 py-3 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition-colors"
            >
              Clear
            </button>
            
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.content}
              className="px-6 py-3 bg-cyan-500 text-slate-900 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating...' : 'Create Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePrompt;

