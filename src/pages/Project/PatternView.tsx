import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Pattern2DViewer from '../../components/Pattern2DViewer';
import Pattern3DViewer from '../../components/Pattern3DViewer';
import patternService, { type Pattern } from '../../services/patternService';

const PatternView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'2d' | '3d'>('3d');

  // Size options state
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedSize, setSelectedSize] = useState('M');

  useEffect(() => {
    if (id) {
      loadPattern(parseInt(id));
    }
  }, [id]);

  const loadPattern = async (patternId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await patternService.getPattern(patternId);
      setPattern(response.pattern);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pattern');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDXF = async () => {
    if (!pattern) return;
    try {
      const { file_url } = await patternService.downloadDXF(pattern.id);
      window.open(file_url, '_blank');
    } catch (err) {
      alert('Failed to download DXF file');
    }
  };

  const handleDownloadPDF = async () => {
    if (!pattern) return;
    try {
      const { file_url } = await patternService.downloadPDF(pattern.id);
      window.open(file_url, '_blank');
    } catch (err) {
      alert('Failed to download PDF file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pattern...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pattern) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Pattern not found'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdatePattern = async () => {
    if (!pattern) return;

    try {
      setLoading(true);
      await patternService.updatePattern(pattern.id, {
        region: selectedRegion,
        size: selectedSize,
      });

      // Reload pattern to get updated data
      await loadPattern(pattern.id);
      alert('Pattern updated successfully!');
    } catch (err) {
      console.error('Error updating pattern:', err);
      alert(err instanceof Error ? err.message : 'Failed to update pattern');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Pattern Viewer */}
        <div className="flex-1 flex flex-col">
          {/* View Toggle */}
          <div className="bg-white border-b px-6 py-4 flex items-center">
            {/* 3D/2D Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">3D</span>
              <button
                onClick={() => setActiveView(activeView === '3d' ? '2d' : '3d')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${activeView === '2d' ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${activeView === '2d' ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">2D</span>
            </div>
          </div>

          {/* Pattern Viewer */}
          <div className="flex-1 overflow-hidden bg-gray-100">
            {activeView === '2d' && pattern.pattern_2d_data ? (
              <Pattern2DViewer
                data={pattern.pattern_2d_data}
                svgUrl={pattern.pattern_2d_svg_url}
              />
            ) : activeView === '3d' && pattern.pattern_3d_data ? (
              <Pattern3DViewer
                data={pattern.pattern_3d_data}
                textureUrl={pattern.pattern_2d_svg_url}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  {activeView === '2d' ? '2D' : '3D'} pattern data not available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Size Options Panel */}
        <div className="w-full lg:w-96 bg-white border-l flex flex-col">
          {/* Action Buttons */}
          <div className="px-6 py-4 border-b flex gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-5 py-2.5 bg-white border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
            >
              Save
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!pattern.pdf_file_url}
              className="flex-1 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:bg-gray-400"
            >
              Export
            </button>
          </div>
          {/* Panel Header */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Size Options</h2>
          </div>

          {/* Panel Content */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            {/* Region Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              >
                <option value="EU">EU</option>
                <option value="US">US</option>
                <option value="Asia">Asia</option>
                <option value="Africa">Africa</option>
              </select>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdatePattern}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              Update Pattern
            </button>

            {/* Premium Section */}
            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-orange-500 text-lg">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Premium Lite</h3>
                  <p className="text-xs text-gray-600 mt-1">Custom measurements</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-white border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-medium text-sm">
                Upgrade
              </button>
            </div>

            {/* Pattern Info */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Pattern Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{pattern.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize font-medium text-gray-900">
                    {pattern.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(pattern.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatternView;
