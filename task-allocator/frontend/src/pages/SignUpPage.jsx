import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import AnimatedBackground from "../components/AnimatedBackground";

const API_URL = 'http://localhost:5000/api';

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email || !password || !name) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        name,
        organizationName: organizationName || undefined
      });

      setMessage("Account created successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create account. Please try again.");
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
        padding: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          background: 'rgba(20, 10, 40, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '50px 40px',
          boxShadow: '0 20px 60px rgba(138, 43, 226, 0.3)',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          width: '100%',
          maxWidth: '450px',
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
            marginBottom: '20px'
          }}>
            <img 
              src="/minipl-logo.png" 
              alt="Mini PL" 
              style={{
                height: '80px',
                width: 'auto'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #e879f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Create Account
          </h1>

          <p style={{
            color: '#c4b5fd',
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '0.95rem'
          }}>
            Join Mini PL and manage your team
          </p>

          <form onSubmit={handleSignUp} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <input
              type="text"
              placeholder="Your Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

            <input
              type="email"
              placeholder="Email *"
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

            <input
              type="password"
              placeholder="Password *"
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

            <input
              type="text"
              placeholder="Organization Name (Optional)"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
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
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {message && (
            <p style={{
              color: '#86efac',
              marginTop: '15px',
              textAlign: 'center',
              fontSize: '0.9rem',
              padding: '10px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              {message}
            </p>
          )}

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
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#a78bfa',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#c084fc'}
              onMouseLeave={(e) => e.target.style.color = '#a78bfa'}
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}