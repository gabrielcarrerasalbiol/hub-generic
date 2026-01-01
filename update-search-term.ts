import { db } from './server/db';
import { siteConfig } from './shared/schema';
import { eq } from 'drizzle-orm';

async function updateSearchTerm() {
  const newTerm = 'Atletico de Madrid';
  
  console.log(`🔄 Actualizando término de búsqueda a: "${newTerm}"\n`);
  
  try {
    const result = await db
      .update(siteConfig)
      .set({ value: newTerm })
      .where(eq(siteConfig.key, 'video.search.term'))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Término actualizado correctamente!');
      console.log('   Nuevo valor:', result[0].value);
    }
    
    // Verificar
    const check = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.key, 'video.search.term'))
      .limit(1);
    
    console.log('\n📋 Verificación:');
    console.log('   video.search.term =', check[0].value);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

updateSearchTerm();
