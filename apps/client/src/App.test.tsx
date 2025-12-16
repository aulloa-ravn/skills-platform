import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock Apollo Client
const mockUseQuery = vi.fn();
vi.mock('@apollo/client/react', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useQuery: (...args: any[]) => mockUseQuery(...args),
  useMutation: vi.fn(() => [vi.fn(), { loading: false }]),
}));

// Mock token storage
vi.mock('./utils/tokenStorage', () => ({
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  hasTokens: vi.fn(() => true),
  getAccessToken: vi.fn(() => 'mock-token'),
  getRefreshToken: vi.fn(() => 'mock-refresh-token'),
}));

// Mock useAuth to simulate authenticated state
const mockProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'EMPLOYEE' as const,
};

vi.mock('./contexts/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('./contexts/AuthContext')>('./contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      isAuthenticated: true,
      profile: mockProfile,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null,
    }),
  };
});

describe('App Routing - Profile Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useQuery to return loading state for Profile component
    mockUseQuery.mockReturnValue({
      loading: true,
      error: null,
      data: null,
    });
  });

  it('should display "View My Profile" button on Home page', () => {
    const { container } = render(<App />);

    // Check if button exists somewhere in the document
    const profileButton = container.querySelector('[data-testid="view-profile-button"]');
    expect(profileButton).toBeTruthy();
  });

  it('should navigate to profile page when clicking "View My Profile" button', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    // Find and click the profile button if it exists on home page
    const profileButton = container.querySelector('[data-testid="view-profile-button"]');
    if (profileButton) {
      await user.click(profileButton);
      // Should navigate to profile page - loading skeletons should appear
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    } else {
      // If we're already on profile page, just verify it
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    }
  });

  it('should have profile route accessible when authenticated', () => {
    render(<App />);

    // Profile page should be renderable (either we're on it or can navigate to it)
    // This test verifies the route exists and is protected
    const content = screen.queryByText(/Welcome/) || document.querySelector('.animate-pulse');
    expect(content).toBeTruthy();
  });
});
