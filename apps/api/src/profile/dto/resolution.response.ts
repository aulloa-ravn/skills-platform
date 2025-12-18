import { ObjectType, Field } from '@nestjs/graphql';
import { ResolutionAction } from './resolution.input';

@ObjectType()
export class ResolvedSuggestion {
  @Field()
  suggestionId: string;

  @Field(() => ResolutionAction)
  action: ResolutionAction;

  @Field()
  employeeName: string;

  @Field()
  skillName: string;

  @Field()
  proficiencyLevel: string;
}

@ObjectType()
export class ResolutionError {
  @Field()
  suggestionId: string;

  @Field()
  message: string;

  @Field()
  code: string;
}

@ObjectType()
export class ResolveSuggestionsResponse {
  @Field()
  success: boolean;

  @Field(() => [ResolvedSuggestion])
  processed: ResolvedSuggestion[];

  @Field(() => [ResolutionError])
  errors: ResolutionError[];
}
