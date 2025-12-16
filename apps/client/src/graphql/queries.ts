import { gql } from "@apollo/client";

/**
 * TypeScript interfaces for profile query response types
 */

export interface ValidatedSkill {
  skillName: string;
  discipline: string;
  proficiencyLevel: string;
  validatedAt: string;
  validator: {
    id: string;
    name: string;
  } | null;
}

export interface PendingSkill {
  skillName: string;
  discipline: string;
  suggestedProficiency: string;
  createdAt: string;
}

export interface SeniorityHistoryEntry {
  seniorityLevel: string;
  start_date: string;
  end_date: string | null;
  createdBy: {
    id: string;
    name: string;
  } | null;
}

export interface Assignment {
  projectName: string;
  role: string;
  tags: string[];
  techLead: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface SkillsTiers {
  coreStack: ValidatedSkill[];
  validatedInventory: ValidatedSkill[];
  pending: PendingSkill[];
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  currentSeniorityLevel: string;
  skills: SkillsTiers;
  seniorityHistory: SeniorityHistoryEntry[];
  currentAssignments: Assignment[];
}

export interface GetProfileResponse {
  getProfile: ProfileData;
}

export interface GetProfileVariables {
  id: string;
}

/**
 * GET_PROFILE_QUERY for fetching comprehensive employee profile data
 *
 * Fetches:
 * - Profile header fields (id, name, email, avatarUrl, currentSeniority)
 * - Three-tier skills nested under 'skills' (coreStack, validatedInventory, pending)
 * - Seniority history with creator information
 * - Current assignments with tech lead information
 */
export const GET_PROFILE_QUERY = gql`
  query GetProfile($id: String!) {
    getProfile(id: $id) {
      id
      name
      email
      avatarUrl
      currentSeniorityLevel
      skills {
        coreStack {
          skillName
          discipline
          proficiencyLevel
          validatedAt
          validator {
            id
            name
          }
        }
        validatedInventory {
          skillName
          discipline
          proficiencyLevel
          validatedAt
          validator {
            id
            name
          }
        }
        pending {
          skillName
          discipline
          suggestedProficiency
          createdAt
        }
      }
      seniorityHistory {
        seniorityLevel
        start_date
        end_date
        createdBy {
          id
          name
        }
      }
      currentAssignments {
        projectName
        role
        tags
        techLead {
          id
          name
          email
        }
      }
    }
  }
`;
