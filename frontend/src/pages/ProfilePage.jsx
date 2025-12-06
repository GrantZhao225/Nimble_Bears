import React, { useEffect, useState } from 'react';

export default function ProfilePage({ onLogout }) {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.name) setNickname(user.name);
    if (user?.avatar) setPreview(user.avatar);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.name = nickname || user.name || 'User';
    if (avatar) user.avatar = avatar;
    localStorage.setItem('user', JSON.stringify(user));
    // show in-app confirmation window (toast)
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
    // optional: trigger a storage event to notify other windows/components
    window.dispatchEvent(new Event('storage'));
    // also fire a custom event for same-window listeners
    window.dispatchEvent(new Event('user:updated'));
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setPreview(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    delete user.avatar;
    localStorage.setItem('user', JSON.stringify(user));
  };

  const initials = (nickname || JSON.parse(localStorage.getItem('user') || '{}').name || 'U')
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div style={{ maxWidth: 880, margin: '24px auto', background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
      {showSaved && (
        <div style={{ position: 'fixed', top: 20, right: 24, background: 'white', color: '#0f172a', padding: '12px 16px', borderRadius: 10, boxShadow: '0 8px 24px rgba(15,23,42,0.12)', zIndex: 2000 }}>
          Profile saved
        </div>
      )}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ width: 92, height: 92, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 28, color: '#3b82f6', fontWeight: 700 }}>
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
          <button onClick={onLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Nickname</label>
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Your display name" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 16 }} />

        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Profile Picture</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && (
            <button type="button" onClick={handleRemoveAvatar} style={{ background: '#f87171', color: 'white', border: 'none', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}>Remove</button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Save Profile</button>
          <button type="button" onClick={() => { setNickname(''); setPreview(null); }} style={{ background: '#e5e7eb', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>Reset</button>
        </div>
      </form>
    </div>
  );
}
