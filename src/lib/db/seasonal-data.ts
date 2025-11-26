/**
 * Data fetching functions for seasonal trends visualization
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SeasonalData {
  season: string;
  year: number;
  label: string;
  count: number;
  type?: string;
}

/**
 * Get anime count by season and year
 */
export async function getSeasonalTrends() {
  const anime = await prisma.anime.findMany({
    where: {
      season: {
        not: null
      },
      year: {
        not: null
      }
    },
    select: {
      season: true,
      year: true,
      type: true
    }
  });

  // Group by season + year
  const seasonMap = new Map<string, SeasonalData>();

  anime.forEach(a => {
    if (a.season && a.year) {
      const key = `${a.season} ${a.year}`;
      if (!seasonMap.has(key)) {
        seasonMap.set(key, {
          season: a.season,
          year: a.year,
          label: key,
          count: 0
        });
      }
      seasonMap.get(key)!.count++;
    }
  });

  // Sort by year and season
  const seasonOrder = ['Winter', 'Spring', 'Summer', 'Fall'];
  return Array.from(seasonMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return seasonOrder.indexOf(a.season) - seasonOrder.indexOf(b.season);
  });
}

/**
 * Get anime count by season, year, and type
 */
export async function getSeasonalTrendsByType() {
  const anime = await prisma.anime.findMany({
    where: {
      season: {
        not: null
      },
      year: {
        not: null
      },
      type: {
        not: null
      }
    },
    select: {
      season: true,
      year: true,
      type: true
    }
  });

  // Group by season + year + type
  const trendMap = new Map<string, SeasonalData>();

  anime.forEach(a => {
    if (a.season && a.year && a.type) {
      const key = `${a.season} ${a.year} - ${a.type}`;
      if (!trendMap.has(key)) {
        trendMap.set(key, {
          season: a.season,
          year: a.year,
          label: `${a.season} ${a.year}`,
          count: 0,
          type: a.type
        });
      }
      trendMap.get(key)!.count++;
    }
  });

  return Array.from(trendMap.values());
}
