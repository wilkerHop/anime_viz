/**
 * Jikan API Integration Test
 * Similar to anime-poc, this script fetches and validates anime data
 * Run with: npm run test:jikan
 */

import { fetchCompleteAnimeData } from '../lib/api/jikan-client';
import { mapCompleteAnimeData } from '../lib/api/jikan-mapper';
import type { Anime } from '../lib/api/jikan-types';

// ==========================================
// ASSERTIONS
// ==========================================

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

// ==========================================
// TEST RUNNER
// ==========================================

async function runIntegrationTest(malId: number, animeName: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`JIKAN API INTEGRATION TEST`);
  console.log(`Anime ID: ${malId} (${animeName})`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Fetch data
    console.log('📡 Fetching anime data from Jikan API...\n');
    const startTime = Date.now();
    
    const rawData = await fetchCompleteAnimeData(malId);
    
    const fetchDuration = Date.now() - startTime;
    console.log(`\n✅ Fetch complete (${fetchDuration}ms)\n`);

    // Map data
    console.log('🔄 Mapping data to domain models...\n');
    const anime: Anime = mapCompleteAnimeData(rawData);
    
    console.log(`${'─'.repeat(60)}`);
    console.log(`Title: ${anime.title}`);
    if (anime.titleEnglish) console.log(`Title (EN): ${anime.titleEnglish}`);
    if (anime.titleJapanese) console.log(`Title (JP): ${anime.titleJapanese}`);
    console.log(`Type: ${anime.type} | Status: ${anime.status}`);
    console.log(`Episodes: ${anime.episodes || 'N/A'} | Aired: ${anime.airedString || 'N/A'}`);
    console.log(`Score: ${anime.stats.score || 'N/A'} | Ranked: #${anime.stats.ranked || 'N/A'}`);
    console.log(`Popularity: #${anime.stats.popularity || 'N/A'} | Members: ${anime.stats.members?.toLocaleString() || 'N/A'}`);
    console.log(`${'─'.repeat(60)}\n`);

    // Run assertions
    console.log('🧪 Running assertions...\n');
    
    // Basic metadata
    assertEqual(anime.id, malId, 'ID should match');
    assert(anime.title.length > 0, 'Title should be populated');
    assert(anime.synopsis !== null && anime.synopsis.length > 50, 'Synopsis should be populated');
    console.log('  ✅ Metadata verified');

    // Genres
    assert(anime.genres.length > 0, 'Should have at least one genre');
    console.log(`  ✅ Genres verified (${anime.genres.length} genres)`);
    console.log(`     ${anime.genres.map(g => g.name).join(', ')}`);

    // Companies
    if (anime.companies.length > 0) {
      const studios = anime.companies.filter(c => c.type === 'Studio');
      console.log(`  ✅ Companies verified (${studios.length} studios, ${anime.companies.length} total)`);
      if (studios.length > 0) {
        console.log(`     Studios: ${studios.map(s => s.company.name).join(', ')}`);
      }
    }

    // Characters
    if (anime.characters.length > 0) {
      const mainChars = anime.characters.filter(c => c.role === 'Main');
      console.log(`  ✅ Characters verified (${mainChars.length} main, ${anime.characters.length} total)`);
      
      // Show first main character with voice actors
      if (mainChars.length > 0) {
        const char = mainChars[0];
        console.log(`     Main: ${char.character.name}`);
        if (char.voiceActors.length > 0) {
          const jpVA = char.voiceActors.find(va => va.language === 'Japanese');
          if (jpVA) {
            console.log(`     JP VA: ${jpVA.person.name}`);
          }
        }
      }
    }

    // Staff
    if (anime.staff.length > 0) {
      console.log(`  ✅ Staff verified (${anime.staff.length} entries)`);
      const directors = anime.staff.filter(s => s.role.toLowerCase().includes('director'));
      if (directors.length > 0) {
        console.log(`     Director(s): ${directors.map(d => d.person.name).join(', ')}`);
      }
    }

    // Themes
    if (anime.themes.length > 0) {
      const openings = anime.themes.filter(t => t.type === 'Opening');
      const endings = anime.themes.filter(t => t.type === 'Ending');
      console.log(`  ✅ Themes verified (${openings.length} OP, ${endings.length} ED)`);
      if (openings.length > 0) {
        console.log(`     OP1: ${openings[0].text}`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✨ SUCCESS! All checks passed for: ${anime.title}`);
    console.log(`${'='.repeat(60)}\n`);

    return anime;

  } catch (error) {
    console.error(`\n${'='.repeat(60)}`);
    console.error('❌ TEST FAILED');
    console.error(`${'='.repeat(60)}\n`);
    console.error(error);
    process.exit(1);
  }
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  // Test with Frieren (same as anime-poc)
  const FRIEREN_ID = 52991;
  await runIntegrationTest(FRIEREN_ID, 'Sousou no Frieren');
  
  console.log('\n💡 Try testing other anime:');
  console.log('   - Steins;Gate: 9253');
  console.log('   - Fullmetal Alchemist: Brotherhood: 5114');
  console.log('   - One Piece: 21');
  console.log('\n   Usage: tsx src/scripts/jikan-integration.ts [MAL_ID]\n');
}

// Execute if run directly
if (require.main === module) {
  // Check for custom anime ID in args
  const customId = process.argv[2];
  if (customId) {
    const malId = parseInt(customId, 10);
    if (isNaN(malId)) {
      console.error('Error: Invalid MAL ID. Please provide a number.');
      process.exit(1);
    }
    runIntegrationTest(malId, 'Custom Anime')
      .catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
      });
  } else {
    main().catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
  }
}

export { runIntegrationTest };
