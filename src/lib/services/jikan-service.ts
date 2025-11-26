/**
 * Jikan Service
 * High-level service for fetching anime data from Jikan API and storing in database
 */

import { PrismaClient } from '@prisma/client';
import { fetchCompleteAnimeData } from '../api/jikan-client';
import { mapCompleteAnimeData } from '../api/jikan-mapper';
import type { Anime } from '../api/jikan-types';

const prisma = new PrismaClient();

/**
 * Fetch anime details from Jikan API and store in database
 * This is a comprehensive operation that stores all related data
 */
export async function fetchAndStoreAnimeDetails(malId: number): Promise<void> {
  console.log(`[JikanService] Fetching anime ${malId} from Jikan API...`);
  
  // Fetch from Jikan API
  const rawData = await fetchCompleteAnimeData(malId);
  const anime: Anime = mapCompleteAnimeData(rawData);
  
  console.log(`[JikanService] Storing anime: ${anime.title}`);
  
  // Store in database with transaction
  await prisma.$transaction(async (tx) => {
    // 1. Upsert Anime
    await tx.anime.upsert({
      where: { id: anime.id },
      create: {
        id: anime.id,
        title: anime.title,
        titleEnglish: anime.titleEnglish,
        titleJapanese: anime.titleJapanese,
        type: anime.type,
        status: anime.status,
        episodes: anime.episodes,
        duration: anime.duration,
        rating: anime.rating,
        source: anime.source,
        airedString: anime.airedString,
        airedFrom: anime.airedFrom,
        airedTo: anime.airedTo,
        season: anime.season,
        year: anime.year,
        mainPicture: anime.mainPicture,
        synopsis: anime.synopsis,
        background: anime.background,
        score: anime.stats.score,
        scoredBy: anime.stats.scoredBy,
        ranked: anime.stats.ranked,
        popularity: anime.stats.popularity,
        members: anime.stats.members,
        favorites: anime.stats.favorites,
      },
      update: {
        title: anime.title,
        titleEnglish: anime.titleEnglish,
        titleJapanese: anime.titleJapanese,
        type: anime.type,
        status: anime.status,
        episodes: anime.episodes,
        duration: anime.duration,
        rating: anime.rating,
        source: anime.source,
        airedString: anime.airedString,
        airedFrom: anime.airedFrom,
        airedTo: anime.airedTo,
        season: anime.season,
        year: anime.year,
        mainPicture: anime.mainPicture,
        synopsis: anime.synopsis,
        background: anime.background,
        score: anime.stats.score,
        scoredBy: anime.stats.scoredBy,
        ranked: anime.stats.ranked,
        popularity: anime.stats.popularity,
        members: anime.stats.members,
        favorites: anime.stats.favorites,
      },
    });

    // 2. Sync Genres
    for (const genre of anime.genres) {
      // Upsert genre
      await tx.genre.upsert({
        where: { id: genre.id },
        create: { id: genre.id, name: genre.name },
        update: { name: genre.name },
      });
      
      // Connect to anime
      await tx.anime.update({
        where: { id: anime.id },
        data: {
          genres: {
            connect: { id: genre.id },
          },
        },
      });
    }

    // 3. Sync Companies
    // First, delete existing company relations for this anime
    await tx.animeCompany.deleteMany({
      where: { animeId: anime.id },
    });
    
    for (const animeCompany of anime.companies) {
      // Upsert company
      await tx.company.upsert({
        where: { id: animeCompany.company.id },
        create: {
          id: animeCompany.company.id,
          name: animeCompany.company.name,
        },
        update: {
          name: animeCompany.company.name,
        },
      });
      
      // Create AnimeCompany relation
      await tx.animeCompany.create({
        data: {
          animeId: anime.id,
          companyId: animeCompany.company.id,
          type: animeCompany.type,
        },
      });
    }

    // 4. Sync Themes
    // Delete existing themes for this anime
    await tx.animeTheme.deleteMany({
      where: { animeId: anime.id },
    });
    
    for (const theme of anime.themes) {
      await tx.animeTheme.create({
        data: {
          animeId: anime.id,
          type: theme.type,
          text: theme.text,
        },
      });
    }

    // 5. Sync Related Anime
    // Delete existing relations for this anime
    await tx.relatedAnime.deleteMany({
      where: { animeId: anime.id },
    });
    
    for (const related of anime.relatedEntries) {
      await tx.relatedAnime.create({
        data: {
          animeId: anime.id,
          relatedAnimeId: related.relatedAnimeId,
          relationType: related.relationType,
          relatedAnimeTitle: related.relatedAnimeTitle,
        },
      });
    }

    // 6. Sync Characters and Voice Actors
    // Delete existing character relations for this anime
    await tx.animeCharacter.deleteMany({
      where: { animeId: anime.id },
    });
    
    for (const animeChar of anime.characters) {
      // Upsert character
      await tx.character.upsert({
        where: { id: animeChar.character.id },
        create: {
          id: animeChar.character.id,
          name: animeChar.character.name,
          image: animeChar.character.image,
        },
        update: {
          name: animeChar.character.name,
          image: animeChar.character.image,
        },
      });
      
      // Create AnimeCharacter relation
      const animeCharacterRecord = await tx.animeCharacter.create({
        data: {
          animeId: anime.id,
          characterId: animeChar.character.id,
          role: animeChar.role,
        },
      });
      
      // Sync Voice Actors
      for (const va of animeChar.voiceActors) {
        // Upsert person
        await tx.person.upsert({
          where: { id: va.person.id },
          create: {
            id: va.person.id,
            name: va.person.name,
            image: va.person.image,
          },
          update: {
            name: va.person.name,
            image: va.person.image,
          },
        });
        
        // Create VoiceActorAssignment
        await tx.voiceActorAssignment.create({
          data: {
            animeCharacterId: animeCharacterRecord.id,
            personId: va.person.id,
            language: va.language,
          },
        });
      }
    }

    // 7. Sync Staff
    // Delete existing staff relations for this anime
    await tx.animeStaff.deleteMany({
      where: { animeId: anime.id },
    });
    
    for (const staffMember of anime.staff) {
      // Upsert person
      await tx.person.upsert({
        where: { id: staffMember.person.id },
        create: {
          id: staffMember.person.id,
          name: staffMember.person.name,
          image: staffMember.person.image,
        },
        update: {
          name: staffMember.person.name,
          image: staffMember.person.image,
        },
      });
      
      // Create AnimeStaff relation
      await tx.animeStaff.create({
        data: {
          animeId: anime.id,
          personId: staffMember.person.id,
          role: staffMember.role,
        },
      });
    }
  });
  
  console.log(`[JikanService] ✅ Successfully stored anime: ${anime.title}`);
}

/**
 * Fetch multiple anime and store them
 * Useful for bulk data population
 */
export async function fetchAndStoreMultipleAnime(malIds: number[]): Promise<void> {
  console.log(`[JikanService] Fetching ${malIds.length} anime...`);
  
  for (const malId of malIds) {
    try {
      await fetchAndStoreAnimeDetails(malId);
    } catch (error) {
      console.error(`[JikanService] Failed to fetch anime ${malId}:`, error);
      // Continue with next anime
    }
  }
  
  console.log(`[JikanService] Completed fetching ${malIds.length} anime`);
}

/**
 * Check if anime exists in database
 */
export async function animeExistsInDatabase(malId: number): Promise<boolean> {
  const anime = await prisma.anime.findUnique({
    where: { id: malId },
  });
  return anime !== null;
}

/**
 * Get anime with all related data from database
 */
export async function getAnimeFromDatabase(malId: number) {
  return prisma.anime.findUnique({
    where: { id: malId },
    include: {
      genres: true,
      companies: {
        include: {
          company: true,
        },
      },
      themes: true,
      characters: {
        include: {
          character: true,
          voiceActors: {
            include: {
              person: true,
            },
          },
        },
      },
      staff: {
        include: {
          person: true,
        },
      },
      relatedAnime: true,
    },
  });
}

/**
 * Get featured anime (top popularity) from database
 */
export async function getFeaturedAnime(limit = 6) {
  return prisma.anime.findMany({
    take: limit,
    orderBy: {
      popularity: 'asc', // Lower is better for rank/popularity
    },
    include: {
      genres: true,
    },
    where: {
      popularity: {
        not: null,
        gt: 0
      }
    }
  });
}

/**
 * Cleanup - close Prisma connection
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
