import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchParams {
  query?: string;
  genres?: string[];
  season?: string;
  year?: number;
  type?: string;
  minScore?: number;
  sortBy?: 'popularity' | 'rank' | 'score' | 'title' | 'aired';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function searchAnime(params: SearchParams): Promise<SearchResult> {
  const {
    query,
    genres,
    season,
    year,
    type,
    minScore,
    sortBy = 'popularity',
    sortOrder = 'asc',
    page = 1,
    limit = 24,
  } = params;

  const where: Prisma.AnimeWhereInput = {};

  // Text search
  if (query) {
    where.OR = [
      { titleEnglish: { contains: query } },
      { titleJapanese: { contains: query } },
      { title: { contains: query } }, // Fallback to main title
    ];
  }

  // Filters
  if (genres && genres.length > 0) {
    where.genres = {
      some: {
        name: { in: genres },
      },
    };
  }

  if (season) {
    where.season = season;
  }

  if (year) {
    where.year = year;
  }

  if (type) {
    where.type = type;
  }

  if (minScore) {
    where.score = {
      gte: minScore,
    };
  }

  // Sorting
  let orderBy: Prisma.AnimeOrderByWithRelationInput = {};
  switch (sortBy) {
    case 'popularity':
      orderBy = { popularity: sortOrder };
      break;
    case 'rank':
      orderBy = { ranked: sortOrder };
      break;
    case 'score':
      orderBy = { score: sortOrder };
      break;
    case 'title':
      orderBy = { titleEnglish: sortOrder };
      break;
    case 'aired':
      orderBy = { year: sortOrder }; // Simplified for now
      break;
    default:
      orderBy = { popularity: 'asc' };
  }

  // Pagination
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.anime.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        genres: true,
      },
    }),
    prisma.anime.count({ where }),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Helper to get all available genres for the filter
export async function getAvailableGenres() {
  return prisma.genre.findMany({
    orderBy: { name: 'asc' },
  });
}

// Helper to get available years
export async function getAvailableYears() {
  const years = await prisma.anime.groupBy({
    by: ['year'],
    where: { year: { not: null } },
    orderBy: { year: 'desc' },
  });
  return years.map(y => y.year).filter((y): y is number => y !== null);
}
