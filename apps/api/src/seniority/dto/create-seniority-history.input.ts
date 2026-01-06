import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { SeniorityLevel } from '@prisma/client';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class CreateSeniorityHistoryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  profileId: string;

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
