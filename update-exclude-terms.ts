import { db } from './server/db';
import { siteConfig } from './shared/schema';
import { eq } from 'drizzle-orm';

async function updateExcludeTerms() {
  console.log('🔄 Actualizando términos de exclusión para Atlético de Madrid...\n');
  
  try {
    // More strict exclusions - include more variations
    const newExcludeTerms = [
      'Real Madrid',
      'Madrid', // Will match but filtered by algorithm
      'Barcelona',
      'Barça',
      'Barca',
      'FCB',
      'FC Barcelona',
      'Bellingham',
      'Jude Bellingham',
      'Vinicius',
      'Mbappé',
      'Mbappe',
      'Los Blancos',
      'Bernabéu',
      'Bernabeu',
      'Santiago Bernabéu'
    ].join(', ');
    
    await db
      .update(siteConfig)
      .set({ value: newExcludeTerms })
      .where(eq(siteConfig.key, 'video.search.exclude'));
    
    console.log('✅ Términos de exclusión actualizados\n');
    
    // Verify
    const searchTerm = await db.select().from(siteConfig).where(eq(siteConfig.key, 'video.search.term')).limit(1);
    const exclude = await db.select().from(siteConfig).where(eq(siteConfig.key, 'video.search.exclude')).limit(1);
    
    console.log('📋 Configuración actualizada:');
    console.log('   Término búsqueda:', searchTerm[0]?.value || 'N/A');
    console.log('\n   Términos excluidos:');
    const terms = (exclude[0]?.value || '').split(',').map(t => t.trim());
    terms.forEach((term, i) => {
      console.log(`   ${i + 1}. ${term}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

updateExcludeTerms();
