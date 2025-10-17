import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Dashboard from './pages/Dashboard';
import CreatePattern from './pages/Project/CreatePattern';
import ProcessingScreen from './pages/Project/ProcessingScreen';
import PatternView from './pages/Project/PatternView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/create" element={<CreatePattern />} />
        <Route path="/project/processing/:id" element={<ProcessingScreen />} />
        <Route path="/project/pattern/:id" element={<PatternView />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Router>
  );
}

export default App;