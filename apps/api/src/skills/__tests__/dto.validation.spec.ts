import { validate } from 'class-validator';
import { CreateSkillInput } from '../dto/create-skill.input';
import { UpdateSkillInput } from '../dto/update-skill.input';
import { Discipline } from '@prisma/client';

describe('DTO Validation', () => {
  describe('CreateSkillInput', () => {
    it('should validate a valid CreateSkillInput', async () => {
      const input = new CreateSkillInput();
      input.name = 'React';
      input.discipline = Discipline.FRONTEND;

      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should fail when name is empty', async () => {
      const input = new CreateSkillInput();
      input.name = '';
      input.discipline = Discipline.FRONTEND;

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail when discipline is invalid', async () => {
      const input = new CreateSkillInput();
      input.name = 'React';
      (input as any).discipline = 'INVALID_DISCIPLINE';

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('discipline');
    });

    it('should fail when required fields are missing', async () => {
      const input = new CreateSkillInput();

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateSkillInput', () => {
    it('should validate a valid UpdateSkillInput with name', async () => {
      const input = new UpdateSkillInput();
      input.id = 'test-id';
      input.name = 'React';

      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should validate a valid UpdateSkillInput with discipline', async () => {
      const input = new UpdateSkillInput();
      input.id = 'test-id';
      input.discipline = Discipline.BACKEND;

      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should validate a valid UpdateSkillInput with both fields', async () => {
      const input = new UpdateSkillInput();
      input.id = 'test-id';
      input.name = 'Node.js';
      input.discipline = Discipline.BACKEND;

      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should fail when id is missing', async () => {
      const input = new UpdateSkillInput();
      input.name = 'React';

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
    });
  });
});
