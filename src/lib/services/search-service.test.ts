import { PrismaClient } from '@prisma/client';
import { searchAnime } from './search-service';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    anime: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    genre: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Search Service', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('searchAnime', () => {
    it('should return search results with pagination', async () => {
      const mockData = [{ id: 1, title: 'Test Anime' }];
      const mockCount = 1;

      prisma.anime.findMany.mockResolvedValue(mockData);
      prisma.anime.count.mockResolvedValue(mockCount);

      const result = await searchAnime({ query: 'Test' });

      expect(result.data).toEqual(mockData);
      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 24,
        totalPages: 1,
      });
      expect(prisma.anime.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { titleEnglish: { contains: 'Test' } },
          ]),
        }),
      }));
    });

    it('should apply filters correctly', async () => {
      prisma.anime.findMany.mockResolvedValue([]);
      prisma.anime.count.mockResolvedValue(0);

      await searchAnime({
        genres: ['Action'],
        year: 2023,
        season: 'Winter',
        type: 'TV',
        minScore: 8.0,
      });

      expect(prisma.anime.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          genres: { some: { name: { in: ['Action'] } } },
          year: 2023,
          season: 'Winter',
          type: 'TV',
          score: { gte: 8.0 },
        }),
      }));
    });

    it('should handle sorting', async () => {
      prisma.anime.findMany.mockResolvedValue([]);
      prisma.anime.count.mockResolvedValue(0);

      await searchAnime({ sortBy: 'score', sortOrder: 'desc' });

      expect(prisma.anime.findMany).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: { score: 'desc' },
      }));
    });
  });
});
