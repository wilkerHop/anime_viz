import { fetchGlobalTopAnime, fetchUserAnimeList, UserAnimeList } from '@/lib/api/mal';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function updateUserData(username: string) {
  let data: UserAnimeList;
  if (username === 'global_mock' || username === 'global') {
    data = await fetchGlobalTopAnime();
  } else {
    data = await fetchUserAnimeList(username);
  }
  
  // Transaction to update DB
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Upsert User
    const user = await tx.userProfile.upsert({
      where: { username },
      update: { lastUpdated: new Date() },
      create: { username, lastUpdated: new Date() }
    });

    // Process Anime and Genres
    for (const item of data.data) {
      const { node } = item;
      
      // Upsert Genres
      for (const genre of node.genres) {
        await tx.genre.upsert({
          where: { id: genre.id },
          update: { name: genre.name },
          create: { id: genre.id, name: genre.name }
        });
      }

      // Upsert Anime
      await tx.anime.upsert({
        where: { id: node.id },
        update: { 
          title: node.title, 
          mainPicture: node.main_picture?.medium,
          genres: {
            connect: node.genres.map((g) => ({ id: g.id }))
          },
          users: {
            connect: { id: user.id }
          }
        },
        create: {
          id: node.id,
          title: node.title,
          mainPicture: node.main_picture?.medium,
          genres: {
            connect: node.genres.map((g) => ({ id: g.id }))
          },
          users: {
            connect: { id: user.id }
          }
        }
      });
    }

    // Calculate Genre Connections for this user
    // 1. Get all anime for this user with their genres
    const userAnime = await tx.anime.findMany({
      where: { users: { some: { id: user.id } } },
      include: { genres: true }
    });

    // 2. Count pairs
    const connections: Record<string, number> = {};
    
    for (const anime of userAnime) {
      const genres = anime.genres.sort((a, b) => a.id - b.id);
      for (let i = 0; i < genres.length; i++) {
        for (let j = i + 1; j < genres.length; j++) {
          const key = `${genres[i].id}-${genres[j].id}`;
          connections[key] = (connections[key] || 0) + 1;
        }
      }
    }

    // 3. Save Connections
    // Clear old connections for this user context? 
    // For simplicity, we'll just upsert/overwrite. In a real app, we might want to clear old ones first if they no longer exist.
    // But since we are adding up, let's delete all user context connections first to be safe.
    await tx.genreConnection.deleteMany({
      where: { context: `USER:${username}` }
    });

    for (const [key, count] of Object.entries(connections)) {
      const [g1, g2] = key.split('-').map(Number);
      await tx.genreConnection.create({
        data: {
          genreAId: g1,
          genreBId: g2,
          count,
          context: `USER:${username}`
        }
      });
    }
  });

  return { success: true };
}

export async function getGenreConnections(context: string) {
  const connections = await prisma.genreConnection.findMany({
    where: { context },
    orderBy: { count: 'desc' },
    take: 50 // Limit to top 50 connections to avoid clutter
  });
  
  // Fetch genre names
  const genreIds = new Set<number>();
  connections.forEach((c) => {
    genreIds.add(c.genreAId);
    genreIds.add(c.genreBId);
  });

  const genres = await prisma.genre.findMany({
    where: { id: { in: Array.from(genreIds) } }
  });

  const genreMap = new Map(genres.map((g) => [g.id, g.name]));

  return connections.map((c) => ({
    source: genreMap.get(c.genreAId) || 'Unknown',
    target: genreMap.get(c.genreBId) || 'Unknown',
    value: c.count
  }));
}

export async function getLastUpdated(username?: string) {
  if (username) {
    const user = await prisma.userProfile.findUnique({ where: { username } });
    return user?.lastUpdated;
  }
  // Global
  const global = await prisma.globalStats.findUnique({ where: { id: 'global' } });
  return global?.lastUpdated;
}
