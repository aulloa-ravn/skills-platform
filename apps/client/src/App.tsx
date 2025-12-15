import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { apolloClient } from "./apollo/client";
import Login from "./pages/Login";
import LogoutButton from "./components/LogoutButton";
import "./App.css";

/**
 * Protected route wrapper that redirects to login if not authenticated
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Home: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Starry background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars */}
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

        {/* Subtle gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl shadow-2xl border border-gray-700/50 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-700/50 rounded-full border border-gray-600/50">
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
                <h1 className="text-2xl font-semibold text-white">
                  Ravn Skills Platform
                </h1>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Welcome Card */}
          <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl shadow-2xl border border-gray-700/50 p-8 mb-6">
            <div className="flex items-start gap-6">
              {/* Large Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-3xl">
                  {profile?.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome, {profile?.name}!
                </h2>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {profile?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat Card 1 */}
            <div className="backdrop-blur-xl bg-gray-800/40 rounded-xl border border-gray-700/50 p-6 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">-</p>
                  <p className="text-sm text-gray-400">Skills</p>
                </div>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="backdrop-blur-xl bg-gray-800/40 rounded-xl border border-gray-700/50 p-6 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">-</p>
                  <p className="text-sm text-gray-400">Completed</p>
                </div>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="backdrop-blur-xl bg-gray-800/40 rounded-xl border border-gray-700/50 p-6 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">-</p>
                  <p className="text-sm text-gray-400">Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main App component with routing and providers
 */
function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
