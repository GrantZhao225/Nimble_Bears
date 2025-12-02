import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import TaskTrackerPage from './pages/TaskTrackerPage.jsx';
import DMsPage from './pages/DMsPage.jsx';
import FilesPage from './pages/FilesPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication on mount and when location changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      // If on login/signup page, redirect to home
      if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/');
      }
    } else {
      setIsAuthenticated(false);
      // If not on login/signup page, redirect to login
      if (location.pathname !== '/login' && location.pathname !== '/signup') {
        navigate('/login');
      }
    }
  }, [location.pathname, navigate]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/'); 
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login'); 
  };

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
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/project/:projectId" element={<ProjectDetailPage onLogout={handleLogout} />} />
          <Route path="/chat" element={<ChatPage onLogout={handleLogout} />} />
          <Route path="/tasks" element={<TaskTrackerPage onLogout={handleLogout} />} />
          <Route path="/dms" element={<DMsPage onLogout={handleLogout} />} />
          <Route path="/files" element={<FilesPage onLogout={handleLogout} />} />
          <Route path="/login" element={<HomePage onLogout={handleLogout} />} /> 
          <Route path="/signup" element={<HomePage onLogout={handleLogout} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
