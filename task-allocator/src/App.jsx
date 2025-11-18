import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import TaskTrackerPage from './pages/TaskTrackerPage.jsx';
import DMsPage from './pages/DMsPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import FilesPage from './pages/FilesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx'; 
import Sidebar from './components/Sidebar.jsx'; 
import './styles/App.css'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/'); 
  };
  
  const handleLogout = () => {
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button onClick={handleLogout}>Log Out</button>
        </div>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TaskTrackerPage />} />
          <Route path="/dms" element={<DMsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/login" element={<HomePage />} /> 
          <Route path="/signup" element={<HomePage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
