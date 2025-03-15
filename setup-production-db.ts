/**
 * Script para configurar la base de datos de producción
 * Crea todas las tablas definidas en el esquema utilizando drizzle-kit
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './shared/schema';
import { Client } from 'pg';
import fs from 'fs';
import { bold, red, green, yellow, blue, cyan, magenta } from './scripts/colorUtils';

// Cargar variables de entorno de producción
config({ path: '.env.production' });

// Verificar archivo .env.production
function checkEnvFile(): boolean {
  console.log(bold(blue('\n🔍 Verificando archivo .env.production')));
  
  if (!fs.existsSync('.env.production')) {
    console.log(red('❌ No se encontró el archivo .env.production'));
    console.log('Crea el archivo .env.production con las variables necesarias.');
    console.log('Puedes usar .env.production.example como referencia.');
    return false;
  }
  
  console.log(green('✅ Archivo .env.production encontrado'));
  return true;
}

// Verificar variable PROD_DATABASE_URL
function checkDatabaseUrl(): boolean {
  console.log(bold(blue('\n🔍 Verificando variable PROD_DATABASE_URL')));
  
  if (!process.env.PROD_DATABASE_URL) {
    console.log(red('❌ No se encontró la variable PROD_DATABASE_URL en el archivo .env.production'));
    console.log('Por favor, configura esta variable con la URL de conexión a la base de datos de producción.');
    return false;
  }
  
  console.log(green('✅ Variable PROD_DATABASE_URL configurada correctamente'));
  return true;
}

// Verificar conexión a la base de datos
async function checkDatabaseConnection(): Promise<boolean> {
  console.log(bold(blue('\n🔍 Verificando conexión a la base de datos de producción')));
  
  const dbUrl = process.env.PROD_DATABASE_URL;
  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    console.log(green('✅ Conexión exitosa a la base de datos de producción'));
    await client.end();
    return true;
  } catch (error) {
    console.log(red('❌ Error al conectar con la base de datos:'));
    console.log(red(`   ${error.message}`));
    
    if (error.message.includes('connection refused')) {
      console.log(yellow('   Posible causa: El servidor de base de datos no está accesible'));
    } else if (error.message.includes('password authentication failed')) {
      console.log(yellow('   Posible causa: Credenciales incorrectas en PROD_DATABASE_URL'));
    } else if (error.message.includes('does not exist')) {
      console.log(yellow('   Posible causa: La base de datos no existe, debe crearla primero'));
    }
    
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  console.log(bold(cyan('==========================================================='))); 
  console.log(bold(cyan('🛠️ CONFIGURACIÓN DE BASE DE DATOS DE PRODUCCIÓN - HUB MADRIDISTA')));
  console.log(bold(cyan('==========================================================='))); 
  
  // Verificar que estamos en entorno de producción
  if (process.env.NODE_ENV !== 'production') {
    console.log(yellow('\n⚠️ ADVERTENCIA: El entorno actual no es producción.'));
    console.log(yellow('⚠️ Configurando la base de datos con .env.production de todas formas.\n'));
  }
  
  // Verificar requisitos antes de proceder
  if (!checkEnvFile() || !checkDatabaseUrl() || !(await checkDatabaseConnection())) {
    console.log(red('\n❌ Error: No se cumplen los requisitos para configurar la base de datos.'));
    console.log(red('Por favor, soluciona los problemas indicados antes de continuar.'));
    process.exit(1);
  }

  try {
    console.log(bold(blue('\n🔄 Conectando a la base de datos de producción...')));
    
    // Crear conexión
    const connectionString = process.env.PROD_DATABASE_URL;
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });

    console.log(green('✅ Conexión establecida'));
    console.log(bold(blue('\n🔄 Ejecutando migraciones al esquema...')));

    // Aplicar migraciones usando la carpeta de migraciones existente
    await migrate(db, { migrationsFolder: './migrations' });

    console.log(green('✅ Esquema aplicado con éxito'));
    console.log(magenta('   La base de datos de producción está lista para ser utilizada'));
    
    // Importamos e inicializamos los datos por defecto usando el storage
    console.log(bold(blue('\n🔄 Inicializando datos por defecto...')));
    
    try {
      const { pgStorage } = await import('./server/pgStorage');
      if (typeof pgStorage.initializeDefaultData === 'function') {
        await pgStorage.initializeDefaultData();
        console.log(green('✅ Datos por defecto inicializados correctamente'));
      } else {
        console.log(yellow('⚠️ No se encontró el método initializeDefaultData en pgStorage'));
        console.log(yellow('   Puede inicializar los datos manualmente más tarde'));
      }
    } catch (error) {
      console.log(yellow('⚠️ No se pudieron inicializar los datos por defecto:'));
      console.log(yellow(`   ${error.message}`));
      console.log(yellow('   Puede inicializar los datos manualmente más tarde'));
    }
    
    console.log(bold(green('\n🎉 Configuración de la base de datos de producción completada')));
    process.exit(0);
  } catch (error) {
    console.log(bold(red('\n❌ Error al configurar la base de datos de producción:')));
    console.log(red(error.message));
    process.exit(1);
  }
}

main().catch(error => {
  console.log(bold(red('\n❌ Error inesperado:')));
  console.log(red(error.message));
  process.exit(1);
});