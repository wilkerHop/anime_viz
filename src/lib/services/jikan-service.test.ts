import * as JikanClient from '@/lib/api/jikan-client';
import { mapCompleteAnimeData } from '@/lib/api/jikan-mapper';
import { PrismaClient } from '@prisma/client';
import { fetchAndStoreAnimeDetails, getAnimeFromDatabase, getFeaturedAnime } from './jikan-service';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    anime: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    genre: {
      upsert: jest.fn(),
    },
    company: {
      upsert: jest.fn(),
    },
    animeStaff: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    animeCharacter: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    animeCompany: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    animeTheme: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    relatedAnime: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    person: {
      upsert: jest.fn(),
    },
    character: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mPrismaClient)),
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

// Mock Jikan Client
jest.mock('@/lib/api/jikan-client', () => ({
  fetchCompleteAnimeData: jest.fn(),
}));

// Mock Mapper
jest.mock('@/lib/api/jikan-mapper', () => ({
  mapCompleteAnimeData: jest.fn(),
}));

describe('Jikan Service', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('getAnimeFromDatabase', () => {
    it('should return anime details from database', async () => {
      const mockAnime = { id: 1, title: 'Test Anime' };
      prisma.anime.findUnique.mockResolvedValue(mockAnime);

      const result = await getAnimeFromDatabase(1);

      expect(result).toEqual(mockAnime);
      expect(prisma.anime.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });
  });

  describe('getFeaturedAnime', () => {
    it('should return top popular anime', async () => {
      const mockAnimeList = [{ id: 1, title: 'Popular Anime' }];
      prisma.anime.findMany.mockResolvedValue(mockAnimeList);

      const result = await getFeaturedAnime(5);

      expect(result).toEqual(mockAnimeList);
      expect(prisma.anime.findMany).toHaveBeenCalledWith({
        orderBy: { popularity: 'asc' },
        take: 5,
        where: { 
            popularity: { 
                not: null,
                gt: 0
            } 
        },
        include: { genres: true }
      });
    });
  });

  describe('fetchAndStoreAnimeDetails', () => {
    it('should fetch from API and store in database', async () => {
      const mockRawData = { anime: { mal_id: 1 }, characters: [], staff: [] };
      const mockMappedAnime = { 
        id: 1, 
        title: 'Test', 
        genres: [], 
        companies: [], 
        themes: [], 
        characters: [], 
        staff: [], 
        relatedEntries: [],
        stats: {
            score: 8.5,
            scoredBy: 1000,
            ranked: 10,
            popularity: 5,
            members: 5000,
            favorites: 100
        }
      };

      (JikanClient.fetchCompleteAnimeData as jest.Mock).mockResolvedValue(mockRawData);
      (mapCompleteAnimeData as jest.Mock).mockReturnValue(mockMappedAnime);

      await fetchAndStoreAnimeDetails(1);

      expect(JikanClient.fetchCompleteAnimeData).toHaveBeenCalledWith(1);
      expect(prisma.anime.upsert).toHaveBeenCalled();
    });
  });
});
