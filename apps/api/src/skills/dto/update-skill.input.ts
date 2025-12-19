import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Discipline } from '@prisma/client';

@InputType()
export class UpdateSkillInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

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
