import { db } from './server/db';
import { siteConfig } from './shared/schema';
import { eq } from 'drizzle-orm';

async function checkConfig() {
  console.log('🔍 Verificando configuración de búsqueda...\n');
  
  const result = await db
    .select()
    .from(siteConfig)
    .where(eq(siteConfig.key, 'video.search.term'))
    .limit(1);
  
  if (result.length > 0) {
    console.log('✅ Configuración encontrada:');
    console.log('   Término actual:', result[0].value);
    console.log('\n💡 Este es el término que se usará para buscar nuevos videos');
  } else {
    console.log('❌ No se encontró configuración');
  }
  
  process.exit(0);
}

checkConfig();
