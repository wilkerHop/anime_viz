import { PrismaClient } from '@prisma/client';
import { getAverageScoreByType, getScoreDistribution } from './score-data';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    anime: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Score Data', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('getScoreDistribution', () => {
    it('should return score distribution buckets', async () => {
      const mockData = [
        { score: 7.5 },
        { score: 7.8 },
        { score: 8.2 },
      ];
      prisma.anime.findMany.mockResolvedValue(mockData);

      const result = await getScoreDistribution();
      
      expect(result).toHaveLength(10);
      expect(result[7].count).toBe(2); // 7.5 and 7.8
      expect(result[8].count).toBe(1); // 8.2
      expect(result[0].range).toBe('0-1');
    });
  });

  describe('getAverageScoreByType', () => {
    it('should return average scores by type', async () => {
      const mockData = [
        { type: 'TV', _avg: { score: 7.5 }, _count: { id: 10 } },
        { type: 'Movie', _avg: { score: 8.0 }, _count: { id: 5 } },
      ];
      prisma.anime.groupBy.mockResolvedValue(mockData);

      const result = await getAverageScoreByType();

      expect(result).toEqual([
        { type: 'TV', averageScore: 7.5, count: 10 },
        { type: 'Movie', averageScore: 8.0, count: 5 },
      ]);
    });
  });
});
