/**
 * Data mapping utilities for transforming Jikan API responses to domain models
 */

import type {
    Anime,
    AnimeCharacter,
    AnimeCompany,
    AnimeStaff,
    AnimeStats,
    AnimeTheme,
    Character,
    Company,
    Genre,
    JikanAnimeRaw,
    JikanCharacterRaw,
    JikanStaffRaw,
    Person,
    RelatedEntry,
    VoiceActorAssignment,
} from './jikan-types';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Safely extract image URL from Jikan image object
 */
function extractImageUrl(images?: { jpg?: { image_url?: string; large_image_url?: string } }): string | null {
  if (!images?.jpg) return null;
  return images.jpg.large_image_url || images.jpg.image_url || null;
}

/**
 * Safely parse date string to Date object
 */
function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

// ==========================================
// MAPPING FUNCTIONS
// ==========================================

/**
 * Map Jikan anime statistics to AnimeStats model
 */
export function mapAnimeStats(raw: JikanAnimeRaw): AnimeStats {
  return {
    score: raw.score,
    scoredBy: raw.scored_by,
    ranked: raw.rank,
    popularity: raw.popularity,
    members: raw.members,
    favorites: raw.favorites,
  };
}

/**
 * Map Jikan genres to Genre array
 */
export function mapGenres(raw: JikanAnimeRaw): Genre[] {
  const allGenres = [
    ...(raw.genres || []),
    ...(raw.explicit_genres || []),
    ...(raw.themes || []),
    ...(raw.demographics || []),
  ];
  
  return allGenres.map(g => ({
    id: g.mal_id,
    name: g.name,
  }));
}

/**
 * Map Jikan companies (producers, licensors, studios) to AnimeCompany array
 */
export function mapCompanies(raw: JikanAnimeRaw): AnimeCompany[] {
  const companies: AnimeCompany[] = [];
  
  // Map producers
  if (raw.producers) {
    companies.push(...raw.producers.map(p => ({
      company: { id: p.mal_id, name: p.name } as Company,
      type: 'Producer' as const,
    })));
  }
  
  // Map licensors
  if (raw.licensors) {
    companies.push(...raw.licensors.map(p => ({
      company: { id: p.mal_id, name: p.name } as Company,
      type: 'Licensor' as const,
    })));
  }
  
  // Map studios
  if (raw.studios) {
    companies.push(...raw.studios.map(p => ({
      company: { id: p.mal_id, name: p.name } as Company,
      type: 'Studio' as const,
    })));
  }
  
  return companies;
}

/**
 * Map Jikan themes (openings/endings) to AnimeTheme array
 */
export function mapThemes(raw: JikanAnimeRaw): AnimeTheme[] {
  const themes: AnimeTheme[] = [];
  
  if (raw.theme?.openings) {
    themes.push(...raw.theme.openings.map(t => ({
      type: 'Opening' as const,
      text: t,
    })));
  }
  
  if (raw.theme?.endings) {
    themes.push(...raw.theme.endings.map(t => ({
      type: 'Ending' as const,
      text: t,
    })));
  }
  
  return themes;
}

/**
 * Map Jikan relations to RelatedEntry array
 */
export function mapRelatedEntries(raw: JikanAnimeRaw): RelatedEntry[] {
  if (!raw.relations) return [];
  
  return raw.relations.flatMap(rel =>
    rel.entry
      .filter(e => e.type === 'anime') // Only include anime relations
      .map(entry => ({
        relationType: rel.relation,
        relatedAnimeId: entry.mal_id,
        relatedAnimeTitle: entry.name,
      }))
  );
}

/**
 * Map Jikan character data to AnimeCharacter array
 */
export function mapCharacters(rawChars: JikanCharacterRaw[]): AnimeCharacter[] {
  return rawChars.map(c => {
    const character: Character = {
      id: c.character.mal_id,
      name: c.character.name,
      image: extractImageUrl(c.character.images),
    };
    
    const voiceActors: VoiceActorAssignment[] = c.voice_actors.map(va => ({
      language: va.language,
      person: {
        id: va.person.mal_id,
        name: va.person.name,
        image: extractImageUrl(va.person.images),
      } as Person,
    }));
    
    return {
      character,
      role: c.role,
      voiceActors,
    };
  });
}

/**
 * Map Jikan staff data to AnimeStaff array
 * Flattens positions: one person with multiple roles creates multiple entries
 */
export function mapStaff(rawStaff: JikanStaffRaw[]): AnimeStaff[] {
  return rawStaff.flatMap(s =>
    s.positions.map(role => ({
      role,
      person: {
        id: s.person.mal_id,
        name: s.person.name,
        image: extractImageUrl(s.person.images),
      } as Person,
    }))
  );
}

/**
 * Map complete Jikan anime data to Anime domain model
 */
export function mapToAnime(
  rawAnime: JikanAnimeRaw,
  rawCharacters: JikanCharacterRaw[],
  rawStaff: JikanStaffRaw[],
): Anime {
  return {
    id: rawAnime.mal_id,
    
    // Titles
    title: rawAnime.title,
    titleEnglish: rawAnime.title_english,
    titleJapanese: rawAnime.title_japanese,
    
    // Media Details
    type: rawAnime.type,
    status: rawAnime.status,
    episodes: rawAnime.episodes,
    duration: rawAnime.duration,
    rating: rawAnime.rating,
    source: rawAnime.source,
    
    // Dates
    airedString: rawAnime.aired?.string || null,
    airedFrom: parseDate(rawAnime.aired?.from),
    airedTo: parseDate(rawAnime.aired?.to),
    season: rawAnime.season,
    year: rawAnime.year,
    
    // Content
    mainPicture: extractImageUrl(rawAnime.images),
    synopsis: rawAnime.synopsis,
    background: rawAnime.background,
    
    // Statistics
    stats: mapAnimeStats(rawAnime),
    
    // Relations
    genres: mapGenres(rawAnime),
    companies: mapCompanies(rawAnime),
    themes: mapThemes(rawAnime),
    relatedEntries: mapRelatedEntries(rawAnime),
    
    // Complex Relations
    characters: mapCharacters(rawCharacters),
    staff: mapStaff(rawStaff),
  };
}

/**
 * Main convenience function to map all raw data at once
 */
export function mapCompleteAnimeData(data: {
  anime: JikanAnimeRaw;
  characters: JikanCharacterRaw[];
  staff: JikanStaffRaw[];
}): Anime {
  return mapToAnime(data.anime, data.characters, data.staff);
}
