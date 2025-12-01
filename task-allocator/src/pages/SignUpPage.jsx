import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import staticUsers from "../users.json";
import AnimatedBackground from "../components/AnimatedBackground";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }
    
    const localUsers = JSON.parse(localStorage.getItem("mockUsers")) || [];
    const allUsers = [...staticUsers, ...localUsers];

    if (allUsers.find((user) => user.email === email)) {
      setMessage("Account already exists with that email.");
      return;
    }

    const newUser = { email, password };
    localUsers.push(newUser);

    localStorage.setItem("mockUsers", JSON.stringify(localUsers));
    
    setMessage("Account created successfully! Redirecting to login...");
    
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <>
      {/* ⭐ Space background with moving ships & lasers */}
      <AnimatedBackground />

      {/* ⭐ Your original content stays untouched */}
      <div className="login-page" style={{ position: "relative", zIndex: 10 }}>
        <h1>Create Account</h1>

        <form onSubmit={handleSignUp}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Sign Up</button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "10px",
              color: message.includes("successfully") ? "lightgreen" : "red",
            }}
          >
            {message}
          </p>
        )}

        <p style={{ marginTop: "20px" }}>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </>
  );
}