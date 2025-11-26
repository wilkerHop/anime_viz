/**
 * Data fetching functions for studio-related visualizations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StudioNode {
  id: string;
  name: string;
  animeCount: number;
}

export interface StudioLink {
  source: string;
  target: string;
  value: number;
  anime: string[];
}

/**
 * Get studio collaboration data for network visualization
 * Returns studios as nodes and shared anime as links
 */
export async function getStudioCollaborationData() {
  // Get all anime with their studios
  const animeWithStudios = await prisma.anime.findMany({
    where: {
      companies: {
        some: {
          type: 'Studio'
        }
      }
    },
    include: {
      companies: {
        where: {
          type: 'Studio'
        },
        include: {
          company: true
        }
      }
    },
    take: 100, // Limit for performance
  });

  // Build nodes (studios)
  const studioMap = new Map<number, StudioNode>();
  const linkMap = new Map<string, StudioLink>();

  animeWithStudios.forEach(anime => {
    const studios = anime.companies.map(c => c.company);
    
    // Add studios as nodes
    studios.forEach(studio => {
      if (!studioMap.has(studio.id)) {
        studioMap.set(studio.id, {
          id: studio.id.toString(),
          name: studio.name,
          animeCount: 0
        });
      }
      const node = studioMap.get(studio.id)!;
      node.animeCount++;
    });

    // Create links between studios that worked on the same anime
    for (let i = 0; i < studios.length; i++) {
      for (let j = i + 1; j < studios.length; j++) {
        const studio1 = studios[i];
        const studio2 = studios[j];
        const linkKey = [studio1.id, studio2.id].sort().join('-');
        
        if (!linkMap.has(linkKey)) {
          linkMap.set(linkKey, {
            source: studio1.id.toString(),
            target: studio2.id.toString(),
            value: 0,
            anime: []
          });
        }
        
        const link = linkMap.get(linkKey)!;
        link.value++;
        link.anime.push(anime.title);
      }
    }
  });

  return {
    nodes: Array.from(studioMap.values()),
    links: Array.from(linkMap.values())
  };
}

/**
 * Get top studios by anime count
 */
export async function getTopStudios(limit = 10) {
  const studios = await prisma.company.findMany({
    where: {
      animes: {
        some: {
          type: 'Studio'
        }
      }
    },
    include: {
      _count: {
        select: {
          animes: true
        }
      }
    },
    orderBy: {
      animes: {
        _count: 'desc'
      }
    },
    take: limit
  });

  return studios.map(studio => ({
    id: studio.id,
    name: studio.name,
    animeCount: studio._count.animes
  }));
}
