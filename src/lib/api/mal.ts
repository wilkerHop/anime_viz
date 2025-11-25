// Mock data for MyAnimeList API

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
    list_status: {
      status: string;
      score: number;
      updated_at: string;
    };
  }[];
};

export async function fetchUserAnimeList(username: string): Promise<UserAnimeList> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log(`Fetching anime list for user: ${username}`);

  // Return mock data
  return {
    data: [
      {
        node: {
          id: 1,
          title: "Cowboy Bebop",
          main_picture: { medium: "https://cdn.myanimelist.net/images/anime/4/19644.jpg", large: "https://cdn.myanimelist.net/images/anime/4/19644l.jpg" },
          genres: [{ id: 1, name: "Action" }, { id: 24, name: "Sci-Fi" }, { id: 29, name: "Space" }]
        },
        list_status: { status: "completed", score: 10, updated_at: new Date().toISOString() }
      },
      {
        node: {
          id: 20,
          title: "Naruto",
          main_picture: { medium: "https://cdn.myanimelist.net/images/anime/13/17405.jpg", large: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg" },
          genres: [{ id: 1, name: "Action" }, { id: 2, name: "Adventure" }, { id: 27, name: "Shounen" }]
        },
        list_status: { status: "completed", score: 8, updated_at: new Date().toISOString() }
      },
      {
        node: {
          id: 9253,
          title: "Steins;Gate",
          main_picture: { medium: "https://cdn.myanimelist.net/images/anime/5/73199.jpg", large: "https://cdn.myanimelist.net/images/anime/5/73199l.jpg" },
          genres: [{ id: 24, name: "Sci-Fi" }, { id: 41, name: "Thriller" }]
        },
        list_status: { status: "completed", score: 9, updated_at: new Date().toISOString() }
      },
       {
        node: {
          id: 16498,
          title: "Shingeki no Kyojin",
          main_picture: { medium: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", large: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg" },
          genres: [{ id: 1, name: "Action" }, { id: 8, name: "Drama" }, { id: 10, name: "Fantasy" }, { id: 27, name: "Shounen" }]
        },
        list_status: { status: "watching", score: 9, updated_at: new Date().toISOString() }
      }
    ]
  };
}

export async function fetchGlobalTopAnime(): Promise<UserAnimeList> {
   // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Reuse the same mock structure for simplicity, but imagine this is top 100
  return fetchUserAnimeList("global_mock");
}
