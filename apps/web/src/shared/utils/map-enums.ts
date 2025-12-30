import { SeniorityLevel, ProficiencyLevel } from '../lib/types'

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
