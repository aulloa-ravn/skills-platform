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

const renderInbox = (additionalMocks = []) => {
  const baseMocks = [
    {
      request: {
        query: GET_VALIDATION_INBOX_QUERY,
      },
      result: {
        data: mockInboxData,
      },
    },
  ];

  const allMocks = [...baseMocks, ...additionalMocks];

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

describe("Inbox - GraphQL Mutation Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute approve mutation successfully", async () => {
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

    // Check for success toast
    await waitFor(() => {
      expect(
        screen.getByText(/successfully approved react for john doe/i)
      ).toBeInTheDocument();
    });
  });

  it("should execute reject mutation successfully", async () => {
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

    // Check for success toast
    await waitFor(() => {
      expect(
        screen.getByText(/rejected react for john doe/i)
      ).toBeInTheDocument();
    });
  });

  it("should handle mutation errors and display error toast", async () => {
    const user = userEvent.setup();

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
      error: new Error("Network error"),
    };

    renderInbox([errorMock]);

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // Check for error toast
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it("should apply optimistic updates and remove suggestion from cache", async () => {
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

    // After optimistic update, the suggestion should be removed
    // and we should navigate to the next suggestion (TypeScript)
    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });
  });

  it("should handle API errors in response and display error toast", async () => {
    const user = userEvent.setup();

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
                message: "Suggestion already resolved",
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

    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // Check for error toast with API error message
    await waitFor(() => {
      expect(
        screen.getByText(/suggestion already resolved/i)
      ).toBeInTheDocument();
    });
  });

  it("should navigate to next employee after resolving last suggestion", async () => {
    const user = userEvent.setup();

    const mockInboxWithMultipleEmployees = {
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
              {
                employeeId: "employee-2",
                employeeName: "Jane Smith",
                employeeEmail: "jane@example.com",
                pendingSuggestionsCount: 1,
                suggestions: [
                  {
                    id: "suggestion-2",
                    skillName: "Vue.js",
                    discipline: "ENGINEERING",
                    suggestedProficiency: "INTERMEDIATE",
                    source: "SELF_REPORT",
                    createdAt: "2025-12-03T00:00:00Z",
                    currentProficiency: null,
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
        data: mockInboxWithMultipleEmployees,
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
        <MockedProvider mocks={[inboxMock, approveMock]}>
          <ToastNotificationProvider>
            <Inbox />
          </ToastNotificationProvider>
        </MockedProvider>
      </BrowserRouter>
    );

    // Wait for React skill to be visible
    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // Should navigate to next employee (Jane Smith) with Vue.js skill
    await waitFor(
      () => {
        expect(screen.getByText("Vue.js")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
