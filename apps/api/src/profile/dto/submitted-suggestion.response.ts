import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProficiencyLevel, SuggestionStatus } from '@prisma/client';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class SubmittedSuggestionSkill {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  discipline: string;
}

@ObjectType()
export class SubmittedSuggestionResponse {
  @Field(() => Int)
  suggestionId: number;

  @Field(() => SuggestionStatus)
  status: SuggestionStatus;

  @Field(() => ProficiencyLevel)
  suggestedProficiency: ProficiencyLevel;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => SubmittedSuggestionSkill)
  skill: SubmittedSuggestionSkill;
}
