// scripts/migrate-data.ts
import * as fs from 'fs';
import path from 'path';
import readline from 'readline';
import { db as sourceDb } from '../server/db';
import * as schema from '../shared/schema';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// Uso:
// Para exportar: NODE_ENV=development npm run migrate-data export
// Para importar: NODE_ENV=production npm run migrate-data import
// Opcionalmente puedes especificar la ruta del archivo: npm run migrate-data export ./mi-archivo.json

// Función para preguntar al usuario
async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function exportData() {
  console.log('==========================================');
  console.log('📤 EXPORTANDO DATOS DE LA BASE DE DATOS');
  console.log('==========================================');
  
  // Obtener nombre de archivo de los argumentos o usar el predeterminado
  const outputFilePath = process.argv[3] || './data-export.json';
  
  try {
    // Obtiene datos de las tablas principales
    console.log('📊 Extrayendo datos de usuarios...');
    const users = await sourceDb.query.users.findMany();
    console.log(`   ✅ ${users.length} usuarios encontrados`);
    
    console.log('📊 Extrayendo datos de categorías...');
    const categories = await sourceDb.query.categories.findMany();
    console.log(`   ✅ ${categories.length} categorías encontradas`);
    
    console.log('📊 Extrayendo datos de canales...');
    const channels = await sourceDb.query.channels.findMany();
    console.log(`   ✅ ${channels.length} canales encontrados`);
    
    console.log('📊 Extrayendo datos de videos...');
    const videos = await sourceDb.query.videos.findMany();
    console.log(`   ✅ ${videos.length} videos encontrados`);
    
    console.log('📊 Extrayendo datos de favoritos...');
    const favorites = await sourceDb.query.favorites.findMany();
    console.log(`   ✅ ${favorites.length} favoritos encontrados`);
    
    console.log('📊 Extrayendo datos de suscripciones...');
    const subscriptions = await sourceDb.query.channelSubscriptions.findMany();
    console.log(`   ✅ ${subscriptions.length} suscripciones encontradas`);

    console.log('📊 Extrayendo datos de comentarios...');
    const comments = await sourceDb.query.comments.findMany();
    console.log(`   ✅ ${comments.length} comentarios encontrados`);
    
    console.log('📊 Extrayendo datos de historial de visualizaciones...');
    const viewHistory = await sourceDb.query.viewHistory.findMany();
    console.log(`   ✅ ${viewHistory.length} registros de historial encontrados`);
    
    console.log('📊 Extrayendo datos de notificaciones...');
    const notifications = await sourceDb.query.notifications.findMany();
    console.log(`   ✅ ${notifications.length} notificaciones encontradas`);
    
    // Crea objeto con todos los datos
    const allData = {
      users,
      categories,
      channels,
      videos,
      favorites,
      subscriptions,
      comments,
      viewHistory,
      notifications,
      exportDate: new Date().toISOString(),
      envInfo: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: '(oculto por seguridad)'
      }
    };
    
    // Crear directorio si no existe
    const dir = path.dirname(outputFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Guarda en archivo JSON
    fs.writeFileSync(outputFilePath, JSON.stringify(allData, null, 2));
    console.log(`\n✅ ÉXITO: Datos exportados correctamente a ${outputFilePath}`);
    console.log(`   Exportados un total de ${Object.values(allData).reduce((sum, arr) => Array.isArray(arr) ? sum + arr.length : sum, 0)} registros.`);
  } catch (error) {
    console.error('❌ ERROR durante la exportación:', error);
    process.exit(1);
  }
}

async function importData() {
  console.log('==========================================');
  console.log('📥 IMPORTANDO DATOS A LA BASE DE DATOS');
  console.log('==========================================');
  
  // Verificar que estemos en producción
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  ADVERTENCIA: Estás intentando importar datos en un entorno que no es de producción.');
    console.warn('   Este script está diseñado para importar datos al entorno de producción.');
    
    const answer = await askQuestion('¿Deseas continuar de todos modos? (s/N): ');
    if (answer.toLowerCase() !== 's') {
      console.log('❌ Importación cancelada.');
      return;
    }
  }
  
  // Obtener nombre de archivo de los argumentos o usar el predeterminado
  const inputFilePath = process.argv[3] || './data-export.json';
  
  // Leer los datos exportados
  if (!fs.existsSync(inputFilePath)) {
    console.error(`❌ ERROR: No se encuentra el archivo ${inputFilePath}`);
    process.exit(1);
  }
  
  try {
    console.log(`📖 Leyendo datos desde ${inputFilePath}...`);
    const data = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    
    console.log(`📆 Datos exportados el: ${data.exportDate || 'Fecha desconocida'}`);
    console.log(`📊 Registros encontrados:`);
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        console.log(`   - ${key}: ${value.length} registros`);
      }
    });
    
    // Configurar conexión a la base de datos de destino (producción)
    const targetDbUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
    if (!targetDbUrl) {
      console.error('❌ ERROR: No se ha definido una URL de base de datos para la importación.');
      console.error('   Define PROD_DATABASE_URL en tus variables de entorno.');
      process.exit(1);
    }
    
    console.log(`\n🔌 Conectando a la base de datos de destino...`);
    const { Pool } = pg;
    const targetPool = new Pool({
      connectionString: targetDbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    const targetDb = drizzle(targetPool, { schema });
    
    // Preguntar por confirmación final
    console.log('\n⚠️  ADVERTENCIA: Esta operación importará datos a la base de datos de destino.');
    console.log('   Si la base de datos ya tiene datos, podrían ocurrir conflictos.');
    const finalConfirmation = await askQuestion('\n¿Estás seguro de que deseas continuar? (s/N): ');
    
    if (finalConfirmation.toLowerCase() !== 's') {
      console.log('❌ Importación cancelada.');
      await targetPool.end();
      return;
    }
    
    // Importar los datos en orden para respetar las relaciones
    console.log('\n🔄 Iniciando importación de datos...');
    
    // 1. Categorías primero (no dependen de otras entidades)
    if (data.categories && data.categories.length > 0) {
      console.log(`\n📥 Importando ${data.categories.length} categorías...`);
      for (const category of data.categories) {
        try {
          await targetDb.insert(schema.categories).values(category).onConflictDoNothing();
        } catch (error) {
          console.error(`   ❌ Error al importar categoría ID=${category.id}:`, error);
        }
      }
      console.log('   ✅ Categorías importadas');
    }
    
    // 2. Usuarios 
    if (data.users && data.users.length > 0) {
      console.log(`\n📥 Importando ${data.users.length} usuarios...`);
      for (const user of data.users) {
        try {
          await targetDb.insert(schema.users).values(user).onConflictDoNothing();
        } catch (error) {
          console.error(`   ❌ Error al importar usuario ID=${user.id}:`, error);
        }
      }
      console.log('   ✅ Usuarios importados');
    }
    
    // 3. Canales
    if (data.channels && data.channels.length > 0) {
      console.log(`\n📥 Importando ${data.channels.length} canales...`);
      for (const channel of data.channels) {
        try {
          await targetDb.insert(schema.channels).values(channel).onConflictDoNothing();
        } catch (error) {
          console.error(`   ❌ Error al importar canal ID=${channel.id}:`, error);
        }
      }
      console.log('   ✅ Canales importados');
    }
    
    // 4. Videos (dependen de canales y categorías)
    if (data.videos && data.videos.length > 0) {
      console.log(`\n📥 Importando ${data.videos.length} videos...`);
      for (const video of data.videos) {
        try {
          await targetDb.insert(schema.videos).values(video).onConflictDoNothing();
        } catch (error) {
          console.error(`   ❌ Error al importar video ID=${video.id}:`, error);
        }
      }
      console.log('   ✅ Videos importados');
    }
    
    // 5. Favoritos (dependen de usuarios y videos)
    if (data.favorites && data.favorites.length > 0) {
      console.log(`\n📥 Importando ${data.favorites.length} favoritos...`);
      for (const favorite of data.favorites) {
        try {
          await targetDb.insert(schema.favorites).values(favorite).onConflictDoNothing();
        } catch (error) {
          console.error(`   ❌ Error al importar favorito ID=${favorite.id}:`, error);
        }
      }
      console.log('   ✅ Favoritos importados');
    }
    
    // 6. Suscripciones (dependen de usuarios y canales)
    if (data.subscriptions && data.subscriptions.length > 0) {
      console.log(`\n📥 Importando ${data.subscriptions.length} suscripciones...`);
      for (const subscription of data.subscriptions) {
        try {
          await targetDb.insert(schema.channelSubscriptions).values(subscription).onConflictDoNothing();
        } catch (error) {
          console.error(`   ❌ Error al importar suscripción ID=${subscription.id}:`, error);
        }
      }
      console.log('   ✅ Suscripciones importadas');
    }
    
    // 7. Comentarios (dependen de usuarios y videos)
    if (data.comments && data.comments.length > 0) {
      console.log(`\n📥 Importando ${data.comments.length} comentarios...`);
      for (const comment of data.comments) {
        try {
          await targetDb.insert(schema.comments).values(comment).onConflictDoNothing();
        } catch (error) {
          console.error(`   ❌ Error al importar comentario ID=${comment.id}:`, error);
        }
      }
      console.log('   ✅ Comentarios importados');
    }
    
    // 8. Historial de visualizaciones (depende de usuarios y videos)
    if (data.viewHistory && data.viewHistory.length > 0) {
      console.log(`\n📥 Importando ${data.viewHistory.length} registros de historial...`);
      for (const history of data.viewHistory) {
        try {
          await targetDb.insert(schema.viewHistory).values(history).onConflictDoNothing();
        } catch (error) {
          console.error(`   ❌ Error al importar historial ID=${history.id}:`, error);
        }
      }
      console.log('   ✅ Historial importado');
    }
    
    // 9. Notificaciones (depende de usuarios, canales y videos)
    if (data.notifications && data.notifications.length > 0) {
      console.log(`\n📥 Importando ${data.notifications.length} notificaciones...`);
      for (const notification of data.notifications) {
        try {
          await targetDb.insert(schema.notifications).values(notification).onConflictDoNothing();
        } catch (error) {
          console.error(`   ❌ Error al importar notificación ID=${notification.id}:`, error);
        }
      }
      console.log('   ✅ Notificaciones importadas');
    }
    
    console.log('\n✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE');
    console.log('\n🔄 Cerrando conexión con la base de datos...');
    await targetPool.end();
    
  } catch (error) {
    console.error('❌ ERROR durante la importación:', error);
    process.exit(1);
  }
}

// Ejecutar función según el argumento
const action = process.argv[2];
if (action === 'export') {
  exportData().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
} else if (action === 'import') {
  importData().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
} else {
  console.log('\n❌ ERROR: Acción desconocida.');
  console.log('Uso: npm run migrate-data [export|import] [ruta-archivo]');
  console.log('\nEjemplos:');
  console.log('  npm run migrate-data export                # Exporta a ./data-export.json');
  console.log('  npm run migrate-data export ./backup.json  # Exporta a ./backup.json');
  console.log('  npm run migrate-data import                # Importa desde ./data-export.json');
  console.log('  npm run migrate-data import ./backup.json  # Importa desde ./backup.json');
  process.exit(1);
}