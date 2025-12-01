
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ✅ This import stays
import AnimatedBackground from "../components/AnimatedBackground";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const staticUsers = [
      { email: 'user@example.com', password: 'password123' },
      { email: 'admin@taskapp.com', password: 'admin' }
    ];

    const localUsers = JSON.parse(localStorage.getItem('mockUsers')) || [];
    const allUsers = [...staticUsers, ...localUsers];
    const user = allUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      onLogin();
    } else {
      setError('Invalid email or password. Please try again or create an account.');
    }
  };

  return (
    <>
      {/* ⭐ THIS is where your new animated background goes */}
      <AnimatedBackground />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(20, 10, 40, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '50px 40px',
          boxShadow: '0 20px 60px rgba(138, 43, 226, 0.3)',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          width: '100%',
          maxWidth: '400px',
          animation: 'fadeIn 0.8s ease-in'
        }}>
          <style>
            {`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #e879f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Task Allocator
          </h1>
          
          <p style={{
            color: '#c4b5fd',
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '0.95rem'
          }}>
            Manage your team efficiently
          </p>

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  background: 'rgba(30, 20, 50, 0.6)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(138, 43, 226, 0.6)';
                  e.target.style.boxShadow = '0 0 15px rgba(138, 43, 226, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(138, 43, 226, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  background: 'rgba(30, 20, 50, 0.6)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(138, 43, 226, 0.6)';
                  e.target.style.boxShadow = '0 0 15px rgba(138, 43, 226, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(138, 43, 226, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
              }}
            >
              Log In
            </button>
          </form>

          {error && (
            <p style={{
              color: '#f87171',
              marginTop: '15px',
              textAlign: 'center',
              fontSize: '0.9rem',
              padding: '10px',
              background: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(220, 38, 38, 0.3)'
            }}>
              {error}
            </p>
          )}

          <p style={{
            marginTop: '25px',
            textAlign: 'center',
            color: '#c4b5fd',
            fontSize: '0.9rem'
          }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{
                color: '#a78bfa',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#c084fc'}
              onMouseLeave={(e) => e.target.style.color = '#a78bfa'}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}