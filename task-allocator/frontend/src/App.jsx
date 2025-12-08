import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import TaskTrackerPage from './pages/TaskTrackerPage.jsx';
import FilesPage from './pages/FilesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (location.pathname !== '/login' && location.pathname !== '/signup') {
        navigate('/login', { replace: true });
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/', { replace: true });
      }
    } else {
      if (location.pathname !== '/login' && location.pathname !== '/signup') {
        navigate('/login', { replace: true });
      }
    }
  }, [location.pathname, isAuthenticated, navigate]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/', { replace: true }); 
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login', { replace: true }); 
  };

  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0033 0%, #2d1b4e 25%, #4a2c6d 50%, #6b3d8c 75%, #8b4fab 100%)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          Loading...
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUpPage />} /> 
        <Route path="*" element={<LoginPage onLogin={handleLogin} />} /> 
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        onLogout={handleLogout} 
        isExpanded={sidebarExpanded}
        setIsExpanded={setSidebarExpanded}
      />
      <div style={{ 
        marginLeft: sidebarExpanded ? '280px' : '0',
        flex: 1,
        minHeight: '100vh',
        background: '#f6f8fa',
        transition: 'margin-left 0.3s ease'
      }}>
        <Routes>
          <Route path="/" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/project/:projectId" element={<ProjectDetailPage onLogout={handleLogout} />} />
          <Route path="/tasks" element={<TaskTrackerPage onLogout={handleLogout} />} />
          <Route path="/files" element={<FilesPage onLogout={handleLogout} />} />
          <Route path="/profile" element={<ProfilePage onLogout={handleLogout} />} />
          <Route path="/calendar" element={<CalendarPage onLogout={handleLogout} />} />
          <Route path="/login" element={<HomePage onLogout={handleLogout} />} /> 
          <Route path="/signup" element={<HomePage onLogout={handleLogout} />} />
          <Route path="*" element={<HomePage onLogout={handleLogout} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
