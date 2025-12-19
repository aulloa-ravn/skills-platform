import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Discipline } from '@prisma/client';
import { GraphQLISODateTime } from '@nestjs/graphql';

// Register Discipline enum for GraphQL
registerEnumType(Discipline, {
  name: 'Discipline',
  description: 'Skill discipline category',
});

@ObjectType()
export class Skill {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => Discipline)
  discipline: Discipline;

  @Field()
  isActive: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
