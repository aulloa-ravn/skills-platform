import { Discipline, Skill } from '@prisma/client';

export type ProjectType = 'MOBILE' | 'BACKEND' | 'FRONTEND' | 'FULLSTACK';

/**
 * Map project types to relevant skill disciplines
 */
export const PROJECT_TYPE_TO_DISCIPLINES: Record<ProjectType, Discipline[]> = {
  MOBILE: [
    Discipline.MOBILE,
    Discipline.FRONTEND,
    Discipline.STYLING,
    Discipline.IOS,
    Discipline.ANDROID,
    Discipline.TESTING,
    Discipline.LANGUAGES,
  ],
  BACKEND: [
    Discipline.BACKEND,
    Discipline.DATABASE,
    Discipline.CLOUD,
    Discipline.DEVOPS,
    Discipline.API,
    Discipline.TESTING,
    Discipline.LANGUAGES,
    Discipline.SECURITY,
  ],
  FRONTEND: [
    Discipline.FRONTEND,
    Discipline.STYLING,
    Discipline.DESIGN,
    Discipline.TESTING,
    Discipline.LANGUAGES,
    Discipline.BUILD_TOOLS,
  ],
  FULLSTACK: [
    Discipline.FRONTEND,
    Discipline.BACKEND,
    Discipline.DATABASE,
    Discipline.CLOUD,
    Discipline.API,
    Discipline.TESTING,
    Discipline.LANGUAGES,
    Discipline.DEVOPS,
    Discipline.STYLING,
  ],
};

/**
 * Get relevant skills for a given project type
 */
export function getRelevantSkillsForProjectType(
  projectType: ProjectType,
  allSkills: Skill[],
): Skill[] {
  const relevantDisciplines = PROJECT_TYPE_TO_DISCIPLINES[projectType];
  return allSkills.filter((skill) =>
    relevantDisciplines.includes(skill.discipline),
  );
}

/**
 * Get relevant skills for multiple project types
 */
export function getRelevantSkillsForProjectTypes(
  projectTypes: ProjectType[],
  allSkills: Skill[],
): Skill[] {
  const uniqueDisciplines = new Set<Discipline>();

  projectTypes.forEach((projectType) => {
    PROJECT_TYPE_TO_DISCIPLINES[projectType].forEach((discipline) => {
      uniqueDisciplines.add(discipline);
    });
  });

  return allSkills.filter((skill) => uniqueDisciplines.has(skill.discipline));
}
