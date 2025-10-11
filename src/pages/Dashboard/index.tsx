import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects] = useState<any[]>([]); // Empty array for now

  const handleCreateClick = () => {
    navigate('/project/create');
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

        {/* Projects Section */}
        {projects.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 bg-white rounded-lg p-12 flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              No projects yet
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
            {/* TODO: Render projects grid */}
          </div>
        )}

        {/* Usage Counter */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">FREE: 0/2 projects used</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
