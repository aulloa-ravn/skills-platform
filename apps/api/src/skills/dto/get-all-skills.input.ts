import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsEnum, IsString } from 'class-validator';
import { Discipline } from '@prisma/client';

@InputType()
export class GetAllSkillsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => [Discipline], { nullable: true })
  @IsOptional()
  @IsEnum(Discipline, { each: true })
  disciplines?: Discipline[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}
