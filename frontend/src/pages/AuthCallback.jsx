import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    
    const handleCallback = async () => {
      hasFetched.current = true;
      const searchParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.replace("#", "?"));
      
      const code = searchParams.get("code");
      const idToken = hashParams.get("id_token");
      const state = searchParams.get("state") || hashParams.get("state");

      if (!code && !idToken) {
        alert("Authorization failed");
        navigate("/login", { replace: true });
        return;
      }

      try {
        let endpoint = "";
        let payload = {};

        if (state === "google") {
          endpoint = "/api/users/google-login";
          payload = { token: idToken };
        } else if (state === "github") {
          endpoint = "/api/users/github-login";
          payload = { code };
        } else if (state === "linkedin") {
          endpoint = "/api/users/linkedin-login";
          payload = { code, redirectUri: `${window.location.origin}/auth/callback` };
        } else {
          throw new Error("Invalid state");
        }

        const res = await axios.post(endpoint, payload);

        if (res.data.user?.email) {
          localStorage.setItem("email", res.data.user.email);
          localStorage.setItem("name", res.data.user.name);
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        alert("Authentication failed. Please try again.");
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Authenticating...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
