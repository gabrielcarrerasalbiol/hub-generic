import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pg;

// Determina el entorno
const isProduction = process.env.NODE_ENV === 'production';

// Elige la URL de la base de datos según el entorno
const databaseUrl = isProduction 
  ? process.env.PROD_DATABASE_URL || process.env.DATABASE_URL // Usa PROD_DATABASE_URL para producción, con fallback a DATABASE_URL
  : process.env.DATABASE_URL;

console.log(`Modo de la aplicación: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);

if (!databaseUrl) {
  throw new Error("ERROR: URL de base de datos no definida en variables de entorno");
}

// Configura el pool de conexiones con PostgreSQL
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Configura el schema de la base de datos según el entorno o la variable SCHEMA_NAME
const schemaName = process.env.SCHEMA_NAME || (isProduction ? 'production' : 'public');
console.log(`Usando el schema ${schemaName} de la base de datos`);

// Crea una instancia de Drizzle ORM
export const db = drizzle(pool, { schema });

// Configura el schema en tiempo de ejecución (siempre que se defina un schema distinto a public)
if (schemaName !== 'public') {
  // Establecer el schema específico
  pool.query(`SET search_path TO ${schemaName};`).catch(err => {
    console.error(`Error al establecer el schema ${schemaName}:`, err);
  });
}

// Exporta la función para inicializar la base de datos
export async function initDb() {
  try {
    console.log(`Verificando conexión con la base de datos (${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'})...`);
    const result = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a PostgreSQL:', result.rows[0].now);
    
    return true;
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error);
    throw error;
  }
}