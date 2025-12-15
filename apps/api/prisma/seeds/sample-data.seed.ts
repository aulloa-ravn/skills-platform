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
} from '@prisma/client';
import { faker } from '@faker-js/faker';
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

// Tag templates by project type
const TAG_TEMPLATES: Record<ProjectType, string[]> = {
  MOBILE: [
    'react-native',
    'ios',
    'android',
    'mobile-ui',
    'app-store',
    'swift',
    'kotlin',
  ],
  BACKEND: ['api', 'rest', 'graphql', 'postgresql', 'redis', 'docker', 'node'],
  FRONTEND: ['react', 'typescript', 'tailwind', 'nextjs', 'ui-ux', 'css'],
  FULLSTACK: [
    'fullstack',
    'typescript',
    'react',
    'node',
    'postgresql',
    'docker',
    'api',
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
 * Generate profiles with seniority distribution
 */
function generateProfiles(count: number): Array<{
  data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;
  seniorityLevel: SeniorityLevel;
}> {
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
  effectiveDate: Date;
  createdById: string | null;
}> {
  const seniorityHistoryRecords: Array<{
    profileId: string;
    seniorityLevel: string;
    effectiveDate: Date;
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

    progressionPath.forEach((level, index) => {
      let effectiveDate: Date;

      if (index === 0) {
        // First record: 1-3 years ago
        effectiveDate = generateDateInRange(threeYearsAgo, new Date());
      } else {
        // Subsequent records: after previous promotion
        const previousDate = seniorityHistoryRecords[
          seniorityHistoryRecords.length - 1
        ].effectiveDate;
        const minMonthsLater = 12; // At least 1 year between promotions
        const maxMonthsLater = 24; // At most 2 years
        const monthsLater = getRandomInt(minMonthsLater, maxMonthsLater);

        effectiveDate = new Date(previousDate);
        effectiveDate.setMonth(effectiveDate.getMonth() + monthsLater);
      }

      const createdById =
        seniorProfiles.length > 0 && Math.random() > 0.3
          ? getRandomItem(seniorProfiles).id
          : null;

      seniorityHistoryRecords.push({
        profileId: profile.id,
        seniorityLevel: level,
        effectiveDate,
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
  const shuffledLeads = shuffleArray(leadProfiles);
  const selectedTemplates = selectRandomItems(PROJECT_TEMPLATES, count);

  for (let i = 0; i < count; i++) {
    const template = selectedTemplates[i];
    const techLead = shuffledLeads[i];

    projects.push({
      data: {
        name: template.name,
        missionBoardId: generateMissionBoardId(),
        techLeadId: techLead.id,
      },
      projectType: template.type,
    });
  }

  return projects;
}

/**
 * Generate assignments with distribution
 */
function generateAssignments(
  profiles: GeneratedProfile[],
  projects: GeneratedProject[],
): AssignmentData[] {
  const assignments: AssignmentData[] = [];
  const distribution = distributeByPercentages(
    profiles.length,
    ASSIGNMENT_DISTRIBUTION,
  );

  const shuffledProfiles = shuffleArray(profiles);
  let profileIndex = 0;

  // Assign profiles to 1, 2, or 3 projects based on distribution
  [1, 2, 3].forEach((projectCount, groupIndex) => {
    for (let i = 0; i < distribution[groupIndex]; i++) {
      const profile = shuffledProfiles[profileIndex];
      const assignedProjects = selectRandomItems(projects, projectCount);

      assignedProjects.forEach((project) => {
        const role = getRandomItem(ROLE_TEMPLATES[project.projectType]);
        const tagCount = getRandomInt(1, 3);
        const tags = selectRandomItems(
          TAG_TEMPLATES[project.projectType],
          tagCount,
        );

        assignments.push({
          profileId: profile.id,
          projectId: project.id,
          missionBoardId: generateMissionBoardId(),
          role,
          tags,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      profileIndex++;
    }
  });

  return assignments;
}

/**
 * Get proficiency level based on seniority
 */
function getProficiencyForSeniority(
  seniority: SeniorityLevel,
  targetDistribution: Record<ProficiencyLevel, number>,
): ProficiencyLevel {
  const random = Math.random() * 100;

  // Adjust distribution based on seniority
  let levels: ProficiencyLevel[];
  let weights: number[];

  switch (seniority) {
    case 'JUNIOR':
      levels = [
        ProficiencyLevel.NOVICE,
        ProficiencyLevel.INTERMEDIATE,
        ProficiencyLevel.ADVANCED,
      ];
      weights = [20, 50, 30]; // No EXPERT for Juniors
      break;
    case 'MID':
      levels = [
        ProficiencyLevel.NOVICE,
        ProficiencyLevel.INTERMEDIATE,
        ProficiencyLevel.ADVANCED,
        ProficiencyLevel.EXPERT,
      ];
      weights = [5, 45, 45, 5];
      break;
    case 'SENIOR':
      levels = [
        ProficiencyLevel.INTERMEDIATE,
        ProficiencyLevel.ADVANCED,
        ProficiencyLevel.EXPERT,
      ];
      weights = [20, 50, 30];
      break;
    case 'LEAD':
      levels = [
        ProficiencyLevel.INTERMEDIATE,
        ProficiencyLevel.ADVANCED,
        ProficiencyLevel.EXPERT,
      ];
      weights = [10, 40, 50];
      break;
    default:
      levels = Object.values(ProficiencyLevel);
      weights = Object.values(targetDistribution);
  }

  let cumulative = 0;
  for (let i = 0; i < levels.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return levels[i];
    }
  }

  return levels[levels.length - 1];
}

/**
 * Generate employee skills with context awareness
 */
function generateEmployeeSkills(
  profiles: GeneratedProfile[],
  assignments: AssignmentData[],
  projects: GeneratedProject[],
  skills: Skill[],
): EmployeeSkillData[] {
  const employeeSkills: EmployeeSkillData[] = [];
  const seniorProfiles = profiles.filter(
    (p) => p.seniorityLevel === 'SENIOR' || p.seniorityLevel === 'LEAD',
  );

  const targetDistribution = {
    [ProficiencyLevel.NOVICE]: 10,
    [ProficiencyLevel.INTERMEDIATE]: 40,
    [ProficiencyLevel.ADVANCED]: 40,
    [ProficiencyLevel.EXPERT]: 10,
  };

  profiles.forEach((profile) => {
    // Get profile's project assignments
    const profileAssignments = assignments.filter(
      (a) => a.profileId === profile.id,
    );

    // Get project types for those assignments
    const profileProjects = projects.filter((p) =>
      profileAssignments.some((a) => a.projectId === p.id),
    );

    const projectTypes = profileProjects.map((p) => p.projectType);

    // Get relevant skills for profile's projects
    const relevantSkills = getRelevantSkillsForProjectTypes(
      projectTypes,
      skills,
    );

    // Generate 3-7 skills per profile
    const skillCount = getRandomInt(3, 7);
    const selectedSkills =
      relevantSkills.length >= skillCount
        ? selectRandomItems(relevantSkills, skillCount)
        : [
            ...relevantSkills,
            ...selectRandomItems(
              skills.filter((s) => !relevantSkills.includes(s)),
              skillCount - relevantSkills.length,
            ),
          ];

    selectedSkills.forEach((skill) => {
      const proficiencyLevel = getProficiencyForSeniority(
        profile.seniorityLevel,
        targetDistribution,
      );

      const validatedAt = generatePastDate(getRandomInt(1, 12));
      const validatedById =
        seniorProfiles.length > 0 && Math.random() > 0.25
          ? getRandomItem(seniorProfiles).id
          : null;

      employeeSkills.push({
        profileId: profile.id,
        skillId: skill.id,
        proficiencyLevel,
        validatedAt,
        validatedById,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  });

  return employeeSkills;
}

/**
 * Generate skill suggestions
 */
function generateSkillSuggestions(
  profiles: GeneratedProfile[],
  employeeSkills: EmployeeSkillData[],
  assignments: AssignmentData[],
  projects: GeneratedProject[],
  skills: Skill[],
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

  profiles.forEach((profile) => {
    // Determine number of suggestions: 60% get 1, 30% get 2, 10% get 3
    const random = Math.random() * 100;
    const suggestionCount = random < 60 ? 1 : random < 90 ? 2 : 3;

    // Get profile's existing skills
    const profileSkills = employeeSkills
      .filter((es) => es.profileId === profile.id)
      .map((es) => ({ skillId: es.skillId, level: es.proficiencyLevel }));

    // Get profile's project types
    const profileAssignments = assignments.filter(
      (a) => a.profileId === profile.id,
    );
    const profileProjects = projects.filter((p) =>
      profileAssignments.some((a) => a.projectId === p.id),
    );
    const projectTypes = profileProjects.map((p) => p.projectType);

    // Get relevant skills
    const relevantSkills = getRelevantSkillsForProjectTypes(
      projectTypes,
      skills,
    );

    // Filter out skills already at same or higher proficiency
    const availableSkills = relevantSkills.filter((skill) => {
      const existing = profileSkills.find((ps) => ps.skillId === skill.id);
      return !existing; // For suggestions, we'll suggest new skills or upgrades
    });

    // If not enough relevant skills, add random ones
    const candidateSkills =
      availableSkills.length >= suggestionCount
        ? selectRandomItems(availableSkills, suggestionCount)
        : [
            ...availableSkills,
            ...selectRandomItems(
              skills.filter(
                (s) =>
                  !availableSkills.includes(s) &&
                  !profileSkills.some((ps) => ps.skillId === s.id),
              ),
              suggestionCount - availableSkills.length,
            ),
          ];

    candidateSkills.forEach((skill) => {
      const existing = profileSkills.find((ps) => ps.skillId === skill.id);
      let suggestedProficiency: ProficiencyLevel;

      if (existing) {
        // Suggest next level up
        const levels = [
          ProficiencyLevel.NOVICE,
          ProficiencyLevel.INTERMEDIATE,
          ProficiencyLevel.ADVANCED,
          ProficiencyLevel.EXPERT,
        ];
        const currentIndex = levels.indexOf(existing.level);
        suggestedProficiency =
          currentIndex < levels.length - 1
            ? levels[currentIndex + 1]
            : existing.level;
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
        console.log('[2/7] Generating profiles...');
        const profileSpecs = generateProfiles(PROFILE_COUNT);

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

        console.log(
          `  Created ${profilesWithSeniority.length} profiles (${seniorityStats.JUNIOR} Junior, ${seniorityStats.MID} Mid, ${seniorityStats.SENIOR} Senior, ${seniorityStats.LEAD} Lead)\n`,
        );

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
        const createdProjects: GeneratedProject[] = [];
        for (const spec of projectSpecs) {
          const createdProject = await tx.project.create({
            data: spec.data,
          });
          createdProjects.push({
            ...createdProject,
            projectType: spec.projectType,
          });
        }

        console.log(
          `  Created ${createdProjects.length} projects with unique Tech Leads\n`,
        );

        // ===== ASSIGNMENT GENERATION =====
        console.log('[5/7] Generating assignments...');
        const assignmentData = generateAssignments(
          profilesWithSeniority,
          createdProjects,
        );

        await tx.assignment.createMany({
          data: assignmentData,
        });

        // Calculate distribution stats
        const assignmentCounts = new Map<string, number>();
        assignmentData.forEach((a) => {
          assignmentCounts.set(
            a.profileId,
            (assignmentCounts.get(a.profileId) || 0) + 1,
          );
        });

        const distribution1 = Array.from(assignmentCounts.values()).filter(
          (c) => c === 1,
        ).length;
        const distribution2 = Array.from(assignmentCounts.values()).filter(
          (c) => c === 2,
        ).length;
        const distribution3 = Array.from(assignmentCounts.values()).filter(
          (c) => c === 3,
        ).length;

        console.log(
          `  Created ${assignmentData.length} assignments (${distribution1} on 1 project, ${distribution2} on 2 projects, ${distribution3} on 3 projects)\n`,
        );

        // ===== EMPLOYEE SKILLS GENERATION =====
        console.log('[6/7] Generating employee skills...');
        const allSkills = await tx.skill.findMany();

        const employeeSkillData = generateEmployeeSkills(
          profilesWithSeniority,
          assignmentData,
          createdProjects,
          allSkills,
        );

        await tx.employeeSkill.createMany({
          data: employeeSkillData,
        });

        // Calculate proficiency stats
        const proficiencyStats = {
          NOVICE: employeeSkillData.filter(
            (es) => es.proficiencyLevel === ProficiencyLevel.NOVICE,
          ).length,
          INTERMEDIATE: employeeSkillData.filter(
            (es) => es.proficiencyLevel === ProficiencyLevel.INTERMEDIATE,
          ).length,
          ADVANCED: employeeSkillData.filter(
            (es) => es.proficiencyLevel === ProficiencyLevel.ADVANCED,
          ).length,
          EXPERT: employeeSkillData.filter(
            (es) => es.proficiencyLevel === ProficiencyLevel.EXPERT,
          ).length,
        };

        const avgSkillsPerProfile = (
          employeeSkillData.length / profilesWithSeniority.length
        ).toFixed(1);

        console.log(
          `  Created ${employeeSkillData.length} employee skills (avg ${avgSkillsPerProfile} per profile)`,
        );
        console.log(
          `  Proficiency distribution: ${proficiencyStats.NOVICE} NOVICE, ${proficiencyStats.INTERMEDIATE} INTERMEDIATE, ${proficiencyStats.ADVANCED} ADVANCED, ${proficiencyStats.EXPERT} EXPERT\n`,
        );

        // ===== SKILL SUGGESTIONS GENERATION =====
        console.log('[7/7] Generating skill suggestions...');
        const suggestionData = generateSkillSuggestions(
          profilesWithSeniority,
          employeeSkillData,
          assignmentData,
          createdProjects,
          allSkills,
        );

        await tx.suggestion.createMany({
          data: suggestionData,
        });

        // Calculate suggestion distribution
        const suggestionCounts = new Map<string, number>();
        suggestionData.forEach((s) => {
          suggestionCounts.set(
            s.profileId,
            (suggestionCounts.get(s.profileId) || 0) + 1,
          );
        });

        const suggestions1 = Array.from(suggestionCounts.values()).filter(
          (c) => c === 1,
        ).length;
        const suggestions2 = Array.from(suggestionCounts.values()).filter(
          (c) => c === 2,
        ).length;
        const suggestions3 = Array.from(suggestionCounts.values()).filter(
          (c) => c === 3,
        ).length;

        console.log(
          `  Created ${suggestionData.length} skill suggestions (${suggestions1} profiles with 1, ${suggestions2} with 2, ${suggestions3} with 3)`,
        );
        console.log(
          '  All suggestions set to PENDING status from SELF_REPORT source\n',
        );

        // ===== DATA INTEGRITY VALIDATIONS =====
        console.log('Validating data integrity...');

        // Validate all emails use @ravn.com domain
        const invalidEmails = await tx.profile.findMany({
          where: {
            NOT: {
              email: {
                endsWith: '@ravn.com',
              },
            },
          },
        });

        if (invalidEmails.length > 0) {
          throw new Error(
            `Found ${invalidEmails.length} profiles with invalid email domains`,
          );
        }
        console.log('  All emails use @ravn.com domain');

        // Validate Tech Leads have Lead seniority
        const projectsWithLeads = await tx.project.findMany({
          include: { techLead: true },
        });

        const invalidTechLeads = projectsWithLeads.filter(
          (p) => p.techLead && p.techLead.currentSeniorityLevel !== 'LEAD',
        );

        if (invalidTechLeads.length > 0) {
          throw new Error(
            `Found ${invalidTechLeads.length} projects with Tech Leads who are not LEAD seniority`,
          );
        }
        console.log('  All Tech Leads have LEAD seniority level');

        // Validate each project has exactly one Tech Lead
        const projectsWithoutLead = projectsWithLeads.filter(
          (p) => !p.techLeadId,
        );

        if (projectsWithoutLead.length > 0) {
          throw new Error(
            `Found ${projectsWithoutLead.length} projects without Tech Leads`,
          );
        }
        console.log('  All projects have exactly one Tech Lead');

        // Validate assignment distribution
        const dist1Pct = ((distribution1 / PROFILE_COUNT) * 100).toFixed(1);
        const dist2Pct = ((distribution2 / PROFILE_COUNT) * 100).toFixed(1);
        const dist3Pct = ((distribution3 / PROFILE_COUNT) * 100).toFixed(1);

        console.log(
          `  Assignment distribution: ${dist1Pct}% on 1 project, ${dist2Pct}% on 2, ${dist3Pct}% on 3`,
        );

        console.log('  All data integrity checks passed\n');
      },
      {
        timeout: 30000, // 30 second timeout
      },
    );

    // ===== FINAL SUMMARY =====
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('========================================');
    console.log('Sample data seeding completed successfully!');
    console.log('========================================');
    console.log(`Total time elapsed: ${elapsed} seconds\n`);
  } catch (error) {
    console.error('\n========================================');
    console.error('ERROR: Seeding failed');
    console.error('========================================');
    console.error('Error message:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}
