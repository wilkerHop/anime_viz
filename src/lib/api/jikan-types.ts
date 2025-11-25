/**
 * TypeScript type definitions for Jikan API v4
 * API Documentation: https://docs.api.jikan.moe/
 */

// ==========================================
// CORE ENUMS AND TYPES
// ==========================================

export type RelationType = 'Sequel' | 'Prequel' | 'Side story' | 'Summary' | 'Alternative version' | 'Other';
export type RoleType = 'Main' | 'Supporting';
export type AnimeType = 'TV' | 'Movie' | 'OVA' | 'Special' | 'ONA' | 'Music';
export type AnimeStatus = 'Finished Airing' | 'Currently Airing' | 'Not yet aired';
export type ThemeType = 'Opening' | 'Ending';
export type CompanyType = 'Producer' | 'Licensor' | 'Studio';

// ==========================================
// JIKAN API RESPONSE WRAPPER
// ==========================================

export interface JikanResponse<T> {
  data: T;
}

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

// ==========================================
// COMMON NESTED TYPES
// ==========================================

export interface JikanImage {
  jpg: {
    image_url: string;
    small_image_url?: string;
    large_image_url?: string;
  };
  webp?: {
    image_url?: string;
    small_image_url?: string;
    large_image_url?: string;
  };
}

export interface JikanMeta {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface JikanDateRange {
  from: string | null;
  to: string | null;
  prop: {
    from: {
      day: number | null;
      month: number | null;
      year: number | null;
    };
    to: {
      day: number | null;
      month: number | null;
      year: number | null;
    };
  };
  string: string | null;
}

export interface JikanTitle {
  type: string;
  title: string;
}

// ==========================================
// ANIME FULL ENDPOINT (/anime/{id}/full)
// ==========================================

export interface JikanAnimeRaw {
  mal_id: number;
  url: string;
  images: JikanImage;
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
    images: {
      image_url: string | null;
      small_image_url: string | null;
      medium_image_url: string | null;
      large_image_url: string | null;
      maximum_image_url: string | null;
    };
  };
  approved: boolean;
  titles: JikanTitle[];
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  title_synonyms: string[];
  type: AnimeType | null;
  source: string | null;
  episodes: number | null;
  status: AnimeStatus | null;
  airing: boolean;
  aired: JikanDateRange;
  duration: string | null;
  rating: string | null;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  broadcast: {
    day: string | null;
    time: string | null;
    timezone: string | null;
    string: string | null;
  };
  producers: JikanMeta[];
  licensors: JikanMeta[];
  studios: JikanMeta[];
  genres: JikanMeta[];
  explicit_genres: JikanMeta[];
  themes: JikanMeta[];
  demographics: JikanMeta[];
  relations: {
    relation: string;
    entry: JikanMeta[];
  }[];
  theme: {
    openings: string[];
    endings: string[];
  };
  external: {
    name: string;
    url: string;
  }[];
  streaming: {
    name: string;
    url: string;
  }[];
}

// ==========================================
// CHARACTERS ENDPOINT (/anime/{id}/characters)
// ==========================================

export interface JikanCharacterRaw {
  character: {
    mal_id: number;
    url: string;
    images: JikanImage;
    name: string;
  };
  role: RoleType;
  favorites: number;
  voice_actors: {
    person: {
      mal_id: number;
      url: string;
      images: JikanImage;
      name: string;
    };
    language: string;
  }[];
}

// ==========================================
// STAFF ENDPOINT (/anime/{id}/staff)
// ==========================================

export interface JikanStaffRaw {
  person: {
    mal_id: number;
    url: string;
    images: JikanImage;
    name: string;
  };
  positions: string[];
}

// ==========================================
// DOMAIN MODELS (Mapped from Jikan)
// ==========================================

export interface Genre {
  id: number;
  name: string;
}

export interface Company {
  id: number;
  name: string;
}

export interface Person {
  id: number;
  name: string;
  image: string | null;
}

export interface Character {
  id: number;
  name: string;
  image: string | null;
}

export interface AnimeStats {
  score: number | null;
  scoredBy: number | null;
  ranked: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
}

export interface RelatedEntry {
  relationType: string;
  relatedAnimeId: number;
  relatedAnimeTitle: string;
}

export interface AnimeTheme {
  type: ThemeType;
  text: string;
}

export interface VoiceActorAssignment {
  person: Person;
  language: string;
}

export interface AnimeCharacter {
  character: Character;
  role: RoleType;
  voiceActors: VoiceActorAssignment[];
}

export interface AnimeStaff {
  person: Person;
  role: string;
}

export interface AnimeCompany {
  company: Company;
  type: CompanyType;
}

// ==========================================
// COMPLETE ANIME AGGREGATE
// ==========================================

export interface Anime {
  id: number;
  
  // Titles
  title: string;
  titleEnglish: string | null;
  titleJapanese: string | null;
  
  // Media Details
  type: AnimeType | null;
  status: AnimeStatus | null;
  episodes: number | null;
  duration: string | null;
  rating: string | null;
  source: string | null;
  
  // Dates
  airedString: string | null;
  airedFrom: Date | null;
  airedTo: Date | null;
  season: string | null;
  year: number | null;
  
  // Content
  mainPicture: string | null;
  synopsis: string | null;
  background: string | null;
  
  // Statistics
  stats: AnimeStats;
  
  // Relations (Nested Objects)
  genres: Genre[];
  companies: AnimeCompany[];
  themes: AnimeTheme[];
  relatedEntries: RelatedEntry[];
  
  // Complex Relations
  characters: AnimeCharacter[];
  staff: AnimeStaff[];
}
