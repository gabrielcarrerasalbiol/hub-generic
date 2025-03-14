import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pg;

// Configura el pool de conexiones con PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Crea una instancia de Drizzle ORM
export const db = drizzle(pool, { schema });

// Exporta la función para inicializar la base de datos
export async function initDb() {
  try {
    console.log('Verificando conexión con la base de datos...');
    const result = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a PostgreSQL:', result.rows[0].now);
    
    return true;
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error);
    throw error;
  }
}