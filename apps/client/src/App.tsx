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

/**
 * Home page component (placeholder for main app)
 */
const Home: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>Ravn Skills Platform</h1>
        <LogoutButton />
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h2>Welcome, {profile?.name}!</h2>
          <p>Email: {profile?.email}</p>
          <p>Role: {profile?.role}</p>
        </div>

        <div
          style={{
            padding: "20px",
            backgroundColor: "#e7f3ff",
            borderRadius: "8px",
            border: "1px solid #b3d9ff",
          }}
        >
          <h3>Authentication Features Implemented</h3>
          <ul style={{ lineHeight: "1.8" }}>
            <li>
              JWT-based authentication with dual-token system (access + refresh)
            </li>
            <li>Secure token storage in localStorage</li>
            <li>Authorization header automatically added to all requests</li>
            <li>Transparent token renewal when access token expires</li>
            <li>Automatic redirect to login on refresh token expiration</li>
            <li>Role-based access control (EMPLOYEE, TECH_LEAD, ADMIN)</li>
          </ul>
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
