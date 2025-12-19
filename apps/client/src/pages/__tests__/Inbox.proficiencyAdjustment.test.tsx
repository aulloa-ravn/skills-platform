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

// Mock inbox data
const mockInboxData = {
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

const renderWithProviders = (mocks: any[] = [mockInboxData]) => {
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

describe("Inbox - Proficiency Adjustment Flow", () => {
  it("should expand inline adjustment controls when Adjust Level is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    const adjustButton = screen.getByText("Adjust Level");
    await user.click(adjustButton);

    // Should show the RadioGroup with proficiency options
    await waitFor(() => {
      expect(screen.getByText("Novice")).toBeInTheDocument();
      expect(screen.getByText("Intermediate")).toBeInTheDocument();
      expect(screen.getByText("Advanced")).toBeInTheDocument();
      expect(screen.getByText("Expert")).toBeInTheDocument();
    });

    // Should show Confirm and Cancel buttons
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();

    // Should hide Approve and Reject buttons
    expect(screen.queryByText("Approve")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject")).not.toBeInTheDocument();
  });

  it("should pre-select the suggested proficiency level when controls expand", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    const adjustButton = screen.getByText("Adjust Level");
    await user.click(adjustButton);

    await waitFor(() => {
      expect(screen.getByText("Advanced")).toBeInTheDocument();
    });

    // The ADVANCED radio should be selected (checked)
    const advancedRadio = screen.getByLabelText("Advanced") as HTMLInputElement;
    expect(advancedRadio.checked).toBe(true);
  });

  it("should show original suggested level indicator", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    const adjustButton = screen.getByText("Adjust Level");
    await user.click(adjustButton);

    await waitFor(() => {
      expect(screen.getByText(/Suggested:/i)).toBeInTheDocument();
    });

    // Should show "Suggested: Advanced" or similar
    expect(screen.getByText(/Advanced/i)).toBeInTheDocument();
  });

  it("should collapse controls and restore buttons when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Open adjustment controls
    const adjustButton = screen.getByText("Adjust Level");
    await user.click(adjustButton);

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    // Click Cancel
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    // Should restore original buttons
    await waitFor(() => {
      expect(screen.getByText("Approve")).toBeInTheDocument();
      expect(screen.getByText("Reject")).toBeInTheDocument();
      expect(screen.getByText("Adjust Level")).toBeInTheDocument();
    });

    // Should hide adjustment controls
    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
    expect(screen.queryByText("Novice")).not.toBeInTheDocument();
  });

  it("should trigger mutation with adjusted proficiency when Confirm is clicked", async () => {
    const user = userEvent.setup();

    const mockMutation = {
      request: {
        query: RESOLVE_SUGGESTIONS_MUTATION,
        variables: {
          input: {
            decisions: [
              {
                suggestionId: "sugg1",
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
                suggestionId: "sugg1",
                action: "ADJUST_LEVEL",
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

    renderWithProviders([mockInboxData, mockMutation]);

    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Open adjustment controls
    const adjustButton = screen.getByText("Adjust Level");
    await user.click(adjustButton);

    await waitFor(() => {
      expect(screen.getByText("Expert")).toBeInTheDocument();
    });

    // Select Expert proficiency
    const expertRadio = screen.getByLabelText("Expert");
    await user.click(expertRadio);

    // Click Confirm
    const confirmButton = screen.getByText("Confirm");
    await user.click(confirmButton);

    // Should show loading state
    await waitFor(() => {
      expect(confirmButton).toBeDisabled();
    });

    // Should show success toast
    await waitFor(
      () => {
        expect(
          screen.getByText(/Adjusted TypeScript to Expert for John Doe/i)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should allow changing proficiency level before confirming", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    // Open adjustment controls
    const adjustButton = screen.getByText("Adjust Level");
    await user.click(adjustButton);

    await waitFor(() => {
      expect(screen.getByText("Advanced")).toBeInTheDocument();
    });

    // Initially Advanced should be selected
    let advancedRadio = screen.getByLabelText("Advanced") as HTMLInputElement;
    expect(advancedRadio.checked).toBe(true);

    // Select Intermediate
    const intermediateRadio = screen.getByLabelText("Intermediate");
    await user.click(intermediateRadio);

    // Intermediate should now be selected
    await waitFor(() => {
      const intermediateRadioChecked = screen.getByLabelText(
        "Intermediate"
      ) as HTMLInputElement;
      expect(intermediateRadioChecked.checked).toBe(true);
    });

    // Advanced should no longer be selected
    advancedRadio = screen.getByLabelText("Advanced") as HTMLInputElement;
    expect(advancedRadio.checked).toBe(false);
  });
});
