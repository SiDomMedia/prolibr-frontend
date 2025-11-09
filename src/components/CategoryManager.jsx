import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Cpu,
  LogOut,
  Home,
  Tag
} from 'lucide-react';
import '../App.css';
import { getApiUrl } from '../config/api';

export default function CategoryManager() {
  const { user, signOut } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: '',
    sortOrder: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/categories'), {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(getApiUrl('/api/categories'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      // Reset form and refresh categories
      setFormData({
        name: '',
        description: '',
        color: '#6366f1',
        icon: '',
        sortOrder: 0
      });
      setShowCreateForm(false);
      fetchCategories();
    } catch (err) {
      alert(`Error creating category: ${err.message}`);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const category = categories.find(c => c.id === id);
      const response = await fetch(getApiUrl(`/api/categories/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: category.name,
          description: category.description,
          color: category.color,
          icon: category.icon,
          sortOrder: category.sort_order
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      setEditingId(null);
      fetchCategories();
    } catch (err) {
      alert(`Error updating category: ${err.message}`);
    }
  };

  const handleDelete = async (id, name, promptCount) => {
    if (promptCount > 0) {
      alert(`Cannot delete category "${name}" because it contains ${promptCount} prompt(s). Please reassign or delete those prompts first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/categories/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      fetchCategories();
    } catch (err) {
      alert(`Error deleting category: ${err.message}`);
    }
  };

  const handleCategoryChange = (id, field, value) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
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
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                size="sm"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
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

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2 tracking-wider">
              Category Management
            </h1>
            <p className="text-slate-300">
              Organize your prompts with custom categories
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {showCreateForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </>
            )}
          </Button>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-cyan-400">Create New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="e.g., Marketing, Development, Content"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Brief description of this category..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10 bg-slate-700/50 border-slate-600"
                      />
                      <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Icon (optional)
                    </label>
                    <Input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="📁"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      min="0"
                    />
                  </div>
                </div>

                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="mt-4 text-slate-300">Loading categories...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="bg-red-900/20 border-red-500/50 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-400">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Categories list */}
        {!loading && !error && categories.length === 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30">
            <CardContent className="pt-6 text-center py-12">
              <Tag className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 text-lg mb-4">No categories yet</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Category
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="space-y-4">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30"
              >
                <CardContent className="pt-6">
                  {editingId === category.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Name
                          </label>
                          <Input
                            type="text"
                            value={category.name}
                            onChange={(e) => handleCategoryChange(category.id, 'name', e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Color
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={category.color}
                              onChange={(e) => handleCategoryChange(category.id, 'color', e.target.value)}
                              className="w-16 h-10 bg-slate-700/50 border-slate-600"
                            />
                            <Input
                              type="text"
                              value={category.color}
                              onChange={(e) => handleCategoryChange(category.id, 'color', e.target.value)}
                              className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Description
                        </label>
                        <Textarea
                          value={category.description || ''}
                          onChange={(e) => handleCategoryChange(category.id, 'description', e.target.value)}
                          rows={2}
                          className="bg-slate-700/50 border-slate-600 text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdate(category.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon || '📁'}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-cyan-400 mb-1">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-slate-300 text-sm mb-2">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>{category.prompt_count || 0} prompts</span>
                            <span>ID: {category.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingId(category.id)}
                          variant="outline"
                          size="sm"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(category.id, category.name, category.prompt_count)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
