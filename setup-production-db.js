/**
 * Script para configurar la base de datos de producción
 * Crea todas las tablas definidas en el esquema en el schema 'production'
 * y configura un usuario administrador
 */

// Establecer NODE_ENV en producción para este script
process.env.NODE_ENV = 'production';

import { db, pool } from './server/db.js';
import { users, categories } from './shared/schema.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno de producción
if (fs.existsSync('.env.production')) {
  dotenv.config({ path: '.env.production' });
  console.log('Variables de entorno de producción cargadas.');
}

async function main() {
  console.log('Iniciando configuración de la base de datos de PRODUCCIÓN...');
  
  try {
    // Asegurarse de que estamos usando el schema de producción
    await pool.query('CREATE SCHEMA IF NOT EXISTS production;');
    await pool.query('SET search_path TO production;');
    console.log('Schema de producción seleccionado.');
    
    // Crear todas las tablas en el schema de producción
    const tables = [
      'users',
      'sessions',
      'oauth_tokens',
      'videos',
      'channels',
      'categories',
      'favorites',
      'channel_subscriptions',
      'notifications',
      'view_history',
      'premium_channels',
      'comments'
    ];
    
    console.log('Creando tablas en el schema de producción...');
    
    // Crear tablas - este enfoque usa SQL directo para crear las tablas
    // basado en las definiciones de Drizzle
    for (const tableName of tables) {
      try {
        // Obtener la definición de la tabla del esquema público
        const result = await pool.query(`
          SELECT column_name, data_type, character_maximum_length, 
                 column_default, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);
        
        if (result.rows.length === 0) {
          console.log(`Tabla ${tableName} no encontrada en el esquema público. Omitiendo.`);
          continue;
        }
        
        // Construir la sentencia CREATE TABLE
        let createTableSQL = `CREATE TABLE IF NOT EXISTS production.${tableName} (\n`;
        const columns = result.rows.map(col => {
          let colDef = `  "${col.column_name}" ${col.data_type}`;
          if (col.character_maximum_length) {
            colDef += `(${col.character_maximum_length})`;
          }
          if (col.column_default) {
            colDef += ` DEFAULT ${col.column_default}`;
          }
          if (col.is_nullable === 'NO') {
            colDef += ' NOT NULL';
          }
          return colDef;
        });
        
        createTableSQL += columns.join(',\n');
        
        // Obtener información de las claves primarias
        const pkResult = await pool.query(`
          SELECT a.attname
          FROM pg_index i
          JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
          WHERE i.indrelid = 'public.${tableName}'::regclass
          AND i.indisprimary;
        `);
        
        if (pkResult.rows.length > 0) {
          const pkColumns = pkResult.rows.map(row => `"${row.attname}"`).join(', ');
          createTableSQL += `,\n  PRIMARY KEY (${pkColumns})`;
        }
        
        createTableSQL += '\n);';
        
        // Crear la tabla
        await pool.query(createTableSQL);
        console.log(`Tabla ${tableName} creada en el schema production.`);
        
        // Copiar las secuencias si existen
        try {
          const seqResult = await pool.query(`
            SELECT pg_get_serial_sequence('public.${tableName}', 'id') AS seq_name;
          `);
          
          if (seqResult.rows[0]?.seq_name) {
            const seqName = seqResult.rows[0].seq_name.replace('public.', '');
            await pool.query(`
              CREATE SEQUENCE IF NOT EXISTS production.${seqName}
              START WITH 1
              INCREMENT BY 1
              NO MINVALUE
              NO MAXVALUE
              CACHE 1;
            `);
            
            // Establecer la secuencia como default para la columna id
            await pool.query(`
              ALTER TABLE production.${tableName} 
              ALTER COLUMN id SET DEFAULT nextval('production.${seqName}'::regclass);
            `);
            
            console.log(`Secuencia ${seqName} creada para la tabla ${tableName}.`);
          }
        } catch (seqError) {
          console.log(`No se pudo crear la secuencia para ${tableName}: ${seqError.message}`);
        }
        
      } catch (tableError) {
        console.error(`Error al crear la tabla ${tableName}:`, tableError);
      }
    }
    
    // Crear categorías predeterminadas
    console.log('Creando categorías predeterminadas...');
    const defaultCategories = [
      { id: 1, name: 'Partidos', type: 'matches', icon: 'futbol', color: '#1E3A8A', description: 'Partidos completos, resúmenes y mejores momentos.' },
      { id: 2, name: 'Entrenamientos', type: 'training', icon: 'dribbble', color: '#047857', description: 'Sesiones de entrenamiento y preparación física.' },
      { id: 3, name: 'Entrevistas', type: 'interviews', icon: 'mic', color: '#7E22CE', description: 'Entrevistas con jugadores, entrenadores y personal del club.' },
      { id: 4, name: 'Análisis', type: 'analysis', icon: 'chart-line', color: '#B91C1C', description: 'Análisis tácticos y estadísticos de partidos y jugadores.' },
      { id: 5, name: 'Noticias', type: 'news', icon: 'newspaper', color: '#0284C7', description: 'Últimas noticias y actualizaciones del club.' },
      { id: 6, name: 'Historia', type: 'history', icon: 'book', color: '#C2410C', description: 'Documentales y contenido histórico sobre el Real Madrid.' },
      { id: 7, name: 'Fichajes', type: 'transfers', icon: 'exchange-alt', color: '#6D28D9', description: 'Rumores, especulaciones y confirmaciones de fichajes.' },
      { id: 8, name: 'Cantera', type: 'academy', icon: 'graduation-cap', color: '#065F46', description: 'Videos sobre las categorías inferiores y canteranos.' },
      { id: 9, name: 'Afición', type: 'fans', icon: 'users', color: '#CA8A04', description: 'Contenido relacionado con la afición madridista.' },
      { id: 10, name: 'Highlights', type: 'highlights', icon: 'star', color: '#EA580C', description: 'Mejores momentos de jugadores y partidos.' }
    ];
    
    for (const category of defaultCategories) {
      await pool.query(`
        INSERT INTO production.categories (id, name, type, icon, color, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING;
      `, [category.id, category.name, category.type, category.icon, category.color, category.description]);
    }
    console.log('Categorías predeterminadas creadas.');
    
    // Crear usuario administrador
    console.log('Creando usuario administrador...');
    const adminPassword = 'Oldbury2022@'; // Esta contraseña debe cambiarse en producción
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await pool.query(`
      INSERT INTO production.users (
        username, email, password, name, role, verified, profilePicture, 
        google_id, apple_id, created_at, updated_at
      ) VALUES (
        'admin', 'contacto@hubmadridista.com', $1, 'Administrador', 'admin', true, 
        '/hubmadridista.png', null, null, NOW(), NOW()
      )
      ON CONFLICT (username) DO NOTHING;
    `, [hashedPassword]);
    
    console.log('Usuario administrador creado.');
    console.log('Credenciales del administrador:');
    console.log('  Usuario: admin');
    console.log('  Email: contacto@hubmadridista.com');
    console.log('  Contraseña: Oldbury2022@'); // En producción, no imprimir la contraseña
    
    console.log('Configuración de la base de datos de producción completada con éxito.');
  } catch (error) {
    console.error('Error durante la configuración de la base de datos de producción:', error);
    process.exit(1);
  } finally {
    // Cerrar la conexión
    await pool.end();
  }
}

main();