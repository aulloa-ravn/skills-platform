import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsInt,
} from 'class-validator';
import { Discipline } from '@prisma/client';

@InputType()
export class UpdateSkillInput {
  @Field(() => Int)
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Field(() => Discipline, { nullable: true })
  @IsOptional()
  @IsEnum(Discipline)
  discipline?: Discipline;
}
