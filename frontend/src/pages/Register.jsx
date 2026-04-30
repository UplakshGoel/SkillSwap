import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Basic validation
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "/api/users/register",
        { name, email, password }
      );

      localStorage.setItem("email", email);
      localStorage.setItem("name", res.data.user.name);
      navigate("/dashboard");

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  // Removed handleGoogleSuccess since AuthCallback handles it now

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white">

      <div className="glass w-full max-w-md p-8 fade-in">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-gray-400 text-sm mt-1">
            Start collaborating with others
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* NAME */}
          <div className="relative">
            <UserIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* EMAIL */}
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn-primary w-full mt-2"
          >
            Register
            <ArrowRightIcon className="w-4 h-4" />
          </button>

        </form>

        {/* OR Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="px-3 text-sm text-gray-500">or continue with</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        {/* GOOGLE LOGIN */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
              if (!clientId || clientId === "your_google_client_id_here") {
                alert("Please add VITE_GOOGLE_CLIENT_ID to .env");
                return;
              }
              window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${window.location.origin}/auth/callback&response_type=id_token&scope=email%20profile&state=google&nonce=random_nonce_value`;
            }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition shadow-lg w-full max-w-[240px]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            Continue with Google
          </button>
        </div>

        {/* GITHUB & LINKEDIN LOGIN */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => {
              const clientId = (import.meta.env.VITE_GITHUB_CLIENT_ID || "").trim();
              if (!clientId || clientId === "your_github_client_id_here") {
                alert("Please add VITE_GITHUB_CLIENT_ID to .env");
                return;
              }
              window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${window.location.origin}/auth/callback&state=github&scope=user:email`;
            }}
            className="flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </button>
          <button
            onClick={() => {
              const clientId = (import.meta.env.VITE_LINKEDIN_CLIENT_ID || "").trim();
              if (!clientId || clientId === "your_linkedin_client_id_here") {
                alert("Please add VITE_LINKEDIN_CLIENT_ID to .env");
                return;
              }
              window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${window.location.origin}/auth/callback&state=linkedin&scope=openid%20profile%20email`;
            }}
            className="flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-full hover:bg-[#0a66c2]/80 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          </button>
        </div>

        {/* FOOTER */}
        <p className="text-sm text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;