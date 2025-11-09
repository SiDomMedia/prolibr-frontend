import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { History, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExecutionHistory({ promptId }) {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchExecutions();
  }, [promptId, offset]);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/prompts/${promptId}/executions?limit=${limit}&offset=${offset}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch execution history');
      }

      const data = await response.json();
      setExecutions(data.executions);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <Card className="bg-slate-800/50 backdrop-blur-lg border-cyan-500/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-cyan-400 flex items-center">
            <History className="h-5 w-5 mr-2" />
            Execution History ({total})
          </CardTitle>
          {total > 0 && (
            <Button
              onClick={fetchExecutions}
              variant="outline"
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="mt-2 text-slate-300 text-sm">Loading executions...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg">
            Error: {error}
          </div>
        )}

        {!loading && !error && executions.length === 0 && (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No executions logged yet</p>
            <p className="text-slate-500 text-sm mt-1">Use the form above to log your first execution</p>
          </div>
        )}

        {!loading && !error && executions.length > 0 && (
          <>
            <div className="space-y-3">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {execution.was_successful ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <span className="text-slate-300 font-medium">{execution.ai_model_used || 'Unknown Model'}</span>
                    </div>
                    <span className="text-slate-400 text-sm">{formatDate(execution.executed_at)}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400">Quality:</span>
                      <span className="text-cyan-400 ml-2 font-medium">
                        {execution.response_quality_rating ? `${execution.response_quality_rating}/5` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Tokens:</span>
                      <span className="text-cyan-400 ml-2 font-medium">
                        {execution.tokens_used ? execution.tokens_used.toLocaleString() : '0'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Time:</span>
                      <span className="text-cyan-400 ml-2 font-medium">
                        {execution.execution_time_ms ? `${execution.execution_time_ms}ms` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Cost:</span>
                      <span className="text-cyan-400 ml-2 font-medium">
                        ${execution.cost_estimate ? execution.cost_estimate.toFixed(4) : '0.0000'}
                      </span>
                    </div>
                  </div>

                  {execution.execution_context && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-slate-400 text-sm">
                        <span className="font-medium">Context:</span> {execution.execution_context}
                      </p>
                    </div>
                  )}

                  {!execution.was_successful && execution.error_message && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-red-400 text-sm">
                        <span className="font-medium">Error:</span> {execution.error_message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-slate-700">
                <Button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-slate-300 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setOffset(Math.min((totalPages - 1) * limit, offset + limit))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
