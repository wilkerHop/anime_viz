/**
 * Test script to fetch anime data from Jikan and store in database
 * Run with: npm run test:db-sync
 */

import {
    disconnect,
    fetchAndStoreAnimeDetails,
    getAnimeFromDatabase,
} from '../lib/services/jikan-service';

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('JIKAN TO DATABASE SYNC TEST');
  console.log('='.repeat(70) + '\n');

  try {
    // Test with Frieren (same as POC)
    const FRIEREN_ID = 52991;
    
    console.log(`Step 1: Fetching and storing anime ${FRIEREN_ID} from Jikan API...\n`);
    await fetchAndStoreAnimeDetails(FRIEREN_ID);
    
    console.log(`\nStep 2: Retrieving anime from database...\n`);
    const storedAnime = await getAnimeFromDatabase(FRIEREN_ID);
    
    if (!storedAnime) {
      throw new Error('Anime not found in database after storing!');
    }
    
    // Display results
    console.log('─'.repeat(70));
    console.log(`Title: ${storedAnime.title}`);
    console.log(`English: ${storedAnime.titleEnglish}`);
    console.log(`Japanese: ${storedAnime.titleJapanese}`);
    console.log(`Type: ${storedAnime.type} | Status: ${storedAnime.status}`);
    console.log(`Episodes: ${storedAnime.episodes}`);
    console.log(`Score: ${storedAnime.score} | Ranked: #${storedAnime.ranked}`);
    console.log(`Aired: ${storedAnime.airedString}`);
    console.log('─'.repeat(70));
    
    console.log(`\n📊 Database Statistics:`);
    console.log(`  Genres: ${storedAnime.genres.length}`);
    console.log(`  Companies: ${storedAnime.companies.length}`);
    console.log(`  Themes: ${storedAnime.themes.length}`);
    console.log(`  Characters: ${storedAnime.characters.length}`);
    console.log(`  Staff: ${storedAnime.staff.length}`);
    console.log(`  Related Anime: ${storedAnime.relatedAnime.length}`);
    
    // Show sample data
    console.log(`\n🎭 Sample Character Data:`);
    const mainChars = storedAnime.characters.filter(c => c.role === 'Main').slice(0, 3);
    for (const charRel of mainChars) {
      console.log(`  - ${charRel.character.name} (${charRel.role})`);
      const jpVA = charRel.voiceActors.find(va => va.language === 'Japanese');
      if (jpVA) {
        console.log(`    JP VA: ${jpVA.person.name}`);
      }
    }
    
    console.log(`\n🎬 Sample Studio Data:`);
    const studios = storedAnime.companies.filter(c => c.type === 'Studio');
    for (const companyRel of studios) {
      console.log(`  - ${companyRel.company.name} (${companyRel.type})`);
    }
    
    console.log(`\n🎵 Sample Themes:`);
    const openings = storedAnime.themes.filter(t => t.type === 'Opening').slice(0, 2);
    for (const theme of openings) {
      console.log(`  ${theme.type}: ${theme.text}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✨ SUCCESS! Data successfully synced to database');
    console.log('='.repeat(70));
    
    console.log('\n💡 You can now:');
    console.log('   - Run: npx prisma studio');
    console.log('   - To visually explore the database\n');
    
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(70) + '\n');
    console.error(error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main };
