import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and provides authentication state globally.
 * Optimistically restores user state from localStorage on reload to prevent
 * auto-logout due to network glitches or Render server sleep cycles.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("campusone_user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem("campusone_token");
    const savedUser = localStorage.getItem("campusone_user");
    // Only bypass loading if we have BOTH the token and a cached user profile
    return !(token && savedUser);
  });

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("campusone_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
        localStorage.setItem("campusone_user", JSON.stringify(response.data.user));
      } catch (error) {
        console.error("Token validation failed:", error);
        // Only clear session if the server explicitly rejects the token (401/403).
        // Preserve session during backend timeouts or network issues.
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("campusone_token");
          localStorage.removeItem("campusone_user");
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem("campusone_token", token);
    localStorage.setItem("campusone_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("campusone_token");
    localStorage.removeItem("campusone_user");
    setUser(null);
  };

  const value = { user, loading, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export default AuthContext;
