import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillInput } from './dto/create-skill.input';
import { UpdateSkillInput } from './dto/update-skill.input';
import { Skill } from './dto/skill.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Resolver()
export class SkillsResolver {
  constructor(private skillsService: SkillsService) {}

  @Mutation(() => Skill)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createSkill(@Args('input') input: CreateSkillInput): Promise<Skill> {
    return this.skillsService.createSkill(input);
  }

  @Mutation(() => Skill)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateSkill(@Args('input') input: UpdateSkillInput): Promise<Skill> {
    return this.skillsService.updateSkill(input);
  }

  @Mutation(() => Skill)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async disableSkill(@Args('id') id: string): Promise<Skill> {
    return this.skillsService.disableSkill(id);
  }

  @Mutation(() => Skill)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async enableSkill(@Args('id') id: string): Promise<Skill> {
    return this.skillsService.enableSkill(id);
  }
}
