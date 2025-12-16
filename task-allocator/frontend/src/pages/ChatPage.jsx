import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function ChatPage({ onLogout }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/messages`, {
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
    setLoading(true);
    setShowSummary(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chat/summarize`, {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error summarizing chat:', error);
      setSummary({ error: 'Failed to generate summary' });
    }
    setLoading(false);
  };

  const handleCreateTaskFromExtracted = async (task) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/tasks`, {
        title: task.title,
        description: task.description,
        status: 'Pending'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: '20px' }}>
      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '15px 15px 0 0',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>💬 Team Chat</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              Collaborate with your team
            </p>
          </div>
          <button
            onClick={handleSummarizeChat}
            disabled={loading}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: loading ? 'wait' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = 'rgba(255,255,255,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            {loading ? '🤖 Analyzing...' : '🤖 AI Summary'}
          </button>
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
                      {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{
          padding: '20px',
          background: 'white',
          borderRadius: '0 0 15px 15px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '10px'
        }}>
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

      
      {showSummary && (
        <div style={{
          width: '400px',
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0 }}>🤖 AI Co-Pilot</h2>
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Analyzing conversation...</p>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '20px auto'
              }} />
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
                <h3 style={{ marginTop: 0, color: '#0369a1' }}>📝 Summary</h3>
                <p style={{ lineHeight: '1.6', color: '#374151' }}>
                  {summary.summary}
                </p>
                {summary.messageCount && (
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 0 }}>
                    Based on {summary.messageCount} messages
                  </p>
                )}
              </div>

              {summary.extractedTasks && summary.extractedTasks.length > 0 && (
                <div>
                  <h3>✅ Extracted Tasks</h3>
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
                      <h4 style={{ marginTop: 0, color: '#92400e' }}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p style={{ fontSize: '0.9rem', color: '#78350f', marginBottom: '10px' }}>
                          {task.description}
                        </p>
                      )}
                      {task.assignedTo && task.assignedTo !== 'unassigned' && (
                        <p style={{ fontSize: '0.85rem', color: '#78350f', marginBottom: '10px' }}>
                          👤 Assigned to: {task.assignedTo}
                        </p>
                      )}
                      <button
                        onClick={() => handleCreateTaskFromExtracted(task)}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        + Create Task
                      </button>
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
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
              Click "AI Summary" to analyze the conversation
            </p>
          )}
        </div>
      )}
    </div>
  );
}