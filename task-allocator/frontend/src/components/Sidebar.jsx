import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Sidebar({ onLogout, isExpanded, setIsExpanded }) {
  const [showTasks, setShowTasks] = useState(false);
  const [projects, setProjects] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [projectTasks, setProjectTasks] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    loadFavorites();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const tasksByProject = {};
      response.data.forEach(task => {
        const projectId = task.projectId?._id || task.projectId;
        if (!tasksByProject[projectId]) {
          tasksByProject[projectId] = [];
        }
        tasksByProject[projectId].push(task);
      });
      setProjectTasks(tasksByProject);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('favoriteProjects');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const toggleFavorite = (projectId) => {
    let newFavorites = [...favorites];
    if (newFavorites.includes(projectId)) {
      newFavorites = newFavorites.filter(id => id !== projectId);
    } else {
      if (newFavorites.length >= 5) {
        alert('You can only favorite up to 5 projects');
        return;
      }
      newFavorites.push(projectId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteProjects', JSON.stringify(newFavorites));
  };

  const toggleProjectTasks = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const favoriteProjects = projects.filter(p => favorites.includes(p._id));
  const nonFavoriteProjects = projects.filter(p => !favorites.includes(p._id));

  return (
    <>
      {/* Hamburger Menu Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1001,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ width: '24px', height: '3px', background: 'white', borderRadius: '2px' }}></div>
            <div style={{ width: '24px', height: '3px', background: 'white', borderRadius: '2px' }}></div>
            <div style={{ width: '24px', height: '3px', background: 'white', borderRadius: '2px' }}></div>
          </div>
        </button>
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: isExpanded ? 0 : '-280px',
        top: 0,
        width: '280px',
        height: '100vh',
        background: 'linear-gradient(180deg, #1a0033 0%, #2d1b4e 100%)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
        transition: 'left 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Header with Logo */}
        <div style={{
          padding: '25px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            <img 
              src="/minipl-logo.png" 
              alt="Mini PL Logo" 
              style={{
                height: '60px',
                width: 'auto',
                maxWidth: '180px'
              }}
              onError={(e) => {
                // Fallback if image fails to load
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.textContent = 'Mini PL';
                fallback.style.cssText = `
                  color: white;
                  font-size: 1.5rem;
                  font-weight: 700;
                  background: linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #e879f9 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                `;
                e.target.parentElement.appendChild(fallback);
              }}
            />
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              marginLeft: '10px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <NavLink to="/" icon="🏠" label="Home" isActive={isActive('/')} />
          <NavLink to="/profile" icon="👤" label="Profile" isActive={isActive('/profile')} />
          <NavLink to="/calendar" icon="📅" label="Calendar" isActive={isActive('/calendar')} />
          <NavLink to="/files" icon="📁" label="Files" isActive={isActive('/files')} />

          {/* Favorites Section */}
          {favoriteProjects.length > 0 && (
            <>
              <div style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                padding: '20px 20px 10px',
                letterSpacing: '1px'
              }}>
                ⭐ Favorites
              </div>
              {favoriteProjects.map(project => (
                <NavLink
                  key={project._id}
                  to={`/project/${project._id}`}
                  icon="📌"
                  label={project.title}
                  isActive={location.pathname === `/project/${project._id}`}
                  onFavoriteClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(project._id);
                  }}
                  isFavorite={true}
                />
              ))}
            </>
          )}

          {/* Projects Section */}
          {nonFavoriteProjects.length > 0 && (
            <>
              <div style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                padding: '20px 20px 10px',
                letterSpacing: '1px'
              }}>
                📂 Projects
              </div>
              {nonFavoriteProjects.map(project => (
                <NavLink
                  key={project._id}
                  to={`/project/${project._id}`}
                  icon="📋"
                  label={project.title}
                  isActive={location.pathname === `/project/${project._id}`}
                  onFavoriteClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(project._id);
                  }}
                  isFavorite={false}
                />
              ))}
            </>
          )}

          {/* Task Tracker with Projects */}
          <div style={{ marginTop: '10px' }}>
            <div
              onClick={() => setShowTasks(!showTasks)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                color: 'white',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: showTasks ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.background = showTasks ? 'rgba(255,255,255,0.1)' : 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>✅</span>
                <span>Task Tracker</span>
              </div>
              <span style={{ 
                transform: showTasks ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}>
                ▶
              </span>
            </div>

            {showTasks && (
              <div style={{ paddingLeft: '20px' }}>
                {projects.map(project => {
                  const tasks = projectTasks[project._id] || [];
                  const isExpanded = expandedProjects[project._id];
                  
                  return (
                    <div key={project._id} style={{ marginBottom: '8px' }}>
                      <div
                        onClick={() => toggleProjectTasks(project._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          color: 'rgba(255,255,255,0.8)',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          borderRadius: '6px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span style={{ 
                            fontSize: '12px',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }}>
                            ▶
                          </span>
                          <span style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {project.title}
                          </span>
                        </div>
                        <div style={{
                          background: 'rgba(255,255,255,0.2)',
                          borderRadius: '10px',
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          marginLeft: '8px'
                        }}>
                          {tasks.length}
                        </div>
                      </div>

                      {isExpanded && tasks.length > 0 && (
                        <div style={{ paddingLeft: '32px', marginTop: '4px' }}>
                          {tasks.slice(0, 5).map(task => (
                            <Link
                              key={task._id}
                              to={`/project/${project._id}?tab=tasks`}
                              style={{
                                display: 'block',
                                padding: '6px 12px',
                                color: 'rgba(255,255,255,0.7)',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                borderRadius: '4px',
                                marginBottom: '2px',
                                transition: 'all 0.2s',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.05)';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = 'rgba(255,255,255,0.7)';
                              }}
                            >
                              • {task.title}
                            </Link>
                          ))}
                          {tasks.length > 5 && (
                            <div style={{
                              padding: '6px 12px',
                              color: 'rgba(255,255,255,0.5)',
                              fontSize: '0.8rem',
                              fontStyle: 'italic'
                            }}>
                              +{tasks.length - 5} more tasks
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {projects.length === 0 && (
                  <div style={{
                    padding: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.85rem',
                    textAlign: 'center'
                  }}>
                    No projects yet
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Logout Button */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}

function NavLink({ to, icon, label, isActive, onFavoriteClick, isFavorite }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        color: 'white',
        textDecoration: 'none',
        transition: 'background 0.2s',
        background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
        borderLeft: isActive ? '4px solid #a78bfa' : '4px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
        <span style={{ 
          fontSize: '0.95rem', 
          fontWeight: isActive ? '600' : '400',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {label}
        </span>
      </div>
      {onFavoriteClick && (
        <button
          onClick={onFavoriteClick}
          style={{
            background: 'transparent',
            border: 'none',
            color: isFavorite ? '#fbbf24' : 'rgba(255,255,255,0.3)',
            fontSize: '1.1rem',
            cursor: 'pointer',
            padding: '4px',
            flexShrink: 0
          }}
        >
          ⭐
        </button>
      )}
    </Link>
  );
}