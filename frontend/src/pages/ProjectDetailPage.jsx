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

  // Update currentUser when profile changes (storage event or custom event)
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
      
      // Determine user role in project
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
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading project...</div>;
  }

  if (!project) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Project not found</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Top Bar with User Info */}
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt="avatar"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.15)'
                }}
              />
            ) : (
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
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
              fontSize: '0.9rem'
            }}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
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
                fontSize: '0.9rem'
              }}
            >
              ← Back to Projects
            </button>
            <h1 style={{ margin: 0, fontSize: '2.2rem' }}>{project.title}</h1>
            {project.description && (
              <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
                {project.description}
              </p>
            )}
            <div style={{ marginTop: '15px', display: 'flex', gap: '15px', fontSize: '0.9rem' }}>
              <span>Status: <strong>{project.status}</strong></span>
              {project.dueDate && (
                <span>Due: <strong>{new Date(project.dueDate).toLocaleDateString()}</strong></span>
              )}
              <span>Members: <strong>{project.members?.length || 0}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            background: activeTab === 'chat' ? '#667eea' : 'transparent',
            color: activeTab === 'chat' ? 'white' : '#374151',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            background: activeTab === 'tasks' ? '#667eea' : 'transparent',
            color: activeTab === 'tasks' ? 'white' : '#374151',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          ✅ Tasks
        </button>
        <button
          onClick={() => setActiveTab('files')}
          style={{
            background: activeTab === 'files' ? '#667eea' : 'transparent',
            color: activeTab === 'files' ? 'white' : '#374151',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          📁 Files
        </button>
        <button
          onClick={() => setActiveTab('dms')}
          style={{
            background: activeTab === 'dms' ? '#667eea' : 'transparent',
            color: activeTab === 'dms' ? 'white' : '#374151',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          💌 DMs
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && <ProjectChat projectId={projectId} />}
      {activeTab === 'tasks' && <ProjectTasks projectId={projectId} projectMembers={project.members} />}
      {activeTab === 'files' && <ProjectFiles projectId={projectId} />}
      {activeTab === 'dms' && <ProjectDMs projectId={projectId} projectMembers={project.members} />}
    </div>
  );
}

// Project Chat Component
// Project Chat Component
function ProjectChat({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);

  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleUploadFromChat = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', file);
      form.append('projectId', projectId);
      await axios.post(`${API_URL}/files`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // notify files component to refresh
      window.dispatchEvent(new Event('project:files:updated'));
      alert('File uploaded');
    } catch (err) {
      console.error('Error uploading file from chat:', err);
      alert('Upload failed');
    }
  };

  const [techSpec, setTechSpec] = useState('');
  const [techSpecLoading, setTechSpecLoading] = useState(false);

  const [exportingTasks, setExportingTasks] = useState(false);

  const messagesEndRef = useRef(null);

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
    setShowSummary(true); // make sure sidebar is visible
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
    if (!summary?.extractedTasks || summary.extractedTasks.length === 0) return;

    setExportingTasks(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/chat/export-tasks`, {
        projectId,
        tasks: summary.extractedTasks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error exporting tasks:', error);
      alert('Failed to export tasks.');
    }
    setExportingTasks(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', gap: '20px', minHeight: '600px' }}>
      {/* LEFT: Chat */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ margin: 0 }}>💬 Project Chat</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input ref={fileInputRef} type="file" accept="*/*" style={{ display: 'none' }} onChange={handleUploadFromChat} />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid white',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              📎 Upload
            </button>
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
                fontWeight: 600
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
                fontWeight: 600
              }}
            >
              {techSpecLoading ? '🧩 Generating...' : '🧩 Req → Tech Spec'}
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: '#f9fafb',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
              <p style={{ fontSize: '1.2rem' }}>No messages yet.</p>
              <p>Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser =
                msg.senderId === currentUser?.id || msg.senderId?._id === currentUser?.id;

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
                    <div
                      style={{
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
                      }}
                    >
                      {msg.senderName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: isCurrentUser
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                      background: isCurrentUser
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'white',
                      color: isCurrentUser ? 'white' : '#1f2937',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  >
                    {!isCurrentUser && (
                      <p
                        style={{
                          margin: '0 0 5px 0',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          opacity: 0.9
                        }}
                      >
                        {msg.senderName}
                      </p>
                    )}
                    <p style={{ margin: 0, lineHeight: '1.5' }}>{msg.content}</p>
                    <p
                      style={{
                        margin: '5px 0 0 0',
                        fontSize: '0.75rem',
                        opacity: 0.7,
                        textAlign: isCurrentUser ? 'right' : 'left'
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {isCurrentUser && (
                    <div
                      style={{
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
                      }}
                    >
                      {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
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
            gap: '10px'
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '25px',
              fontSize: '1rem',
              outline: 'none'
            }}
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
              fontWeight: '600'
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* RIGHT: AI Summary + Tech Spec */}
      {showSummary && (
        <div
          style={{
            width: '400px',
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}
          >
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

          {/* Summary block */}
          {summaryLoading ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p>Analyzing conversation...</p>
            </div>
          ) : summary ? (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  background: '#f0f9ff',
                  padding: '15px',
                  borderRadius: '10px',
                  marginBottom: '20px'
                }}
              >
                <h4 style={{ marginTop: 0 }}>📝 Summary</h4>
                <p>{summary.summary}</p>
              </div>

              {summary.extractedTasks && summary.extractedTasks.length > 0 && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}
                  >
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
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}
                    >
                      {exportingTasks ? 'Exporting…' : 'Export to Task Tracker'}
                    </button>
                  </div>

                  {summary.extractedTasks.map((task, index) => (
                    <div
                      key={index}
                      style={{
                        background: '#fef3c7',
                        padding: '15px',
                        borderRadius: '10px',
                        marginBottom: '12px'
                      }}
                    >
                      <strong>{task.title}</strong>
                      {task.description && (
                        <p style={{ margin: '5px 0' }}>{task.description}</p>
                      )}
                      {task.assignedTo && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.85rem',
                            opacity: 0.8
                          }}
                        >
                          👤 Assigned to: {task.assignedTo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Tech spec block */}
          {techSpecLoading && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p>Generating technical specification...</p>
            </div>
          )}

          {techSpec && !techSpecLoading && (
            <div
              style={{
                background: '#eef2ff',
                padding: '15px',
                borderRadius: '10px',
                marginTop: '10px'
              }}
            >
              <h4 style={{ marginTop: 0 }}>🧩 Technical Spec</h4>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '0.9rem',
                  margin: 0
                }}
              >
                {techSpec}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// Project Files Component
function ProjectFiles({ projectId }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

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
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', file);
      form.append('projectId', projectId);
      await axios.post(`${API_URL}/files`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.dispatchEvent(new Event('project:files:updated'));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    }
  };

  const handleDownload = (f) => {
    // assuming API returns url in file record
    if (f.url) window.open(f.url, '_blank');
    else alert('No downloadable URL available');
  };

  // New: delete file handler
  const handleDeleteFile = async (fileId) => {
    if (!fileId) return;
    if (!window.confirm('Delete this file?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // refresh list
      fetchFiles();
      // notify other components just in case
      window.dispatchEvent(new Event('project:files:updated'));
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file');
    }
  };

  return (
    <div style={{ background: 'white', padding: 24, borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Project Files</h3>
        <div>
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
          <button onClick={() => fileInputRef.current?.click()} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Upload File</button>
        </div>
      </div>
      {files.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No files yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {files.map(f => (
            <div key={f._id || f.id} style={{ padding: 12, borderRadius: 8, background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{f.name || f.filename || 'Untitled'}</strong>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{f.size ? `${(f.size/1024).toFixed(1)} KB` : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleDownload(f)} style={{ background: '#e5e7eb', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Download</button>
                <button onClick={() => handleDeleteFile(f._id || f.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
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

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
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
                fontWeight: '600'
              }}
            >
              {status} ({status === 'all' ? tasks.length : tasks.filter(t => t.status === status).length})
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
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              >
                <option value="">Assign To</option>
                {projectMembers?.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
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

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No tasks found. Create your first task!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                    {task.description && <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{task.description}</div>}
                  </td>
                  <td style={{ padding: '15px' }}>
                    {task.assignedTo?.name || <span style={{ color: '#9ca3af' }}>Unassigned</span>}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ background: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#10b981', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                      style={{ background: task.status === 'Completed' ? '#10b981' : task.status === 'In Progress' ? '#3b82f6' : '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td style={{ padding: '15px' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : <span style={{ color: '#9ca3af' }}>No deadline</span>}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
      // refresh conversations list
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
      // send DM with fileId
      const res = await axios.post(`${API_URL}/dms`, {
        projectId,
        recipientId: activeParticipant.id,
        content: `File: ${fileDoc.name}`,
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
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ width: 260, background: 'white', borderRadius: 12, padding: 16 }}>
        <h4 style={{ marginTop: 0 }}>Conversations</h4>
        {loadingConvos ? (
          <div>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {conversations.map(c => (
              <div key={c.participant.id} onClick={() => handleSelectParticipant(c.participant)} style={{ padding: 10, borderRadius: 8, background: activeParticipant?.id === c.participant.id ? '#eef2ff' : '#f9fafb', cursor: 'pointer' }}>
                <div style={{ fontWeight: 600 }}>{c.participant.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{c.lastMessage || 'No messages yet'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, background: 'white', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
        {!activeParticipant ? (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: 60 }}>Select a conversation to start DM</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>{activeParticipant.name}</h3>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{projectMembers?.find(m => m._id === activeParticipant.id)?.email || ''}</div>
              </div>
              <div>
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleUploadAttachment} />
                <button onClick={() => fileInputRef.current?.click()} style={{ background: '#eef2ff', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>📎</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', background: '#f8fafc', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 30 }}>No messages yet.</div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.senderId?._id === (JSON.parse(localStorage.getItem('user') || '{}').id) || m.senderId === (JSON.parse(localStorage.getItem('user') || '{}').id);
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ background: isMe ? '#667eea' : 'white', color: isMe ? 'white' : '#1f2937', padding: 10, borderRadius: 10, maxWidth: '70%' }}>
                        {m.content}
                        {m.fileId && m.fileId.url && (
                          <div style={{ marginTop: 8 }}>
                            <a href={m.fileId.url} target="_blank" rel="noreferrer" style={{ color: isMe ? 'rgba(255,255,255,0.9)' : '#2563eb' }}>Download attachment</a>
                          </div>
                        )}
                        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>{new Date(m.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendDM} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input value={newDM} onChange={(e) => setNewDM(e.target.value)} placeholder={`Message ${activeParticipant.name}`} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <button type="submit" disabled={sending} style={{ background: '#667eea', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8 }}>{sending ? 'Sending…' : 'Send'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

