// src/App.js
import React, { useState, useEffect } from "react";
import {
  getMe,
  login,
  signup,
  listMyEvents,
  createEvent,
  toggleSwappable,
  getSwappableSlots,
  listRequests,
  respondToRequest,
  createSwapRequest,
} from "./api";
import CalendarView from "./components/CalendarView";
import Marketplace from "./components/Marketplace";
import RequestsView from "./components/RequestsView";
import Notifications from "./components/Notifications";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [view, setView] = useState("calendar");

  useEffect(() => {
    if (token) {
      getMe(token)
        .then((me) => setUser(me))
        .catch(() => {
          localStorage.removeItem("token");
          setToken("");
        });
    }
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.access_token);
      setToken(res.access_token);
    } catch {
      alert("Invalid credentials");
    }
  };

  const handleSignup = async (name, email, password) => {
    try {
      await signup({ name, email, password });
      alert("Signup successful! Please login.");
    } catch {
      alert("Signup failed, try another email.");
    }
  };

  if (!token)
    return (
      <AuthPage onLogin={handleLogin} onSignup={handleSignup} />
    );

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2989/2989988.png"
            alt="logo"
            className="logo"
          />
          <h1 className="title">Slot Swapper</h1>
        </div>

        <div className="header-right">
          <span className="user-name">{user?.name}</span>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              setToken("");
              setUser(null);
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="navbar">
        {["calendar", "marketplace", "requests"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`nav-btn ${view === v ? "active" : ""}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </nav>

      <Notifications token={token} user={user} pollInterval={8000} />

      <main className="main-content">
        {view === "calendar" && (
          <CalendarView
            token={token}
            createEvent={createEvent}
            toggleSwappable={toggleSwappable}
          />
        )}
        {view === "marketplace" && (
          <Marketplace
            token={token}
            getSwappableSlots={getSwappableSlots}
            createSwapRequest={createSwapRequest}
          />
        )}
        {view === "requests" && (
          <RequestsView
            token={token}
            listRequests={listRequests}
            respondToRequest={respondToRequest}
          />
        )}
      </main>
    </div>
  );
}

function AuthPage({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "login") onLogin(form.email, form.password);
    else onSignup(form.name, form.email, form.password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <input name="name" placeholder="Full Name" onChange={handleChange} required />
          )}
          <input name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

          <button type="submit" className="auth-btn">
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button onClick={() => setMode("signup")}>Sign Up</button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")}>Login</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
