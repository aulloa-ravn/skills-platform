import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

// ResolutionAction enum
export enum ResolutionAction {
  APPROVE = 'APPROVE',
  ADJUST_LEVEL = 'ADJUST_LEVEL',
  REJECT = 'REJECT',
}

// Register enum with GraphQL
registerEnumType(ResolutionAction, {
  name: 'ResolutionAction',
  description: 'Action to take on a skill suggestion',
});

@InputType()
export class DecisionInput {
  @Field(() => Int)
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  suggestionId: number;

  @Field(() => ResolutionAction)
  @IsEnum(ResolutionAction)
  @IsNotEmpty()
  action: ResolutionAction;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  adjustedProficiency?: string;
}

@InputType()
export class ResolveSuggestionsInput {
  @Field(() => [DecisionInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DecisionInput)
  decisions: DecisionInput[];
}
