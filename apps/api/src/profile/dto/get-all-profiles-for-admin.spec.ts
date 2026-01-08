import { validate } from 'class-validator';
import {
  GetAllProfilesForAdminInput,
  YearsInCompanyRange,
  ProfileSortField,
  SortDirection,
} from './get-all-profiles-for-admin.input';
import { SeniorityLevel } from '@prisma/client';

describe('GetAllProfilesForAdminInput', () => {
  it('should validate successfully with valid pagination values', async () => {
    const input = new GetAllProfilesForAdminInput();
    input.page = 1;
    input.pageSize = 25;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when page is less than 1', async () => {
    const input = new GetAllProfilesForAdminInput();
    input.page = 0;

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('should fail validation when pageSize exceeds 100', async () => {
    const input = new GetAllProfilesForAdminInput();
    input.pageSize = 101;

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('pageSize');
  });

  it('should validate YearsInCompanyRange enum values', async () => {
    const input = new GetAllProfilesForAdminInput();
    input.yearsInCompanyRanges = [
      YearsInCompanyRange.LESS_THAN_1,
      YearsInCompanyRange.ONE_TO_TWO,
      YearsInCompanyRange.FIVE_PLUS,
    ];

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should validate ProfileSortField enum values', async () => {
    const input = new GetAllProfilesForAdminInput();
    input.sortBy = ProfileSortField.NAME;
    input.sortDirection = SortDirection.ASC;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should validate seniorityLevels array with valid SeniorityLevel enum', async () => {
    const input = new GetAllProfilesForAdminInput();
    input.seniorityLevels = [
      SeniorityLevel.JUNIOR_ENGINEER,
      SeniorityLevel.SENIOR_ENGINEER,
    ];

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should allow optional fields to be undefined', async () => {
    const input = new GetAllProfilesForAdminInput();
    // All fields are optional except defaults

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });
});
