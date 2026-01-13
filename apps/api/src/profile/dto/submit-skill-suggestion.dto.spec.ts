import { validate } from 'class-validator';
import { SubmitSkillSuggestionInput } from './submit-skill-suggestion.input';
import { SubmittedSuggestionResponse } from './submitted-suggestion.response';
import { ProficiencyLevel, SuggestionStatus } from '@prisma/client';

describe('SubmitSkillSuggestion DTOs', () => {
  describe('SubmitSkillSuggestionInput', () => {
    it('should pass validation with valid inputs', async () => {
      const input = new SubmitSkillSuggestionInput();
      input.skillId = 1;
      input.proficiencyLevel = ProficiencyLevel.INTERMEDIATE;

      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when skillId is not a number', async () => {
      const input = new SubmitSkillSuggestionInput();
      input.skillId = 'invalid' as any;
      input.proficiencyLevel = ProficiencyLevel.INTERMEDIATE;

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('skillId');
    });

    it('should fail validation when skillId is missing', async () => {
      const input = new SubmitSkillSuggestionInput();
      input.proficiencyLevel = ProficiencyLevel.INTERMEDIATE;

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('skillId');
    });

    it('should fail validation when proficiencyLevel is invalid', async () => {
      const input = new SubmitSkillSuggestionInput();
      input.skillId = 1;
      input.proficiencyLevel = 'INVALID_LEVEL' as any;

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('proficiencyLevel');
    });

    it('should fail validation when proficiencyLevel is missing', async () => {
      const input = new SubmitSkillSuggestionInput();
      input.skillId = 1;

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('proficiencyLevel');
    });
  });

  describe('SubmittedSuggestionResponse', () => {
    it('should have correct structure with all required fields', () => {
      const response = new SubmittedSuggestionResponse();
      response.suggestionId = 1;
      response.status = SuggestionStatus.PENDING;
      response.suggestedProficiency = ProficiencyLevel.INTERMEDIATE;
      response.createdAt = new Date();
      response.skill = {
        id: 1,
        name: 'JavaScript',
        discipline: 'FRONTEND',
      };

      expect(response.suggestionId).toBe(1);
      expect(response.status).toBe(SuggestionStatus.PENDING);
      expect(response.suggestedProficiency).toBe(ProficiencyLevel.INTERMEDIATE);
      expect(response.createdAt).toBeInstanceOf(Date);
      expect(response.skill).toEqual({
        id: 1,
        name: 'JavaScript',
        discipline: 'FRONTEND',
      });
    });

    it('should have nested skill object with correct fields', () => {
      const response = new SubmittedSuggestionResponse();
      response.skill = {
        id: 5,
        name: 'React',
        discipline: 'FRONTEND',
      };

      expect(response.skill.id).toBe(5);
      expect(response.skill.name).toBe('React');
      expect(response.skill.discipline).toBe('FRONTEND');
    });
  });
});
