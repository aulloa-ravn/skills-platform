import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { useAuth, Role } from "../contexts/AuthContext";
import {
  GET_VALIDATION_INBOX_QUERY,
  type GetValidationInboxResponse,
  type ProjectInbox,
  type EmployeeInbox,
  type PendingSuggestion,
} from "../graphql/queries";

/**
 * Validation Inbox page component for TECH_LEAD and ADMIN roles
 * Displays pending skill suggestions organized by projects and team members
 */
const Inbox: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // GraphQL query for inbox data
  const { loading, error, data, refetch } =
    useQuery<GetValidationInboxResponse>(GET_VALIDATION_INBOX_QUERY);

  // Client-side state management
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [currentSuggestionIndex, setCurrentSuggestionIndex] =
    useState<number>(0);

  // Redirect EMPLOYEE role to home page
  useEffect(() => {
    if (profile?.role === Role.EMPLOYEE) {
      navigate("/", { replace: true });
    }
  }, [profile, navigate]);

  // Auto-expand first project and auto-select first employee on mount
  useEffect(() => {
    if (
      data?.getValidationInbox.projects &&
      data.getValidationInbox.projects.length > 0
    ) {
      const firstProject = data.getValidationInbox.projects[0];
      setExpandedProjects(new Set([firstProject.projectId]));

      if (firstProject.employees.length > 0) {
        setSelectedProjectId(firstProject.projectId);
        setSelectedEmployeeId(firstProject.employees[0].employeeId);
        setCurrentSuggestionIndex(0);
      }
    }
  }, [data]);

  // Flatten employees across all projects for cross-person navigation
  const flattenedEmployees = useMemo(() => {
    if (!data?.getValidationInbox.projects) return [];

    const employees: Array<{ projectId: string; employee: EmployeeInbox }> = [];
    data.getValidationInbox.projects.forEach((project) => {
      project.employees.forEach((employee) => {
        employees.push({ projectId: project.projectId, employee });
      });
    });
    return employees;
  }, [data]);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDisciplineColor = (discipline: string) => {
    const colors: Record<string, string> = {
      ENGINEERING: "bg-blue-500/20 text-blue-300",
      DESIGN: "bg-pink-500/20 text-pink-300",
      PRODUCT: "bg-green-500/20 text-green-300",
      DATA: "bg-yellow-500/20 text-yellow-300",
    };
    return colors[discipline] || "bg-gray-500/20 text-gray-300";
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      SELF_REPORT: "bg-blue-500/20 text-blue-300",
      SYSTEM_FLAG: "bg-yellow-500/20 text-yellow-300",
    };
    return colors[source] || "bg-gray-500/20 text-gray-300";
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const selectEmployee = (projectId: string, employeeId: string) => {
    setSelectedProjectId(projectId);
    setSelectedEmployeeId(employeeId);
    setCurrentSuggestionIndex(0);
  };

  const goToNextSuggestion = () => {
    const selectedEmployee = flattenedEmployees.find(
      (e) => e.employee.employeeId === selectedEmployeeId
    );
    if (
      selectedEmployee &&
      currentSuggestionIndex < selectedEmployee.employee.suggestions.length - 1
    ) {
      setCurrentSuggestionIndex(currentSuggestionIndex + 1);
    }
  };

  const goToPreviousSuggestion = () => {
    if (currentSuggestionIndex > 0) {
      setCurrentSuggestionIndex(currentSuggestionIndex - 1);
    }
  };

  const goToNextPerson = () => {
    const currentIndex = flattenedEmployees.findIndex(
      (e) => e.employee.employeeId === selectedEmployeeId
    );
    if (currentIndex < flattenedEmployees.length - 1) {
      const next = flattenedEmployees[currentIndex + 1];
      selectEmployee(next.projectId, next.employee.employeeId);
    }
  };

  const goToPreviousPerson = () => {
    const currentIndex = flattenedEmployees.findIndex(
      (e) => e.employee.employeeId === selectedEmployeeId
    );
    if (currentIndex > 0) {
      const prev = flattenedEmployees[currentIndex - 1];
      selectEmployee(prev.projectId, prev.employee.employeeId);
    }
  };

  // Don't render for EMPLOYEE users
  if (profile?.role === Role.EMPLOYEE) {
    return null;
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Starry background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white/40 rounded-full"></div>
          <div className="absolute top-[20%] left-[25%] w-1 h-1 bg-white/30 rounded-full"></div>
          <div className="absolute top-[15%] left-[75%] w-1 h-1 bg-white/50 rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar skeleton */}
              <div className="w-full md:w-[30%]">
                <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
                  <div className="h-64 bg-gray-700/30 animate-pulse rounded-lg"></div>
                </div>
              </div>
              {/* Content skeleton */}
              <div className="w-full md:w-[70%]">
                <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
                  <div className="h-96 bg-gray-700/30 animate-pulse rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="relative z-10 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-300 mb-2">
                Error Loading Inbox
              </h2>
              <p className="text-sm text-red-300 mb-4">
                {error.message || "Failed to load inbox. Please try again."}
              </p>
              <button
                onClick={() => refetch()}
                className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-6 py-3 rounded-lg transition-colors border border-gray-600/50"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const projects = data?.getValidationInbox.projects || [];
  const selectedEmployee = flattenedEmployees.find(
    (e) => e.employee.employeeId === selectedEmployeeId
  );
  const currentSuggestion =
    selectedEmployee?.employee.suggestions[currentSuggestionIndex];
  const currentEmployeeIndex = flattenedEmployees.findIndex(
    (e) => e.employee.employeeId === selectedEmployeeId
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Validation Inbox</h1>
        <p className="text-gray-400 mt-2">
          Review pending skill suggestions for your team
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar */}
        <div className="w-full md:w-[30%] overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Projects</h2>

            {projects.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No pending validations at this time
              </p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.projectId}>
                    {/* Project header */}
                    <button
                      onClick={() => toggleProject(project.projectId)}
                      className="w-full flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/40 rounded-lg border border-gray-600/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedProjects.has(project.projectId)
                              ? "rotate-90"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span className="font-semibold text-white">
                          {project.projectName}
                        </span>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-300">
                        {project.pendingSuggestionsCount}
                      </span>
                    </button>

                    {/* Team members list */}
                    {expandedProjects.has(project.projectId) && (
                      <div className="ml-4 mt-2 space-y-2">
                        {project.employees.map((employee) => (
                          <button
                            key={employee.employeeId}
                            onClick={() =>
                              selectEmployee(
                                project.projectId,
                                employee.employeeId
                              )
                            }
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              selectedEmployeeId === employee.employeeId
                                ? "bg-gray-700/50 border-l-4 border-purple-500"
                                : "bg-gray-700/20 hover:bg-gray-700/30"
                            }`}
                          >
                            {/* Avatar */}
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">
                                {employee.employeeName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {/* Name and count */}
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium text-white">
                                {employee.employeeName}
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-300">
                              {employee.pendingSuggestionsCount}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right content */}
        <div className="w-full md:w-[70%] overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8">
            {!selectedEmployee || !currentSuggestion ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">
                  Select a team member to review suggestions
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Employee info */}
                <div className="flex items-center gap-4 pb-6 border-b border-gray-700/50">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-2xl">
                      {selectedEmployee.employee.employeeName
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedEmployee.employee.employeeName}
                    </h2>
                    <p className="text-gray-400">
                      {selectedEmployee.employee.employeeEmail}
                    </p>
                  </div>
                </div>

                {/* Suggestion card */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-400">
                      Suggestion {currentSuggestionIndex + 1} of{" "}
                      {selectedEmployee.employee.suggestions.length}
                    </p>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {currentSuggestion.skillName}
                    </h3>

                    <div className="space-y-4">
                      {/* Discipline */}
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Discipline</p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDisciplineColor(currentSuggestion.discipline)}`}
                        >
                          {currentSuggestion.discipline}
                        </span>
                      </div>

                      {/* Current Proficiency */}
                      <div>
                        <p className="text-sm text-gray-400 mb-1">
                          Current Proficiency
                        </p>
                        {currentSuggestion.currentProficiency ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-300">
                            {currentSuggestion.currentProficiency}
                          </span>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No current proficiency
                          </p>
                        )}
                      </div>

                      {/* Suggested Proficiency */}
                      <div>
                        <p className="text-sm text-gray-400 mb-1">
                          Suggested Proficiency
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-300">
                          {currentSuggestion.suggestedProficiency}
                        </span>
                      </div>

                      {/* Source */}
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Source</p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(currentSuggestion.source)}`}
                        >
                          {currentSuggestion.source}
                        </span>
                      </div>

                      {/* Created date */}
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Created</p>
                        <p className="text-gray-300 text-sm">
                          {formatDate(currentSuggestion.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Suggestion navigation */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700/50">
                      <button
                        onClick={goToPreviousSuggestion}
                        disabled={currentSuggestionIndex === 0}
                        className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-700/20 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors border border-gray-600/50"
                      >
                        Previous Suggestion
                      </button>
                      <button
                        onClick={goToNextSuggestion}
                        disabled={
                          currentSuggestionIndex ===
                          selectedEmployee.employee.suggestions.length - 1
                        }
                        className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-700/20 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors border border-gray-600/50"
                      >
                        Next Suggestion
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cross-person navigation */}
                <div className="flex gap-3 pt-6 border-t border-gray-700/50">
                  <button
                    onClick={goToPreviousPerson}
                    disabled={currentEmployeeIndex === 0}
                    className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-700/20 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors border border-gray-600/50"
                  >
                    Previous Person
                  </button>
                  <button
                    onClick={goToNextPerson}
                    disabled={
                      currentEmployeeIndex === flattenedEmployees.length - 1
                    }
                    className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-700/20 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors border border-gray-600/50"
                  >
                    Next Person
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
