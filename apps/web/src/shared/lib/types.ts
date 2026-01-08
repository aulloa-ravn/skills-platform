/* eslint-disable @typescript-eslint/no-explicit-any */
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never
    }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any }
}

export type CreateSeniorityHistoryInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>
  profileId: Scalars['String']['input']
  seniorityLevel: SeniorityLevel
  startDate: Scalars['DateTime']['input']
}

export type CreateSkillInput = {
  discipline: Discipline
  name: Scalars['String']['input']
}

export type CurrentAssignmentResponse = {
  __typename?: 'CurrentAssignmentResponse'
  projectName: Scalars['String']['output']
  role: Scalars['String']['output']
  tags: Array<Scalars['String']['output']>
  techLead?: Maybe<TechLeadInfo>
}

export type DecisionInput = {
  action: ResolutionAction
  adjustedProficiency?: InputMaybe<Scalars['String']['input']>
  suggestionId: Scalars['Int']['input']
}

/** Skill discipline category */
export enum Discipline {
  ANDROID = 'ANDROID',
  API = 'API',
  BACKEND = 'BACKEND',
  BUILD_TOOLS = 'BUILD_TOOLS',
  CLOUD = 'CLOUD',
  DATABASE = 'DATABASE',
  DESIGN = 'DESIGN',
  DEVOPS = 'DEVOPS',
  FRONTEND = 'FRONTEND',
  IOS = 'IOS',
  LANGUAGES = 'LANGUAGES',
  MOBILE = 'MOBILE',
  NO_CODE = 'NO_CODE',
  OTHER = 'OTHER',
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  STYLING = 'STYLING',
  TESTING = 'TESTING',
  TOOLS = 'TOOLS',
}

export type EmployeeInbox = {
  __typename?: 'EmployeeInbox'
  employeeAvatarUrl?: Maybe<Scalars['String']['output']>
  employeeCurrentSeniorityLevel: SeniorityLevel
  employeeEmail: Scalars['String']['output']
  employeeId: Scalars['String']['output']
  employeeName: Scalars['String']['output']
  employeeRole: Scalars['String']['output']
  pendingSuggestionsCount: Scalars['Int']['output']
  suggestions: Array<PendingSuggestion>
}

export type GetAllProfilesForAdminInput = {
  page?: InputMaybe<Scalars['Int']['input']>
  pageSize?: InputMaybe<Scalars['Int']['input']>
  searchTerm?: InputMaybe<Scalars['String']['input']>
  seniorityLevels?: InputMaybe<Array<SeniorityLevel>>
  skillIds?: InputMaybe<Array<Scalars['String']['input']>>
  sortBy?: InputMaybe<ProfileSortField>
  sortDirection?: InputMaybe<SortDirection>
  yearsInCompanyRanges?: InputMaybe<Array<YearsInCompanyRange>>
}

export type GetAllSkillsInput = {
  disciplines?: InputMaybe<Array<Discipline>>
  isActive?: InputMaybe<Scalars['Boolean']['input']>
  searchTerm?: InputMaybe<Scalars['String']['input']>
}

export type InboxResponse = {
  __typename?: 'InboxResponse'
  projects: Array<ProjectInbox>
}

export type LoginInput = {
  email: Scalars['String']['input']
  password: Scalars['String']['input']
}

export type LoginResponse = {
  __typename?: 'LoginResponse'
  accessToken: Scalars['String']['output']
  profile: ProfileInfo
  refreshToken: Scalars['String']['output']
}

export type Mutation = {
  __typename?: 'Mutation'
  createSeniorityHistory: SeniorityHistoryRecord
  createSkill: Skill
  login: LoginResponse
  refreshToken: RefreshTokenResponse
  resolveSuggestions: ResolveSuggestionsResponse
  toggleSkill: Skill
  updateSeniorityHistory: SeniorityHistoryRecord
  updateSkill: Skill
}

export type MutationCreateSeniorityHistoryArgs = {
  input: CreateSeniorityHistoryInput
}

export type MutationCreateSkillArgs = {
  input: CreateSkillInput
}

export type MutationLoginArgs = {
  input: LoginInput
}

export type MutationRefreshTokenArgs = {
  input: RefreshTokenInput
}

export type MutationResolveSuggestionsArgs = {
  input: ResolveSuggestionsInput
}

export type MutationToggleSkillArgs = {
  id: Scalars['Float']['input']
  isActive: Scalars['Boolean']['input']
}

export type MutationUpdateSeniorityHistoryArgs = {
  input: UpdateSeniorityHistoryInput
}

export type MutationUpdateSkillArgs = {
  input: UpdateSkillInput
}

export type PaginatedProfilesResponse = {
  __typename?: 'PaginatedProfilesResponse'
  currentPage: Scalars['Int']['output']
  pageSize: Scalars['Int']['output']
  profiles: Array<ProfileListItemResponse>
  totalCount: Scalars['Int']['output']
  totalPages: Scalars['Int']['output']
}

export type PendingSkillResponse = {
  __typename?: 'PendingSkillResponse'
  createdAt: Scalars['DateTime']['output']
  discipline: Discipline
  skillName: Scalars['String']['output']
  suggestedProficiency: ProficiencyLevel
}

export type PendingSuggestion = {
  __typename?: 'PendingSuggestion'
  createdAt: Scalars['DateTime']['output']
  currentProficiency?: Maybe<ProficiencyLevel>
  discipline: Discipline
  id: Scalars['Int']['output']
  skillName: Scalars['String']['output']
  source: SuggestionSource
  suggestedProficiency: ProficiencyLevel
}

/** Skill proficiency level */
export enum ProficiencyLevel {
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  INTERMEDIATE = 'INTERMEDIATE',
  NOVICE = 'NOVICE',
}

export type ProfileInfo = {
  __typename?: 'ProfileInfo'
  avatarUrl?: Maybe<Scalars['String']['output']>
  email: Scalars['String']['output']
  id: Scalars['String']['output']
  name: Scalars['String']['output']
  type: ProfileType
}

export type ProfileListItemResponse = {
  __typename?: 'ProfileListItemResponse'
  avatarUrl?: Maybe<Scalars['String']['output']>
  coreStackSkills: Array<Scalars['String']['output']>
  currentAssignmentsCount: Scalars['Int']['output']
  currentSeniorityLevel: SeniorityLevel
  email: Scalars['String']['output']
  id: Scalars['String']['output']
  joinDate: Scalars['DateTime']['output']
  name: Scalars['String']['output']
  remainingSkillsCount: Scalars['Int']['output']
}

export type ProfileResponse = {
  __typename?: 'ProfileResponse'
  avatarUrl?: Maybe<Scalars['String']['output']>
  currentAssignments: Array<CurrentAssignmentResponse>
  currentSeniorityLevel: SeniorityLevel
  email: Scalars['String']['output']
  id: Scalars['String']['output']
  name: Scalars['String']['output']
  seniorityHistory: Array<SeniorityHistoryResponse>
  skills: SkillsTiersResponse
}

/** Fields available for sorting profiles */
export enum ProfileSortField {
  EMAIL = 'EMAIL',
  JOIN_DATE = 'JOIN_DATE',
  NAME = 'NAME',
  SENIORITY = 'SENIORITY',
}

/** User profile type in the system */
export enum ProfileType {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  TECH_LEAD = 'TECH_LEAD',
}

export type ProjectInbox = {
  __typename?: 'ProjectInbox'
  employees: Array<EmployeeInbox>
  pendingSuggestionsCount: Scalars['Int']['output']
  projectId: Scalars['String']['output']
  projectName: Scalars['String']['output']
}

export type Query = {
  __typename?: 'Query'
  getAllProfilesForAdmin: PaginatedProfilesResponse
  getAllSkills: Array<Skill>
  getProfile: ProfileResponse
  getSeniorityHistory: Array<SeniorityHistoryRecord>
  getSkillById: Skill
  getValidationInbox: InboxResponse
  health: Scalars['String']['output']
}

export type QueryGetAllProfilesForAdminArgs = {
  input?: InputMaybe<GetAllProfilesForAdminInput>
}

export type QueryGetAllSkillsArgs = {
  input?: InputMaybe<GetAllSkillsInput>
}

export type QueryGetProfileArgs = {
  id: Scalars['String']['input']
}

export type QueryGetSeniorityHistoryArgs = {
  profileId: Scalars['String']['input']
}

export type QueryGetSkillByIdArgs = {
  id: Scalars['Int']['input']
}

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input']
}

export type RefreshTokenResponse = {
  __typename?: 'RefreshTokenResponse'
  accessToken: Scalars['String']['output']
}

/** Action to take on a skill suggestion */
export enum ResolutionAction {
  ADJUST_LEVEL = 'ADJUST_LEVEL',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export type ResolutionError = {
  __typename?: 'ResolutionError'
  code: Scalars['String']['output']
  message: Scalars['String']['output']
  suggestionId: Scalars['Int']['output']
}

export type ResolveSuggestionsInput = {
  decisions: Array<DecisionInput>
}

export type ResolveSuggestionsResponse = {
  __typename?: 'ResolveSuggestionsResponse'
  errors: Array<ResolutionError>
  processed: Array<ResolvedSuggestion>
  success: Scalars['Boolean']['output']
}

export type ResolvedSuggestion = {
  __typename?: 'ResolvedSuggestion'
  action: ResolutionAction
  employeeName: Scalars['String']['output']
  proficiencyLevel: Scalars['String']['output']
  skillName: Scalars['String']['output']
  suggestionId: Scalars['Int']['output']
}

export type SeniorityHistoryRecord = {
  __typename?: 'SeniorityHistoryRecord'
  createdAt: Scalars['DateTime']['output']
  endDate?: Maybe<Scalars['DateTime']['output']>
  id: Scalars['Int']['output']
  profileId: Scalars['String']['output']
  seniorityLevel: SeniorityLevel
  startDate: Scalars['DateTime']['output']
  updatedAt: Scalars['DateTime']['output']
}

export type SeniorityHistoryResponse = {
  __typename?: 'SeniorityHistoryResponse'
  createdBy?: Maybe<ValidatorInfo>
  endDate?: Maybe<Scalars['DateTime']['output']>
  seniorityLevel: SeniorityLevel
  startDate: Scalars['DateTime']['output']
}

/** Employee seniority level */
export enum SeniorityLevel {
  JUNIOR_ENGINEER = 'JUNIOR_ENGINEER',
  MID_ENGINEER = 'MID_ENGINEER',
  SENIOR_ENGINEER = 'SENIOR_ENGINEER',
  STAFF_ENGINEER = 'STAFF_ENGINEER',
}

export type Skill = {
  __typename?: 'Skill'
  createdAt: Scalars['DateTime']['output']
  discipline: Discipline
  employeeCount: Scalars['Int']['output']
  id: Scalars['Int']['output']
  isActive: Scalars['Boolean']['output']
  name: Scalars['String']['output']
  updatedAt: Scalars['DateTime']['output']
}

export type SkillsTiersResponse = {
  __typename?: 'SkillsTiersResponse'
  coreStack: Array<ValidatedSkillResponse>
  pending: Array<PendingSkillResponse>
  validatedInventory: Array<ValidatedSkillResponse>
}

/** Sort direction */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

/** Source of the skill suggestion */
export enum SuggestionSource {
  SELF_REPORT = 'SELF_REPORT',
  SYSTEM_FLAG = 'SYSTEM_FLAG',
}

export type TechLeadInfo = {
  __typename?: 'TechLeadInfo'
  avatarUrl?: Maybe<Scalars['String']['output']>
  email?: Maybe<Scalars['String']['output']>
  id?: Maybe<Scalars['String']['output']>
  name?: Maybe<Scalars['String']['output']>
}

export type UpdateSeniorityHistoryInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>
  id: Scalars['Int']['input']
  seniorityLevel: SeniorityLevel
  startDate: Scalars['DateTime']['input']
}

export type UpdateSkillInput = {
  discipline?: InputMaybe<Discipline>
  id: Scalars['Int']['input']
  name?: InputMaybe<Scalars['String']['input']>
}

export type ValidatedSkillResponse = {
  __typename?: 'ValidatedSkillResponse'
  discipline: Discipline
  proficiencyLevel: ProficiencyLevel
  skillName: Scalars['String']['output']
  validatedAt: Scalars['DateTime']['output']
  validator?: Maybe<ValidatorInfo>
}

export type ValidatorInfo = {
  __typename?: 'ValidatorInfo'
  id?: Maybe<Scalars['String']['output']>
  name?: Maybe<Scalars['String']['output']>
}

/** Years in company range categories */
export enum YearsInCompanyRange {
  FIVE_PLUS = 'FIVE_PLUS',
  LESS_THAN_1 = 'LESS_THAN_1',
  ONE_TO_TWO = 'ONE_TO_TWO',
  THREE_TO_FIVE = 'THREE_TO_FIVE',
  TWO_TO_THREE = 'TWO_TO_THREE',
}
