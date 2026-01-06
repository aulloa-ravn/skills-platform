import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNumber,
  IsInt,
} from 'class-validator';
import { SeniorityLevel } from '@prisma/client';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class UpdateSeniorityHistoryInput {
  @Field(() => Int)
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  id: number;

  @Field(() => SeniorityLevel)
  @IsEnum(SeniorityLevel)
  @IsNotEmpty()
  seniorityLevel: SeniorityLevel;

  @Field(() => GraphQLISODateTime)
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: Date | null;
}
