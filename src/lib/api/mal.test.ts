import { fetchGlobalTopAnime, fetchUserAnimeList } from './mal';

// Mock global fetch
global.fetch = jest.fn();

describe('MAL API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.MAL_CLIENT_ID = 'test-client-id';
    
    // Default mock implementation
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('fetchUserAnimeList should call correct URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await fetchUserAnimeList('testuser');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.myanimelist.net/v2/users/testuser/animelist'),
      expect.objectContaining({
        headers: { 'X-MAL-CLIENT-ID': 'test-client-id' },
      })
    );
  });

  it('fetchGlobalTopAnime should call correct URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await fetchGlobalTopAnime();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.myanimelist.net/v2/anime/ranking'),
      expect.objectContaining({
        headers: { 'X-MAL-CLIENT-ID': 'test-client-id' },
      })
    );
  });

  it('should throw error if MAL_CLIENT_ID is missing', async () => {
    process.env.MAL_CLIENT_ID = ''; // Set to empty string to simulate missing
    
    await expect(fetchUserAnimeList('testuser')).rejects.toThrow('MAL_CLIENT_ID is not set');
  });
});
