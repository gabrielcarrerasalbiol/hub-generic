/**
 * Script para configurar la base de datos de producción
 * Crea todas las tablas definidas en el esquema
 */

require('dotenv').config({ path: '.env.production' });
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { migrate } = require('drizzle-orm/postgres-js/migrator');

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
    const db = drizzle(client);
    
    console.log('Conexión establecida. Ejecutando migraciones...');
    
    // Aplicar migraciones (creará todas las tablas según el esquema)
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('Migraciones completadas con éxito. La base de datos de producción está lista para ser utilizada.');
    process.exit(0);
  } catch (error) {
    console.error('Error al configurar la base de datos de producción:', error);
    process.exit(1);
  }
}

main();