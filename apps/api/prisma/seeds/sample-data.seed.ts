import {
  PrismaClient,
  Profile,
  Project,
  Assignment,
  Skill,
  EmployeeSkill,
  ProficiencyLevel,
  SuggestionStatus,
  SuggestionSource,
  ProfileType,
  SeniorityLevel,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import {
  initializeFaker,
  generateEmail,
  generateMissionBoardId,
  distributeByPercentages,
  shuffleArray,
  selectRandomItems,
  getRandomInt,
  getRandomItem,
  generatePastDate,
  generateRecentDate,
  generateDateWithin3Years,
  generateStaleValidationDate,
  generateFreshValidationDate,
  generateThresholdValidationDate,
} from './seed-utils';
import { ProjectType, getRelevantSkillsForProjectTypes } from './skill-context';

// Constants for data generation
const PROFILE_COUNT = 25; // Between 20-30
const PROJECT_COUNT = 7; // Between 5-10
const MIN_STAFF_PROFILES = 5; // Ensure enough for all projects
const BCRYPT_SALT_ROUNDS = 10; // Standard salt rounds for bcrypt
const DEFAULT_PASSWORD = 'password123'; // Default password for all seeded profiles

// Seniority levels
const SENIORITY_DISTRIBUTION = {
  [SeniorityLevel.JUNIOR_ENGINEER]: 40,
  [SeniorityLevel.MID_ENGINEER]: 30,
  [SeniorityLevel.SENIOR_ENGINEER]: 20,
  [SeniorityLevel.STAFF_ENGINEER]: 10,
};

// Assignment distribution percentages
const ASSIGNMENT_DISTRIBUTION = [65, 25, 10]; // 1 project, 2 projects, 3 projects

// Project type templates
const PROJECT_TEMPLATES: Array<{ name: string; type: ProjectType }> = [
  { name: 'Mobile Banking App Redesign', type: 'MOBILE' },
  { name: 'E-commerce Platform Migration', type: 'FULLSTACK' },
  { name: 'Payment Gateway Integration', type: 'BACKEND' },
  { name: 'Customer Portal Dashboard', type: 'FRONTEND' },
  { name: 'iOS Health Tracking App', type: 'MOBILE' },
  { name: 'Microservices Architecture Refactor', type: 'BACKEND' },
  { name: 'Real-time Analytics Dashboard', type: 'FULLSTACK' },
  { name: 'Android Food Delivery App', type: 'MOBILE' },
  { name: 'REST API Development', type: 'BACKEND' },
  { name: 'Component Library Redesign', type: 'FRONTEND' },
];

// Role templates by project type
const ROLE_TEMPLATES: Record<ProjectType, string[]> = {
  MOBILE: [
    'Mobile Developer',
    'iOS Engineer',
    'Android Engineer',
    'Mobile QA Engineer',
    'React Native Developer',
  ],
  BACKEND: [
    'Backend Engineer',
    'API Developer',
    'Database Engineer',
    'DevOps Engineer',
    'Backend QA Engineer',
  ],
  FRONTEND: [
    'Frontend Developer',
    'UI Engineer',
    'React Developer',
    'Frontend QA Analyst',
    'UX Developer',
  ],
  FULLSTACK: [
    'Full Stack Developer',
    'Software Engineer',
    'Application Developer',
    'QA Engineer',
    'Systems Engineer',
  ],
};

// Tag templates by project type (using exact skill names for Core Stack matching)
const TAG_TEMPLATES: Record<ProjectType, string[]> = {
  MOBILE: [
    'React Native',
    'Swift',
    'Kotlin',
    'iOS',
    'Android',
    'TypeScript',
    'JavaScript',
  ],
  BACKEND: [
    'Node.js',
    'Express.js',
    'PostgreSQL',
    'Redis',
    'Docker',
    'GraphQL',
    'REST API',
  ],
  FRONTEND: [
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Next.js',
    'CSS',
    'JavaScript',
  ],
  FULLSTACK: [
    'TypeScript',
    'React',
    'Node.js',
    'PostgreSQL',
    'Docker',
    'GraphQL',
    'Next.js',
  ],
};

// Type aliases for data without IDs
type AssignmentData = Omit<Assignment, 'id'>;
type EmployeeSkillData = Omit<EmployeeSkill, 'id'>;

interface GeneratedProfile extends Profile {
  seniorityLevel: SeniorityLevel;
}

interface GeneratedProject extends Project {
  projectType: ProjectType;
}

/**
 * Generate profiles with seniority distribution, passwords, and roles
 */
async function generateProfiles(count: number): Promise<
  Array<{
    data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;
    seniorityLevel: SeniorityLevel;
  }>
> {
  const profiles: Array<{
    data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;
    seniorityLevel: SeniorityLevel;
  }> = [];
  const seniorityLevels = Object.keys(
    SENIORITY_DISTRIBUTION,
  ) as SeniorityLevel[];
  const distribution = distributeByPercentages(
    count,
    Object.values(SENIORITY_DISTRIBUTION),
  );

  // Ensure minimum Staff profiles
  if (distribution[3] < MIN_STAFF_PROFILES) {
    const deficit = MIN_STAFF_PROFILES - distribution[3];
    distribution[3] = MIN_STAFF_PROFILES;
    // Take from Junior and Mid proportionally
    distribution[0] -= Math.ceil(deficit / 2);
    distribution[1] -= Math.floor(deficit / 2);
  }

  // Hash the default password once (reused for all profiles)
  const hashedPassword = await bcrypt.hash(
    DEFAULT_PASSWORD,
    BCRYPT_SALT_ROUNDS,
  );

  let profileIndex = 0;

  seniorityLevels.forEach((level, levelIndex) => {
    for (let i = 0; i < distribution[levelIndex]; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = generateEmail(firstName, lastName);
      const name = `${firstName} ${lastName}`;

      profiles.push({
        data: {
          missionBoardId: generateMissionBoardId(),
          email,
          name,
          avatarUrl: faker.image.avatar(),
          currentSeniorityLevel: level,
          password: hashedPassword,
          type: ProfileType.EMPLOYEE,
        },
        seniorityLevel: level,
      });

      profileIndex++;
    }
  });

  return profiles;
}

/**
 * Generate seniority history for profiles
 */
function generateSeniorityHistory(profiles: GeneratedProfile[]): Array<{
  profileId: string;
  seniorityLevel: SeniorityLevel;
  startDate: Date;
  endDate: Date | null;
}> {
  const seniorityHistoryRecords: Array<{
    profileId: string;
    seniorityLevel: SeniorityLevel;
    startDate: Date;
    endDate: Date | null;
  }> = [];

  profiles.forEach((profile) => {
    const recordCount =
      profile.seniorityLevel === 'JUNIOR_ENGINEER'
        ? 1
        : profile.seniorityLevel === 'MID_ENGINEER'
          ? getRandomInt(1, 2)
          : getRandomInt(2, 3);

    const progressionPath: SeniorityLevel[] = [];

    // Build progression path
    switch (profile.seniorityLevel) {
      case 'JUNIOR_ENGINEER':
        progressionPath.push('JUNIOR_ENGINEER');
        break;
      case 'MID_ENGINEER':
        if (recordCount === 1) {
          progressionPath.push('MID_ENGINEER');
        } else {
          progressionPath.push('JUNIOR_ENGINEER', 'MID_ENGINEER');
        }
        break;
      case 'SENIOR_ENGINEER':
        if (recordCount === 2) {
          progressionPath.push('MID_ENGINEER', 'SENIOR_ENGINEER');
        } else {
          progressionPath.push(
            'JUNIOR_ENGINEER',
            'MID_ENGINEER',
            'SENIOR_ENGINEER',
          );
        }
        break;
      case 'STAFF_ENGINEER':
        if (recordCount === 2) {
          progressionPath.push('SENIOR_ENGINEER', 'STAFF_ENGINEER');
        } else {
          progressionPath.push(
            'JUNIOR_ENGINEER',
            'MID_ENGINEER',
            'SENIOR_ENGINEER',
            'STAFF_ENGINEER',
          );
        }
        break;
    }

    // Generate dates for each progression step
    // Work backwards from today to ensure all dates are in the past
    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const tempDates: Date[] = [];

    // Start with the current (most recent) seniority level
    // It should have started 1-6 months ago (to be clearly in the past)
    const lastStartDate = new Date();
    lastStartDate.setMonth(lastStartDate.getMonth() - getRandomInt(1, 6));
    tempDates.push(lastStartDate);

    // Work backwards for previous seniority levels
    for (let i = 1; i < progressionPath.length; i++) {
      const previousStartDate = tempDates[tempDates.length - 1];
      const minMonthsEarlier = 12; // At least 1 year before
      const maxMonthsEarlier = 24; // At most 2 years before
      const monthsEarlier = getRandomInt(minMonthsEarlier, maxMonthsEarlier);

      const startDate = new Date(previousStartDate);
      startDate.setMonth(startDate.getMonth() - monthsEarlier);

      // Ensure we don't go beyond 5 years ago
      if (startDate < fiveYearsAgo) {
        // Cap at 5 years ago with some variation
        const cappedDate = new Date(fiveYearsAgo);
        cappedDate.setMonth(cappedDate.getMonth() + getRandomInt(0, 6)); // 0-6 months after 5-year boundary
        tempDates.push(cappedDate);
      } else {
        tempDates.push(startDate);
      }
    }

    // Reverse the array since we worked backwards
    tempDates.reverse();

    // Create seniority history records
    // endDate = next promotion's startDate (or null for current)
    progressionPath.forEach((level, index) => {
      seniorityHistoryRecords.push({
        profileId: profile.id,
        seniorityLevel: level,
        startDate: tempDates[index],
        endDate: index < tempDates.length - 1 ? tempDates[index + 1] : null,
      });
    });
  });

  return seniorityHistoryRecords;
}

/**
 * Generate projects with Tech Leads
 */
function generateProjects(
  count: number,
  leadProfiles: GeneratedProfile[],
): Array<{
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
  projectType: ProjectType;
}> {
  if (leadProfiles.length < count) {
    throw new Error(
      `Insufficient Lead profiles (${leadProfiles.length}) for ${count} projects. Need at least ${count} Lead profiles.`,
    );
  }

  const projects: Array<{
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
    projectType: ProjectType;
  }> = [];

  // Shuffle templates to add variety
  const shuffledTemplates = shuffleArray([...PROJECT_TEMPLATES]);
  const selectedTemplates = shuffledTemplates.slice(0, count);

  // Shuffle Lead profiles to assign them to projects
  const shuffledLeads = shuffleArray([...leadProfiles]);

  selectedTemplates.forEach((template, index) => {
    const assignedLead = shuffledLeads[index % shuffledLeads.length];

    projects.push({
      data: {
        name: template.name,
        missionBoardId: generateMissionBoardId(),
        techLeadId: assignedLead.id,
      },
      projectType: template.type,
    });
  });

  return projects;
}

/**
 * Generate assignments for profiles to projects
 */
function generateAssignments(
  profiles: GeneratedProfile[],
  projects: GeneratedProject[],
): AssignmentData[] {
  const assignments: AssignmentData[] = [];

  // Distribute assignments based on ASSIGNMENT_DISTRIBUTION
  const distribution = distributeByPercentages(
    profiles.length,
    ASSIGNMENT_DISTRIBUTION,
  );

  let profileIndex = 0;

  // 1 project (65%)
  for (let i = 0; i < distribution[0]; i++) {
    const profile = profiles[profileIndex++];
    const project = getRandomItem(projects);
    const role = getRandomItem(ROLE_TEMPLATES[project.projectType]);
    const tags = selectRandomItems(
      TAG_TEMPLATES[project.projectType],
      getRandomInt(2, 4),
    );

    assignments.push({
      profileId: profile.id,
      projectId: project.id,
      missionBoardId: generateMissionBoardId(),
      role,
      tags,
      createdAt: generatePastDate(180),
      updatedAt: generateRecentDate(30),
    });
  }

  // 2 projects (25%)
  for (let i = 0; i < distribution[1]; i++) {
    const profile = profiles[profileIndex++];
    const selectedProjects = selectRandomItems(projects, 2);

    selectedProjects.forEach((project) => {
      const role = getRandomItem(ROLE_TEMPLATES[project.projectType]);
      const tags = selectRandomItems(
        TAG_TEMPLATES[project.projectType],
        getRandomInt(2, 4),
      );

      assignments.push({
        profileId: profile.id,
        projectId: project.id,
        missionBoardId: generateMissionBoardId(),
        role,
        tags,
        createdAt: generatePastDate(180),
        updatedAt: generateRecentDate(30),
      });
    });
  }

  // 3 projects (10%)
  for (let i = 0; i < distribution[2]; i++) {
    const profile = profiles[profileIndex++];
    const selectedProjects = selectRandomItems(projects, 3);

    selectedProjects.forEach((project) => {
      const role = getRandomItem(ROLE_TEMPLATES[project.projectType]);
      const tags = selectRandomItems(
        TAG_TEMPLATES[project.projectType],
        getRandomInt(2, 4),
      );

      assignments.push({
        profileId: profile.id,
        projectId: project.id,
        missionBoardId: generateMissionBoardId(),
        role,
        tags,
        createdAt: generatePastDate(180),
        updatedAt: generateRecentDate(30),
      });
    });
  }

  return assignments;
}

/**
 * Generate employee skills based on project assignments and seniority
 */
function generateEmployeeSkills(
  profiles: GeneratedProfile[],
  assignments: Assignment[],
  projects: GeneratedProject[],
  allSkills: Skill[],
): EmployeeSkillData[] {
  const employeeSkills: EmployeeSkillData[] = [];
  const skillsByProfile = new Map<
    string,
    Map<number, { level: ProficiencyLevel; validatedById: string | null }>
  >();

  // Helper function to determine proficiency based on seniority
  const getProficiencyForSeniority = (
    seniorityLevel: SeniorityLevel,
  ): ProficiencyLevel => {
    switch (seniorityLevel) {
      case 'JUNIOR_ENGINEER':
        return Math.random() < 0.7
          ? ProficiencyLevel.NOVICE
          : ProficiencyLevel.INTERMEDIATE;
      case 'MID_ENGINEER':
        return Math.random() < 0.6
          ? ProficiencyLevel.INTERMEDIATE
          : ProficiencyLevel.ADVANCED;
      case 'SENIOR_ENGINEER':
        return Math.random() < 0.5
          ? ProficiencyLevel.ADVANCED
          : ProficiencyLevel.EXPERT;
      case 'STAFF_ENGINEER':
        return Math.random() < 0.3
          ? ProficiencyLevel.ADVANCED
          : ProficiencyLevel.EXPERT;
      default:
        return ProficiencyLevel.INTERMEDIATE;
    }
  };

  // Build a map of profiles by ID for quick lookup
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // For each profile with assignments, add relevant skills
  profiles.forEach((profile) => {
    const profileAssignments = assignments.filter(
      (a) => a.profileId === profile.id,
    );

    if (profileAssignments.length === 0) return;

    const profileProjects = profileAssignments
      .map((a) => projects.find((p) => p.id === a.projectId))
      .filter((p): p is GeneratedProject => p !== undefined);

    const projectTypes = Array.from(
      new Set(profileProjects.map((p) => p.projectType)),
    );

    // Get relevant skills for project types
    const relevantSkills = getRelevantSkillsForProjectTypes(
      projectTypes,
      allSkills,
    );

    // Determine how many skills this profile should have based on seniority
    let skillCount: number;
    switch (profile.seniorityLevel) {
      case 'JUNIOR_ENGINEER':
        skillCount = getRandomInt(3, 6);
        break;
      case 'MID_ENGINEER':
        skillCount = getRandomInt(5, 10);
        break;
      case 'SENIOR_ENGINEER':
        skillCount = getRandomInt(8, 15);
        break;
      case 'STAFF_ENGINEER':
        skillCount = getRandomInt(12, 20);
        break;
      default:
        skillCount = 5;
    }

    // Select random skills from relevant skills
    const selectedSkills = selectRandomItems(
      relevantSkills,
      Math.min(skillCount, relevantSkills.length),
    );

    // Initialize profile's skill map
    if (!skillsByProfile.has(profile.id)) {
      skillsByProfile.set(profile.id, new Map());
    }
    const profileSkillMap = skillsByProfile.get(profile.id)!;

    selectedSkills.forEach((skill) => {
      const proficiencyLevel = getProficiencyForSeniority(
        profile.seniorityLevel,
      );

      // Find a validator (Senior or Lead) - 80% chance of being validated
      let validatedById: string | null = null;
      if (Math.random() < 0.8) {
        const validators = profiles.filter(
          (p) =>
            (p.seniorityLevel === 'SENIOR_ENGINEER' ||
              p.seniorityLevel === 'STAFF_ENGINEER') &&
            p.id !== profile.id,
        );
        if (validators.length > 0) {
          validatedById = getRandomItem(validators).id;
        }
      }

      profileSkillMap.set(skill.id, {
        level: proficiencyLevel,
        validatedById,
      });
    });
  });

  // Convert map to employee skills array with distributed validation dates
  // to cover all edge cases for stale skill flagging
  let skillIndex = 0;
  const totalSkills = Array.from(skillsByProfile.values()).reduce(
    (sum, map) => sum + map.size,
    0,
  );

  skillsByProfile.forEach((skillMap, profileId) => {
    skillMap.forEach((skillData, skillId) => {
      let lastValidatedAt: Date;

      // Distribute validation dates to cover edge cases:
      // 40% stale (> 12 months) - should be flagged by cron job
      // 40% fresh (< 12 months) - should NOT be flagged
      // 10% exactly at threshold (12 months) - edge case
      // 10% very old (2-3 years) - edge case for old data
      const percentage = (skillIndex / totalSkills) * 100;

      if (percentage < 40) {
        // Stale skills (13 months to 3 years ago)
        lastValidatedAt = generateStaleValidationDate();
      } else if (percentage < 80) {
        // Fresh skills (within last 11 months)
        lastValidatedAt = generateFreshValidationDate();
      } else if (percentage < 90) {
        // Exactly at threshold (12 months ago)
        lastValidatedAt = generateThresholdValidationDate();
      } else {
        // Very old skills (2-3 years ago)
        lastValidatedAt = generateDateWithin3Years();
      }

      employeeSkills.push({
        profileId,
        skillId,
        proficiencyLevel: skillData.level,
        lastValidatedAt,
        lastValidatedById: skillData.validatedById,
        createdAt: generatePastDate(120),
        updatedAt: generateRecentDate(60),
      });

      skillIndex++;
    });
  });

  return employeeSkills;
}

/**
 * Generate skill suggestions (PENDING status only)
 * Includes both SELF_REPORT and SYSTEM_FLAG suggestions
 */
function generateSuggestions(
  profiles: GeneratedProfile[],
  allSkills: Skill[],
  existingSkills: EmployeeSkillData[],
  assignments: Assignment[],
): Array<{
  profileId: string;
  skillId: number;
  suggestedProficiency: ProficiencyLevel;
  status: SuggestionStatus;
  source: SuggestionSource;
  createdAt: Date;
}> {
  const suggestions: Array<{
    profileId: string;
    skillId: number;
    suggestedProficiency: ProficiencyLevel;
    status: SuggestionStatus;
    source: SuggestionSource;
    createdAt: Date;
  }> = [];

  // ===== PART 1: SELF_REPORT SUGGESTIONS =====
  // Generate 5-10 pending suggestions total (not per profile)
  const suggestionCount = getRandomInt(5, 10);

  // Select random profiles to receive suggestions
  const profilesWithSuggestions = selectRandomItems(
    profiles,
    Math.min(suggestionCount, profiles.length),
  );

  profilesWithSuggestions.forEach((profile) => {
    // Get existing skills for this profile
    const profileExistingSkills = existingSkills.filter(
      (es) => es.profileId === profile.id,
    );
    const existingSkillIds = new Set(
      profileExistingSkills.map((es) => es.skillId),
    );

    // Find skills not yet added
    const availableSkills = allSkills.filter(
      (s) => !existingSkillIds.has(s.id),
    );

    if (availableSkills.length === 0) return;

    // Select 1-2 skills to suggest
    const skillsToSuggest = selectRandomItems(
      availableSkills,
      Math.min(getRandomInt(1, 2), availableSkills.length),
    );

    skillsToSuggest.forEach((skill) => {
      let suggestedProficiency: ProficiencyLevel;

      // Check if this is an upgrade suggestion
      const existing = profileExistingSkills.find(
        (es) => es.skillId === skill.id,
      );
      if (existing) {
        // Suggest next level up
        const levels = [
          ProficiencyLevel.NOVICE,
          ProficiencyLevel.INTERMEDIATE,
          ProficiencyLevel.ADVANCED,
          ProficiencyLevel.EXPERT,
        ];
        const currentIndex = levels.indexOf(existing.proficiencyLevel);
        suggestedProficiency =
          currentIndex < levels.length - 1
            ? levels[currentIndex + 1]
            : existing.proficiencyLevel;
      } else {
        // New skill - suggest based on seniority
        switch (profile.seniorityLevel) {
          case 'JUNIOR_ENGINEER':
            suggestedProficiency =
              Math.random() < 0.7
                ? ProficiencyLevel.NOVICE
                : ProficiencyLevel.INTERMEDIATE;
            break;
          case 'MID_ENGINEER':
            suggestedProficiency =
              Math.random() < 0.5
                ? ProficiencyLevel.INTERMEDIATE
                : ProficiencyLevel.ADVANCED;
            break;
          case 'SENIOR_ENGINEER':
          case 'STAFF_ENGINEER':
            suggestedProficiency =
              Math.random() < 0.6
                ? ProficiencyLevel.ADVANCED
                : ProficiencyLevel.EXPERT;
            break;
          default:
            suggestedProficiency = ProficiencyLevel.INTERMEDIATE;
        }
      }

      suggestions.push({
        profileId: profile.id,
        skillId: skill.id,
        suggestedProficiency,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SELF_REPORT,
        createdAt: generateRecentDate(14),
      });
    });
  });

  // ===== PART 2: SYSTEM_FLAG RE-VALIDATION SUGGESTIONS =====
  // Identify stale Core Stack skills and create re-validation suggestions
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  // Build skill name map for quick lookups
  const skillNameMap = new Map(allSkills.map((s) => [s.name, s.id]));

  // Process each profile with assignments
  profiles.forEach((profile) => {
    const profileAssignments = assignments.filter(
      (a) => a.profileId === profile.id,
    );

    if (profileAssignments.length === 0) return;

    // Extract all assignment tags (Core Stack)
    const assignmentTags = new Set<string>();
    profileAssignments.forEach((assignment) => {
      assignment.tags.forEach((tag) => assignmentTags.add(tag));
    });

    // Get employee skills for this profile
    const profileSkills = existingSkills.filter(
      (es) => es.profileId === profile.id,
    );

    // Identify Core Stack skills (in both assignment tags AND employee skills)
    const coreStackSkills = profileSkills.filter((empSkill) => {
      const skill = allSkills.find((s) => s.id === empSkill.skillId);
      return skill && assignmentTags.has(skill.name);
    });

    // Filter for stale Core Stack skills (not validated in > 12 months)
    const staleSkills = coreStackSkills.filter(
      (empSkill) => empSkill.lastValidatedAt < twelveMonthsAgo,
    );

    // Check for existing PENDING suggestions to prevent duplicates
    const existingSuggestionKeys = new Set(
      suggestions.map((s) => `${s.profileId}-${s.skillId}`),
    );

    // Create SYSTEM_FLAG suggestions for 50% of stale skills
    // (to show both flagged and unflagged states)
    const skillsToFlag = selectRandomItems(
      staleSkills,
      Math.ceil(staleSkills.length * 0.5),
    );

    skillsToFlag.forEach((empSkill) => {
      const suggestionKey = `${profile.id}-${empSkill.skillId}`;

      // Skip if suggestion already exists
      if (existingSuggestionKeys.has(suggestionKey)) return;

      suggestions.push({
        profileId: profile.id,
        skillId: empSkill.skillId,
        suggestedProficiency: empSkill.proficiencyLevel, // Keep current level
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
        createdAt: generateRecentDate(7), // Created within last week
      });

      // Add to set to prevent duplicates within this function
      existingSuggestionKeys.add(suggestionKey);
    });
  });

  return suggestions;
}

/**
 * Main sample data seeding function
 */
export async function seedSampleData(prisma: PrismaClient): Promise<void> {
  const startTime = Date.now();

  console.log('\n========================================');
  console.log('Starting sample data seeding...');
  console.log('========================================\n');

  // Initialize Faker with deterministic seed
  initializeFaker(12345);

  try {
    // Wrap everything in a transaction for atomicity
    await prisma.$transaction(
      async (tx) => {
        // ===== CLEANUP PHASE =====
        console.log('[1/7] Cleaning up existing sample data...');

        // Get skill count before cleanup
        const skillCountBefore = await tx.skill.count();
        console.log(`  Preserving ${skillCountBefore} existing skills...`);

        // Delete in correct order (child records first)
        const deletedSeniorityHistory = await tx.seniorityHistory.deleteMany();
        const deletedSuggestions = await tx.suggestion.deleteMany();
        const deletedEmployeeSkills = await tx.employeeSkill.deleteMany();
        const deletedAssignments = await tx.assignment.deleteMany();
        const deletedProjects = await tx.project.deleteMany();
        const deletedProfiles = await tx.profile.deleteMany();

        console.log(
          `  Deleted: ${deletedSeniorityHistory.count} seniority histories, ${deletedSuggestions.count} suggestions, ${deletedEmployeeSkills.count} employee skills`,
        );
        console.log(
          `  Deleted: ${deletedAssignments.count} assignments, ${deletedProjects.count} projects, ${deletedProfiles.count} profiles`,
        );

        // Verify skills preserved
        const skillCountAfter = await tx.skill.count();
        if (skillCountAfter !== skillCountBefore) {
          throw new Error(
            `Skills were modified during cleanup! Before: ${skillCountBefore}, After: ${skillCountAfter}`,
          );
        }
        console.log(`  Verified ${skillCountAfter} skills preserved\n`);

        // ===== PROFILE GENERATION =====
        console.log('[2/7] Generating profiles with authentication...');

        // Hash the default password for admin user
        const hashedPassword = await bcrypt.hash(
          DEFAULT_PASSWORD,
          BCRYPT_SALT_ROUNDS,
        );

        // Create admin user first
        const adminProfile = await tx.profile.create({
          data: {
            missionBoardId: generateMissionBoardId(),
            email: 'donovan@ravn.co',
            name: 'Donovan',
            avatarUrl: faker.image.avatar(),
            currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
            password: hashedPassword,
            type: ProfileType.ADMIN,
          },
        });

        const profilesWithSeniority: GeneratedProfile[] = [
          {
            ...adminProfile,
            seniorityLevel: SeniorityLevel.STAFF_ENGINEER,
          },
        ];

        // Generate regular employee profiles
        const profileSpecs = await generateProfiles(PROFILE_COUNT);

        // Create profiles individually to get their IDs
        for (const spec of profileSpecs) {
          const createdProfile = await tx.profile.create({
            data: spec.data,
          });
          profilesWithSeniority.push({
            ...createdProfile,
            seniorityLevel: spec.seniorityLevel,
          });
        }

        const seniorityStats = {
          JUNIOR: profilesWithSeniority.filter(
            (p) => p.seniorityLevel === 'JUNIOR_ENGINEER',
          ).length,
          MID: profilesWithSeniority.filter(
            (p) => p.seniorityLevel === 'MID_ENGINEER',
          ).length,
          SENIOR: profilesWithSeniority.filter(
            (p) => p.seniorityLevel === 'SENIOR_ENGINEER',
          ).length,
          STAFF: profilesWithSeniority.filter(
            (p) => p.seniorityLevel === 'STAFF_ENGINEER',
          ).length,
        };

        const adminCount = profilesWithSeniority.filter(
          (p) => p.type === ProfileType.ADMIN,
        ).length;

        console.log(
          `  Created ${profilesWithSeniority.length} profiles (${seniorityStats.JUNIOR} Junior, ${seniorityStats.MID} Mid, ${seniorityStats.SENIOR} Senior, ${seniorityStats.STAFF} Staff)`,
        );
        console.log(
          `  Assigned ${adminCount} ADMIN role (Donovan), remaining profiles have EMPLOYEE role`,
        );
        console.log(`  All profiles have password: "${DEFAULT_PASSWORD}"\n`);

        // ===== SENIORITY HISTORY GENERATION =====
        console.log('[3/7] Generating seniority history...');
        const seniorityHistoryData = generateSeniorityHistory(
          profilesWithSeniority,
        );

        await tx.seniorityHistory.createMany({
          data: seniorityHistoryData,
        });

        console.log(
          `  Created ${seniorityHistoryData.length} seniority history records\n`,
        );

        // ===== PROJECT GENERATION =====
        console.log('[4/7] Generating projects...');
        const leadProfiles = profilesWithSeniority.filter(
          (p) =>
            p.seniorityLevel === 'STAFF_ENGINEER' ||
            p.seniorityLevel === 'SENIOR_ENGINEER',
        );

        const projectSpecs = generateProjects(PROJECT_COUNT, leadProfiles);

        // Create projects individually to get their IDs
        const projectsWithTypes: GeneratedProject[] = [];
        for (const spec of projectSpecs) {
          const createdProject = await tx.project.create({
            data: spec.data,
          });
          projectsWithTypes.push({
            ...createdProject,
            projectType: spec.projectType,
          });
        }

        const projectStats = {
          MOBILE: projectsWithTypes.filter((p) => p.projectType === 'MOBILE')
            .length,
          BACKEND: projectsWithTypes.filter((p) => p.projectType === 'BACKEND')
            .length,
          FRONTEND: projectsWithTypes.filter(
            (p) => p.projectType === 'FRONTEND',
          ).length,
          FULLSTACK: projectsWithTypes.filter(
            (p) => p.projectType === 'FULLSTACK',
          ).length,
        };

        console.log(
          `  Created ${projectsWithTypes.length} projects (${projectStats.MOBILE} Mobile, ${projectStats.BACKEND} Backend, ${projectStats.FRONTEND} Frontend, ${projectStats.FULLSTACK} Fullstack)`,
        );
        console.log(
          `  All projects have Tech Leads assigned from STAFF and SENIOR profiles\n`,
        );

        // ===== ASSIGNMENT GENERATION =====
        console.log('[5/7] Generating assignments...');
        const assignmentData = generateAssignments(
          profilesWithSeniority,
          projectsWithTypes,
        );

        const createdAssignments = await tx.assignment.createMany({
          data: assignmentData,
        });

        const assignmentStats = {
          oneProject: profilesWithSeniority.filter(
            (p) =>
              assignmentData.filter((a) => a.profileId === p.id).length === 1,
          ).length,
          twoProjects: profilesWithSeniority.filter(
            (p) =>
              assignmentData.filter((a) => a.profileId === p.id).length === 2,
          ).length,
          threeProjects: profilesWithSeniority.filter(
            (p) =>
              assignmentData.filter((a) => a.profileId === p.id).length === 3,
          ).length,
        };

        console.log(
          `  Created ${createdAssignments.count} assignments (${assignmentStats.oneProject} profiles with 1 project, ${assignmentStats.twoProjects} with 2 projects, ${assignmentStats.threeProjects} with 3 projects)\n`,
        );

        // ===== EMPLOYEE SKILLS GENERATION =====
        console.log('[6/7] Generating employee skills...');

        // Fetch all skills
        const allSkills = await tx.skill.findMany();

        // Fetch all assignments for passing to generation
        const assignments = await tx.assignment.findMany();

        const employeeSkillData = generateEmployeeSkills(
          profilesWithSeniority,
          assignments,
          projectsWithTypes,
          allSkills,
        );

        await tx.employeeSkill.createMany({
          data: employeeSkillData,
        });

        const validatedSkills = employeeSkillData.filter(
          (es) => es.lastValidatedById !== null,
        ).length;
        const validationRate = (
          (validatedSkills / employeeSkillData.length) *
          100
        ).toFixed(1);

        console.log(
          `  Created ${employeeSkillData.length} employee skills (${validatedSkills} validated, ${validationRate}% validation rate)\n`,
        );

        // ===== SUGGESTIONS GENERATION =====
        console.log('[7/7] Generating suggestions...');

        const suggestionData = generateSuggestions(
          profilesWithSeniority,
          allSkills,
          employeeSkillData,
          assignments,
        );

        await tx.suggestion.createMany({
          data: suggestionData,
        });

        const selfReportCount = suggestionData.filter(
          (s) => s.source === SuggestionSource.SELF_REPORT,
        ).length;
        const systemFlagCount = suggestionData.filter(
          (s) => s.source === SuggestionSource.SYSTEM_FLAG,
        ).length;

        console.log(
          `  Created ${suggestionData.length} pending suggestions (${selfReportCount} self-report, ${systemFlagCount} system-flagged)\n`,
        );
      },
      {
        timeout: 60000, // 60 seconds timeout for the transaction
      },
    );

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('========================================');
    console.log('Sample data seeding completed!');
    console.log('========================================');
    console.log(`Total execution time: ${totalElapsed} seconds\n`);
  } catch (error) {
    console.error('\n========================================');
    console.error('ERROR: Sample data seeding failed');
    console.error('========================================\n');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
}
