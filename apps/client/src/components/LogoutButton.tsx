import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { apolloClient } from "../apollo/client";

const LogoutButton: React.FC = () => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Clear tokens and auth state
    logout();

    // Reset Apollo Client cache to remove any cached queries
    await apolloClient.clearStore();

    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="flex items-center gap-4">
      {profile && (
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {profile.name?.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* User Info */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-200">{profile.name}</p>
            <p className="text-xs text-gray-400">{profile.role}</p>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-red-600/20 border border-gray-600/50 hover:border-red-500/50 rounded-lg text-gray-200 hover:text-red-400 text-sm font-medium transition-all duration-200"
      >
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span>Logout</span>
      </button>
    </div>
  );
};

export default LogoutButton;
