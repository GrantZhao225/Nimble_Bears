import React, { useState } from 'react';

export default function FilesPage({ onLogout }) {
  const [files, setFiles] = useState([
    { id: 1, name: 'Project Proposal.pdf', size: '2.4 MB', type: 'PDF', uploadedBy: 'John Doe', date: '2024-11-28' },
    { id: 2, name: 'Design Mockups.fig', size: '8.1 MB', type: 'Figma', uploadedBy: 'Jane Smith', date: '2024-11-27' },
    { id: 3, name: 'Meeting Notes.docx', size: '156 KB', type: 'Document', uploadedBy: 'Bob Wilson', date: '2024-11-26' },
    { id: 4, name: 'Budget Spreadsheet.xlsx', size: '512 KB', type: 'Excel', uploadedBy: 'Alice Johnson', date: '2024-11-25' },
  ]);

  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = uploadedFiles.map((file, index) => ({
      id: files.length + index + 1,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: getFileType(file.name),
      uploadedBy: 'You',
      date: new Date().toISOString().split('T')[0]
    }));
    setFiles([...newFiles, ...files]);
    setShowUpload(false);
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'PDF',
      'doc': 'Document',
      'docx': 'Document',
      'xls': 'Excel',
      'xlsx': 'Excel',
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
      'fig': 'Figma',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image',
      'mp4': 'Video',
      'mov': 'Video',
      'zip': 'Archive',
      'rar': 'Archive'
    };
    return typeMap[ext] || 'File';
  };

  const getFileIcon = (type) => {
    const iconMap = {
      'PDF': '📄',
      'Document': '📝',
      'Excel': '📊',
      'PowerPoint': '📺',
      'Figma': '🎨',
      'Image': '🖼️',
      'Video': '🎥',
      'Archive': '📦',
      'File': '📁'
    };
    return iconMap[type] || '📁';
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this file?')) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>📁 Files</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Manage your project files and documents
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '12px 20px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />

        <button
          onClick={() => setShowUpload(!showUpload)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ⬆️ Upload Files
        </button>
      </div>

      {showUpload && (
        <div style={{
          background: '#f0f9ff',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '2px dashed #3b82f6',
          textAlign: 'center'
        }}>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            style={{
              display: 'inline-block',
              padding: '40px 60px',
              cursor: 'pointer',
              borderRadius: '10px',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>☁️</div>
            <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e40af', margin: '0 0 10px 0' }}>
              Click to upload or drag and drop
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
              Any file type supported • Max 100MB per file
            </p>
          </label>
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={() => setShowUpload(false)}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
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
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
            {files.reduce((acc, f) => acc + parseFloat(f.size), 0).toFixed(1)} MB
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
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📁</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d97706' }}>
            {new Set(files.map(f => f.type)).size}
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
        {filteredFiles.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px',
            background: '#f9fafb',
            borderRadius: '12px',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📂</div>
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {searchTerm ? 'No files match your search' : 'No files uploaded yet'}
            </p>
            <p>Upload your first file to get started!</p>
          </div>
        ) : (
          filteredFiles.map(file => (
            <div
              key={file.id}
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
                  {getFileIcon(file.type)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
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
                {file.name}
              </h3>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  background: '#e0e7ff',
                  color: '#3730a3',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {file.type}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {file.size}
                </span>
              </div>

              <div style={{
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb',
                fontSize: '0.85rem',
                color: '#6b7280'
              }}>
                <div>👤 {file.uploadedBy}</div>
                <div>📅 {new Date(file.date).toLocaleDateString()}</div>
              </div>

              <div style={{
                marginTop: '15px',
                display: 'flex',
                gap: '8px'
              }}>
                <button style={{
                  flex: 1,
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  Download
                </button>
                <button style={{
                  flex: 1,
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  Share
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}