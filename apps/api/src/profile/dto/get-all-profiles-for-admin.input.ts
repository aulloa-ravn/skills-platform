import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  IsArray,
} from 'class-validator';
import { SeniorityLevel } from '@prisma/client';

// Register YearsInCompanyRange enum for GraphQL
export enum YearsInCompanyRange {
  LESS_THAN_1 = 'LESS_THAN_1',
  ONE_TO_TWO = 'ONE_TO_TWO',
  TWO_TO_THREE = 'TWO_TO_THREE',
  THREE_TO_FIVE = 'THREE_TO_FIVE',
  FIVE_PLUS = 'FIVE_PLUS',
}

registerEnumType(YearsInCompanyRange, {
  name: 'YearsInCompanyRange',
  description: 'Years in company range categories',
});

// Register ProfileSortField enum for GraphQL
export enum ProfileSortField {
  NAME = 'NAME',
  EMAIL = 'EMAIL',
  SENIORITY = 'SENIORITY',
  JOIN_DATE = 'JOIN_DATE',
}

registerEnumType(ProfileSortField, {
  name: 'ProfileSortField',
  description: 'Fields available for sorting profiles',
});

// Register SortDirection enum for GraphQL
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Sort direction',
});

@InputType()
export class GetAllProfilesForAdminInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @Field(() => [SeniorityLevel], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(SeniorityLevel, { each: true })
  seniorityLevels?: SeniorityLevel[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  skillIds?: string[];

  @Field(() => [YearsInCompanyRange], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(YearsInCompanyRange, { each: true })
  yearsInCompanyRanges?: YearsInCompanyRange[];

  @Field(() => ProfileSortField, { nullable: true })
  @IsOptional()
  @IsEnum(ProfileSortField)
  sortBy?: ProfileSortField;

  @Field(() => SortDirection, { nullable: true })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;
}
