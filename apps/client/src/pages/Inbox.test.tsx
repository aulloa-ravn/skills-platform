import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '../apollo/client';
import Inbox from './Inbox';
import { Role } from '../contexts/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('../contexts/AuthContext')>('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
  };
});

// Mock Apollo Client useQuery
const mockUseQuery = vi.fn();
vi.mock('@apollo/client/react', async () => {
  const actual = await vi.importActual<typeof import('@apollo/client/react')>('@apollo/client/react');
  return {
    ...actual,
    useQuery: (...args: any[]) => mockUseQuery(...args),
  };
});

describe('Inbox - Role-Based Access Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getValidationInbox: { projects: [] } },
      refetch: vi.fn(),
    });
  });

  it('should allow TECH_LEAD users to access inbox', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      profile: {
        id: '1',
        name: 'Tech Lead User',
        email: 'techlead@example.com',
        role: Role.TECH_LEAD,
      },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null,
    });

    render(
      <ApolloProvider client={apolloClient}>
        <MemoryRouter initialEntries={['/inbox']}>
          <Routes>
            <Route path="/inbox" element={<Inbox />} />
          </Routes>
        </MemoryRouter>
      </ApolloProvider>
    );

    expect(screen.getByText('Validation Inbox')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should allow ADMIN users to access inbox', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      profile: {
        id: '2',
        name: 'Admin User',
        email: 'admin@example.com',
        role: Role.ADMIN,
      },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null,
    });

    render(
      <ApolloProvider client={apolloClient}>
        <MemoryRouter initialEntries={['/inbox']}>
          <Routes>
            <Route path="/inbox" element={<Inbox />} />
          </Routes>
        </MemoryRouter>
      </ApolloProvider>
    );

    expect(screen.getByText('Validation Inbox')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should redirect EMPLOYEE users to home page', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      profile: {
        id: '3',
        name: 'Employee User',
        email: 'employee@example.com',
        role: Role.EMPLOYEE,
      },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null,
    });

    render(
      <ApolloProvider client={apolloClient}>
        <MemoryRouter initialEntries={['/inbox']}>
          <Routes>
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </ApolloProvider>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should not render inbox content for EMPLOYEE role', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      profile: {
        id: '3',
        name: 'Employee User',
        email: 'employee@example.com',
        role: Role.EMPLOYEE,
      },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null,
    });

    const { container } = render(
      <ApolloProvider client={apolloClient}>
        <MemoryRouter initialEntries={['/inbox']}>
          <Routes>
            <Route path="/inbox" element={<Inbox />} />
          </Routes>
        </MemoryRouter>
      </ApolloProvider>
    );

    expect(screen.queryByText('Validation Inbox')).not.toBeInTheDocument();
    // Component should return null for EMPLOYEE role
    expect(container.firstChild).toBeNull();
  });

  it('should display dark glassmorphism background for authorized users', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      profile: {
        id: '1',
        name: 'Tech Lead User',
        email: 'techlead@example.com',
        role: Role.TECH_LEAD,
      },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null,
    });

    const { container } = render(
      <ApolloProvider client={apolloClient}>
        <MemoryRouter initialEntries={['/inbox']}>
          <Routes>
            <Route path="/inbox" element={<Inbox />} />
          </Routes>
        </MemoryRouter>
      </ApolloProvider>
    );

    // Check for dark glassmorphism background elements
    const backgroundElement = container.querySelector('.bg-gradient-to-br.from-gray-900');
    expect(backgroundElement).toBeInTheDocument();

    // Check for starry background effect
    const stars = container.querySelectorAll('.bg-white\\/40.rounded-full');
    expect(stars.length).toBeGreaterThan(0);
  });
});
