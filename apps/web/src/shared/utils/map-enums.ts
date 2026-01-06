import {
  SuggestionSource,
  SeniorityLevel,
  ProficiencyLevel,
  Discipline,
} from '../lib/types'

export const SeniorityLevelMap: Record<SeniorityLevel, string> = {
  [SeniorityLevel.JUNIOR_ENGINEER]: 'Junior Engineer',
  [SeniorityLevel.MID_ENGINEER]: 'Mid Engineer',
  [SeniorityLevel.SENIOR_ENGINEER]: 'Senior Engineer',
  [SeniorityLevel.STAFF_ENGINEER]: 'Staff Engineer',
}

export const ProficiencyLevelMap: Record<ProficiencyLevel, string> = {
  [ProficiencyLevel.NOVICE]: 'Novice',
  [ProficiencyLevel.INTERMEDIATE]: 'Intermediate',
  [ProficiencyLevel.ADVANCED]: 'Advanced',
  [ProficiencyLevel.EXPERT]: 'Expert',
}

export const SuggestionSourceMap: Record<SuggestionSource, string> = {
  [SuggestionSource.SELF_REPORT]: 'Self',
  [SuggestionSource.SYSTEM_FLAG]: 'System',
}

export const DisciplineMap: Record<Discipline, string> = {
  [Discipline.ANDROID]: 'Android',
  [Discipline.API]: 'API',
  [Discipline.BACKEND]: 'Backend',
  [Discipline.BUILD_TOOLS]: 'Build Tools',
  [Discipline.CLOUD]: 'Cloud',
  [Discipline.DATABASE]: 'Database',
  [Discipline.DESIGN]: 'Design',
  [Discipline.DEVOPS]: 'DevOps',
  [Discipline.FRONTEND]: 'Frontend',
  [Discipline.IOS]: 'iOS',
  [Discipline.LANGUAGES]: 'Languages',
  [Discipline.MOBILE]: 'Mobile',
  [Discipline.NO_CODE]: 'No Code',
  [Discipline.OTHER]: 'Other',
  [Discipline.PERFORMANCE]: 'Performance',
  [Discipline.SECURITY]: 'Security',
  [Discipline.STYLING]: 'Styling',
  [Discipline.TESTING]: 'Testing',
  [Discipline.TOOLS]: 'Tools',
}
