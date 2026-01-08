import { ObjectType, Field, Int } from '@nestjs/graphql';
import { SeniorityLevel } from '@prisma/client';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class ProfileListItemResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => SeniorityLevel)
  currentSeniorityLevel: SeniorityLevel;

  @Field(() => GraphQLISODateTime)
  joinDate: Date;

  @Field(() => Int)
  currentAssignmentsCount: number;

  @Field(() => [String])
  coreStackSkills: string[];

  @Field(() => Int)
  remainingSkillsCount: number;
}

@ObjectType()
export class PaginatedProfilesResponse {
  @Field(() => [ProfileListItemResponse])
  profiles: ProfileListItemResponse[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalPages: number;
}
