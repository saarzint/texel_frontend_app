import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import patternService, { type Pattern } from '../../services/patternService';

interface ProcessingStep {
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

const ProcessingScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { label: 'Analyzing sketch...', status: 'processing' },
    { label: 'Extracting outlines...', status: 'pending' },
    { label: 'Generating pattern pieces...', status: 'pending' },
    { label: 'Creating 3D preview...', status: 'pending' },
  ]);

  useEffect(() => {
    if (!id) {
      navigate('/dashboard');
      return;
    }

    // Start polling for pattern status
    const pollInterval = setInterval(async () => {
      try {
        const response = await patternService.getPattern(parseInt(id));
        const pattern = response.pattern;

        // Update steps based on pattern status
        updateStepsBasedOnStatus(pattern);

        // Check if processing is complete
        if (pattern.status === 'completed') {
          clearInterval(pollInterval);
          // Wait a moment to show completion, then navigate
          setTimeout(() => {
            navigate(`/project/pattern/${id}`);
          }, 1000);
        } else if (pattern.status === 'failed') {
          clearInterval(pollInterval);
          alert(pattern.error_message || 'Pattern processing failed. Please try again.');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error polling pattern status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [id, navigate]);

  const updateStepsBasedOnStatus = (pattern: Pattern) => {
    const newSteps = [...steps];
    let newProgress = 0;

    switch (pattern.status) {
      case 'pending':
        newSteps[0].status = 'processing';
        newProgress = 10;
        break;
      case 'processing':
        newSteps[0].status = 'completed';
        newSteps[1].status = 'processing';
        newProgress = 30;
        break;
      case 'outline_extracted':
        newSteps[0].status = 'completed';
        newSteps[1].status = 'completed';
        newSteps[2].status = 'processing';
        newProgress = 60;
        break;
      case 'pattern_generated':
        newSteps[0].status = 'completed';
        newSteps[1].status = 'completed';
        newSteps[2].status = 'completed';
        newSteps[3].status = 'processing';
        newProgress = 85;
        break;
      case 'completed':
        newSteps.forEach((step) => (step.status = 'completed'));
        newProgress = 100;
        break;
    }

    setSteps(newSteps);
    setProgress(newProgress);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white rounded-lg shadow-lg p-12">
          {/* Spinner */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32">
              <svg className="animate-spin" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#000000"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - progress / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                  style={{
                    transformOrigin: 'center',
                    transform: 'rotate(-90deg)',
                  }}
                />
              </svg>
            </div>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Processing Your Design
          </h2>
          <p className="text-center text-gray-600 mb-8">This may take 30-60 seconds</p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Animated stripes */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                  style={{
                    backgroundSize: '30px 100%',
                    animation: 'shimmer 1s infinite linear',
                  }}
                />
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">{progress}%</p>
          </div>

          {/* Processing Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* Status Icon */}
                <div className="flex-shrink-0 w-5 h-5">
                  {step.status === 'completed' ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : step.status === 'processing' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-base ${
                    step.status === 'completed'
                      ? 'text-gray-900 line-through'
                      : step.status === 'processing'
                      ? 'text-yellow-600 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Info Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Please don't close this window. You'll be redirected automatically when
              processing is complete.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default ProcessingScreen;
