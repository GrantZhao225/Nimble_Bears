import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import staticUsers from "../users.json";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); 

    
    const localUsers = JSON.parse(localStorage.getItem("mockUsers")) || [];
    const allUsers = [...staticUsers, ...localUsers];
    const user = allUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      onLogin(); 
    } else {
      setError("Invalid email or password. Please try again or create an account.");
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Log In</button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      <p style={{ marginTop: '20px' }}>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}