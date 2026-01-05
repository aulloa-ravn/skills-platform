import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillInput } from './dto/create-skill.input';
import { UpdateSkillInput } from './dto/update-skill.input';
import { GetAllSkillsInput } from './dto/get-all-skills.input';
import { Skill } from './dto/skill.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProfileType } from '@prisma/client';

@Resolver()
export class SkillsResolver {
  constructor(private skillsService: SkillsService) {}

  @Query(() => [Skill], { name: 'getAllSkills' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ProfileType.ADMIN)
  async getAllSkills(
    @Args('input', { nullable: true }) input?: GetAllSkillsInput,
  ): Promise<Skill[]> {
    return this.skillsService.getAllSkills(input);
  }

  @Query(() => Skill, { name: 'getSkillById' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ProfileType.ADMIN)
  async getSkillById(@Args('id', { type: () => Int }) id: number): Promise<Skill> {
    return this.skillsService.getSkillById(id);
  }

  @Mutation(() => Skill)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ProfileType.ADMIN)
  async createSkill(@Args('input') input: CreateSkillInput): Promise<Skill> {
    return this.skillsService.createSkill(input);
  }

  @Mutation(() => Skill)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ProfileType.ADMIN)
  async updateSkill(@Args('input') input: UpdateSkillInput): Promise<Skill> {
    return this.skillsService.updateSkill(input);
  }

  @Mutation(() => Skill)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ProfileType.ADMIN)
  async toggleSkill(
    @Args('id') id: number,
    @Args('isActive') isActive: boolean,
  ): Promise<Skill> {
    return this.skillsService.toggleSkill(id, isActive);
  }
}
