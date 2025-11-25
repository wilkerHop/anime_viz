/**
 * Script to enrich all anime in the database with Jikan API data
 * Fetches missing anime details for:
 * - Related anime (sequels, prequels, etc.)
 * - User list anime
 * Run with: npm run enrich:anime
 */

import { PrismaClient } from '@prisma/client';
import { animeExistsInDatabase, fetchAndStoreAnimeDetails } from '../lib/services/jikan-service';

const prisma = new PrismaClient();

interface EnrichmentStats {
  totalFound: number;
  alreadyEnriched: number;
  newlyFetched: number;
  failed: number;
  skipped: number;
}

/**
 * Get all unique anime IDs that need enrichment
 */
async function getAnimeIdsNeedingEnrichment(): Promise<Set<number>> {
  const animeIds = new Set<number>();

  // 1. Get all anime already in database
  const existingAnime = await prisma.anime.findMany({
    select: { id: true }
  });
  
  console.log(`📊 Found ${existingAnime.length} anime in database`);

  // 2. Get all related anime IDs
  const relatedAnime = await prisma.relatedAnime.findMany({
    select: { relatedAnimeId: true },
    where: { relatedAnimeId: { not: null } }
  });

  relatedAnime.forEach(rel => {
    if (rel.relatedAnimeId) {
      animeIds.add(rel.relatedAnimeId);
    }
  });

  console.log(`🔗 Found ${relatedAnime.length} related anime references`);

  // 3. Check which ones are missing from database
  const missingIds = new Set<number>();
  for (const id of animeIds) {
    const exists = await animeExistsInDatabase(id);
    if (!exists) {
      missingIds.add(id);
    }
  }

  console.log(`⚠️  Found ${missingIds.size} anime missing full data\n`);

  return missingIds;
}

/**
 * Enrich anime with full Jikan data
 */
async function enrichAnime(
  animeId: number,
  stats: EnrichmentStats,
  fetchRelated: boolean = false
): Promise<void> {
  try {
    console.log(`\n📥 Fetching anime ${animeId}...`);
    
    // Check if already exists
    if (await animeExistsInDatabase(animeId)) {
      console.log(`   ✓ Already enriched`);
      stats.alreadyEnriched++;
      return;
    }

    // Fetch and store
    await fetchAndStoreAnimeDetails(animeId);
    stats.newlyFetched++;
    console.log(`   ✅ Successfully enriched`);

    // If fetchRelated is true, recursively fetch related anime
    if (fetchRelated) {
      const relatedAnime = await prisma.relatedAnime.findMany({
        where: { animeId },
        select: { relatedAnimeId: true }
      });

      for (const rel of relatedAnime) {
        if (rel.relatedAnimeId && !(await animeExistsInDatabase(rel.relatedAnimeId))) {
          // Recursively fetch (but don't go deeper than 1 level to avoid infinite loops)
          await enrichAnime(rel.relatedAnimeId, stats, false);
        }
      }
    }

  } catch (error) {
    console.error(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    stats.failed++;
  }
}

/**
 * Main enrichment function
 */
async function enrichAllAnime(options: {
  maxAnime?: number;
  fetchRelated?: boolean;
} = {}) {
  const { maxAnime, fetchRelated = false } = options;

  console.log('\n' + '='.repeat(70));
  console.log('ANIME DATABASE ENRICHMENT');
  console.log('='.repeat(70) + '\n');

  const stats: EnrichmentStats = {
    totalFound: 0,
    alreadyEnriched: 0,
    newlyFetched: 0,
    failed: 0,
    skipped: 0,
  };

  try {
    // Get anime IDs that need enrichment
    const animeIds = await getAnimeIdsNeedingEnrichment();
    stats.totalFound = animeIds.size;

    if (animeIds.size === 0) {
      console.log('✨ All anime are already enriched!\n');
      return;
    }

    // Limit if specified
    let idsToFetch = Array.from(animeIds);
    if (maxAnime && maxAnime < idsToFetch.length) {
      stats.skipped = idsToFetch.length - maxAnime;
      idsToFetch = idsToFetch.slice(0, maxAnime);
      console.log(`⚠️  Limiting to first ${maxAnime} anime (${stats.skipped} will be skipped)\n`);
    }

    // Enrich each anime
    for (let i = 0; i < idsToFetch.length; i++) {
      const animeId = idsToFetch[i];
      console.log(`\n[${i + 1}/${idsToFetch.length}]`);
      await enrichAnime(animeId, stats, fetchRelated);
    }

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('ENRICHMENT COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   Total found: ${stats.totalFound}`);
    console.log(`   Already enriched: ${stats.alreadyEnriched}`);
    console.log(`   Newly fetched: ${stats.newlyFetched}`);
    console.log(`   Failed: ${stats.failed}`);
    if (stats.skipped > 0) {
      console.log(`   Skipped: ${stats.skipped}`);
    }
    console.log();

  } catch (error) {
    console.error('\n❌ Enrichment failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Enrich a specific anime and optionally its related anime
 */
async function enrichSpecificAnime(malId: number, fetchRelated: boolean = true) {
  console.log('\n' + '='.repeat(70));
  console.log(`ENRICHING ANIME ${malId}`);
  console.log('='.repeat(70) + '\n');

  const stats: EnrichmentStats = {
    totalFound: 1,
    alreadyEnriched: 0,
    newlyFetched: 0,
    failed: 0,
    skipped: 0,
  };

  try {
    await enrichAnime(malId, stats, fetchRelated);

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Enrichment complete: ${stats.newlyFetched} anime fetched, ${stats.failed} failed`);
    console.log('='.repeat(70) + '\n');

  } finally {
    await prisma.$disconnect();
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Enrich all missing anime
    enrichAllAnime({ fetchRelated: false })
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else if (args[0] === '--all') {
    // Enrich all and their related anime
    enrichAllAnime({ fetchRelated: true })
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else if (args[0] === '--limit') {
    // Enrich with a limit
    const limit = parseInt(args[1], 10);
    enrichAllAnime({ maxAnime: limit, fetchRelated: false })
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else if (args[0] === '--anime') {
    // Enrich specific anime
    const malId = parseInt(args[1], 10);
    const fetchRelated = args.includes('--related');
    enrichSpecificAnime(malId, fetchRelated)
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else {
    console.log(`
Usage:
  npm run enrich:anime              # Enrich all missing anime
  npm run enrich:anime -- --all     # Enrich all + their related anime
  npm run enrich:anime -- --limit 5 # Enrich first 5 missing anime
  npm run enrich:anime -- --anime 52991 # Enrich specific anime
  npm run enrich:anime -- --anime 52991 --related # Enrich anime + related
    `);
    process.exit(1);
  }
}

export { enrichAllAnime, enrichSpecificAnime };
