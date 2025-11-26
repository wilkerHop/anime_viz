/**
 * Data fetching functions for score distribution visualization
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ScoreBucket {
  range: string;
  count: number;
  minScore: number;
  maxScore: number;
}

/**
 * Get score distribution data
 * Groups anime by score ranges (0-1, 1-2, ..., 9-10)
 */
export async function getScoreDistribution(): Promise<ScoreBucket[]> {
  const anime = await prisma.anime.findMany({
    where: {
      score: {
        not: null,
        gt: 0
      }
    },
    select: {
      score: true
    }
  });

  // Create buckets
  const buckets: ScoreBucket[] = [];
  for (let i = 0; i < 10; i++) {
    buckets.push({
      range: `${i}-${i + 1}`,
      minScore: i,
      maxScore: i + 1,
      count: 0
    });
  }

  // Count anime in each bucket
  anime.forEach(a => {
    if (a.score !== null) {
      const bucketIndex = Math.min(Math.floor(a.score), 9);
      buckets[bucketIndex].count++;
    }
  });

  return buckets;
}

/**
 * Get average score by type (TV, Movie, OVA, etc.)
 */
export async function getAverageScoreByType() {
  const results = await prisma.anime.groupBy({
    by: ['type'],
    where: {
      score: {
        not: null,
        gt: 0
      },
      type: {
        not: null
      }
    },
    _avg: {
      score: true
    },
    _count: {
      id: true
    }
  });

  return results.map(r => ({
    type: r.type!,
    averageScore: r._avg.score || 0,
    count: r._count.id
  }));
}
