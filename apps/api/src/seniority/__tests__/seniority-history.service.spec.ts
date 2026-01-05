import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SeniorityHistoryService } from '../seniority-history.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SeniorityLevel } from '@prisma/client';

describe('SeniorityHistoryService', () => {
  let service: SeniorityHistoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    seniorityHistory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeniorityHistoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SeniorityHistoryService>(SeniorityHistoryService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getSeniorityHistory', () => {
    it('should return seniority history ordered by startDate descending', async () => {
      const profileId = 'test-profile-123';
      const mockRecords = [
        {
          id: 2,
          profileId,
          seniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          startDate: new Date('2025-01-01'),
          endDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 1,
          profileId,
          seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.seniorityHistory.findMany.mockResolvedValue(
        mockRecords,
      );

      const result = await service.getSeniorityHistory(profileId);

      expect(result).toEqual(mockRecords);
      expect(prisma.seniorityHistory.findMany).toHaveBeenCalledWith({
        where: { profileId },
        orderBy: { startDate: 'desc' },
      });
    });
  });

  describe('createSeniorityHistory', () => {
    it('should throw BadRequestException when endDate is before startDate', async () => {
      const input = {
        profileId: 'test-profile-123',
        seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-01-01'), // Before startDate
      };

      await expect(service.createSeniorityHistory(input)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      const input = {
        profileId: 'non-existent-profile',
        seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
        startDate: new Date('2024-01-01'),
        endDate: null,
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.createSeniorityHistory(input)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create record and sync profile when endDate is null', async () => {
      const input = {
        profileId: 'test-profile-123',
        seniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
        startDate: new Date('2025-01-01'),
        endDate: null,
      };

      const mockProfile = {
        id: input.profileId,
        currentSeniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
      };

      const mockRecord = {
        id: 1,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          seniorityHistory: {
            create: jest.fn().mockResolvedValue(mockRecord),
          },
          profile: {
            update: jest.fn().mockResolvedValue({
              ...mockProfile,
              currentSeniorityLevel: input.seniorityLevel,
            }),
          },
        };
        return callback(tx);
      });

      const result = await service.createSeniorityHistory(input);

      expect(result).toEqual(mockRecord);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should create record without syncing when endDate is provided', async () => {
      const input = {
        profileId: 'test-profile-123',
        seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      const mockProfile = {
        id: input.profileId,
        currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
      };

      const mockRecord = {
        id: 1,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.seniorityHistory.create.mockResolvedValue(mockRecord);

      const result = await service.createSeniorityHistory(input);

      expect(result).toEqual(mockRecord);
      expect(prisma.seniorityHistory.create).toHaveBeenCalledWith({
        data: {
          profileId: input.profileId,
          seniorityLevel: input.seniorityLevel,
          startDate: input.startDate,
          endDate: input.endDate,
        },
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('updateSeniorityHistory', () => {
    it('should throw BadRequestException when endDate is before startDate', async () => {
      const input = {
        id: 1,
        seniorityLevel: SeniorityLevel.MID_ENGINEER,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-01-01'), // Before startDate
      };

      await expect(service.updateSeniorityHistory(input)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when record does not exist', async () => {
      const input = {
        id: 999,
        seniorityLevel: SeniorityLevel.MID_ENGINEER,
        startDate: new Date('2024-01-01'),
        endDate: null,
      };

      mockPrismaService.seniorityHistory.findUnique.mockResolvedValue(null);

      await expect(service.updateSeniorityHistory(input)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update record and sync profile when endDate is null', async () => {
      const input = {
        id: 1,
        seniorityLevel: SeniorityLevel.STAFF_ENGINEER,
        startDate: new Date('2025-01-01'),
        endDate: null,
      };

      const existingRecord = {
        id: 1,
        profileId: 'test-profile-123',
        seniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
        startDate: new Date('2024-01-01'),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedRecord = {
        ...existingRecord,
        ...input,
        updatedAt: new Date(),
      };

      mockPrismaService.seniorityHistory.findUnique.mockResolvedValue(
        existingRecord,
      );
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          seniorityHistory: {
            update: jest.fn().mockResolvedValue(updatedRecord),
          },
          profile: {
            update: jest.fn().mockResolvedValue({
              id: existingRecord.profileId,
              currentSeniorityLevel: input.seniorityLevel,
            }),
          },
        };
        return callback(tx);
      });

      const result = await service.updateSeniorityHistory(input);

      expect(result).toEqual(updatedRecord);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should update record without syncing when endDate is provided', async () => {
      const input = {
        id: 1,
        seniorityLevel: SeniorityLevel.MID_ENGINEER,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      const existingRecord = {
        id: 1,
        profileId: 'test-profile-123',
        seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
        startDate: new Date('2024-01-01'),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedRecord = {
        ...existingRecord,
        ...input,
        updatedAt: new Date(),
      };

      mockPrismaService.seniorityHistory.findUnique.mockResolvedValue(
        existingRecord,
      );
      mockPrismaService.seniorityHistory.update.mockResolvedValue(
        updatedRecord,
      );

      const result = await service.updateSeniorityHistory(input);

      expect(result).toEqual(updatedRecord);
      expect(prisma.seniorityHistory.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: {
          seniorityLevel: input.seniorityLevel,
          startDate: input.startDate,
          endDate: input.endDate,
        },
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
