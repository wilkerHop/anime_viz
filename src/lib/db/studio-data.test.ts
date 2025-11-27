import { PrismaClient } from '@prisma/client';
import { getStudioCollaborationData, getTopStudios } from './studio-data';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    company: {
      findMany: jest.fn(),
    },
    anime: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Studio Data', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('getTopStudios', () => {
    it('should return top studios by anime count', async () => {
      const mockStudios = [
        { id: 1, name: 'Studio A', _count: { animes: 10 } },
        { id: 2, name: 'Studio B', _count: { animes: 5 } },
      ];
      prisma.company.findMany.mockResolvedValue(mockStudios);

      const result = await getTopStudios(2);

      expect(result).toEqual([
        { id: 1, name: 'Studio A', animeCount: 10 },
        { id: 2, name: 'Studio B', animeCount: 5 },
      ]);
    });
  });

  describe('getStudioCollaborationData', () => {
    it('should format data for pack chart', async () => {
      const mockAnime = [
        {
          title: 'Anime 1',
          companies: [
            { company: { id: 1, name: 'Studio A' } },
            { company: { id: 2, name: 'Studio B' } },
          ]
        }
      ];
      prisma.anime.findMany.mockResolvedValue(mockAnime);

      const result = await getStudioCollaborationData();

      expect(result.nodes).toContainEqual(expect.objectContaining({ name: 'Studio A', animeCount: 1 }));
      expect(result.nodes).toContainEqual(expect.objectContaining({ name: 'Studio B', animeCount: 1 }));
      expect(result.links).toHaveLength(1);
      expect(result.links[0]).toEqual(expect.objectContaining({
        source: '1',
        target: '2',
        value: 1
      }));
    });
  });
});
