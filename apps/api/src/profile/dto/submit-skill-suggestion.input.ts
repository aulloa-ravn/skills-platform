import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsInt, IsEnum } from 'class-validator';
import { ProficiencyLevel } from '@prisma/client';

@InputType()
export class SubmitSkillSuggestionInput {
  @Field(() => Int)
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  skillId: number;

  @Field(() => ProficiencyLevel)
  @IsEnum(ProficiencyLevel)
  @IsNotEmpty()
  proficiencyLevel: ProficiencyLevel;
}
