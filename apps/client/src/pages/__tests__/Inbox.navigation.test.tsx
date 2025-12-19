import { describe, it, expect, vi } from "vitest";
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

// Mock inbox data with multiple employees and projects
const mockMultipleEmployeesData = {
  request: {
    query: GET_VALIDATION_INBOX_QUERY,
  },
  result: {
    data: {
      getValidationInbox: {
        projects: [
          {
            projectId: "proj1",
            projectName: "Project Alpha",
            pendingSuggestionsCount: 2,
            employees: [
              {
                employeeId: "emp1",
                employeeName: "John Doe",
                employeeEmail: "john@test.com",
                pendingSuggestionsCount: 1,
                suggestions: [
                  {
                    id: "sugg1",
                    skillName: "TypeScript",
                    discipline: "ENGINEERING",
                    suggestedProficiency: "ADVANCED",
                    source: "SELF_REPORT",
                    createdAt: "2024-01-15T10:00:00Z",
                    currentProficiency: "INTERMEDIATE",
                  },
                ],
              },
              {
                employeeId: "emp2",
                employeeName: "Jane Smith",
                employeeEmail: "jane@test.com",
                pendingSuggestionsCount: 1,
                suggestions: [
                  {
                    id: "sugg2",
                    skillName: "React",
                    discipline: "ENGINEERING",
                    suggestedProficiency: "EXPERT",
                    source: "SELF_REPORT",
                    createdAt: "2024-01-16T10:00:00Z",
                    currentProficiency: "ADVANCED",
                  },
                ],
              },
            ],
          },
          {
            projectId: "proj2",
            projectName: "Project Beta",
            pendingSuggestionsCount: 1,
            employees: [
              {
                employeeId: "emp3",
                employeeName: "Bob Johnson",
                employeeEmail: "bob@test.com",
                pendingSuggestionsCount: 1,
                suggestions: [
                  {
                    id: "sugg3",
                    skillName: "Node.js",
                    discipline: "ENGINEERING",
                    suggestedProficiency: "INTERMEDIATE",
                    source: "SYSTEM_FLAG",
                    createdAt: "2024-01-17T10:00:00Z",
                    currentProficiency: null,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
};

const renderWithProviders = (mocks: any[]) => {
  return render(
    <BrowserRouter>
      <ToastNotificationProvider>
        <MockedProvider mocks={mocks}>
          <Inbox />
        </MockedProvider>
      </ToastNotificationProvider>
    </BrowserRouter>
  );
};

describe("Inbox - Navigation Logic", () => {
  it("should navigate to next team member in same project after resolving suggestion", async () => {
    const user = userEvent.setup();

    const mockMutation = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "sugg1",
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
                suggestionId: "sugg1",
                action: "APPROVE",
                employeeName: "John Doe",
                skillName: "TypeScript",
                proficiencyLevel: "ADVANCED",
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderWithProviders([mockMultipleEmployeesData, mockMutation]);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Approve the first employee's suggestion
    const approveButton = screen.getByText("Approve");
    await user.click(approveButton);

    // Should navigate to Jane Smith (next employee in same project)
    await waitFor(
      () => {
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("React")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should navigate to next project when no more team members in current project", async () => {
    const user = userEvent.setup();

    const mockMutation = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "sugg2",
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
                suggestionId: "sugg2",
                action: "APPROVE",
                employeeName: "Jane Smith",
                skillName: "React",
                proficiencyLevel: "EXPERT",
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderWithProviders([mockMultipleEmployeesData, mockMutation]);

    // Wait for initial data and select Jane Smith (last in Project Alpha)
    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Click on Jane Smith
    const janeButton = screen.getByText("Jane Smith");
    await user.click(janeButton);

    await waitFor(() => {
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    // Approve Jane's suggestion
    const approveButton = screen.getByText("Approve");
    await user.click(approveButton);

    // Should navigate to Bob Johnson in Project Beta
    await waitFor(
      () => {
        expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
        expect(screen.getByText("Node.js")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should show empty state when all suggestions are resolved", async () => {
    const user = userEvent.setup();

    const singleSuggestionData = {
      request: {
        query: GET_VALIDATION_INBOX_QUERY,
      },
      result: {
        data: {
          getValidationInbox: {
            projects: [
              {
                projectId: "proj1",
                projectName: "Project Alpha",
                pendingSuggestionsCount: 1,
                employees: [
                  {
                    employeeId: "emp1",
                    employeeName: "John Doe",
                    employeeEmail: "john@test.com",
                    pendingSuggestionsCount: 1,
                    suggestions: [
                      {
                        id: "sugg1",
                        skillName: "TypeScript",
                        discipline: "ENGINEERING",
                        suggestedProficiency: "ADVANCED",
                        source: "SELF_REPORT",
                        createdAt: "2024-01-15T10:00:00Z",
                        currentProficiency: "INTERMEDIATE",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    };

    const mockMutation = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "sugg1",
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
                suggestionId: "sugg1",
                action: "APPROVE",
                employeeName: "John Doe",
                skillName: "TypeScript",
                proficiencyLevel: "ADVANCED",
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderWithProviders([singleSuggestionData, mockMutation]);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Approve the last suggestion
    const approveButton = screen.getByText("Approve");
    await user.click(approveButton);

    // Should show empty state message
    await waitFor(
      () => {
        expect(
          screen.getByText("All suggestions resolved! Great work.")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should maintain master-detail structure during navigation", async () => {
    const user = userEvent.setup();

    const mockMutation = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "sugg1",
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
                suggestionId: "sugg1",
                action: "APPROVE",
                employeeName: "John Doe",
                skillName: "TypeScript",
                proficiencyLevel: "ADVANCED",
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderWithProviders([mockMultipleEmployeesData, mockMutation]);

    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Initial employee is selected
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    // Approve suggestion
    const approveButton = screen.getByText("Approve");
    await user.click(approveButton);

    // After navigation, Jane Smith should be selected
    await waitFor(
      () => {
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Master-detail structure should be maintained
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
  });

  it("should update sidebar counts after successful resolution", async () => {
    const user = userEvent.setup();

    const mockMutation = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "sugg1",
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
                suggestionId: "sugg1",
                action: "APPROVE",
                employeeName: "John Doe",
                skillName: "TypeScript",
                proficiencyLevel: "ADVANCED",
              },
            ],
            errors: [],
          },
        },
      },
    };

    renderWithProviders([mockMultipleEmployeesData, mockMutation]);

    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Initial project count should be 2
    const projectAlpha = screen.getByText("Project Alpha").closest("button");
    expect(projectAlpha).toHaveTextContent("2");

    // Approve suggestion
    const approveButton = screen.getByText("Approve");
    await user.click(approveButton);

    // After resolution, project count should be updated to 1
    await waitFor(
      () => {
        const updatedProjectAlpha = screen
          .getByText("Project Alpha")
          .closest("button");
        expect(updatedProjectAlpha).toHaveTextContent("1");
      },
      { timeout: 3000 }
    );
  });
});
