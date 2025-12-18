import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "../contexts/AuthContext";
import {
  GET_PROFILE_QUERY,
  type GetProfileResponse,
  type GetProfileVariables,
  type ValidatedSkill,
  type PendingSkill,
} from "../graphql/queries";

/**
 * Profile page component displaying employee profile data
 */
const Profile: React.FC = () => {
  const { profile: authProfile } = useAuth();
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [expandedTiers, setExpandedTiers] = useState({
    coreStack: false,
    validatedInventory: false,
    pending: false,
  });

  // Fetch profile data using GraphQL
  const { loading, error, data, refetch } = useQuery<
    GetProfileResponse,
    GetProfileVariables
  >(GET_PROFILE_QUERY, {
    variables: { id: authProfile?.id || "" },
    skip: !authProfile?.id,
  });

  const profileData = data?.getProfile;

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get discipline badge color
  const getDisciplineColor = (discipline: string) => {
    const colors: Record<string, string> = {
      ENGINEERING: "bg-blue-500/20 text-blue-300",
      DESIGN: "bg-pink-500/20 text-pink-300",
      PRODUCT: "bg-green-500/20 text-green-300",
      DATA: "bg-yellow-500/20 text-yellow-300",
    };
    return colors[discipline] || "bg-gray-500/20 text-gray-300";
  };

  // Toggle tier expansion
  const toggleTier = (tier: keyof typeof expandedTiers) => {
    setExpandedTiers((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

  // Render skill card
  const renderSkill = (
    skill: ValidatedSkill | PendingSkill,
    isValidated: boolean,
    index: number
  ) => (
    <div
      key={`skill-${index}-${skill.skillName}`}
      className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 hover:bg-gray-700/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-white">{skill.skillName}</h4>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDisciplineColor(
            skill.discipline
          )}`}
        >
          {skill.discipline}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-300">
          {isValidated
            ? (skill as ValidatedSkill).proficiencyLevel
            : (skill as PendingSkill).suggestedProficiency}
        </span>
      </div>
      {isValidated && (skill as ValidatedSkill).validator && (
        <p className="text-xs text-gray-400 mt-2">
          Validated by {(skill as ValidatedSkill).validator?.name} on{" "}
          {formatDate((skill as ValidatedSkill).validatedAt)}
        </p>
      )}
    </div>
  );

  // Render skills tier
  const renderSkillsTier = (
    title: string,
    skills: ValidatedSkill[] | PendingSkill[],
    tierKey: keyof typeof expandedTiers,
    emptyMessage: string,
    isValidated: boolean = true,
    showActionButton: boolean = false
  ) => {
    const isExpanded = expandedTiers[tierKey];
    const displaySkills = isExpanded ? skills : skills.slice(0, 10);
    const hasMore = skills.length > 10;

    return (
      <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-300">
            {skills.length}
          </span>
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">{emptyMessage}</p>
            {showActionButton && (
              <button className="bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/50 px-4 py-2 rounded-lg text-sm text-gray-300 transition-colors">
                Suggest a new skill
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-4">
              {displaySkills.map((skill, index) =>
                renderSkill(skill, isValidated, index)
              )}
            </div>
            {hasMore && (
              <button
                onClick={() => toggleTier(tierKey)}
                className="w-full py-2 px-4 bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/50 rounded-lg text-sm text-gray-300 transition-colors"
              >
                {isExpanded
                  ? "View Less"
                  : `View More (${skills.length - 10} more)`}
              </button>
            )}
          </>
        )}
      </div>
    );
  };

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
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header skeleton */}
            <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8">
              <div className="h-20 bg-gray-700/30 animate-pulse rounded-lg"></div>
            </div>
            {/* Timeline skeleton */}
            <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
              <div className="flex gap-4">
                <div className="h-16 flex-1 bg-gray-700/30 animate-pulse rounded-lg"></div>
                <div className="h-16 flex-1 bg-gray-700/30 animate-pulse rounded-lg"></div>
                <div className="h-16 flex-1 bg-gray-700/30 animate-pulse rounded-lg"></div>
              </div>
            </div>
            {/* Projects skeleton */}
            <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
              <div className="h-32 bg-gray-700/30 animate-pulse rounded-lg"></div>
            </div>
            {/* Skills skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
                <div className="h-64 bg-gray-700/30 animate-pulse rounded-lg"></div>
              </div>
              <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
                <div className="h-64 bg-gray-700/30 animate-pulse rounded-lg"></div>
              </div>
              <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
                <div className="h-64 bg-gray-700/30 animate-pulse rounded-lg"></div>
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
                Error Loading Profile
              </h2>
              <p className="text-sm text-red-300 mb-4">
                {error.message || "Failed to load profile. Please try again."}
              </p>
              <button
                onClick={() => refetch()}
                className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  const seniorityToShow = showFullHistory
    ? profileData.seniorityHistory
    : profileData.seniorityHistory.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 mt-2">
          Review Seniority Timeline, current projects, and skills
        </p>
      </div>

      {/* Seniority Timeline */}
      <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Seniority Timeline
        </h2>
        {profileData.seniorityHistory.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No seniority history available
          </p>
        ) : (
          <>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-max">
                {seniorityToShow.map((entry, index) => (
                  <div
                    key={`seniority-${index}-${entry.start_date}`}
                    className="flex items-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mb-2">
                        <span className="text-white font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="text-center min-w-[160px]">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
                          {entry.seniorityLevel}
                        </span>
                        <p className="text-xs text-gray-400">
                          {formatDate(entry.start_date)}
                          {entry.end_date && ` - ${formatDate(entry.end_date)}`}
                          {!entry.end_date && " - Present"}
                        </p>
                        {/* {entry.createdBy && (
                              <p className="text-xs text-gray-500 mt-1">
                                by {entry.createdBy.name}
                              </p>
                            )} */}
                      </div>
                    </div>
                    {index < seniorityToShow.length - 1 && (
                      <div className="w-16 border-t border-gray-600 mx-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {profileData.seniorityHistory.length > 3 && (
              <button
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="w-full mt-4 py-2 px-4 bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/50 rounded-lg text-sm text-gray-300 transition-colors"
              >
                {showFullHistory ? "Show Less" : "Show Full History"}
              </button>
            )}
          </>
        )}
      </div>

      {/* Current Projects */}
      <div className="backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Current Projects
        </h2>
        {profileData.currentAssignments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No current assignments
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileData.currentAssignments.map((assignment, index) => (
              <div
                key={`assignment-${index}-${assignment.projectName}`}
                className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {assignment.projectName}
                </h3>
                <p className="text-gray-300 mb-3">{assignment.role}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {assignment.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center bg-blue-500/20 text-blue-300 rounded-full px-2 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {assignment.techLead && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>
                      Tech Lead: {assignment.techLead.name} (
                      {assignment.techLead.email})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Three-Tier Skills Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderSkillsTier(
          "Core Stack",
          profileData.skills.coreStack,
          "coreStack",
          "No core stack skills yet"
        )}
        {renderSkillsTier(
          "Validated Inventory",
          profileData.skills.validatedInventory,
          "validatedInventory",
          "No validated skills in inventory"
        )}
        {renderSkillsTier(
          "Pending",
          profileData.skills.pending,
          "pending",
          "No pending skills",
          false,
          true
        )}
      </div>
    </div>
  );
};

export default Profile;
