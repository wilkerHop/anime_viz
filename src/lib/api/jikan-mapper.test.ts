import { mapCharacters, mapStaff, mapToAnime } from './jikan-mapper';
import { JikanAnimeRaw, JikanCharacterRaw, JikanStaffRaw } from './jikan-types';

describe('Jikan Mapper', () => {
  describe('mapToAnime', () => {
    it('should map API response to Anime domain model', () => {
      const apiAnime = {
        mal_id: 1,
        title: 'Test Anime',
        title_english: 'Test Anime English',
        title_japanese: 'Test Anime Japanese',
        images: { jpg: { large_image_url: 'http://test.com/image.jpg' } },
        synopsis: 'Test synopsis',
        type: 'TV',
        episodes: 12,
        status: 'Finished Airing',
        aired: { from: '2023-01-01', to: '2023-03-31', string: 'Winter 2023' },
        duration: '24 min',
        rating: 'PG-13',
        score: 8.5,
        scored_by: 1000,
        rank: 10,
        popularity: 5,
        members: 5000,
        favorites: 100,
        season: 'winter',
        year: 2023,
        studios: [],
        genres: [],
      } as unknown as JikanAnimeRaw;

      const result = mapToAnime(apiAnime, [], []);

      expect(result).toMatchObject({
        id: 1,
        title: 'Test Anime',
        titleEnglish: 'Test Anime English',
        titleJapanese: 'Test Anime Japanese',
        mainPicture: 'http://test.com/image.jpg',
        synopsis: 'Test synopsis',
        type: 'TV',
        episodes: 12,
        status: 'Finished Airing',
        airedString: 'Winter 2023',
        duration: '24 min',
        rating: 'PG-13',
        stats: {
            score: 8.5,
            scoredBy: 1000,
            ranked: 10,
            popularity: 5,
            members: 5000,
            favorites: 100,
        },
        season: 'winter',
        year: 2023,
      });
    });
  });

  describe('mapCharacters', () => {
    it('should map API characters to AnimeCharacter array', () => {
      const apiChar = {
        character: {
            mal_id: 100,
            name: 'Test Character',
            images: { jpg: { image_url: 'http://test.com/char.jpg' } },
            url: 'url'
        },
        role: 'Main',
        favorites: 50,
        voice_actors: []
      } as unknown as JikanCharacterRaw;

      const result = mapCharacters([apiChar]);

      expect(result[0]).toMatchObject({
        character: {
            id: 100,
            name: 'Test Character',
            image: 'http://test.com/char.jpg',
        },
        role: 'Main',
      });
    });
  });

  describe('mapStaff', () => {
    it('should map API staff to AnimeStaff array', () => {
      const apiPerson = {
        person: {
            mal_id: 200,
            name: 'Test Person',
            images: { jpg: { image_url: 'http://test.com/person.jpg' } },
            url: 'url'
        },
        positions: ['Director']
      } as unknown as JikanStaffRaw;

      const result = mapStaff([apiPerson]);

      expect(result[0]).toMatchObject({
        person: {
            id: 200,
            name: 'Test Person',
            image: 'http://test.com/person.jpg',
        },
        role: 'Director',
      });
    });
  });
});
