import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  ProficiencyLevel,
  Discipline,
  SuggestionSource,
  SuggestionStatus,
  SeniorityLevel,
} from '@prisma/client';
import { GraphQLISODateTime } from '@nestjs/graphql';

// Register Prisma enums for GraphQL
registerEnumType(SuggestionSource, {
  name: 'SuggestionSource',
  description: 'Source of the skill suggestion',
});

registerEnumType(SuggestionStatus, {
  name: 'SuggestionStatus',
  description: 'Status of the skill suggestion',
});

// Level 3: Pending Suggestion
@ObjectType()
export class PendingSuggestion {
  @Field()
  id: string;

  @Field()
  skillName: string;

  @Field(() => Discipline)
  discipline: Discipline;

  @Field(() => ProficiencyLevel)
  suggestedProficiency: ProficiencyLevel;

  @Field(() => SuggestionSource)
  source: SuggestionSource;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => ProficiencyLevel, { nullable: true })
  currentProficiency?: ProficiencyLevel;
}

// Level 2: Employee Inbox
@ObjectType()
export class EmployeeInbox {
  @Field()
  employeeId: string;

  @Field()
  employeeName: string;

  @Field()
  employeeEmail: string;

  @Field(() => SeniorityLevel)
  employeeCurrentSeniorityLevel: SeniorityLevel;

  @Field({ nullable: true })
  employeeAvatarUrl?: string;

  @Field(() => Int)
  pendingSuggestionsCount: number;

  @Field(() => [PendingSuggestion])
  suggestions: PendingSuggestion[];
}

// Level 1: Project Inbox
@ObjectType()
export class ProjectInbox {
  @Field()
  projectId: string;

  @Field()
  projectName: string;

  @Field(() => Int)
  pendingSuggestionsCount: number;

  @Field(() => [EmployeeInbox])
  employees: EmployeeInbox[];
}

// Top Level: Inbox Response
@ObjectType()
export class InboxResponse {
  @Field(() => [ProjectInbox])
  projects: ProjectInbox[];
}
