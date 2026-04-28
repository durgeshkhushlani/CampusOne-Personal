import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Lock, Eye, EyeOff, Twitter, Linkedin, Instagram, Youtube, Facebook } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: 40,
    border: "1px solid #D8D5CE",
    borderRadius: 8,
    fontSize: 14,
    color: "#2C3E50",
    background: "#FFFFFF",
    outline: "none",
    transition: "all 150ms ease",
    fontFamily: "inherit",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#8C2E2E url(/images/campus_login_bg.png) no-repeat center center",
      backgroundSize: "cover",
      padding: "16px",
    }}>
      
      {/* Login Container Card */}
      <div style={{
        display: "flex",
        width: "900px",
        height: "550px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 24px 48px rgba(0, 0, 0, 0.3)",
        background: "#FFFFFF",
      }}>
        
        {/* Left Panel (Teal Student Illustration) */}
        <div style={{
          width: "42%",
          background: "#7BD3CB url(/images/student_login_illustration.png) no-repeat center center",
          backgroundSize: "cover",
        }} className="hidden md:block" />

        {/* Right Panel (Form Content) */}
        <div style={{
          flex: 1,
          background: "#FAF5E6",
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#5C4033",
        }}>
          
          {/* Top row */}
          <div>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8C2E2E", fontWeight: 600 }}>
              Welcome Back
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: "#2C3E50", marginTop: "4px", marginBottom: "0px" }}>
              CampusOne Portal
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ margin: "24px 0" }}>
            {error && (
              <div style={{ background: "#FBF0F0", color: "#C17B7B", fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: 16, border: "1px solid #EDD5D5" }}>
                {error}
              </div>
            )}

            {/* ID Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#2C3E50", marginBottom: 6 }}>
                Enrollment No. / EMP Code
              </label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A94A0" }} />
                <input
                  type="text"
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 12 }}
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  onFocus={e => { e.target.style.borderColor = "#8C2E2E"; e.target.style.boxShadow = "0 0 0 3px rgba(140,46,46,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#D8D5CE"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#2C3E50", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A94A0" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 40 }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  onFocus={e => { e.target.style.borderColor = "#8C2E2E"; e.target.style.boxShadow = "0 0 0 3px rgba(140,46,46,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#D8D5CE"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#8A94A0", background: "none", border: "none", cursor: "pointer", display: "flex" }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", height: 42, background: isLoading ? "#C48E8E" : "#8C2E2E",
                color: "#FFFFFF", fontSize: 14, fontWeight: 600, border: "none",
                borderRadius: 8, cursor: isLoading ? "wait" : "pointer",
                transition: "all 150ms ease", fontFamily: "inherit",
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = "#6B1F1F"; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = "#8C2E2E"; }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Footer block */}
          <div>
            <div style={{ fontSize: 11, color: "#A6907A", fontWeight: 500 }}>Contact Us</div>
            <div style={{ fontSize: 12, color: "#5C4033", margin: "2px 0 12px" }}>
              info@campusone.edu &nbsp;|&nbsp; +91 79847 04174
            </div>

            <div style={{ fontSize: 11, color: "#A6907A", fontWeight: 500, marginBottom: 6 }}>Connect with us</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <a href="https://x.com/dauofficial_" target="_blank" rel="noopener noreferrer">
                <Twitter size={16} color="#8C2E2E" style={{ cursor: "pointer" }} />
              </a>
              <a href="https://in.linkedin.com/school/dhirubhaiambaniuniversity/" target="_blank" rel="noopener noreferrer">
                <Linkedin size={16} color="#8C2E2E" style={{ cursor: "pointer" }} />
              </a>
              <a href="https://www.instagram.com/daiictofficial/" target="_blank" rel="noopener noreferrer">
                <Instagram size={16} color="#8C2E2E" style={{ cursor: "pointer" }} />
              </a>
              <a href="https://www.facebook.com/officialdau/" target="_blank" rel="noopener noreferrer">
                <Facebook size={16} color="#8C2E2E" style={{ cursor: "pointer" }} />
              </a>
            </div>

            <div style={{ fontSize: 10, color: "#A6907A", borderTop: "1px solid #E8DCC4", paddingTop: "8px" }}>
              <Link to="/terms" style={{ color: "inherit", textDecoration: "underline" }}>Terms & Policies</Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
