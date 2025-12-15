import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apolloClient } from '../apollo/client';

/**
 * Logout button component
 */
const LogoutButton: React.FC = () => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle logout action
   * Clears tokens, resets Apollo cache, and redirects to login
   */
  const handleLogout = async () => {
    // Clear tokens and auth state
    logout();

    // Reset Apollo Client cache to remove any cached queries
    await apolloClient.clearStore();

    // Redirect to login page
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      {profile && (
        <span style={{ fontSize: '14px', color: '#555' }}>
          {profile.name} ({profile.role})
        </span>
      )}
      <button
        onClick={handleLogout}
        style={{
          padding: '8px 16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;
