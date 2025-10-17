import { useEffect, useState } from 'react';
import type { Pattern2DData } from '../services/patternService';

interface Pattern2DViewerProps {
  data: Pattern2DData;
  svgUrl?: string;
}

const Pattern2DViewer = ({ data, svgUrl }: Pattern2DViewerProps) => {
  const [scale, setScale] = useState(1);

  // Debug: Log data when component mounts or data changes
  useEffect(() => {
    console.log('=== Pattern2DViewer Data ===');
    console.log('Data object:', data);
    console.log('SVG URL:', svgUrl);
    console.log('Points count:', data?.points?.length || 0);
    console.log('Segments count:', data?.segments?.length || 0);
  }, [data, svgUrl]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));
  const handleReset = () => setScale(1);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-800">2D Pattern View</div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="text-sm min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 ml-2"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Pattern Info */}
      <div className="bg-gray-50 border-b px-4 py-2 text-sm text-gray-700">
        <span className="mr-4">Points: {data.points.length}</span>
        <span className="mr-4">Segments: {data.segments.length}</span>
        <span className="mr-4">Perimeter: {data.total_perimeter.toFixed(2)} px</span>
        <span>Area: {data.area.toFixed(2)} px²</span>
      </div>

      {/* Viewer */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="flex items-center justify-center h-full">
          {svgUrl ? (
            <img
              src={svgUrl}
              alt="2D Pattern"
              style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
              className="max-w-full max-h-full"
            />
          ) : (
            <div className="text-gray-500">No pattern data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pattern2DViewer;
