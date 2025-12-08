import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function FilesPage({ onLogout }) {
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchFiles();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
      if (response.data.length > 0 && !selectedProject) {
        setSelectedProject(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchFiles = async () => {
    if (!selectedProject) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/files?projectId=${selectedProject}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', selectedProject);

      await axios.post(`${API_URL}/files`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      showNotification('✅ File successfully uploaded!', 'success');
      fetchFiles();
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('❌ Failed to upload file', 'error');
    }
    setUploading(false);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('✅ File deleted successfully', 'success');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      showNotification('❌ Failed to delete file', 'error');
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return '📄';
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap = {
      'pdf': '📕',
      'doc': '📘', 'docx': '📘',
      'xls': '📗', 'xlsx': '📗',
      'ppt': '📙', 'pptx': '📙',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'svg': '🖼️',
      'mp4': '🎥', 'mov': '🎥', 'avi': '🎥',
      'mp3': '🎵', 'wav': '🎵',
      'zip': '📦', 'rar': '📦', '7z': '📦',
      'txt': '📝',
      'js': '💻', 'jsx': '💻', 'ts': '💻', 'tsx': '💻',
      'css': '🎨', 'html': '🌐',
      'json': '📋'
    };
    return iconMap[ext] || '📄';
  };

  return (
    <div style={{ 
      padding: '20px',
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>📁 Files</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Manage and organize your project files
        </p>
      </div>

      {/* Project Selector and Upload */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '1rem',
              outline: 'none',
              background: 'white'
            }}
          >
            <option value="">Select a project...</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            disabled={!selectedProject || uploading}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedProject || uploading}
            style={{
              background: uploading 
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: uploading || !selectedProject ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'transform 0.2s',
              opacity: !selectedProject ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!uploading && selectedProject) e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {uploading ? '⏳ Uploading...' : '⬆️ Upload File'}
          </button>
        </div>
      </div>

      {!selectedProject ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'white',
          borderRadius: '12px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📂</div>
          <h2 style={{ margin: '0 0 10px 0', color: '#374151' }}>No Project Selected</h2>
          <p style={{ margin: 0 }}>Please select a project to view and upload files.</p>
        </div>
      ) : files.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'white',
          borderRadius: '12px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔭</div>
          <h2 style={{ margin: '0 0 10px 0', color: '#374151' }}>No Files Yet</h2>
          <p style={{ margin: '0 0 20px 0' }}>Upload your first file to get started!</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            ⬆️ Upload Your First File
          </button>
        </div>
      ) : (
        <>
          {/* File Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '2px solid #3b82f6'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📊</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e40af' }}>
                {files.length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Files</div>
            </div>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '2px solid #10b981'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>💾</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#059669' }}>
                {(files.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024)).toFixed(2)} MB
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Storage</div>
            </div>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '2px solid #f59e0b'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📑</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#d97706' }}>
                {new Set(files.map(f => f.name?.split('.').pop()?.toLowerCase())).size}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>File Types</div>
            </div>
          </div>

          {/* Files Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {files.map(file => (
              <div
                key={file._id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div style={{ fontSize: '2.5rem' }}>
                    {getFileIcon(file.name)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file._id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '4px'
                    }}
                  >
                    🗑️
                  </button>
                </div>

                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.1rem',
                  color: '#1f2937',
                  wordBreak: 'break-word'
                }}>
                  {file.name || 'Untitled'}
                </h3>

                <div style={{
                  fontSize: '0.85rem',
                  color: '#6b7280',
                  marginBottom: '12px'
                }}>
                  {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                </div>

                <div style={{
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '0.85rem',
                  color: '#6b7280'
                }}>
                  <div>📅 {new Date(file.createdAt).toLocaleDateString()}</div>
                  {file.uploadedBy && (
                    <div>👤 {file.uploadedBy.name || 'Unknown'}</div>
                  )}
                </div>

                <div style={{
                  marginTop: '15px',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => setPreviewFile(file)}
                    style={{
                      flex: 1,
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    👁️ Preview
                  </button>
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    style={{
                      flex: 1,
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div
          onClick={() => setPreviewFile(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>{previewFile.name}</h2>
              <button
                onClick={() => setPreviewFile(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {/(png|jpe?g|gif|webp|bmp|svg)$/i.test(previewFile.url) ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            ) : /(pdf)$/i.test(previewFile.url) ? (
              <iframe
                src={previewFile.url}
                style={{
                  width: '80vw',
                  height: '70vh',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title={previewFile.name}
              />
            ) : (
              <div style={{
                padding: '60px 40px',
                textAlign: 'center',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📄</div>
                <p style={{ fontSize: '1.2rem', color: '#374151', marginBottom: '20px' }}>
                  Preview not available for this file type
                </p>
                <button
                  onClick={() => window.open(previewFile.url, '_blank')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  ⬇️ Download File
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Notification Helper Function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 16px 24px;
    borderRadius: 10px;
    boxShadow: 0 4px 20px rgba(0,0,0,0.25);
    zIndex: 10000;
    fontSize: 1rem;
    fontWeight: 600;
    animation: slideInFromRight 0.3s ease;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInFromRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutToRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutToRight 0.3s ease';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}