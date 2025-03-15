/**
 * Script para configurar la base de datos de producción
 * Crea todas las tablas definidas en el esquema utilizando drizzle-kit
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './shared/schema';

// Cargar variables de entorno de producción
config({ path: '.env.production' });

async function main() {
  console.log('Iniciando configuración de la base de datos de producción...');

  // Verificar que la variable de entorno PROD_DATABASE_URL está definida
  if (!process.env.PROD_DATABASE_URL) {
    console.error('Error: La variable PROD_DATABASE_URL no está definida en el archivo .env.production');
    process.exit(1);
  }

  console.log('Conectando a la base de datos de producción...');

  try {
    // Crear conexión
    const connectionString = process.env.PROD_DATABASE_URL;
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });

    console.log('Conexión establecida. Ejecutando push del esquema...');

    // Aplicar migraciones usando la carpeta de migraciones existente
    await migrate(db, { migrationsFolder: './migrations' });

    console.log('Esquema aplicado con éxito. La base de datos de producción está lista para ser utilizada.');
    
    // Importamos e inicializamos los datos por defecto usando el storage
    try {
      const { pgStorage } = await import('./server/pgStorage');
      if (typeof pgStorage.initializeDefaultData === 'function') {
        console.log('Inicializando datos por defecto...');
        await pgStorage.initializeDefaultData();
        console.log('Datos por defecto inicializados correctamente.');
      }
    } catch (error) {
      console.warn('No se pudieron inicializar los datos por defecto:', error);
      console.log('Puede inicializar los datos manualmente más tarde.');
    }
    
    console.log('Configuración de la base de datos de producción completada.');
    process.exit(0);
  } catch (error) {
    console.error('Error al configurar la base de datos de producción:', error);
    process.exit(1);
  }
}

main();