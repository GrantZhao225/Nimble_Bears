import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function ProjectDetailPage({ onLogout }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [project, setProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const handleUserUpdate = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(user);
    };
    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('user:updated', handleUserUpdate);
    return () => {
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('user:updated', handleUserUpdate);
    };
  }, []);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(response.data);
      
      if (response.data.createdBy?._id === user.id) {
        setUserRole('Creator');
      } else if (response.data.members?.some(m => m._id === user.id)) {
        setUserRole('Member');
      } else {
        setUserRole('Member');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        alert('Project not found or access denied');
        navigate('/');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#6b7280'
      }}>
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Project not found</div>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px 20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid rgba(102, 126, 234, 0.3)'
          }}>
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt="avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1f2937' }}>
              {currentUser?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              {userRole} • {project?.title}
            </div>
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#dc2626'}
            onMouseLeave={(e) => e.target.style.background = '#ef4444'}
          >
            Log Out
          </button>
        )}
      </div>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '20px',
        color: 'white'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '15px',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          ← Back to Projects
        </button>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>{project.title}</h1>
        {project.description && (
          <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
            {project.description}
          </p>
        )}
        <div style={{ marginTop: '15px', display: 'flex', gap: '15px', fontSize: '0.9rem', flexWrap: 'wrap' }}>
          <span>Status: <strong>{project.status}</strong></span>
          {project.dueDate && (
            <span>Due: <strong>{new Date(project.dueDate).toLocaleDateString()}</strong></span>
          )}
          <span>Members: <strong>{project.members?.length || 0}</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #e5e7eb',
        overflowX: 'auto'
      }}>
        {['chat', 'tasks', 'files', 'dms', 'calendar'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#667eea' : 'transparent',
              color: activeTab === tab ? 'white' : '#374151',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab === 'chat' && '💬 Chat'}
            {tab === 'tasks' && '✅ Tasks'}
            {tab === 'files' && '📁 Files'}
            {tab === 'dms' && '💌 DMs'}
            {tab === 'calendar' && '📅 Calendar'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '500px' }}>
        {activeTab === 'chat' && <ProjectChat projectId={projectId} />}
        {activeTab === 'tasks' && <ProjectTasks projectId={projectId} projectMembers={project.members} />}
        {activeTab === 'files' && <ProjectFiles projectId={projectId} />}
        {activeTab === 'dms' && <ProjectDMs projectId={projectId} projectMembers={project.members} />}
        {activeTab === 'calendar' && <ProjectCalendar projectId={projectId} />}
      </div>
    </div>
  );
}

// Project Chat Component
function ProjectChat({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [techSpec, setTechSpec] = useState('');
  const [techSpecLoading, setTechSpecLoading] = useState(false);
  const [exportingTasks, setExportingTasks] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [projectId]);


  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/messages?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/messages`, {
        projectId,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUploadFromChat = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', file);
      form.append('projectId', projectId);
      
      const uploadRes = await axios.post(`${API_URL}/files`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fileDoc = uploadRes.data;

      await axios.post(`${API_URL}/messages`, {
        projectId,
        content: `📎 Uploaded file: ${fileDoc.name}`,
        fileId: fileDoc._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      window.dispatchEvent(new Event('project:files:updated'));
      fetchMessages();
    } catch (err) {
      console.error('Error uploading file from chat:', err);
      alert('Upload failed');
    }
  };

  const handleSummarizeChat = async () => {
    setSummaryLoading(true);
    setShowSummary(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chat/summarize`, {
        projectId,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error summarizing chat:', error);
      setSummary({ error: 'Failed to generate summary' });
    }
    setSummaryLoading(false);
  };

  const handleGenerateTechSpec = async () => {
    setTechSpecLoading(true);
    setShowSummary(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chat/tech-spec`, {
        projectId,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechSpec(response.data.techSpec || 'No tech spec generated.');
    } catch (error) {
      console.error('Error generating tech spec:', error);
      setTechSpec('Failed to generate technical specification.');
    }
    setTechSpecLoading(false);
  };

  const handleExportTasks = async () => {
    if (!summary?.extractedTasks || summary.extractedTasks.length === 0) {
      alert('No tasks to export');
      return;
    }

    setExportingTasks(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/chat/export-tasks`, {
        projectId,
        tasks: summary.extractedTasks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Tasks exported successfully!');
    } catch (error) {
      console.error('Error exporting tasks:', error);
      alert('Failed to export tasks.');
    }
    setExportingTasks(false);
  };


  return (
    <div style={{ display: 'flex', gap: '20px', minHeight: '600px' }}>
      {/* Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h2 style={{ margin: 0 }}>💬 Project Chat</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              ref={fileInputRef} 
              type="file" 
              style={{ display: 'none' }} 
              onChange={handleUploadFromChat} 
            />
            <button
              onClick={handleSummarizeChat}
              disabled={summaryLoading}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid white',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: summaryLoading ? 'wait' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              {summaryLoading ? '🤖 Analyzing...' : '🤖 AI Summary'}
            </button>
            <button
              onClick={handleGenerateTechSpec}
              disabled={techSpecLoading}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid white',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: techSpecLoading ? 'wait' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              {techSpecLoading ? '🧩 Generating...' : '🧩 Tech Spec'}
            </button>
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '1.2rem' }}>No messages yet.</p>
              <p>Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === currentUser?.id || msg.senderId?._id === currentUser?.id;
              const attachment = msg.fileId?.url ? msg.fileId : msg.file || (msg.fileUrl ? { url: msg.fileUrl, name: msg.fileName } : null);

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  {!isCurrentUser && (
                    <div style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {msg.senderName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: isCurrentUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isCurrentUser 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'white',
                    color: isCurrentUser ? 'white' : '#1f2937',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    {!isCurrentUser && (
                      <p style={{
                        margin: '0 0 5px 0',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        opacity: 0.9
                      }}>
                        {msg.senderName}
                      </p>
                    )}
                    <p style={{ margin: 0, lineHeight: '1.5' }}>{msg.content}</p>

                    {attachment && (
                      <div style={{ marginTop: 8 }}>
                        {/(png|jpe?g|gif|webp|bmp|svg)$/i.test(attachment.url) ? (
                          <a href={attachment.url} target="_blank" rel="noreferrer">
                            <img 
                              src={attachment.url} 
                              alt={attachment.name || 'attachment'} 
                              style={{ 
                                maxWidth: '320px', 
                                borderRadius: 8, 
                                display: 'block', 
                                cursor: 'pointer' 
                              }} 
                            />
                          </a>
                        ) : (
                          <a 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ 
                              color: isCurrentUser ? 'rgba(255,255,255,0.95)' : '#2563eb', 
                              textDecoration: 'underline' 
                            }}
                          >
                            {attachment.name || 'Download file'}
                          </a>
                        )}
                      </div>
                    )}

                    <p style={{
                      margin: '5px 0 0 0',
                      fontSize: '0.75rem',
                      opacity: 0.7,
                      textAlign: isCurrentUser ? 'right' : 'left'
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {isCurrentUser && (
                    <div style={{ width: '35px', height: '35px', flexShrink: 0 }}>
                      {currentUser?.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt="avatar"
                          style={{
                            width: '35px',
                            height: '35px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(102, 126, 234, 0.3)'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '35px',
                          height: '35px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}>
                          {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '20px',
            background: 'white',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <input 
            ref={fileInputRef} 
            type="file" 
            style={{ display: 'none' }} 
            onChange={handleUploadFromChat} 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'rgba(102, 126, 234, 0.1)',
              border: '2px solid #667eea',
              color: '#667eea',
              padding: '12px 16px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(102, 126, 234, 0.1)';
              e.target.style.color = '#667eea';
            }}
          >
            📎 Attach
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '25px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Send
          </button>
        </form>
      </div>

      {/* AI Sidebar */}
      {showSummary && (
        <div style={{
          width: '400px',
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          overflowY: 'auto',
          maxHeight: '80vh'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0 }}>🤖 AI Insights</h3>
            <button
              onClick={() => setShowSummary(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ✕
            </button>
          </div>

          {summaryLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }} />
              <p>Analyzing conversation...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : summary ? (
            <>
              <div style={{
                background: '#f0f9ff',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid #bae6fd'
              }}>
                <h4 style={{ marginTop: 0, color: '#0369a1' }}>📝 Summary</h4>
                <p style={{ lineHeight: '1.6', color: '#374151', margin: '0 0 10px 0' }}>
                  {summary.summary}
                </p>
                {summary.messageCount && (
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                    Based on {summary.messageCount} messages
                  </p>
                )}
              </div>

              {summary.extractedTasks && summary.extractedTasks.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ margin: 0 }}>✅ Extracted Tasks</h4>
                    <button
                      onClick={handleExportTasks}
                      disabled={exportingTasks}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: exportingTasks ? 'wait' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      {exportingTasks ? 'Exporting...' : 'Export All'}
                    </button>
                  </div>

                  {summary.extractedTasks.map((task, index) => (
                    <div
                      key={index}
                      style={{
                        background: '#fef3c7',
                        padding: '15px',
                        borderRadius: '10px',
                        marginBottom: '12px',
                        border: '1px solid #fcd34d'
                      }}
                    >
                      <h5 style={{ marginTop: 0, color: '#92400e' }}>
                        {task.title}
                      </h5>
                      {task.description && (
                        <p style={{ fontSize: '0.9rem', color: '#78350f', margin: '5px 0 10px 0' }}>
                          {task.description}
                        </p>
                      )}
                      {task.assignedTo && task.assignedTo !== 'unassigned' && (
                        <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0 }}>
                          👤 Assigned to: {task.assignedTo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {summary.error && (
                <div style={{
                  background: '#fee2e2',
                  padding: '15px',
                  borderRadius: '10px',
                  color: '#991b1b'
                }}>
                  {summary.error}
                </div>
              )}
            </>
          ) : null}

          {/* Tech Spec Section */}
          {techSpecLoading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }} />
              <p>Generating technical specification...</p>
            </div>
          )}

          {techSpec && !techSpecLoading && (
            <div style={{
              background: '#eef2ff',
              padding: '15px',
              borderRadius: '10px',
              marginTop: '10px'
            }}>
              <h4 style={{ marginTop: 0, color: '#4338ca' }}>🧩 Technical Spec</h4>
              <pre style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '0.9rem',
                margin: 0,
                lineHeight: '1.6'
              }}>
                {techSpec}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Project Tasks Component
function ProjectTasks({ projectId, projectMembers }) {
  const [tasks, setTasks] = useState([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: ''
  });
  const [filter, setFilter] = useState('all');
  const [editDueDates, setEditDueDates] = useState({});

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/tasks`, {
        ...newTask,
        projectId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        status: 'Pending',
        priority: 'Medium',
        dueDate: ''
      });
      setShowNewTask(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/tasks/${taskId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prev => prev.map(t => (t._id === taskId ? { ...t, ...updates } : t)));
    } catch (error) {
      console.error('Error updating task:', error);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDueDateInput = (taskId, value) => {
    setEditDueDates(prev => ({ ...prev, [taskId]: value }));
  };

  const handleDueDateBlur = (taskId) => {
    const val = editDueDates[taskId];
    handleUpdateTask(taskId, { dueDate: val && val.length > 0 ? val : null });
    setEditDueDates(prev => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['all', 'Pending', 'In Progress', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                background: filter === status ? '#667eea' : '#e5e7eb',
                color: filter === status ? 'white' : '#374151',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              {status === 'all' ? `All (${tasks.length})` : `${status} (${tasks.filter(t => t.status === status).length})`}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNewTask(!showNewTask)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ➕ New Task
        </button>
      </div>

      {showNewTask && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3>Create New Task</h3>
          <form onSubmit={handleCreateTask}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '80px' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              >
                <option value="">Assign To</option>
                {projectMembers?.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                Create
              </button>
              <button type="button" onClick={() => setShowNewTask(false)} style={{ background: '#6b7280', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No tasks found. Create your first task!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Task</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Assigned To</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Priority</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Due Date</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600' }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>{task.description}</div>}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <select
                        value={task.assignedTo?._id || task.assignedTo || ''}
                        onChange={(e) => handleUpdateTask(task._id, { assignedTo: e.target.value || null })}
                        style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.9rem' }}
                      >
                        <option value="">Unassigned</option>
                        {projectMembers?.map(member => (
                          <option key={member._id} value={member._id}>{member.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <select
                        value={task.priority}
                        onChange={(e) => handleUpdateTask(task._id, { priority: e.target.value })}
                        style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.9rem' }}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTask(task._id, { status: e.target.value })}
                        style={{ 
                          background: task.status === 'Completed' ? '#10b981' : task.status === 'In Progress' ? '#3b82f6' : '#f59e0b', 
                          color: 'white', 
                          border: 'none', 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <input
                        type="date"
                        value={editDueDates[task._id] !== undefined ? editDueDates[task._id] : (task.dueDate ? (typeof task.dueDate === 'string' && task.dueDate.length >= 10 ? task.dueDate.slice(0,10) : new Date(task.dueDate).toISOString().slice(0,10)) : '')}
                        onChange={(e) => handleDueDateInput(task._id, e.target.value)}
                        onBlur={() => handleDueDateBlur(task._id)}
                        style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.9rem' }}
                      />
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
// Project Files Component
function ProjectFiles({ projectId }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/files?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data || []);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
    const onUpdated = () => fetchFiles();
    window.addEventListener('project:files:updated', onUpdated);
    return () => window.removeEventListener('project:files:updated', onUpdated);
  }, [projectId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', file);
      form.append('projectId', projectId);
      await axios.post(`${API_URL}/files`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.dispatchEvent(new Event('project:files:updated'));
      e.target.value = '';
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    }
    setUploading(false);
  };

  const handleDeleteFile = async (fileId) => {
    if (!fileId || !window.confirm('Delete this file?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFiles();
      window.dispatchEvent(new Event('project:files:updated'));
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file');
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return '📄';
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap = {
      'pdf': '📕', 'doc': '📘', 'docx': '📘', 'xls': '📗', 'xlsx': '📗',
      'ppt': '📙', 'pptx': '📙', 'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 
      'gif': '🖼️', 'svg': '🖼️', 'mp4': '🎥', 'mov': '🎥', 'avi': '🎥',
      'mp3': '🎵', 'wav': '🎵', 'zip': '📦', 'rar': '📦', '7z': '📦',
      'txt': '📝', 'js': '💻', 'jsx': '💻', 'ts': '💻', 'tsx': '💻',
      'css': '🎨', 'html': '🌐', 'json': '📋'
    };
    return iconMap[ext] || '📄';
  };

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h3 style={{ margin: 0 }}>Project Files</h3>
        <div>
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            style={{ 
              background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '8px', 
              cursor: uploading ? 'wait' : 'pointer',
              fontWeight: '600'
            }}
          >
            {uploading ? '⏳ Uploading...' : '⬆️ Upload File'}
          </button>
        </div>
      </div>
      
      {files.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📁</div>
          <p style={{ fontSize: '1.1rem', margin: '0 0 10px 0' }}>No files yet</p>
          <p style={{ margin: 0 }}>Upload your first file to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {files.map(f => (
            <div key={f._id || f.id} style={{ 
              padding: '15px', 
              borderRadius: '8px', 
              background: '#f9fafb', 
              border: '1px solid #e5e7eb',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ fontSize: '2rem' }}>{getFileIcon(f.name)}</div>
                <button 
                  onClick={() => handleDeleteFile(f._id || f.id)} 
                  style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  🗑️
                </button>
              </div>
              <div style={{ fontWeight: '600', marginBottom: '5px', wordBreak: 'break-word' }}>{f.name || f.filename || 'Untitled'}</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '10px' }}>
                {f.size ? `${(f.size/1024).toFixed(1)} KB` : 'Unknown size'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '10px' }}>
                {new Date(f.createdAt).toLocaleDateString()}
              </div>
              <button 
                onClick={() => window.open(f.url, '_blank')} 
                style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
              >
                ⬇️ Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Project DMs Component
function ProjectDMs({ projectId, projectMembers }) {
  const [conversations, setConversations] = useState([]);
  const [activeParticipant, setActiveParticipant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newDM, setNewDM] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/dms/conversations?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data || []);
      setLoadingConvos(false);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setLoadingConvos(false);
    }
  };

  const fetchMessagesFor = async (participantId) => {
    if (!participantId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/dms?projectId=${projectId}&participantId=${participantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error('Error fetching DMs:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [projectId]);

  useEffect(() => {
    let interval;
    if (activeParticipant) {
      fetchMessagesFor(activeParticipant.id);
      interval = setInterval(() => fetchMessagesFor(activeParticipant.id), 2000);
    }
    return () => clearInterval(interval);
  }, [activeParticipant]);

  const handleSelectParticipant = (p) => {
    setActiveParticipant(p);
    setNewDM('');
  };

  const handleSendDM = async (e) => {
    e?.preventDefault();
    if (!activeParticipant || !newDM.trim()) return;
    
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/dms`, {
        projectId,
        recipientId: activeParticipant.id,
        content: newDM.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, res.data]);
      setNewDM('');
      fetchConversations();
    } catch (err) {
      console.error('Error sending DM:', err);
      alert('Failed to send message');
    }
    setSending(false);
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeParticipant) return;
    
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', file);
      form.append('projectId', projectId);
      const upload = await axios.post(`${API_URL}/files`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fileDoc = upload.data;
      
      const res = await axios.post(`${API_URL}/dms`, {
        projectId,
        recipientId: activeParticipant.id,
        content: `📎 File: ${fileDoc.name}`,
        fileId: fileDoc._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, res.data]);
      fetchConversations();
    } catch (err) {
      console.error('Error uploading attachment:', err);
      alert('Upload failed');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', minHeight: '600px' }}>
      {/* Conversations List */}
      <div style={{ width: '280px', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h4 style={{ marginTop: 0 }}>Conversations</h4>
        {loadingConvos ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '0.9rem' }}>
                No conversations yet
              </div>
            ) : (
              conversations.map(c => (
                <div 
                  key={c.participant.id} 
                  onClick={() => handleSelectParticipant(c.participant)} 
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    background: activeParticipant?.id === c.participant.id ? '#eef2ff' : '#f9fafb', 
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeParticipant?.id !== c.participant.id) e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    if (activeParticipant?.id !== c.participant.id) e.currentTarget.style.background = '#f9fafb';
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{c.participant.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.lastMessage || 'No messages yet'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '400px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {!activeParticipant ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e5e7eb' }}>
              <div>
                <h3 style={{ margin: 0 }}>{activeParticipant.name}</h3>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {projectMembers?.find(m => m._id === activeParticipant.id)?.email || ''}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', background: '#f8fafc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '30px' }}>No messages yet.</div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.senderId?._id === (JSON.parse(localStorage.getItem('user') || '{}').id) || m.senderId === (JSON.parse(localStorage.getItem('user') || '{}').id);
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ 
                        background: isMe ? '#667eea' : 'white', 
                        color: isMe ? 'white' : '#1f2937', 
                        padding: '10px 14px', 
                        borderRadius: '10px', 
                        maxWidth: '70%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        {m.content}
                        {m.fileId && m.fileId.url && (
                          <div style={{ marginTop: '8px' }}>
                            <a 
                              href={m.fileId.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ color: isMe ? 'rgba(255,255,255,0.9)' : '#2563eb', textDecoration: 'underline' }}
                            >
                              Download attachment
                            </a>
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '6px' }}>
                          {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendDM} style={{ display: 'flex', gap: '10px' }}>
              <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleUploadAttachment} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '2px solid #667eea',
                  color: '#667eea',
                  padding: '12px 16px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.target.style.color = '#667eea';
                }}
              >
                📎
              </button>
              <input 
                value={newDM} 
                onChange={(e) => setNewDM(e.target.value)} 
                placeholder={`Message ${activeParticipant.name}`} 
                style={{ 
                  flex: 1, 
                  padding: '12px 16px', 
                  borderRadius: '25px', 
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  outline: 'none'
                }} 
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button 
                type="submit" 
                disabled={sending} 
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: '25px',
                  cursor: sending ? 'wait' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Project Calendar Component
function ProjectCalendar({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <button onClick={previousMonth}
          style={{ background: '#667eea', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
          ← Previous
        </button>
        <h2 style={{ margin: 0, color: '#1f2937' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={nextMonth}
          style={{ background: '#667eea', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
          Next →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px' }}>
        {dayNames.map(day => (
          <div key={day} style={{ textAlign: 'center', fontWeight: '600', color: '#6b7280', padding: '10px' }}>{day}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
        {days.map((date, index) => {
          const dayTasks = date ? getTasksForDate(date) : [];
          const isToday = date && date.toDateString() === new Date().toDateString();

          return (
            <div key={index} style={{
              minHeight: '120px',
              padding: '10px',
              borderRadius: '8px',
              background: date ? '#f9fafb' : 'transparent',
              border: isToday ? '2px solid #667eea' : '1px solid #e5e7eb',
              cursor: date ? 'pointer' : 'default'
            }}>
              {date && (
                <>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>{date.getDate()}</div>
                  {dayTasks.map(task => (
                    <div key={task._id} 
                      onClick={() => setSelectedTask(task)}
                      style={{
                        background: task.status === 'Completed' ? '#d1fae5' : task.status === 'In Progress' ? '#dbeafe' : '#fef3c7',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div onClick={() => setSelectedTask(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>{selectedTask.title}</h3>
              <button onClick={() => setSelectedTask(null)} style={{
                background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280'
              }}>✕</button>
            </div>
            {selectedTask.description && <p style={{ marginBottom: '15px', color: '#374151' }}>{selectedTask.description}</p>}
            <div style={{ display: 'grid', gap: '10px' }}>
              <div><strong>Status:</strong> <span style={{
                background: selectedTask.status === 'Completed' ? '#10b981' : selectedTask.status === 'In Progress' ? '#3b82f6' : '#f59e0b',
                color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600'
              }}>{selectedTask.status}</span></div>
              <div><strong>Priority:</strong> <span style={{
                background: selectedTask.priority === 'High' ? '#ef4444' : selectedTask.priority === 'Medium' ? '#f59e0b' : '#10b981',
                color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600'
              }}>{selectedTask.priority}</span></div>
              {selectedTask.assignedTo && <div><strong>Assigned to:</strong> {selectedTask.assignedTo.name}</div>}
              {selectedTask.dueDate && <div><strong>Due:</strong> {new Date(selectedTask.dueDate).toLocaleDateString()}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}