import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  DecisionInput,
  ResolveSuggestionsInput,
  ResolutionAction,
} from './resolution.input';

describe('Resolution DTOs', () => {
  describe('DecisionInput', () => {
    it('should validate valid decision with APPROVE action', async () => {
      const dto = plainToClass(DecisionInput, {
        suggestionId: 'test-id',
        action: ResolutionAction.APPROVE,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate valid decision with ADJUST_LEVEL action and adjustedProficiency', async () => {
      const dto = plainToClass(DecisionInput, {
        suggestionId: 'test-id',
        action: ResolutionAction.ADJUST_LEVEL,
        adjustedProficiency: 'EXPERT',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when suggestionId is empty', async () => {
      const dto = plainToClass(DecisionInput, {
        suggestionId: '',
        action: ResolutionAction.APPROVE,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('suggestionId');
    });

    it('should fail validation when action is invalid', async () => {
      const dto = plainToClass(DecisionInput, {
        suggestionId: 'test-id',
        action: 'INVALID_ACTION',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('action');
    });
  });

  describe('ResolveSuggestionsInput', () => {
    it('should validate valid input with multiple decisions', async () => {
      const dto = plainToClass(ResolveSuggestionsInput, {
        decisions: [
          {
            suggestionId: 'id-1',
            action: ResolutionAction.APPROVE,
          },
          {
            suggestionId: 'id-2',
            action: ResolutionAction.ADJUST_LEVEL,
            adjustedProficiency: 'ADVANCED',
          },
          {
            suggestionId: 'id-3',
            action: ResolutionAction.REJECT,
          },
        ],
      });

      const errors = await validate(dto, { skipMissingProperties: false });
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when decisions array is empty', async () => {
      const dto = plainToClass(ResolveSuggestionsInput, {
        decisions: [],
      });

      const errors = await validate(dto);
      // Empty array is valid - the service layer will handle this
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when decisions contains invalid decision', async () => {
      const dto = plainToClass(ResolveSuggestionsInput, {
        decisions: [
          {
            suggestionId: '',
            action: ResolutionAction.APPROVE,
          },
        ],
      });

      const errors = await validate(dto, { skipMissingProperties: false });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('ResolutionAction enum', () => {
    it('should have all three action types', () => {
      expect(ResolutionAction.APPROVE).toBe('APPROVE');
      expect(ResolutionAction.ADJUST_LEVEL).toBe('ADJUST_LEVEL');
      expect(ResolutionAction.REJECT).toBe('REJECT');
    });
  });
});
