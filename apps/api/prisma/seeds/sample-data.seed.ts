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
  Role,
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
  generateDateInRange,
} from './seed-utils';
import {
  ProjectType,
  getRelevantSkillsForProjectTypes,
} from './skill-context';

// Constants for data generation
const PROFILE_COUNT = 25; // Between 20-30
const PROJECT_COUNT = 7; // Between 5-10
const MIN_LEAD_PROFILES = 7; // Ensure enough for all projects
const BCRYPT_SALT_ROUNDS = 10; // Standard salt rounds for bcrypt
const DEFAULT_PASSWORD = 'password123'; // Default password for all seeded profiles

// Seniority levels
type SeniorityLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';

const SENIORITY_DISTRIBUTION = {
  JUNIOR: 40,
  MID: 30,
  SENIOR: 20,
  LEAD: 10,
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

  // Ensure minimum Lead profiles
  if (distribution[3] < MIN_LEAD_PROFILES) {
    const deficit = MIN_LEAD_PROFILES - distribution[3];
    distribution[3] = MIN_LEAD_PROFILES;
    // Take from Junior and Mid proportionally
    distribution[0] -= Math.ceil(deficit / 2);
    distribution[1] -= Math.floor(deficit / 2);
  }

  // Hash the default password once (reused for all profiles)
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_SALT_ROUNDS);

  let profileIndex = 0;
  let adminAssigned = false; // Ensure at least one admin

  seniorityLevels.forEach((level, levelIndex) => {
    for (let i = 0; i < distribution[levelIndex]; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = generateEmail(firstName, lastName);
      const name = `${firstName} ${lastName}`;

      // Assign ADMIN role to first SENIOR or LEAD profile for testing
      let role: Role = Role.EMPLOYEE;
      if (!adminAssigned && (level === 'SENIOR' || level === 'LEAD')) {
        role = Role.ADMIN;
        adminAssigned = true;
      }

      profiles.push({
        data: {
          missionBoardId: generateMissionBoardId(),
          email,
          name,
          avatarUrl: faker.image.avatar(),
          currentSeniorityLevel: level,
          password: hashedPassword,
          role,
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
function generateSeniorityHistory(
  profiles: GeneratedProfile[],
): Array<{
  profileId: string;
  seniorityLevel: string;
  start_date: Date;
  end_date: Date | null;
  createdById: string | null;
}> {
  const seniorityHistoryRecords: Array<{
    profileId: string;
    seniorityLevel: string;
    start_date: Date;
    end_date: Date | null;
    createdById: string | null;
  }> = [];

  const seniorProfiles = profiles.filter(
    (p) => p.seniorityLevel === 'SENIOR' || p.seniorityLevel === 'LEAD',
  );

  profiles.forEach((profile) => {
    const recordCount =
      profile.seniorityLevel === 'JUNIOR'
        ? 1
        : profile.seniorityLevel === 'MID'
          ? getRandomInt(1, 2)
          : getRandomInt(2, 3);

    const progressionPath: SeniorityLevel[] = [];

    // Build progression path
    switch (profile.seniorityLevel) {
      case 'JUNIOR':
        progressionPath.push('JUNIOR');
        break;
      case 'MID':
        if (recordCount === 1) {
          progressionPath.push('MID');
        } else {
          progressionPath.push('JUNIOR', 'MID');
        }
        break;
      case 'SENIOR':
        if (recordCount === 2) {
          progressionPath.push('MID', 'SENIOR');
        } else {
          progressionPath.push('JUNIOR', 'MID', 'SENIOR');
        }
        break;
      case 'LEAD':
        if (recordCount === 2) {
          progressionPath.push('SENIOR', 'LEAD');
        } else {
          progressionPath.push('MID', 'SENIOR', 'LEAD');
        }
        break;
    }

    // Generate dates for each progression step
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const tempDates: Date[] = [];
    progressionPath.forEach((level, index) => {
      let startDate: Date;

      if (index === 0) {
        // First record: 1-3 years ago
        startDate = generateDateInRange(threeYearsAgo, new Date());
      } else {
        // Subsequent records: after previous promotion
        const previousDate = tempDates[tempDates.length - 1];
        const minMonthsLater = 12; // At least 1 year between promotions
        const maxMonthsLater = 24; // At most 2 years
        const monthsLater = getRandomInt(minMonthsLater, maxMonthsLater);

        startDate = new Date(previousDate);
        startDate.setMonth(startDate.getMonth() + monthsLater);
      }

      tempDates.push(startDate);
    });

    // Now create records with end_date set to next promotion's start_date
    progressionPath.forEach((level, index) => {
      const createdById =
        seniorProfiles.length > 0 && Math.random() > 0.3
          ? getRandomItem(seniorProfiles).id
          : null;

      seniorityHistoryRecords.push({
        profileId: profile.id,
        seniorityLevel: level,
        start_date: tempDates[index],
        end_date: index < tempDates.length - 1 ? tempDates[index + 1] : null,
        createdById,
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
    Map<string, { level: ProficiencyLevel; validatedById: string | null }>
  >();

  // Helper function to determine proficiency based on seniority
  const getProficiencyForSeniority = (
    seniorityLevel: SeniorityLevel,
  ): ProficiencyLevel => {
    switch (seniorityLevel) {
      case 'JUNIOR':
        return Math.random() < 0.7
          ? ProficiencyLevel.NOVICE
          : ProficiencyLevel.INTERMEDIATE;
      case 'MID':
        return Math.random() < 0.6
          ? ProficiencyLevel.INTERMEDIATE
          : ProficiencyLevel.ADVANCED;
      case 'SENIOR':
        return Math.random() < 0.5
          ? ProficiencyLevel.ADVANCED
          : ProficiencyLevel.EXPERT;
      case 'LEAD':
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
      case 'JUNIOR':
        skillCount = getRandomInt(3, 6);
        break;
      case 'MID':
        skillCount = getRandomInt(5, 10);
        break;
      case 'SENIOR':
        skillCount = getRandomInt(8, 15);
        break;
      case 'LEAD':
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
            (p.seniorityLevel === 'SENIOR' || p.seniorityLevel === 'LEAD') &&
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

  // Convert map to employee skills array
  skillsByProfile.forEach((skillMap, profileId) => {
    skillMap.forEach((skillData, skillId) => {
      employeeSkills.push({
        profileId,
        skillId,
        proficiencyLevel: skillData.level,
        validatedAt: generatePastDate(90),
        validatedById: skillData.validatedById,
        createdAt: generatePastDate(120),
        updatedAt: generateRecentDate(60),
      });
    });
  });

  return employeeSkills;
}

/**
 * Generate skill suggestions (PENDING status only)
 */
function generateSuggestions(
  profiles: GeneratedProfile[],
  allSkills: Skill[],
  existingSkills: EmployeeSkillData[],
): Array<{
  profileId: string;
  skillId: string;
  suggestedProficiency: ProficiencyLevel;
  status: SuggestionStatus;
  source: SuggestionSource;
  createdAt: Date;
}> {
  const suggestions: Array<{
    profileId: string;
    skillId: string;
    suggestedProficiency: ProficiencyLevel;
    status: SuggestionStatus;
    source: SuggestionSource;
    createdAt: Date;
  }> = [];

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
          case 'JUNIOR':
            suggestedProficiency =
              Math.random() < 0.7
                ? ProficiencyLevel.NOVICE
                : ProficiencyLevel.INTERMEDIATE;
            break;
          case 'MID':
            suggestedProficiency =
              Math.random() < 0.5
                ? ProficiencyLevel.INTERMEDIATE
                : ProficiencyLevel.ADVANCED;
            break;
          case 'SENIOR':
          case 'LEAD':
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
        const profileSpecs = await generateProfiles(PROFILE_COUNT);

        // Create profiles individually to get their IDs
        const profilesWithSeniority: GeneratedProfile[] = [];
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
            (p) => p.seniorityLevel === 'JUNIOR',
          ).length,
          MID: profilesWithSeniority.filter((p) => p.seniorityLevel === 'MID')
            .length,
          SENIOR: profilesWithSeniority.filter(
            (p) => p.seniorityLevel === 'SENIOR',
          ).length,
          LEAD: profilesWithSeniority.filter(
            (p) => p.seniorityLevel === 'LEAD',
          ).length,
        };

        const adminCount = profilesWithSeniority.filter(
          (p) => p.role === Role.ADMIN,
        ).length;

        console.log(
          `  Created ${profilesWithSeniority.length} profiles (${seniorityStats.JUNIOR} Junior, ${seniorityStats.MID} Mid, ${seniorityStats.SENIOR} Senior, ${seniorityStats.LEAD} Lead)`,
        );
        console.log(
          `  Assigned ${adminCount} ADMIN role(s), remaining profiles have EMPLOYEE role`,
        );
        console.log(`  All profiles have password: "${DEFAULT_PASSWORD}"\n`);

        // ===== SENIORITY HISTORY GENERATION =====
        console.log('[3/7] Generating seniority history...');
        const seniorityHistoryData =
          generateSeniorityHistory(profilesWithSeniority);

        await tx.seniorityHistory.createMany({
          data: seniorityHistoryData,
        });

        console.log(
          `  Created ${seniorityHistoryData.length} seniority history records\n`,
        );

        // ===== PROJECT GENERATION =====
        console.log('[4/7] Generating projects...');
        const leadProfiles = profilesWithSeniority.filter(
          (p) => p.seniorityLevel === 'LEAD',
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
          `  All projects have Tech Leads assigned from LEAD profiles\n`,
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
            (p) => assignmentData.filter((a) => a.profileId === p.id).length === 1,
          ).length,
          twoProjects: profilesWithSeniority.filter(
            (p) => assignmentData.filter((a) => a.profileId === p.id).length === 2,
          ).length,
          threeProjects: profilesWithSeniority.filter(
            (p) => assignmentData.filter((a) => a.profileId === p.id).length === 3,
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
          (es) => es.validatedById !== null,
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
        );

        await tx.suggestion.createMany({
          data: suggestionData,
        });

        console.log(
          `  Created ${suggestionData.length} pending suggestions\n`,
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
