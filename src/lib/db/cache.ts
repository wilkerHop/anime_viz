import { fetchGlobalTopAnime, fetchUserAnimeList, UserAnimeList } from '@/lib/api/mal';
import { prisma } from '@/lib/db';
import { fetchAndStoreAnimeDetails } from '@/lib/services/jikan-service';
import { Prisma } from '@prisma/client';

/**
 * Update user anime data
 * Fetches user's anime list from MAL, then enriches each anime with Jikan data
 */
export async function updateUserData(username: string) {
  console.log(`[Cache] Updating data for user: ${username}`);
  
  let data: UserAnimeList;
  
  // For global/mock user, we'll populate with top anime
  if (username === 'global_mock' || username === 'global') {
    // Fetch top anime from MAL
    data = await fetchGlobalTopAnime();
  } else {
    // Fetch specific user's list
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

    console.log(`[Cache] Processing ${data.data.length} anime for ${username}`);

    // Process each anime
    for (const item of data.data) {
      const { node } = item;
      
      try {
        // Fetch full Jikan data for this anime
        console.log(`[Cache] Enriching anime ${node.id}: ${node.title}`);
        await fetchAndStoreAnimeDetails(node.id);
        
        // Connect anime to user
        await tx.anime.update({
          where: { id: node.id },
          data: {
            users: {
              connect: { id: user.id }
            }
          }
        });
      } catch (error) {
        console.error(`[Cache] Failed to enrich anime ${node.id}:`, error);
        // Continue with next anime even if one fails
      }
    }

    // Calculate Genre Connections for this user
    console.log(`[Cache] Calculating genre connections for ${username}`);
    
    // 1. Get all anime for this user with their genres
    const userAnime = await tx.anime.findMany({
      where: { users: { some: { id: user.id } } },
      include: { genres: true }
    });

    // 2. Count genre pairs
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
    // Clear old connections for this user context
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

    console.log(`[Cache] Created ${Object.keys(connections).length} genre connections`);
  });

  console.log(`[Cache] ✅ Successfully updated data for ${username}`);
  return { success: true };
}

/**
 * Get genre connections for visualization
 */
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

/**
 * Get last updated timestamp
 */
export async function getLastUpdated(username?: string) {
  if (username) {
    const user = await prisma.userProfile.findUnique({ where: { username } });
    return user?.lastUpdated;
  }
  // Global
  const global = await prisma.globalStats.findUnique({ where: { id: 'global' } });
  return global?.lastUpdated;
}
