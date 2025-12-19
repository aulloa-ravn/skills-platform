import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
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
        pendingSuggestionsCount: 3,
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
          {
            employeeId: "employee-2",
            employeeName: "Jane Smith",
            employeeEmail: "jane@example.com",
            pendingSuggestionsCount: 1,
            suggestions: [
              {
                id: "suggestion-3",
                skillName: "Node.js",
                discipline: "ENGINEERING",
                suggestedProficiency: "INTERMEDIATE",
                source: "SELF_REPORT",
                createdAt: "2025-12-03T00:00:00Z",
                currentProficiency: "NOVICE",
              },
            ],
          },
        ],
      },
      {
        projectId: "project-2",
        projectName: "Project Beta",
        pendingSuggestionsCount: 1,
        employees: [
          {
            employeeId: "employee-3",
            employeeName: "Bob Johnson",
            employeeEmail: "bob@example.com",
            pendingSuggestionsCount: 1,
            suggestions: [
              {
                id: "suggestion-4",
                skillName: "Vue.js",
                discipline: "ENGINEERING",
                suggestedProficiency: "ADVANCED",
                source: "SYSTEM_FLAG",
                createdAt: "2025-12-04T00:00:00Z",
                currentProficiency: null,
              },
            ],
          },
        ],
      },
    ],
  },
};

const renderInbox = (additionalMocks: any[] = []) => {
  const baseMock = {
    request: {
      query: GET_VALIDATION_INBOX_QUERY,
    },
    result: {
      data: mockInboxData,
    },
  };

  const allMocks = [baseMock, ...additionalMocks];

  return render(
    <BrowserRouter>
      <ToastNotificationProvider>
        <MockedProvider mocks={allMocks}>
          <Inbox />
        </MockedProvider>
      </ToastNotificationProvider>
    </BrowserRouter>
  );
};

describe("Inbox - End-to-End Integration Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should complete full approve workflow with toast and navigation", async () => {
    const user = userEvent.setup({ delay: null });

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

    // Wait for inbox to load
    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    // Click Approve button
    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // Verify toast notification appears
    await waitFor(() => {
      expect(
        screen.getByText(/Successfully approved React for John Doe/i)
      ).toBeInTheDocument();
    });

    // Verify navigation to next suggestion (TypeScript for same employee)
    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Fast-forward time to check toast auto-dismiss
    vi.advanceTimersByTime(4000);

    // Toast should be dismissed
    await waitFor(() => {
      expect(
        screen.queryByText(/Successfully approved React for John Doe/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should complete full reject workflow with toast and navigation", async () => {
    const user = userEvent.setup({ delay: null });

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

    // Click Reject button
    const rejectButton = screen.getByRole("button", { name: /reject/i });
    await user.click(rejectButton);

    // Verify toast notification
    await waitFor(() => {
      expect(
        screen.getByText(/Rejected React for John Doe/i)
      ).toBeInTheDocument();
    });

    // Verify navigation to next suggestion
    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Verify toast auto-dismisses
    vi.advanceTimersByTime(4000);
    await waitFor(() => {
      expect(
        screen.queryByText(/Rejected React for John Doe/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should complete full proficiency adjustment workflow with toast", async () => {
    const user = userEvent.setup({ delay: null });

    const adjustMock = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "suggestion-1",
                action: "ADJUST_LEVEL",
                adjustedProficiency: "EXPERT",
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
                action: "ADJUST_LEVEL",
                employeeName: "John Doe",
                skillName: "React",
                proficiencyLevel: "EXPERT",
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderInbox([adjustMock]);

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    // Click Adjust Level button
    const adjustButton = screen.getByRole("button", { name: /adjust level/i });
    await user.click(adjustButton);

    // Verify controls expand and buttons hide
    await waitFor(() => {
      expect(screen.getByLabelText("Expert")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /approve/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /reject/i })
      ).not.toBeInTheDocument();
    });

    // Select Expert proficiency
    const expertRadio = screen.getByLabelText("Expert");
    await user.click(expertRadio);

    // Click Confirm
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    // Verify success toast with adjusted proficiency
    await waitFor(() => {
      expect(
        screen.getByText(/Adjusted React to Expert for John Doe/i)
      ).toBeInTheDocument();
    });

    // Verify navigation to next suggestion
    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Verify toast auto-dismisses
    vi.advanceTimersByTime(4000);
    await waitFor(() => {
      expect(
        screen.queryByText(/Adjusted React to Expert for John Doe/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should handle mutation error with revert and error toast", async () => {
    const user = userEvent.setup({ delay: null });

    const errorMock = {
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
      error: new Error("Network error: Unable to reach server"),
    };

    renderInbox([errorMock]);

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    // Click Approve
    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // Verify error toast appears
    await waitFor(() => {
      expect(
        screen.getByText(/Network error: Unable to reach server/i)
      ).toBeInTheDocument();
    });

    // Verify suggestion is still visible (optimistic update reverted)
    expect(screen.getByText("React")).toBeInTheDocument();

    // Verify buttons are re-enabled for retry
    await waitFor(() => {
      expect(approveButton).not.toBeDisabled();
    });

    // Verify error toast auto-dismisses
    vi.advanceTimersByTime(4000);
    await waitFor(() => {
      expect(
        screen.queryByText(/Network error: Unable to reach server/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should navigate to next project when current project is completed", async () => {
    const user = userEvent.setup({ delay: null });

    // Mock resolving the last suggestion in Project Alpha (Jane's Node.js)
    const resolveMock = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "suggestion-3",
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
                suggestionId: "suggestion-3",
                action: "APPROVE",
                employeeName: "Jane Smith",
                skillName: "Node.js",
                proficiencyLevel: "INTERMEDIATE",
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderInbox([resolveMock]);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Navigate to Jane Smith (last employee in Project Alpha)
    const janeButton = screen.getByText("Jane Smith");
    await user.click(janeButton);

    await waitFor(() => {
      expect(screen.getByText("Node.js")).toBeInTheDocument();
    });

    // Approve Jane's suggestion
    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // Should navigate to next project (Project Beta - Bob Johnson)
    await waitFor(
      () => {
        expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
        expect(screen.getByText("Vue.js")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should display empty state when all suggestions are resolved", async () => {
    const user = userEvent.setup({ delay: null });

    // Create inbox with single suggestion
    const singleSuggestionInbox = {
      getValidationInbox: {
        projects: [
          {
            projectId: "project-1",
            projectName: "Project Alpha",
            pendingSuggestionsCount: 1,
            employees: [
              {
                employeeId: "employee-1",
                employeeName: "John Doe",
                employeeEmail: "john@example.com",
                pendingSuggestionsCount: 1,
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
                ],
              },
            ],
          },
        ],
      },
    };

    const inboxMock = {
      request: {
        query: GET_VALIDATION_INBOX_QUERY,
      },
      result: {
        data: singleSuggestionInbox,
      },
    };

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

    render(
      <BrowserRouter>
        <ToastNotificationProvider>
          <MockedProvider mocks={[inboxMock, approveMock]}>
            <Inbox />
          </MockedProvider>
        </ToastNotificationProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    // Approve the last suggestion
    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // Verify empty state appears
    await waitFor(
      () => {
        expect(
          screen.getByText("All suggestions resolved! Great work.")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should stack multiple toast notifications when rapid actions occur", async () => {
    const user = userEvent.setup({ delay: null });

    const firstApproveMock = {
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

    const secondApproveMock = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "suggestion-2",
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
                suggestionId: "suggestion-2",
                action: "APPROVE",
                employeeName: "John Doe",
                skillName: "TypeScript",
                proficiencyLevel: "EXPERT",
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderInbox([firstApproveMock, secondApproveMock]);

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    // Approve first suggestion
    const firstApproveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(firstApproveButton);

    // Wait for first toast
    await waitFor(() => {
      expect(
        screen.getByText(/Successfully approved React for John Doe/i)
      ).toBeInTheDocument();
    });

    // Navigate to next suggestion
    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Quickly approve second suggestion
    const secondApproveButton = screen.getByRole("button", {
      name: /approve/i,
    });
    await user.click(secondApproveButton);

    // Wait for second toast
    await waitFor(() => {
      expect(
        screen.getByText(/Successfully approved TypeScript for John Doe/i)
      ).toBeInTheDocument();
    });

    // Both toasts should be visible (stacked)
    expect(
      screen.getByText(/Successfully approved React for John Doe/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Successfully approved TypeScript for John Doe/i)
    ).toBeInTheDocument();
  });

  it("should disable all buttons during mutation processing", async () => {
    const user = userEvent.setup({ delay: null });

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
      delay: 1000, // Add delay to observe loading state
    };

    renderInbox([approveMock]);

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    const approveButton = screen.getByRole("button", { name: /approve/i });
    const rejectButton = screen.getByRole("button", { name: /reject/i });
    const adjustButton = screen.getByRole("button", { name: /adjust level/i });

    // Click Approve
    await user.click(approveButton);

    // All buttons should be disabled during processing
    await waitFor(() => {
      expect(approveButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
      expect(adjustButton).toBeDisabled();
    });
  });

  it("should update sidebar counts after successful resolution", async () => {
    const user = userEvent.setup({ delay: null });

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

    // Find initial project count badge
    const projectAlpha = screen.getByText("Project Alpha").closest("button");
    expect(projectAlpha).toHaveTextContent("3");

    // Approve suggestion
    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // Wait for mutation to complete and cache to update
    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Verify project count decremented
    await waitFor(
      () => {
        const updatedProjectAlpha = screen
          .getByText("Project Alpha")
          .closest("button");
        expect(updatedProjectAlpha).toHaveTextContent("2");
      },
      { timeout: 3000 }
    );
  });

  it("should handle API error response with specific error message", async () => {
    const user = userEvent.setup({ delay: null });

    const errorResponseMock = {
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
            success: false,
            processed: [],
            errors: [
              {
                suggestionId: "suggestion-1",
                message: "Suggestion already resolved by another user",
                code: "ALREADY_RESOLVED",
              },
            ],
          },
        },
      },
    };

    renderInbox([errorResponseMock]);

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    // Click Approve
    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // Verify specific error message appears in toast
    await waitFor(() => {
      expect(
        screen.getByText(/Suggestion already resolved by another user/i)
      ).toBeInTheDocument();
    });

    // Verify suggestion remains visible (revert occurred)
    expect(screen.getByText("React")).toBeInTheDocument();

    // Verify buttons are re-enabled
    await waitFor(() => {
      expect(approveButton).not.toBeDisabled();
    });
  });
});
