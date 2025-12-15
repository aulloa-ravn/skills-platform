import React, { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Login page component with email/password form
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);

    try {
      await login(email, password);
      // Redirect to main app on successful login
      navigate("/");
    } catch (err: any) {
      // Error is already set in AuthContext, but we can display it here too
      const errorMessage =
        err.graphQLErrors?.[0]?.message || "Login failed. Please try again.";
      setLoginError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Starry background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars - small dots scattered across the background */}
        <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute top-[20%] left-[25%] w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-[15%] left-[75%] w-1 h-1 bg-white/50 rounded-full"></div>
        <div className="absolute top-[30%] left-[60%] w-0.5 h-0.5 bg-white/40 rounded-full"></div>
        <div className="absolute top-[40%] left-[20%] w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-[50%] left-[80%] w-0.5 h-0.5 bg-white/50 rounded-full"></div>
        <div className="absolute top-[60%] left-[40%] w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute top-[70%] left-[70%] w-0.5 h-0.5 bg-white/30 rounded-full"></div>
        <div className="absolute top-[80%] left-[30%] w-1 h-1 bg-white/50 rounded-full"></div>
        <div className="absolute top-[25%] left-[90%] w-0.5 h-0.5 bg-white/40 rounded-full"></div>
        <div className="absolute top-[45%] left-[10%] w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-[65%] left-[85%] w-0.5 h-0.5 bg-white/50 rounded-full"></div>
        <div className="absolute top-[35%] left-[50%] w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute top-[75%] left-[55%] w-0.5 h-0.5 bg-white/30 rounded-full"></div>
        <div className="absolute top-[55%] left-[95%] w-1 h-1 bg-white/50 rounded-full"></div>

        {/* Subtle gradient orbs for depth */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl shadow-2xl border border-gray-700/50 p-10">
          {/* Logo/Header Section */}
          <div className="text-center mb-8">
            {/* Circular icon with sparkle */}
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-700/50 rounded-full mb-6 border border-gray-600/50">
              <svg
                className="w-6 h-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              Ravn Skills Platform
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Email"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {(loginError || authError) && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-300">
                  {loginError || authError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600/50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {/* Divider
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/40 text-gray-400">or</span>
              </div>
            </div>

            {/* Google Sign In Button - Commented out as not implemented
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-gray-700/30 hover:bg-gray-600/30 text-white rounded-lg font-medium transition-all duration-200 border border-gray-600/50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button> */}
          </form>

          {/* Footer Message */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Internal use only - Ravn employees
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
