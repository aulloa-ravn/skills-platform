import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';

// Mock useQuery hook
const mockUseQuery = vi.fn();
const mockRefetch = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
}));

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Profile Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      profile: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'EMPLOYEE' },
    });
  });

  it('should handle error state and successfully retry loading profile', async () => {
    const user = userEvent.setup();

    // Start with error state
    mockUseQuery.mockReturnValue({
      loading: false,
      error: { message: 'Network error' },
      data: null,
      refetch: mockRefetch,
    });

    const { rerender } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Should show error message
    expect(screen.getByText('Error Loading Profile')).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    // Verify refetch was called
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should transition from loading to loaded state with profile data', async () => {
    // Start with loading state
    mockUseQuery.mockReturnValue({
      loading: true,
      error: null,
      data: null,
    });

    const { rerender } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Should show loading skeleton
    let skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);

    // Update to loaded state
    const profileData = {
      getProfile: {
        id: '1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatarUrl: null,
        currentSeniority: 'MID',
        coreStack: [],
        validatedInventory: [],
        pending: [],
        seniorityHistory: [],
        currentAssignments: [],
      },
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: profileData,
    });

    rerender(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Should show profile data
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    // Loading skeletons should be gone
    skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(0);
  });

  it('should handle empty profile data gracefully', () => {
    const emptyProfile = {
      getProfile: {
        id: '1',
        name: 'Empty User',
        email: 'empty@example.com',
        avatarUrl: null,
        currentSeniority: 'JUNIOR',
        coreStack: [],
        validatedInventory: [],
        pending: [],
        seniorityHistory: [],
        currentAssignments: [],
      },
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: emptyProfile,
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Should show all empty state messages
    expect(screen.getByText('No core stack skills yet')).toBeInTheDocument();
    expect(screen.getByText('No validated skills in inventory')).toBeInTheDocument();
    expect(screen.getByText('No pending skills')).toBeInTheDocument();
    expect(screen.getByText('No seniority history available')).toBeInTheDocument();
    expect(screen.getByText('No current assignments')).toBeInTheDocument();
  });

  it('should expand seniority timeline and then collapse it', async () => {
    const user = userEvent.setup();

    const profileWithHistory = {
      getProfile: {
        id: '1',
        name: 'User With History',
        email: 'user@example.com',
        avatarUrl: null,
        currentSeniority: 'SENIOR',
        coreStack: [],
        validatedInventory: [],
        pending: [],
        seniorityHistory: [
          { id: '1', seniorityLevel: 'SENIOR', effectiveDate: '2024-01-01', createdBy: null },
          { id: '2', seniorityLevel: 'MID', effectiveDate: '2023-01-01', createdBy: null },
          { id: '3', seniorityLevel: 'JUNIOR', effectiveDate: '2022-01-01', createdBy: null },
          { id: '4', seniorityLevel: 'INTERN', effectiveDate: '2021-01-01', createdBy: null },
        ],
        currentAssignments: [],
      },
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: profileWithHistory,
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Initially should show only 3 entries
    const expandButton = screen.getByText('Show Full History');
    expect(expandButton).toBeInTheDocument();

    // Expand
    await user.click(expandButton);

    // Should now show collapse button
    await waitFor(() => {
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });

    // Collapse
    const collapseButton = screen.getByText('Show Less');
    await user.click(collapseButton);

    // Should show expand button again
    await waitFor(() => {
      expect(screen.getByText('Show Full History')).toBeInTheDocument();
    });
  });

  it('should expand skills tier with more than 10 skills', async () => {
    const user = userEvent.setup();

    const manySkills = Array.from({ length: 15 }, (_, i) => ({
      id: `skill-${i}`,
      name: `Skill ${i + 1}`,
      discipline: 'ENGINEERING',
      proficiencyLevel: 'INTERMEDIATE',
      validatedAt: '2024-01-01',
      validatedBy: { id: '2', name: 'Validator' },
    }));

    const profileWithManySkills = {
      getProfile: {
        id: '1',
        name: 'User With Skills',
        email: 'user@example.com',
        avatarUrl: null,
        currentSeniority: 'SENIOR',
        coreStack: manySkills,
        validatedInventory: [],
        pending: [],
        seniorityHistory: [],
        currentAssignments: [],
      },
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: profileWithManySkills,
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Should only show 10 skills initially
    expect(screen.getByText('Skill 1')).toBeInTheDocument();
    expect(screen.getByText('Skill 10')).toBeInTheDocument();
    expect(screen.queryByText('Skill 15')).not.toBeInTheDocument();

    // Should have View More button
    const viewMoreButton = screen.getByText(/View More \(5 more\)/i);
    await user.click(viewMoreButton);

    // Now all skills should be visible
    await waitFor(() => {
      expect(screen.getByText('Skill 15')).toBeInTheDocument();
    });

    // Should have View Less button
    const viewLessButton = screen.getByText('View Less');
    expect(viewLessButton).toBeInTheDocument();
  });

  it('should display validated skill metadata correctly', () => {
    const profileWithSkill = {
      getProfile: {
        id: '1',
        name: 'User',
        email: 'user@example.com',
        avatarUrl: null,
        currentSeniority: 'SENIOR',
        coreStack: [
          {
            id: '1',
            name: 'React',
            discipline: 'ENGINEERING',
            proficiencyLevel: 'EXPERT',
            validatedAt: '2024-01-15T00:00:00.000Z',
            validatedBy: { id: '2', name: 'Tech Lead' },
          },
        ],
        validatedInventory: [],
        pending: [],
        seniorityHistory: [],
        currentAssignments: [],
      },
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: profileWithSkill,
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Should show skill with validator info
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('EXPERT')).toBeInTheDocument();
    expect(screen.getByText(/Validated by Tech Lead/i)).toBeInTheDocument();
  });

  it('should display current project assignments with all details', () => {
    const profileWithAssignment = {
      getProfile: {
        id: '1',
        name: 'User',
        email: 'user@example.com',
        avatarUrl: null,
        currentSeniority: 'SENIOR',
        coreStack: [],
        validatedInventory: [],
        pending: [],
        seniorityHistory: [],
        currentAssignments: [
          {
            id: '1',
            projectName: 'Important Project',
            role: 'Senior Developer',
            tags: ['React', 'TypeScript', 'GraphQL'],
            techLead: {
              id: '2',
              name: 'Project Lead',
              email: 'lead@example.com',
            },
          },
        ],
      },
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: profileWithAssignment,
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Should show project details
    expect(screen.getByText('Important Project')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText(/Tech Lead: Project Lead/i)).toBeInTheDocument();
    expect(screen.getByText(/lead@example.com/i)).toBeInTheDocument();
  });

  it('should apply correct discipline badge colors', () => {
    const profileWithDisciplines = {
      getProfile: {
        id: '1',
        name: 'User',
        email: 'user@example.com',
        avatarUrl: null,
        currentSeniority: 'SENIOR',
        coreStack: [
          {
            id: '1',
            name: 'React',
            discipline: 'ENGINEERING',
            proficiencyLevel: 'EXPERT',
            validatedAt: '2024-01-15',
            validatedBy: { id: '2', name: 'Validator' },
          },
        ],
        validatedInventory: [
          {
            id: '2',
            name: 'Figma',
            discipline: 'DESIGN',
            proficiencyLevel: 'INTERMEDIATE',
            validatedAt: '2024-01-15',
            validatedBy: { id: '2', name: 'Validator' },
          },
        ],
        pending: [
          {
            id: '3',
            name: 'Product Analytics',
            discipline: 'PRODUCT',
            suggestedProficiency: 'BEGINNER',
            createdAt: '2024-01-15',
          },
        ],
        seniorityHistory: [],
        currentAssignments: [],
      },
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: profileWithDisciplines,
    });

    const { container } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Check discipline badges exist
    expect(screen.getByText('ENGINEERING')).toBeInTheDocument();
    expect(screen.getByText('DESIGN')).toBeInTheDocument();
    expect(screen.getByText('PRODUCT')).toBeInTheDocument();
  });
});
