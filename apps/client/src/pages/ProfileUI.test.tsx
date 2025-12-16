import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';

// Mock useQuery hook
const mockUseQuery = vi.fn();
vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
}));

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Profile UI Components', () => {
  const mockProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: null,
    currentSeniority: 'SENIOR',
    coreStack: [
      {
        id: '1',
        name: 'React',
        discipline: 'ENGINEERING',
        proficiencyLevel: 'ADVANCED',
        validatedAt: '2024-01-15',
        validatedBy: { id: '2', name: 'Jane Smith' },
      },
    ],
    validatedInventory: [
      {
        id: '2',
        name: 'TypeScript',
        discipline: 'ENGINEERING',
        proficiencyLevel: 'EXPERT',
        validatedAt: '2024-02-01',
        validatedBy: { id: '3', name: 'Bob Jones' },
      },
    ],
    pending: [
      {
        id: '3',
        name: 'GraphQL',
        discipline: 'ENGINEERING',
        suggestedProficiency: 'INTERMEDIATE',
        createdAt: '2024-03-01',
      },
    ],
    seniorityHistory: [
      {
        id: '1',
        seniorityLevel: 'SENIOR',
        start_date: '2024-01-01',
        end_date: null,
        createdBy: { id: '2', name: 'Manager' },
      },
    ],
    currentAssignments: [
      {
        id: '1',
        projectName: 'Test Project',
        role: 'Developer',
        tags: ['React', 'TypeScript'],
        techLead: { id: '4', name: 'Lead Dev', email: 'lead@example.com' },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      profile: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'EMPLOYEE' },
    });
  });

  it('should display loading skeleton while data is loading', () => {
    mockUseQuery.mockReturnValue({
      loading: true,
      error: null,
      data: null,
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Check for skeleton elements with animate-pulse
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display error state with retry button when query fails', () => {
    const mockRefetch = vi.fn();
    mockUseQuery.mockReturnValue({
      loading: false,
      error: { message: 'Failed to load profile' },
      data: null,
      refetch: mockRefetch,
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText('Error Loading Profile')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load profile/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should render profile header with user information', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getProfile: mockProfile },
    });

    const { container } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();

    // SENIOR appears multiple times, just check it exists
    const seniorBadges = screen.getAllByText('SENIOR');
    expect(seniorBadges.length).toBeGreaterThan(0);
  });

  it('should display seniority timeline with expand/collapse functionality', async () => {
    const user = userEvent.setup();
    const multipleHistory = {
      ...mockProfile,
      seniorityHistory: [
        ...mockProfile.seniorityHistory,
        { id: '2', seniorityLevel: 'MID', start_date: '2023-01-01', end_date: '2023-12-31', createdBy: null },
        { id: '3', seniorityLevel: 'JUNIOR', start_date: '2022-01-01', end_date: '2022-12-31', createdBy: null },
        { id: '4', seniorityLevel: 'INTERN', start_date: '2021-01-01', end_date: '2021-12-31', createdBy: null },
      ],
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getProfile: multipleHistory },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText('Seniority Timeline')).toBeInTheDocument();

    // Should show "Show Full History" button when more than 3 entries
    const expandButton = screen.getByText('Show Full History');
    expect(expandButton).toBeInTheDocument();

    // Click to expand
    await user.click(expandButton);

    // Should show "Show Less" button after expansion
    await waitFor(() => {
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });
  });

  it('should render skills in three tiers', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getProfile: mockProfile },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Check tier headings
    expect(screen.getByText('Core Stack')).toBeInTheDocument();
    expect(screen.getByText('Validated Inventory')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();

    // Check skills are rendered (they appear in the document somewhere)
    const allText = document.body.textContent || '';
    expect(allText).toContain('React');
    expect(allText).toContain('TypeScript');
    expect(allText).toContain('GraphQL');
  });

  it('should display empty state messages when data is empty', () => {
    const emptyProfile = {
      ...mockProfile,
      coreStack: [],
      validatedInventory: [],
      pending: [],
      seniorityHistory: [],
      currentAssignments: [],
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getProfile: emptyProfile },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText('No core stack skills yet')).toBeInTheDocument();
    expect(screen.getByText('No validated skills in inventory')).toBeInTheDocument();
    expect(screen.getByText('No pending skills')).toBeInTheDocument();
    expect(screen.getByText('No seniority history available')).toBeInTheDocument();
    expect(screen.getByText('No current assignments')).toBeInTheDocument();

    // Check for "Suggest a new skill" button in pending tier
    expect(screen.getByText('Suggest a new skill')).toBeInTheDocument();
  });

  it('should expand and collapse skills tiers when View More/Less is clicked', async () => {
    const user = userEvent.setup();
    const manySkills = Array.from({ length: 15 }, (_, i) => ({
      id: `skill-${i}`,
      name: `Skill ${i}`,
      discipline: 'ENGINEERING',
      proficiencyLevel: 'INTERMEDIATE',
      validatedAt: '2024-01-01',
      validatedBy: { id: '2', name: 'Validator' },
    }));

    const profileWithManySkills = {
      ...mockProfile,
      coreStack: manySkills,
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getProfile: profileWithManySkills },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Should show "View More" button
    const viewMoreButton = screen.getByText(/View More \(5 more\)/i);
    expect(viewMoreButton).toBeInTheDocument();

    // Click to expand
    await user.click(viewMoreButton);

    // Should show "View Less" button
    await waitFor(() => {
      expect(screen.getByText('View Less')).toBeInTheDocument();
    });
  });

  it('should render current projects with tech lead information', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getProfile: mockProfile },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText('Current Projects')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText(/Tech Lead: Lead Dev/i)).toBeInTheDocument();
  });
});
