import * as JikanClient from './jikan-client';

// Mock fetch
global.fetch = jest.fn();

describe('JikanClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    JikanClient.clearQueue();
  });

  it('should fetch anime full by id', async () => {
    const mockResponse = { data: { mal_id: 1, title: 'Test Anime' } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await JikanClient.fetchAnimeFullById(1);

    expect(result).toEqual(mockResponse.data);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/anime/1/full'));
  });

  it('should fetch complete anime data', async () => {
    const mockAnime = { data: { mal_id: 1 } };
    const mockChars = { data: [] };
    const mockStaff = { data: [] };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockAnime })
      .mockResolvedValueOnce({ ok: true, json: async () => mockChars })
      .mockResolvedValueOnce({ ok: true, json: async () => mockStaff });

    const result = await JikanClient.fetchCompleteAnimeData(1);

    expect(result.anime).toEqual(mockAnime.data);
    expect(result.characters).toEqual(mockChars.data);
    expect(result.staff).toEqual(mockStaff.data);
  });
});
