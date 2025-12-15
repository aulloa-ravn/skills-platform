import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { ProficiencyLevel, Discipline } from '@prisma/client';
import { GraphQLISODateTime } from '@nestjs/graphql';

// Register Prisma enums for GraphQL
registerEnumType(ProficiencyLevel, {
  name: 'ProficiencyLevel',
  description: 'Skill proficiency level',
});

registerEnumType(Discipline, {
  name: 'Discipline',
  description: 'Skill discipline category',
});

// Validator Info (reused for both validated skills and seniority history creator)
@ObjectType()
export class ValidatorInfo {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;
}

// Validated Skill Response
@ObjectType()
export class ValidatedSkillResponse {
  @Field()
  skillName: string;

  @Field(() => Discipline)
  discipline: Discipline;

  @Field(() => ProficiencyLevel)
  proficiencyLevel: ProficiencyLevel;

  @Field(() => GraphQLISODateTime)
  validatedAt: Date;

  @Field(() => ValidatorInfo, { nullable: true })
  validator?: ValidatorInfo;
}

// Pending Skill Response
@ObjectType()
export class PendingSkillResponse {
  @Field()
  skillName: string;

  @Field(() => Discipline)
  discipline: Discipline;

  @Field(() => ProficiencyLevel)
  suggestedProficiency: ProficiencyLevel;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}

// Skills Tiers Response
@ObjectType()
export class SkillsTiersResponse {
  @Field(() => [ValidatedSkillResponse])
  coreStack: ValidatedSkillResponse[];

  @Field(() => [ValidatedSkillResponse])
  validatedInventory: ValidatedSkillResponse[];

  @Field(() => [PendingSkillResponse])
  pending: PendingSkillResponse[];
}

// Seniority History Response
@ObjectType()
export class SeniorityHistoryResponse {
  @Field()
  seniorityLevel: string;

  @Field(() => GraphQLISODateTime)
  effectiveDate: Date;

  @Field(() => ValidatorInfo, { nullable: true })
  createdBy?: ValidatorInfo;
}

// Tech Lead Info
@ObjectType()
export class TechLeadInfo {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;
}

// Current Assignment Response
@ObjectType()
export class CurrentAssignmentResponse {
  @Field()
  projectName: string;

  @Field()
  role: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => TechLeadInfo, { nullable: true })
  techLead?: TechLeadInfo;
}

// Main Profile Response
@ObjectType()
export class ProfileResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  currentSeniorityLevel: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => SkillsTiersResponse)
  skills: SkillsTiersResponse;

  @Field(() => [SeniorityHistoryResponse])
  seniorityHistory: SeniorityHistoryResponse[];

  @Field(() => [CurrentAssignmentResponse])
  currentAssignments: CurrentAssignmentResponse[];
}
