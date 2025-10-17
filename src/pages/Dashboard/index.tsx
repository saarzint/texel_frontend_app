import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import patternService, { type Pattern } from '../../services/patternService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patternService.getPatterns();
      setPatterns(response.results || []);
    } catch (err) {
      console.error('Error loading patterns:', err);
      setError('Failed to load patterns. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    navigate('/project/create');
  };

  const handlePatternClick = (patternId: number) => {
    navigate(`/project/pattern/${patternId}`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'outline_extracted':
      case 'pattern_generated':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Projects</h2>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Create
            <span className="text-lg">+</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <button
                onClick={loadPatterns}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading patterns...</p>
            </div>
          </div>
        ) : patterns.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 bg-white rounded-lg p-12 flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              No patterns yet
            </h3>

            <button
              onClick={handleCreateClick}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Create your first pattern
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                onClick={() => handlePatternClick(pattern.id)}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Pattern Image */}
                <div className="aspect-video bg-gray-200 relative">
                  {pattern.outline_image_url ? (
                    <img
                      src={pattern.outline_image_url}
                      alt={pattern.name}
                      className="w-full h-full object-cover"
                    />
                  ) : pattern.original_image_url ? (
                    <img
                      src={pattern.original_image_url}
                      alt={pattern.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(
                        pattern.status
                      )}`}
                    >
                      {pattern.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Pattern Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    {pattern.name}
                  </h3>
                  {pattern.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {pattern.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>ID: {pattern.id}</span>
                    <span>{new Date(pattern.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Usage Counter */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {patterns.length} pattern{patterns.length !== 1 ? 's' : ''} created
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
