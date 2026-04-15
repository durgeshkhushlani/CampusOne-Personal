import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gray-100 flex items-center font-sans">
      {/* Main Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/bg.jpg" 
          alt="Campus Background" 
          className="w-full h-full object-cover"
        />
        {/* Subtle orange/warm overlay to match the sunset feel in the original background if needed */}
      </div>

      {/* Foreground Content wrapper */}
      <div className="relative z-10 w-full h-screen flex">
        
        {/* Left Beige Panel Section */}
        <div className="relative w-full md:w-[65%] lg:w-[45%] xl:w-[40%] flex flex-col justify-center min-h-screen">
          
          {/* Beige Curve Shape */}
          <div className="absolute top-0 left-0 w-[140%] h-[120%] -top-[10%] z-0 pointer-events-none drop-shadow-2xl">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none" 
              fill="#F4E3CC"
            >
              {/* This path creates the specific curve matching the screenshot closely */}
              <path d="M0,0 L60,0 C90,20 85,50 65,75 C55,85 40,95 0,100 Z" />
            </svg>
          </div>
          
          {/* Subtle secondary beige shapes */}
          <div className="absolute top-[10%] left-[80%] z-0 pointer-events-none mix-blend-multiply opacity-50">
             <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="#E6D3B8"/>
             </svg>
          </div>

          {/* Green uniRP Blob */}
          <div className="absolute top-[10%] left-[65%] sm:left-[75%] md:left-[80%] z-10 transform -translate-x-1/2 w-48 h-40 xl:w-56 xl:h-48 pointer-events-none drop-shadow-lg">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path fill="#159779" d="M49,-64C63.2,-54.6,74.1,-39.7,77.7,-23.5C81.4,-7.3,77.7,10.3,69.5,26.4C61.3,42.4,48.5,57,32.7,65C16.9,73,-1.9,74.5,-20.1,70.5C-38.3,66.6,-55.8,57.3,-67.2,42.7C-78.6,28.1,-83.8,8.2,-79.8,-9.6C-75.9,-27.4,-62.7,-43.1,-47.4,-52.7C-32.1,-62.3,-16,-65.9,1.1,-67.3C18.2,-68.8,34.8,-69.1,49,-64Z" transform="translate(100 100) scale(1.1)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center -ml-2 mt-1">
               <span className="text-white font-medium text-3xl xl:text-4xl tracking-tight">uniRP<sup className="text-xs xl:text-sm font-normal ml-0.5">™</sup></span>
            </div>
          </div>

          {/* Form Content */}
          <div className="relative z-20 px-8 sm:px-16 xl:pl-28 w-full max-w-lg mt-10">
            
            {/* University Logo */}
            <div className="mb-4">
               {/* using user's uploaded logo */}
               <img src="/images/logo.png" alt="University Logo" className="h-[90px] xl:h-[110px] object-contain mb-8" />
            </div>

            <h1 className="text-[2.6rem] font-bold text-[#e1472e] mb-8 tracking-tight">Login</h1>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 rounded p-3 mb-4 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full xl:w-[95%]">
              {/* Username Input */}
              <div className="mb-5">
                <input
                  type="text"
                  placeholder="Roll / Enrollment No / EMP Code"
                  className="w-full bg-transparent border border-[#DCB796] text-gray-800 placeholder-[#9a8471] rounded-md px-4 py-3 focus:outline-none focus:border-[#e1472e] transition-colors shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="mb-8 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-transparent border border-[#DCB796] text-gray-800 placeholder-[#9a8471] rounded-md px-4 py-3 focus:outline-none focus:border-[#e1472e] transition-colors shadow-sm pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-black focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     {showPassword ? (
                       <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                     ) : (
                       <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                     )}
                     {!showPassword && (
                       <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                     )}
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-[#De3f2b] text-white px-9 py-2.5 rounded-md text-[13px] font-bold tracking-wider shadow-sm transition-colors ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#C92F1A]"}`}
                >
                  {isLoading ? "PLEASE WAIT..." : "LOGIN"}
                </button>
                <a href="#" className="text-[13px] font-bold text-gray-900 hover:text-[#e1472e] transition-colors pr-2">
                  Forgot Password ?
                </a>
              </div>
            </form>

            <div className="mt-12 text-[11px] text-gray-800 font-medium">
              Powered By - <span className="font-bold text-black">Bloomfield Innovations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right Header - "Powered By uniRP" */}
      <div className="absolute top-6 right-8 lg:top-[2.5rem] lg:right-[3rem] z-20 hidden md:block">
        <div className="flex flex-col items-end">
          <span className="text-[13px] font-bold text-gray-900 mb-0 opacity-80 leading-none mr-2">Powered By</span>
          <div className="flex items-start mt-0.5">
             <span className="text-[1.85rem] font-black text-gray-900 tracking-tighter leading-none mt-1">uniRP<sup className="text-sm font-medium ml-0.5 mt-1">™</sup></span>
             <div className="w-10 h-10 ml-2 rounded-full border border-gray-500 flex items-center justify-center opacity-70 mt-1">
               {/* Globe outline icon approximation */}
               <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <path d="M2 12h20"/>
               </svg>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Social Icons */}
      <div className="absolute bottom-6 w-full flex justify-center items-center gap-[18px] z-20">
        <a href="#" className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-400/30 transition-colors">
          <svg className="w-3.5 h-3.5 fill-current opacity-80" viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" /></svg>
        </a>
        <a href="#" className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-400/30 transition-colors">
          <svg className="w-3.5 h-3.5 fill-current opacity-80" viewBox="0 0 24 24"><path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10V10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16.02 6 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" /></svg>
        </a>
        <a href="#" className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-400/30 transition-colors">
          <svg className="w-3.5 h-3.5 fill-current opacity-80" viewBox="0 0 24 24"><path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14 9.94 13.4 10.6 13.04 11.23V10.08H10.5V18.5H13.04V14.15C13.04 13 13.25 11.97 14.54 11.97C15.82 11.97 15.96 13.18 15.96 14.24V18.5H18.5M7.05 8.52C7.9 8.52 8.58 7.83 8.58 6.96C8.58 6.1 7.9 5.41 7.05 5.41C6.19 5.41 5.5 6.1 5.5 6.96C5.5 7.83 6.19 8.52 7.05 8.52M5.77 18.5H8.31V10.08H5.77V18.5Z" /></svg>
        </a>
      </div>
      
    </div>
  );
}
