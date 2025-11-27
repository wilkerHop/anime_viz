import { PrismaClient } from '@prisma/client';
import { getSeasonalTrends, getSeasonalTrendsByType } from './seasonal-data';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    anime: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Seasonal Data', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('getSeasonalTrends', () => {
    it('should return seasonal trends data', async () => {
      const mockData = [
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
        { season: 'Spring', year: 2023, type: 'TV' },
      ];
      prisma.anime.findMany.mockResolvedValue(mockData);

      const result = await getSeasonalTrends();

      expect(result).toEqual([
        { label: 'Winter 2023', count: 10, year: 2023, season: 'Winter' },
        { label: 'Spring 2023', count: 15, year: 2023, season: 'Spring' },
      ]);
    });
  });

  describe('getSeasonalTrendsByType', () => {
    it('should return seasonal trends filtered by type', async () => {
      const mockData = [
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
        { season: 'Winter', year: 2023, type: 'TV' },
      ];
      prisma.anime.findMany.mockResolvedValue(mockData);

      const result = await getSeasonalTrendsByType();

      expect(result).toEqual([
        { label: 'Winter 2023', count: 5, year: 2023, season: 'Winter', type: 'TV' },
      ]);
      expect(prisma.anime.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ type: { not: null } }),
      }));
    });
  });
});
