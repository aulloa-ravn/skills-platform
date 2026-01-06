import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { SeniorityHistoryResolver } from '../seniority-history.resolver';
import { SeniorityHistoryService } from '../seniority-history.service';
import { SeniorityLevel } from '@prisma/client';

describe('SeniorityHistoryResolver', () => {
  let resolver: SeniorityHistoryResolver;
  let service: SeniorityHistoryService;

  const mockSeniorityHistoryService = {
    getSeniorityHistory: jest.fn(),
    createSeniorityHistory: jest.fn(),
    updateSeniorityHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeniorityHistoryResolver,
        {
          provide: SeniorityHistoryService,
          useValue: mockSeniorityHistoryService,
        },
      ],
    }).compile();

    resolver = module.get<SeniorityHistoryResolver>(SeniorityHistoryResolver);
    service = module.get<SeniorityHistoryService>(SeniorityHistoryService);

    jest.clearAllMocks();
  });

  describe('getSeniorityHistory', () => {
    it('should return seniority history records for valid profileId', async () => {
      const profileId = 'test-profile-123';
      const mockRecords = [
        {
          id: 1,
          profileId,
          seniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          startDate: new Date('2025-01-01'),
          endDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          profileId,
          seniorityLevel: SeniorityLevel.MID_ENGINEER,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSeniorityHistoryService.getSeniorityHistory.mockResolvedValue(
        mockRecords,
      );

      const result = await resolver.getSeniorityHistory(profileId);

      expect(result).toEqual(mockRecords);
      expect(service.getSeniorityHistory).toHaveBeenCalledWith(profileId);
    });
  });

  describe('createSeniorityHistory', () => {
    it('should create a new seniority history record', async () => {
      const input = {
        profileId: 'test-profile-123',
        seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
        startDate: new Date('2024-01-01'),
        endDate: null,
      };

      const mockRecord = {
        id: 1,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSeniorityHistoryService.createSeniorityHistory.mockResolvedValue(
        mockRecord,
      );

      const result = await resolver.createSeniorityHistory(input);

      expect(result).toEqual(mockRecord);
      expect(service.createSeniorityHistory).toHaveBeenCalledWith(input);
    });
  });

  describe('updateSeniorityHistory', () => {
    it('should update an existing seniority history record', async () => {
      const input = {
        id: 1,
        seniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
      };

      const mockRecord = {
        ...input,
        profileId: 'test-profile-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSeniorityHistoryService.updateSeniorityHistory.mockResolvedValue(
        mockRecord,
      );

      const result = await resolver.updateSeniorityHistory(input);

      expect(result).toEqual(mockRecord);
      expect(service.updateSeniorityHistory).toHaveBeenCalledWith(input);
    });
  });
});
