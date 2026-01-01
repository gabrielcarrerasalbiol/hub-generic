import { db } from './server/db';
import { videos } from './shared/schema';
import { sql } from 'drizzle-orm';

async function cleanVideos() {
  console.log('🗑️  Limpiando videos viejos de la base de datos...\n');
  
  try {
    // Count videos first
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(videos);
    const totalVideos = Number(countResult[0]?.count || 0);
    
    console.log(`📊 Videos actuales en BD: ${totalVideos}`);
    
    if (totalVideos === 0) {
      console.log('✅ No hay videos para borrar');
      process.exit(0);
    }
    
    console.log('\n⚠️  ¿Seguro que quieres borrar TODOS los videos?');
    console.log('   Esto permitirá agregar nuevos videos del Atlético');
    console.log('   Los videos viejos del Real Madrid serán eliminados\n');
    
    // Delete all videos
    const result = await db.delete(videos);
    
    console.log(`✅ ${totalVideos} videos eliminados`);
    console.log('\n💡 Ahora puedes buscar nuevos videos del Atlético desde:');
    console.log('   http://localhost:3001/admin → Videos → "Importar Contenido"');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

cleanVideos();
