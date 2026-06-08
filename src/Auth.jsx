import { useState } from "react";
import supabase from "./supabase";
import logo from "./assets/signsync-logo.png";
import "./Auth.css";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setError("");

    let result;

    if (mode === "signup") {
      result = await supabase.auth.signUp({
        email,
        password,
      });
    } else {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    }

    const { data, error } = result;

    if (error) {
      setError(error.message);
    } else {
      onLogin(data.user);
    }

    setLoading(false);
  };

return (
  <div className="container">
    <div className="card">

      {/* Logo */}
      <div className="logo">
        <img
          src={logo}
          alt="SignSync Logo"
          style={{
            width: "80px",
            height: "80px",
            objectFit: "contain",
          }}
        />
      </div>

      <h1 className="title">SignSync</h1>

      <p className="subtitle">
        AI-powered real-time Sign Language Interpreter
      </p>

      <h2 className="heading">Get Started</h2>

      <p className="desc">
        Turn gestures into text and speech. Break communication barriers—try it now!
      </p>

      {/* Toggle */}
      <div className="toggle">
        <button
          className="toggleBtn"
          style={{
            background: mode === "signin" ? "#fff" : "transparent",
          }}
          onClick={() => setMode("signin")}
        >
          Sign In
        </button>

        <button
          className="toggleBtn"
          style={{
            background: mode === "signup" ? "#fff" : "transparent",
          }}
          onClick={() => setMode("signup")}
        >
          Sign Up
        </button>
      </div>

      {/* Inputs */}
      <input
        className="input"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="input"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      <button className="mainBtn" onClick={handleAuth}>
        {mode === "signin" ? "Sign In" : "Sign Up"}
      </button>

    </div>
  </div>
);
}
