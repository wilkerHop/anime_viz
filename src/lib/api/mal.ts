/**
 * MyAnimeList API v2 Client
 * 
 * PURPOSE: This client is used ONLY for fetching anime IDs from:
 * - User anime lists (Jikan doesn't support user-specific data)
 * - Top anime rankings (to know which anime to enrich with Jikan)
 * 
 * IMPORTANT: This does NOT fetch detailed anime data anymore.
 * All detailed data (characters, staff, themes, etc.) comes from Jikan API.
 * 
 * WORKFLOW:
 * 1. Fetch anime IDs from MAL (user lists or rankings)
 * 2. Enrich each anime with full Jikan data
 * 3. Store in database with all relationships
 * 
 * REQUIREMENTS:
 * - MAL_CLIENT_ID environment variable must be set
 * - Get one from: https://myanimelist.net/apiconfig
 */

const MAL_API_BASE = process.env.MAL_API_BASE || "https://api.myanimelist.net/v2";

export type AnimeNode = {
  id: number;
  title: string;
  main_picture: {
    medium: string;
    large: string;
  } | null;
  genres: { id: number; name: string }[];
};

export type UserAnimeList = {
  data: {
    node: AnimeNode;
    list_status?: {
      status: string;
      score: number;
      num_episodes_watched: number;
      is_rewatching: boolean;
      updated_at: string;
    };
  }[];
  paging?: {
    next?: string;
  };
};

async function fetchMAL(endpoint: string, params: Record<string, string> = {}) {
  const CLIENT_ID = process.env.MAL_CLIENT_ID;
  if (!CLIENT_ID) {
    throw new Error("MAL_CLIENT_ID is not set in environment variables");
  }

  const url = new URL(`${MAL_API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const response = await fetch(url.toString(), {
    headers: {
      "X-MAL-CLIENT-ID": CLIENT_ID,
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Resource not found");
    }
    throw new Error(`MAL API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a user's anime list
 * Returns anime IDs that will be enriched with Jikan data
 */
export async function fetchUserAnimeList(username: string): Promise<UserAnimeList> {
  console.log(`[MAL] Fetching anime list for user: ${username}`);
  
  return fetchMAL(`/users/${username}/animelist`, {
    fields: "list_status,genres,main_picture",
    limit: "1000",
    // Note: Not filtering by status to get all anime
  });
}

/**
 * Fetch top anime from MAL rankings
 * Returns anime IDs that will be enriched with Jikan data
 */
export async function fetchGlobalTopAnime(): Promise<UserAnimeList> {
  console.log("[MAL] Fetching global top anime");
  
  return fetchMAL("/anime/ranking", {
    ranking_type: "bypopularity",
    limit: "500",
    fields: "genres,main_picture"
  });
}
