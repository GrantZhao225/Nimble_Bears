import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function HomePage({ onLogout }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'Upcoming',
    dueDate: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchInvitations();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/invitations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvitations(response.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/projects/${selectedProject._id}/invitations`, {
        inviteeEmail: inviteEmail.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInviteEmail('');
      setShowInviteModal(false);
      alert('Invitation sent!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert(error.response?.data?.error || 'Failed to send invitation');
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/invitations/${invitationId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
      fetchInvitations();
      alert('Invitation accepted!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert(error.response?.data?.error || 'Failed to accept invitation');
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/invitations/${invitationId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewProject({ title: '', description: '', status: 'Upcoming', dueDate: '' });
      setShowNewProject(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return '#3b82f6';
      case 'Upcoming': return '#f59e0b';
      case 'Completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading projects...</div>;
  }

  const inProgressProjects = projects.filter(p => p.status === 'In Progress');
  const upcomingProjects = projects.filter(p => p.status === 'Upcoming');
  const completedProjects = projects.filter(p => p.status === 'Completed');

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '15px',
        marginBottom: '30px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Project Dashboard</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Manage your teams and projects
        </p>
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div style={{
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0, color: '#92400e' }}>📬 Pending Invitations</h2>
          {invitations.map(invitation => (
            <div key={invitation._id} style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{invitation.projectId?.title || invitation.projectTitle}</strong>
                <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '0.9rem' }}>
                  Invited by {invitation.invitedBy?.name || invitation.invitedByName}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleAcceptInvitation(invitation._id)}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectInvitation(invitation._id)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h2>Your Projects</h2>
        <button
          onClick={() => setShowNewProject(!showNewProject)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          ➕ Add New Project
        </button>
      </div>

      {showNewProject && (
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3>Create New Project</h3>
          <form onSubmit={handleCreateProject}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <textarea
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '80px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <select
                value={newProject.status}
                onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <input
                type="date"
                value={newProject.dueDate}
                onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Create Project
              </button>
              <button
                type="button"
                onClick={() => setShowNewProject(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* In Progress Projects */}
      {inProgressProjects.length > 0 && (
        <>
          <h3 style={{ marginBottom: '20px', color: '#3b82f6' }}>In Progress</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {inProgressProjects.map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
                onInvite={(p) => { setSelectedProject(p); setShowInviteModal(true); }}
                statusColor={getStatusColor(project.status)}
                navigate={navigate}
              />
            ))}
          </div>
        </>
      )}

      {/* Upcoming Projects */}
      {upcomingProjects.length > 0 && (
        <>
          <h3 style={{ marginBottom: '20px', color: '#f59e0b' }}>Upcoming</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {upcomingProjects.map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
                onInvite={(p) => { setSelectedProject(p); setShowInviteModal(true); }}
                statusColor={getStatusColor(project.status)}
                navigate={navigate}
              />
            ))}
          </div>
        </>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <>
          <h3 style={{ marginBottom: '20px', color: '#10b981' }}>Completed</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {completedProjects.map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
                onInvite={(p) => { setSelectedProject(p); setShowInviteModal(true); }}
                statusColor={getStatusColor(project.status)}
                navigate={navigate}
              />
            ))}
          </div>
        </>
      )}

      {projects.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: '#f9fafb',
          borderRadius: '12px'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
            No projects yet. Create your first project to get started!
          </p>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && selectedProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2 style={{ marginTop: 0 }}>Invite User to {selectedProject.title}</h2>
            <form onSubmit={handleSendInvitation}>
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  marginBottom: '15px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    flex: 1
                  }}
                >
                  Send Invitation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setSelectedProject(null);
                  }}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onDelete, statusColor, onInvite, navigate }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      border: `3px solid ${statusColor}`
    }}
    onClick={() => navigate(`/project/${project._id}`)}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
      }}>
        <h4 style={{ margin: 0, fontSize: '1.3rem' }}>{project.title}</h4>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInvite(project);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '4px 8px'
            }}
            title="Invite users"
          >
            ➕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project._id);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '4px 8px'
            }}
            title="Delete project"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {project.description && (
        <p style={{
          color: '#6b7280',
          fontSize: '0.95rem',
          marginBottom: '15px',
          lineHeight: '1.5'
        }}>
          {project.description}
        </p>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          background: statusColor,
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          {project.status}
        </span>
        
        {project.dueDate && (
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Due: {new Date(project.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {project.createdBy && (
        <p style={{
          fontSize: '0.85rem',
          color: '#9ca3af',
          marginTop: '10px',
          marginBottom: 0
        }}>
          Created by {project.createdBy.name}
        </p>
      )}
    </div>
  );
}