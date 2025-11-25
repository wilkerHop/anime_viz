const MAL_API_BASE = "https://api.myanimelist.net/v2";
const CLIENT_ID = process.env.MAL_CLIENT_ID;

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
      updated_at: string;
    };
  }[];
};

async function fetchMAL(endpoint: string, params: Record<string, string> = {}) {
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

export async function fetchUserAnimeList(username: string): Promise<UserAnimeList> {
  console.log(`Fetching anime list for user: ${username}`);
  
  // Fetch user's anime list (limit 1000 for now, paging could be added later)
  return fetchMAL(`/users/${username}/animelist`, {
    fields: "list_status,genres,main_picture",
    limit: "1000",
    status: "completed" // Focus on completed anime for better connections, or all? Let's get all.
    // Actually, removing status gets all.
  });
}

export async function fetchGlobalTopAnime(): Promise<UserAnimeList> {
  console.log("Fetching global top anime");
  
  return fetchMAL("/anime/ranking", {
    ranking_type: "bypopularity", // Popularity gives better genre connections usually
    limit: "500",
    fields: "genres,main_picture"
  });
}
