import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { SeniorityLevel } from '@prisma/client';
import { GraphQLISODateTime } from '@nestjs/graphql';

// Register SeniorityLevel enum for GraphQL
registerEnumType(SeniorityLevel, {
  name: 'SeniorityLevel',
  description: 'Employee seniority level',
});

@ObjectType()
export class SeniorityHistoryRecord {
  @Field(() => Int)
  id: number;

  @Field()
  profileId: string;

  @Field(() => SeniorityLevel)
  seniorityLevel: SeniorityLevel;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate: Date | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
