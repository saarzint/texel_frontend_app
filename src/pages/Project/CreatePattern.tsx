import { useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import patternService from '../../services/patternService';

const CreatePattern = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [patternName, setPatternName] = useState('');
  const [textDescription, setTextDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedFileTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => acceptedFileTypes.includes(file.type));

    if (validFiles.length > 0) {
      setUploadedFile(validFiles[0]);
      console.log('Valid file dropped:', validFiles[0]);
    } else {
      alert('Please upload only PNG, JPG, JPEG, or PDF files');
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (acceptedFileTypes.includes(file.type)) {
        setUploadedFile(file);
        console.log('Valid file selected:', file);
      } else {
        alert('Please upload only PNG, JPG, JPEG, or PDF files');
      }
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextDescription(e.target.value);
  };

  const handleGenerate = async () => {
    // Validation
    if (!uploadedFile) {
      setError('Please upload an image file');
      return;
    }

    if (!patternName.trim()) {
      setError('Please provide a pattern name');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('name', patternName.trim());
      formData.append('description', textDescription.trim() || '');
      formData.append('original_image', uploadedFile);

      // Upload pattern
      const response = await patternService.createPattern(formData);

      if (response.success && response.pattern) {
        // Navigate to processing screen
        navigate(`/project/processing/${response.pattern.id}`);
      } else {
        setError('Failed to create pattern. Please try again.');
      }
    } catch (err) {
      console.error('Error creating pattern:', err);
      setError(err instanceof Error ? err.message : 'Failed to create pattern. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create New Pattern</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Pattern Name Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Pattern Name</h3>
          <input
            type="text"
            value={patternName}
            onChange={(e) => setPatternName(e.target.value)}
            placeholder="Enter a name for your pattern (e.g., Summer Dress Pattern)"
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
            disabled={isUploading}
          />
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Your Sketch</h3>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center min-h-[250px] transition-colors
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
            `}
          >
            {uploadedFile ? (
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
                <label htmlFor="file-upload">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                    Change File
                  </span>
                </label>
              </div>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-700 mb-3">Upload Your Sketch</p>
                <p className="text-sm text-gray-500 mb-2">Support hand drawn sketches & digital designs</p>
                <p className="text-lg font-semibold text-gray-900 mb-4">or</p>

                <label htmlFor="file-upload">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="bg-white border-2 border-gray-900 text-gray-900 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer inline-block font-medium">
                    Browse Files
                  </span>
                </label>

                <p className="text-xs text-gray-400 mt-4">
                  Supports: JPG, PNG, PDF
                </p>
              </>
            )}
          </div>
        </div>

        {/* Text Description Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Description (Optional)</h3>

          <textarea
            value={textDescription}
            onChange={handleTextChange}
            placeholder='Additional details: e.g., "A-line midi dress with short sleeves, pleated skirt"'
            className="w-full min-h-[150px] p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-gray-900"
            disabled={isUploading}
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleGenerate}
            disabled={isUploading || !uploadedFile || !patternName.trim()}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              'Generate Pattern'
            )}
          </button>
        </div>

        {/* Usage Counter */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            FREE: 0/2 projects used |
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer ml-1">
              Upgrade to Premium for unlimited
            </span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default CreatePattern;
