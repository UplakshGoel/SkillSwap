import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasFetched = useRef(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (hasFetched.current) return;
    
    const handleCallback = async () => {
      hasFetched.current = true;
      const searchParams = new URLSearchParams(location.search);
      const hashClean = location.hash.startsWith("#") ? location.hash.substring(1) : location.hash;
      const hashParams = new URLSearchParams(hashClean);
      
      const code = searchParams.get("code");
      const idToken = hashParams.get("id_token") || searchParams.get("id_token");
      const state = searchParams.get("state") || hashParams.get("state");
      const oauthError = searchParams.get("error") || hashParams.get("error");

      if (oauthError) {
        setErrorMessage(`OAuth Error: ${oauthError}`);
        setTimeout(() => navigate("/login", { replace: true }), 2500);
        return;
      }

      if (!code && !idToken) {
        setErrorMessage("Authorization token missing. Please try signing in again.");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
        return;
      }

      try {
        let endpoint = "";
        let payload = {};

        if (state === "google") {
          if (!idToken) {
            throw new Error("Google authentication token not found");
          }
          endpoint = "/api/users/google-login";
          payload = { token: idToken };
        } else if (state === "github") {
          if (!code) throw new Error("GitHub authorization code missing");
          endpoint = "/api/users/github-login";
          payload = { code };
        } else if (state === "linkedin") {
          if (!code) throw new Error("LinkedIn authorization code missing");
          endpoint = "/api/users/linkedin-login";
          payload = { code, redirectUri: `${window.location.origin}/auth/callback` };
        } else {
          throw new Error("Invalid OAuth state");
        }

        const res = await axios.post(endpoint, payload);

        if (res.data.user?.email) {
          const userEmail = res.data.user.email;
          const userName = res.data.user.name || userEmail.split("@")[0];
          localStorage.setItem("email", userEmail);
          localStorage.setItem("name", userName);
          navigate("/dashboard", { replace: true });
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        const detail = err.response?.data?.error || err.response?.data?.message || err.message || "Authentication failed";
        setErrorMessage(detail);
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white relative overflow-hidden">
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full"></div>

      <div className="flex flex-col items-center relative z-10 scale-in px-4 text-center">
        {errorMessage ? (
          <div className="max-w-md p-6 glass border border-red-500/30 rounded-3xl shadow-2xl">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Authentication Failed</h2>
            <p className="text-gray-300 text-sm">{errorMessage}</p>
            <p className="text-gray-500 text-xs mt-4">Redirecting back to login...</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <h2 className="text-2xl font-bold mt-8 tracking-tight">Authenticating</h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">Connecting your secure session...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
