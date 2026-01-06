import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Discipline } from '@prisma/client';

@InputType()
export class CreateSkillInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Discipline)
  @IsEnum(Discipline)
  @IsNotEmpty()
  discipline: Discipline;
}
