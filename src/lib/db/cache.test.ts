import { fetchGlobalTopAnime, fetchUserAnimeList } from '@/lib/api/mal';
import { prisma } from '@/lib/db';
import { getGenreConnections, updateUserData } from './cache';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma)),
    userProfile: {
      upsert: jest.fn().mockResolvedValue({ id: 'user-id' }),
      findUnique: jest.fn(),
    },
    genre: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    anime: {
      upsert: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    genreConnection: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    globalStats: {
      findUnique: jest.fn(),
    }
  },
}));

jest.mock('@/lib/api/mal', () => ({
  fetchUserAnimeList: jest.fn(),
  fetchGlobalTopAnime: jest.fn(),
}));

jest.mock('@/lib/services/jikan-service', () => ({
  fetchAndStoreAnimeDetails: jest.fn().mockResolvedValue(undefined),
}));

describe('Cache Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserData', () => {
    it('should fetch user data and update database', async () => {
      (fetchUserAnimeList as jest.Mock).mockResolvedValue({
        data: [
          {
            node: {
              id: 1,
              title: 'Anime 1',
              genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'Comedy' }],
            },
          },
        ],
      });

      (prisma.anime.findMany as jest.Mock).mockResolvedValue([
        {
          genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'Comedy' }],
        },
      ]);

      await updateUserData('testuser');

      expect(fetchUserAnimeList).toHaveBeenCalledWith('testuser');
      expect(prisma.userProfile.upsert).toHaveBeenCalled();
      expect(prisma.genreConnection.create).toHaveBeenCalled();
    });

    it('should fetch global data if username is global', async () => {
      (fetchGlobalTopAnime as jest.Mock).mockResolvedValue({ data: [] });
      
      await updateUserData('global');
      
      expect(fetchGlobalTopAnime).toHaveBeenCalled();
    });
  });

  describe('getGenreConnections', () => {
    it('should return formatted connections', async () => {
      (prisma.genreConnection.findMany as jest.Mock).mockResolvedValue([
        { genreAId: 1, genreBId: 2, count: 10 },
      ]);
      (prisma.genre.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Action' },
        { id: 2, name: 'Comedy' },
      ]);

      const result = await getGenreConnections('USER:testuser');

      expect(result).toEqual([
        { source: 'Action', target: 'Comedy', value: 10 },
      ]);
    });
  });
});
