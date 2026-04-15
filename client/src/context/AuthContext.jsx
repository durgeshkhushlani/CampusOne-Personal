import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and provides authentication state globally.
 * On mount, checks localStorage for an existing token and validates it via /api/auth/me
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Token validation failed:", error);
        localStorage.removeItem("campusone_token");
        setUser(null);
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
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("campusone_token");
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
