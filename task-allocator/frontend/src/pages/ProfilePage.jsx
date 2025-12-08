import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function ProfilePage({ onLogout }) {
  const [nickname, setNickname] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.name) setNickname(response.data.name);
      if (response.data.avatar) {
        setPreview(response.data.avatar);
        setCurrentAvatar(response.data.avatar);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Function to update profile with the provided data
      const updateProfile = async (updateData) => {
        const response = await axios.put(`${API_URL}/users/profile`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Update local storage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.name = response.data.name;
        user.avatar = response.data.avatar;
        localStorage.setItem('user', JSON.stringify(user));

        // Trigger events to update UI everywhere
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('user:updated'));

        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
        setLoading(false);
        setAvatarFile(null);
        setCurrentAvatar(response.data.avatar);
      };

      // Prepare update data
      const updateData = {
        name: nickname
      };
      
      // If a new avatar file was selected, convert to base64
      if (avatarFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          updateData.avatar = reader.result;
          await updateProfile(updateData);
        };
        reader.onerror = () => {
          console.error('Error reading file');
          alert('Failed to read image file');
          setLoading(false);
        };
        reader.readAsDataURL(avatarFile);
      } else if (preview === null && currentAvatar !== null) {
        // Avatar was removed
        updateData.avatar = '';
        await updateProfile(updateData);
      } else {
        // Only name changed
        await updateProfile(updateData);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setPreview(null);
  };

  const initials = (nickname || 'U')
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div style={{ maxWidth: 880, margin: '24px auto', background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
      {showSaved && (
        <div style={{ 
          position: 'fixed', 
          top: 20, 
          right: 24, 
          background: '#10b981', 
          color: 'white', 
          padding: '12px 16px', 
          borderRadius: 10, 
          boxShadow: '0 8px 24px rgba(16,185,129,0.3)', 
          zIndex: 2000,
          fontWeight: '600'
        }}>
          ✓ Profile saved successfully!
        </div>
      )}
      
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ 
          width: 92, 
          height: 92, 
          borderRadius: '50%', 
          background: '#eef2ff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflow: 'hidden', 
          fontSize: 28, 
          color: '#3b82f6', 
          fontWeight: 700,
          border: '3px solid #ddd'
        }}>
          {preview ? (
            <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>Profile</h2>
          <p style={{ margin: '6px 0 0 0', color: '#6b7280' }}>Update your display name and profile picture.</p>
        </div>
        <div>
          <button 
            onClick={onLogout} 
            style={{ 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              padding: '10px 16px', 
              borderRadius: 8, 
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Nickname</label>
        <input 
          value={nickname} 
          onChange={(e) => setNickname(e.target.value)} 
          placeholder="Your display name" 
          style={{ 
            width: '100%', 
            padding: '10px 12px', 
            borderRadius: 8, 
            border: '1px solid #e5e7eb', 
            marginBottom: 16,
            fontSize: '1rem',
            boxSizing: 'border-box'
          }} 
        />

        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Profile Picture</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && (
            <button 
              type="button" 
              onClick={handleRemoveAvatar} 
              style={{ 
                background: '#f87171', 
                color: 'white', 
                border: 'none', 
                padding: '8px 10px', 
                borderRadius: 8, 
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Remove
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              border: 'none', 
              padding: '10px 14px', 
              borderRadius: 8, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontWeight: 700,
              fontSize: '1rem'
            }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          <button 
            type="button" 
            onClick={() => { 
              fetchUserProfile();
              setAvatarFile(null);
            }} 
            style={{ 
              background: '#e5e7eb', 
              border: 'none', 
              padding: '10px 14px', 
              borderRadius: 8, 
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}