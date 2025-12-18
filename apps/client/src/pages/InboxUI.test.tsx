import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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

// Mock Apollo Client
const mockUseQuery = vi.fn();
vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
}));

const mockInboxData = {
  getValidationInbox: {
    projects: [
      {
        projectId: 'proj-1',
        projectName: 'Project Alpha',
        pendingSuggestionsCount: 3,
        employees: [
          {
            employeeId: 'emp-1',
            employeeName: 'John Doe',
            employeeEmail: 'john@example.com',
            pendingSuggestionsCount: 2,
            suggestions: [
              {
                id: 'sugg-1',
                skillName: 'React',
                discipline: 'ENGINEERING',
                suggestedProficiency: 'INTERMEDIATE',
                source: 'SELF_REPORT',
                createdAt: '2025-12-15T10:00:00Z',
                currentProficiency: 'BEGINNER',
              },
              {
                id: 'sugg-2',
                skillName: 'TypeScript',
                discipline: 'ENGINEERING',
                suggestedProficiency: 'ADVANCED',
                source: 'SYSTEM_FLAG',
                createdAt: '2025-12-14T10:00:00Z',
                currentProficiency: null,
              },
            ],
          },
          {
            employeeId: 'emp-2',
            employeeName: 'Jane Smith',
            employeeEmail: 'jane@example.com',
            pendingSuggestionsCount: 1,
            suggestions: [
              {
                id: 'sugg-3',
                skillName: 'Figma',
                discipline: 'DESIGN',
                suggestedProficiency: 'EXPERT',
                source: 'SELF_REPORT',
                createdAt: '2025-12-13T10:00:00Z',
                currentProficiency: 'ADVANCED',
              },
            ],
          },
        ],
      },
      {
        projectId: 'proj-2',
        projectName: 'Project Beta',
        pendingSuggestionsCount: 1,
        employees: [
          {
            employeeId: 'emp-3',
            employeeName: 'Bob Wilson',
            employeeEmail: 'bob@example.com',
            pendingSuggestionsCount: 1,
            suggestions: [
              {
                id: 'sugg-4',
                skillName: 'SQL',
                discipline: 'DATA',
                suggestedProficiency: 'INTERMEDIATE',
                source: 'SYSTEM_FLAG',
                createdAt: '2025-12-12T10:00:00Z',
                currentProficiency: 'BEGINNER',
              },
            ],
          },
        ],
      },
    ],
  },
};

describe('Inbox UI - Component Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  it('should display loading skeleton while fetching data', () => {
    mockUseQuery.mockReturnValue({
      loading: true,
      error: null,
      data: null,
      refetch: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display error state with retry button on GraphQL error', async () => {
    const mockRefetch = vi.fn();
    mockUseQuery.mockReturnValue({
      loading: false,
      error: { message: 'Network error' },
      data: null,
      refetch: mockRefetch,
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Error Loading Inbox')).toBeInTheDocument();
    expect(screen.getByText(/Network error/)).toBeInTheDocument();

    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should auto-expand first project and show team members', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: mockInboxData,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    // First project should be auto-expanded, so team members should be visible in sidebar
    // Use getAllByText because names appear in both sidebar and review card
    const johnDoeElements = screen.getAllByText('John Doe');
    expect(johnDoeElements.length).toBeGreaterThan(0);

    const janeSmithElements = screen.getAllByText('Jane Smith');
    expect(janeSmithElements.length).toBeGreaterThan(0);
  });

  it('should select employee and display their first suggestion', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: mockInboxData,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    );

    // First employee should be auto-selected with first suggestion displayed
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('SELF_REPORT')).toBeInTheDocument();
    });
  });

  it('should navigate between suggestions for selected employee', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: mockInboxData,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    // Click Next Suggestion
    const nextSuggestionButton = screen.getByText('Next Suggestion');
    await user.click(nextSuggestionButton);

    // Should now see TypeScript suggestion
    await waitFor(() => {
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('SYSTEM_FLAG')).toBeInTheDocument();
    });

    // Click Previous Suggestion
    const previousSuggestionButton = screen.getByText('Previous Suggestion');
    await user.click(previousSuggestionButton);

    // Should be back to React
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  it('should navigate to next person across projects', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: mockInboxData,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    );

    // Initially showing React skill (John Doe's suggestion)
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    // Click Next Person
    const nextPersonButton = screen.getByText('Next Person');
    await user.click(nextPersonButton);

    // Should now show Figma skill (Jane Smith's suggestion)
    await waitFor(() => {
      expect(screen.getByText('Figma')).toBeInTheDocument();
    });
  });

  it('should display empty state when no projects exist', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getValidationInbox: { projects: [] } },
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('No pending validations at this time')).toBeInTheDocument();
  });

  it('should display empty state when no employee is selected', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: {
        getValidationInbox: {
          projects: [
            {
              projectId: 'proj-1',
              projectName: 'Project Empty',
              pendingSuggestionsCount: 0,
              employees: [],
            },
          ],
        },
      },
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Select a team member to review suggestions')).toBeInTheDocument();
  });
});
