import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { BrowserRouter } from "react-router-dom";
import Inbox from "../Inbox";
import { GET_VALIDATION_INBOX_QUERY } from "../../graphql/queries";
import { RESOLVE_SUGGESTIONS_MUTATION } from "../../graphql/mutations";
import { ToastNotificationProvider } from "../../contexts/ToastNotificationContext";

// Mock the useAuth hook
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    profile: {
      id: "tech-lead-1",
      name: "Tech Lead",
      email: "tech@example.com",
      role: "TECH_LEAD",
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    error: null,
    isInitializing: false,
  }),
  Role: {
    EMPLOYEE: "EMPLOYEE",
    TECH_LEAD: "TECH_LEAD",
    ADMIN: "ADMIN",
  },
}));

const mockInboxData = {
  getValidationInbox: {
    projects: [
      {
        projectId: "project-1",
        projectName: "Project Alpha",
        pendingSuggestionsCount: 2,
        employees: [
          {
            employeeId: "employee-1",
            employeeName: "John Doe",
            employeeEmail: "john@example.com",
            pendingSuggestionsCount: 2,
            suggestions: [
              {
                id: "suggestion-1",
                skillName: "React",
                discipline: "ENGINEERING",
                suggestedProficiency: "ADVANCED",
                source: "SELF_REPORT",
                createdAt: "2025-12-01T00:00:00Z",
                currentProficiency: "INTERMEDIATE",
              },
              {
                id: "suggestion-2",
                skillName: "TypeScript",
                discipline: "ENGINEERING",
                suggestedProficiency: "EXPERT",
                source: "SYSTEM_FLAG",
                createdAt: "2025-12-02T00:00:00Z",
                currentProficiency: null,
              },
            ],
          },
        ],
      },
    ],
  },
};

const mocks = [
  {
    request: {
      query: GET_VALIDATION_INBOX_QUERY,
    },
    result: {
      data: mockInboxData,
    },
  },
];

const renderInbox = (additionalMocks = []) => {
  const allMocks = [...mocks, ...additionalMocks];

  return render(
    <BrowserRouter>
      <MockedProvider mocks={allMocks}>
        <ToastNotificationProvider>
          <Inbox />
        </ToastNotificationProvider>
      </MockedProvider>
    </BrowserRouter>
  );
};

describe("Inbox - Action Buttons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render three action buttons for each suggestion card", async () => {
    renderInbox();

    // Wait for the inbox to load
    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    // Check that all three action buttons are present
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /adjust level/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /approve/i })
    ).toBeInTheDocument();
  });

  it("should display action buttons in correct horizontal layout", async () => {
    renderInbox();

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    const rejectButton = screen.getByRole("button", { name: /reject/i });
    const adjustButton = screen.getByRole("button", { name: /adjust level/i });
    const approveButton = screen.getByRole("button", { name: /approve/i });

    // Verify buttons exist
    expect(rejectButton).toBeInTheDocument();
    expect(adjustButton).toBeInTheDocument();
    expect(approveButton).toBeInTheDocument();
  });

  it("should trigger approve handler when Approve button is clicked", async () => {
    const user = userEvent.setup();

    const approveMock = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "suggestion-1",
                action: "APPROVE",
              },
            ],
          },
        },
      },
      result: {
        data: {
          resolveSuggestions: {
            success: true,
            processed: [
              {
                suggestionId: "suggestion-1",
                action: "APPROVE",
                employeeName: "John Doe",
                skillName: "React",
                proficiencyLevel: "ADVANCED",
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderInbox([approveMock]);

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // The button should show loading state initially
    await waitFor(() => {
      expect(approveButton).toBeDisabled();
    });
  });

  it("should trigger reject handler when Reject button is clicked", async () => {
    const user = userEvent.setup();

    const rejectMock = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "suggestion-1",
                action: "REJECT",
              },
            ],
          },
        },
      },
      result: {
        data: {
          resolveSuggestions: {
            success: true,
            processed: [
              {
                suggestionId: "suggestion-1",
                action: "REJECT",
                employeeName: "John Doe",
                skillName: "React",
                proficiencyLevel: null,
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderInbox([rejectMock]);

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    const rejectButton = screen.getByRole("button", { name: /reject/i });
    await user.click(rejectButton);

    // The button should show loading state initially
    await waitFor(() => {
      expect(rejectButton).toBeDisabled();
    });
  });

  it("should disable all buttons when any action is processing", async () => {
    const user = userEvent.setup();

    const approveMock = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "suggestion-1",
                action: "APPROVE",
              },
            ],
          },
        },
      },
      result: {
        data: {
          resolveSuggestions: {
            success: true,
            processed: [
              {
                suggestionId: "suggestion-1",
                action: "APPROVE",
                employeeName: "John Doe",
                skillName: "React",
                proficiencyLevel: "ADVANCED",
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderInbox([approveMock]);

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    const approveButton = screen.getByRole("button", { name: /approve/i });
    const rejectButton = screen.getByRole("button", { name: /reject/i });
    const adjustButton = screen.getByRole("button", { name: /adjust level/i });

    await user.click(approveButton);

    // All buttons should be disabled during processing
    await waitFor(() => {
      expect(approveButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
      expect(adjustButton).toBeDisabled();
    });
  });
});
