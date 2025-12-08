import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AnimatedBackground from "../components/AnimatedBackground";

const API_URL = 'http://localhost:5000/api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      onLogin();
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
          
          {/* Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '30px'
          }}>
            <img 
              src="/minipl-logo.png" 
              alt="Mini PL" 
              style={{
                height: '120px',
                width: 'auto',
                maxWidth: '100%'
              }}
              onError={(e) => {
                // Fallback text if logo doesn't load
                e.target.style.display = 'none';
                const fallback = document.createElement('h1');
                fallback.textContent = 'Mini PL';
                fallback.style.cssText = `
                  font-size: 2.5rem;
                  font-weight: 700;
                  background: linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #e879f9 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  margin: 0;
                  text-align: center;
                `;
                e.target.parentElement.appendChild(fallback);
              }}
            />
          </div>

          <p style={{
            color: '#c4b5fd',
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '0.95rem'
          }}>
            Manage your team efficiently with AI
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
                disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: loading 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                  : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
              }}
            >
              {loading ? 'Logging in...' : 'Log In'}
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