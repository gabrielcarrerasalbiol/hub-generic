import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.ts';

async function main() {
  console.log('Iniciando configuración de la base de datos...');
  
  try {
    // Conectar a la base de datos usando la variable de entorno DATABASE_URL
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('Variable de entorno DATABASE_URL no encontrada');
    }
    
    console.log('Conectando a la base de datos...');
    const queryClient = postgres(connectionString);
    const db = drizzle(queryClient, { schema });
    
    console.log('Conexión establecida. Creando esquema...');
    
    // Crear tablas utilizando la definición del esquema
    await db.query.users.findFirst();
    await db.query.sessions.findFirst();
    await db.query.oauthTokens.findFirst();
    await db.query.videos.findFirst();
    await db.query.channels.findFirst();
    await db.query.categories.findFirst();
    await db.query.favorites.findFirst();
    await db.query.channelSubscriptions.findFirst();
    await db.query.notifications.findFirst();
    await db.query.premiumChannels.findFirst();
    await db.query.viewHistory.findFirst();
    await db.query.comments.findFirst();
    
    console.log('Esquema creado correctamente');

    // Inicializar datos por defecto si es necesario
    if (schema.pgStorage && typeof schema.pgStorage.initializeDefaultData === 'function') {
      console.log('Inicializando datos por defecto...');
      await schema.pgStorage.initializeDefaultData();
      console.log('Datos por defecto inicializados correctamente');
    }
    
    console.log('Configuración de la base de datos completada con éxito');
    process.exit(0);
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
    process.exit(1);
  }
}

main();