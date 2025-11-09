import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Play, CheckCircle, XCircle } from 'lucide-react';

export default function ExecutionLogger({ promptId, onExecutionLogged }) {
  const [formData, setFormData] = useState({
    ai_model_used: 'GPT-4',
    input_variables: {},
    execution_context: '',
    response_quality_rating: 3,
    execution_time_ms: 0,
    tokens_used: 0,
    cost_estimate: 0,
    was_successful: true,
    error_message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/prompts/${promptId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log execution');
      }

      setSuccess(true);
      setFormData({
        ai_model_used: 'GPT-4',
        input_variables: {},
        execution_context: '',
        response_quality_rating: 3,
        execution_time_ms: 0,
        tokens_used: 0,
        cost_estimate: 0,
        was_successful: true,
        error_message: ''
      });

      if (onExecutionLogged) {
        onExecutionLogged();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center">
          <Play className="h-5 w-5 mr-2" />
          Log Execution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Execution logged successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">AI Model</label>
              <select
                value={formData.ai_model_used}
                onChange={(e) => setFormData({ ...formData, ai_model_used: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md px-3 py-2"
              >
                <option value="GPT-4">GPT-4</option>
                <option value="GPT-3.5">GPT-3.5</option>
                <option value="Claude">Claude</option>
                <option value="Gemini">Gemini</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Quality Rating (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.response_quality_rating}
                onChange={(e) => setFormData({ ...formData, response_quality_rating: parseInt(e.target.value) })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Execution Context</label>
            <Textarea
              value={formData.execution_context}
              onChange={(e) => setFormData({ ...formData, execution_context: e.target.value })}
              rows={2}
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Optional: Describe the context or use case..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Execution Time (ms)</label>
              <Input
                type="number"
                min="0"
                value={formData.execution_time_ms}
                onChange={(e) => setFormData({ ...formData, execution_time_ms: parseInt(e.target.value) })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tokens Used</label>
              <Input
                type="number"
                min="0"
                value={formData.tokens_used}
                onChange={(e) => setFormData({ ...formData, tokens_used: parseInt(e.target.value) })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cost Estimate ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost_estimate}
                onChange={(e) => setFormData({ ...formData, cost_estimate: parseFloat(e.target.value) })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="was_successful"
              checked={formData.was_successful}
              onChange={(e) => setFormData({ ...formData, was_successful: e.target.checked })}
              className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded"
            />
            <label htmlFor="was_successful" className="text-slate-300">
              Execution was successful
            </label>
          </div>

          {!formData.was_successful && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Error Message</label>
              <Textarea
                value={formData.error_message}
                onChange={(e) => setFormData({ ...formData, error_message: e.target.value })}
                rows={2}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Describe the error..."
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Logging...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Log Execution
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
