/**
 * Database Population Script
 * Populates the database with top anime from MyAnimeList
 * Run with: npm run populate:db
 */

import { fetchGlobalTopAnime } from '../lib/api/mal';
import { prisma } from '../lib/db';
import { fetchAndStoreAnimeDetails } from '../lib/services/jikan-service';

interface PopulationOptions {
  limit?: number;
  startFrom?: number;
}

/**
 * Populate database with top anime
 */
async function populateDatabase(options: PopulationOptions = {}) {
  const { limit = 100, startFrom = 0 } = options;

  console.log('\n' + '='.repeat(70));
  console.log('DATABASE POPULATION');
  console.log('='.repeat(70) + '\n');

  const stats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
  };

  try {
    // 1. Fetch top anime list from MAL
    console.log('📥 Fetching top anime from MyAnimeList...');
    const data = await fetchGlobalTopAnime();
    
    const animeList = data.data.slice(startFrom, startFrom + limit);
    stats.total = animeList.length;

    console.log(`   Found ${data.data.length} anime, processing ${animeList.length} (from ${startFrom})\n`);

    // 2. Process each anime
    for (let i = 0; i < animeList.length; i++) {
      const { node } = animeList[i];
      const progress = `[${i + 1}/${animeList.length}]`;

      try {
        console.log(`\n${progress} Processing anime ${node.id}: ${node.title}`);

        // Check if already exists
        const existing = await prisma.anime.findUnique({
          where: { id: node.id },
          select: { 
            id: true,
            characters: { select: { id: true } }
          }
        });

        if (existing && existing.characters.length > 0) {
          console.log(`   ⏭️  Already enriched, skipping`);
          stats.skipped++;
          continue;
        }

        // Fetch and store full Jikan data
        await fetchAndStoreAnimeDetails(node.id);
        stats.success++;
        console.log(`   ✅ Successfully enriched`);

      } catch (error) {
        console.error(`   ❌ Failed:`, error instanceof Error ? error.message : 'Unknown error');
        stats.failed++;
        
        // Continue with next anime even if one fails
        continue;
      }
    }

    // 3. Print summary
    console.log('\n' + '='.repeat(70));
    console.log('POPULATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   Total anime: ${stats.total}`);
    console.log(`   Successfully enriched: ${stats.success}`);
    console.log(`   Already enriched (skipped): ${stats.skipped}`);
    console.log(`   Failed: ${stats.failed}`);
    console.log();

    // 4. Create global stats record
    await prisma.globalStats.upsert({
      where: { id: 'global' },
      update: { lastUpdated: new Date() },
      create: { id: 'global', lastUpdated: new Date() }
    });

    console.log('✅ Database population completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Population failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Populate specific anime by IDs
 */
async function populateSpecificAnime(malIds: number[]) {
  console.log('\n' + '='.repeat(70));
  console.log(`POPULATING ${malIds.length} SPECIFIC ANIME`);
  console.log('='.repeat(70) + '\n');

  const stats = {
    total: malIds.length,
    success: 0,
    failed: 0,
  };

  try {
    for (let i = 0; i < malIds.length; i++) {
      const malId = malIds[i];
      const progress = `[${i + 1}/${malIds.length}]`;

      try {
        console.log(`\n${progress} Fetching anime ${malId}...`);
        await fetchAndStoreAnimeDetails(malId);
        stats.success++;
        console.log(`   ✅ Success`);
      } catch (error) {
        console.error(`   ❌ Failed:`, error instanceof Error ? error.message : 'Unknown error');
        stats.failed++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Populated ${stats.success}/${stats.total} anime (${stats.failed} failed)`);
    console.log('='.repeat(70) + '\n');

  } finally {
   await prisma.$disconnect();
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Default: populate top 100 anime
    populateDatabase({ limit: 100 })
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else if (args[0] === '--limit') {
    // Populate with custom limit
    const limit = parseInt(args[1], 10);
    populateDatabase({ limit })
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else if (args[0] === '--range') {
    // Populate a range
    const start = parseInt(args[1], 10);
    const limit = parseInt(args[2], 10);
    populateDatabase({ startFrom: start, limit })
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else if (args[0] === '--ids') {
    // Populate specific IDs
    const ids = args.slice(1).map(id => parseInt(id, 10));
    populateSpecificAnime(ids)
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else {
    console.log(`
Usage:
  npm run populate:db                    # Populate top 100 anime
  npm run populate:db -- --limit 50      # Populate top 50 anime
  npm run populate:db -- --range 100 50  # Populate 50 anime starting from #100
  npm run populate:db -- --ids 52991 5114 9253  # Populate specific anime by ID
    `);
    process.exit(1);
  }
}

export { populateDatabase, populateSpecificAnime };
