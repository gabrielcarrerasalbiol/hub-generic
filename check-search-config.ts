import { db } from './server/db';
import { siteConfig } from './shared/schema';
import { eq } from 'drizzle-orm';

async function checkSearchConfig() {
  try {
    const result = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.key, 'video.search.term'))
      .limit(1);
    
    if (result.length > 0) {
      console.log('✅ Campo encontrado en base de datos:');
      console.log('   Key:', result[0].key);
      console.log('   Value:', result[0].value);
    } else {
      console.log('❌ Campo NO encontrado en base de datos');
      console.log('   Necesitas ejecutar: npx tsx seed-site-config-expanded.ts');
    }
    
    // Check all video.search.* keys
    const allResults = await db
      .select()
      .from(siteConfig);
    
    const videoSearchKeys = allResults.filter(r => r.key?.startsWith('video.search'));
    
    console.log('\nCampos video.search.* encontrados:', videoSearchKeys.length);
    videoSearchKeys.forEach(k => {
      console.log(`  - ${k.key}: ${k.value}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSearchConfig();
