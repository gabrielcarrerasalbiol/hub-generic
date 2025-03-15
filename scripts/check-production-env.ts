/**
 * Script para verificar la configuración del entorno de producción
 * Comprueba las variables de entorno necesarias y la conexión a la base de datos
 */

import dotenv from 'dotenv';
import fs from 'fs';
import { bold, red, green, yellow, blue, cyan, magenta } from './colorUtils';
import pkg from 'pg';
const { Client } = pkg;

// Cargar variables de entorno de producción
dotenv.config({ path: '.env.production' });

// Definir categorías de variables de entorno
interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  category: 'database' | 'auth' | 'api' | 'url' | 'mail' | 'general';
}

// Variables críticas que deben estar definidas
const criticalEnvVars: EnvVariable[] = [
  { name: 'PROD_DATABASE_URL', required: true, description: 'URL de conexión a la base de datos de producción', category: 'database' },
  { name: 'PORT', required: true, description: 'Puerto para la aplicación', category: 'general' },
  { name: 'NODE_ENV', required: true, description: 'Entorno de ejecución (debe ser production)', category: 'general' },
  { name: 'JWT_SECRET', required: true, description: 'Secreto para generar tokens JWT', category: 'auth' },
  { name: 'SESSION_SECRET', required: true, description: 'Secreto para sesiones', category: 'auth' },
  { name: 'FRONTEND_URL', required: true, description: 'URL del frontend', category: 'url' },
  { name: 'CORS_ALLOWED_ORIGINS', required: true, description: 'Orígenes permitidos para CORS', category: 'url' },
];

// Variables recomendadas pero no críticas
const recommendedEnvVars: EnvVariable[] = [
  { name: 'MAILCHIMP_API_KEY', required: false, description: 'API Key de Mailchimp para newsletter', category: 'mail' },
  { name: 'MAILCHIMP_SERVER', required: false, description: 'Servidor de Mailchimp (ej: us17)', category: 'mail' },
  { name: 'MAILCHIMP_AUDIENCE_ID', required: false, description: 'ID de la audiencia de Mailchimp', category: 'mail' },
  { name: 'GOOGLE_CLIENT_ID', required: false, description: 'Client ID de Google para OAuth', category: 'auth' },
  { name: 'GOOGLE_CLIENT_SECRET', required: false, description: 'Client Secret de Google para OAuth', category: 'auth' },
  { name: 'CALLBACK_URL', required: false, description: 'URL de callback para OAuth', category: 'url' },
  { name: 'ANTHROPIC_API_KEY', required: false, description: 'API Key de Anthropic (Claude AI)', category: 'api' },
  { name: 'GEMINI_API_KEY', required: false, description: 'API Key de Google Gemini', category: 'api' },
  { name: 'OPENAI_API_KEY', required: false, description: 'API Key de OpenAI', category: 'api' },
  { name: 'RATE_LIMIT_WINDOW_MS', required: false, description: 'Ventana de tiempo para rate limiting (ms)', category: 'general' },
  { name: 'RATE_LIMIT_MAX_REQUESTS', required: false, description: 'Máximo de solicitudes permitidas en la ventana', category: 'general' },
];

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

// Verificar variables críticas
function checkCriticalVars(): boolean {
  console.log(bold(blue('\n🔍 Verificando variables de entorno críticas')));
  
  let allPresent = true;
  
  for (const envVar of criticalEnvVars) {
    const value = process.env[envVar.name];
    
    if (!value) {
      console.log(red(`❌ Falta la variable ${bold(envVar.name)}: ${envVar.description}`));
      allPresent = false;
    } else {
      if (envVar.name === 'NODE_ENV' && value !== 'production') {
        console.log(yellow(`⚠️ ${bold(envVar.name)} debe ser 'production', valor actual: '${value}'`));
        allPresent = false;
      } else {
        console.log(green(`✅ ${bold(envVar.name)} está configurada`));
      }
    }
  }
  
  return allPresent;
}

// Verificar variables recomendadas
function checkRecommendedVars(): void {
  console.log(bold(blue('\n🔍 Verificando variables de entorno recomendadas')));
  
  for (const envVar of recommendedEnvVars) {
    const value = process.env[envVar.name];
    
    if (!value) {
      console.log(yellow(`⚠️ Recomendado: ${bold(envVar.name)}: ${envVar.description}`));
    } else {
      console.log(green(`✅ ${bold(envVar.name)} está configurada`));
    }
  }
}

// Verificar conexión a la base de datos
async function checkDatabaseConnection(): Promise<boolean> {
  console.log(bold(blue('\n🔍 Verificando conexión a la base de datos de producción')));
  
  const dbUrl = process.env.PROD_DATABASE_URL;
  
  if (!dbUrl) {
    console.log(red('❌ No se puede verificar la conexión: PROD_DATABASE_URL no está definida'));
    return false;
  }
  
  const client = new Client({
    connectionString: dbUrl,
  });
  
  try {
    await client.connect();
    console.log(green('✅ Conexión exitosa a la base de datos de producción'));
    
    // Verificar si existen las tablas principales
    const { rows } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = rows.map(row => row.table_name);
    const requiredTables = ['users', 'videos', 'channels', 'categories'];
    
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length === 0) {
      console.log(green('✅ Todas las tablas principales existen en la base de datos'));
    } else {
      console.log(yellow(`⚠️ Faltan algunas tablas en la base de datos: ${missingTables.join(', ')}`));
      console.log('   Ejecuta ./setup-production-db.sh para configurar el esquema de la base de datos');
    }
    
    await client.end();
    return true;
  } catch (error: any) {
    console.log(red('❌ Error al conectar con la base de datos:'));
    console.log(red(`   ${error.message}`));
    
    if (error.message.includes('connection refused')) {
      console.log(yellow('   Posible causa: El servidor de base de datos no está accesible'));
    } else if (error.message.includes('password authentication failed')) {
      console.log(yellow('   Posible causa: Credenciales incorrectas en PROD_DATABASE_URL'));
    } else if (error.message.includes('does not exist')) {
      console.log(yellow('   Posible causa: La base de datos no existe, debe crearla primero'));
    }
    
    await client.end();
    return false;
  }
}

// Mostrar resumen por categorías
function showCategorySummary(): void {
  console.log(bold(blue('\n📊 Resumen por categoría')));
  
  const categories = {
    database: { title: 'Base de datos', color: magenta },
    auth: { title: 'Autenticación', color: cyan },
    api: { title: 'APIs externas', color: yellow },
    url: { title: 'URLs y direcciones', color: green },
    mail: { title: 'Correo y comunicación', color: blue },
    general: { title: 'Configuración general', color: magenta }
  };
  
  const allVars = [...criticalEnvVars, ...recommendedEnvVars];
  
  for (const [catKey, category] of Object.entries(categories)) {
    const vars = allVars.filter(v => v.category === catKey);
    const configuredVars = vars.filter(v => process.env[v.name]);
    
    console.log(category.color(`${category.title}: ${configuredVars.length}/${vars.length} configuradas`));
    
    const missingCritical = vars
      .filter(v => v.required && !process.env[v.name])
      .map(v => v.name);
    
    if (missingCritical.length > 0) {
      console.log(red(`  ❌ Faltantes críticas: ${missingCritical.join(', ')}`));
    }
    
    const missingRecommended = vars
      .filter(v => !v.required && !process.env[v.name])
      .map(v => v.name);
    
    if (missingRecommended.length > 0) {
      console.log(yellow(`  ⚠️ Recomendadas sin configurar: ${missingRecommended.join(', ')}`));
    }
  }
}

// Función principal
async function main() {
  console.log(bold(cyan('==========================================================='))); 
  console.log(bold(cyan('🔍 VERIFICACIÓN DEL ENTORNO DE PRODUCCIÓN - HUB MADRIDISTA')));
  console.log(bold(cyan('==========================================================='))); 
  
  let success = true;
  
  // Verificar archivo .env.production
  if (!checkEnvFile()) {
    return process.exit(1);
  }
  
  // Verificar variables críticas
  if (!checkCriticalVars()) {
    console.log(red('\n❌ Faltan variables de entorno críticas. Verifica el archivo .env.production'));
    success = false;
  }
  
  // Verificar variables recomendadas
  checkRecommendedVars();
  
  // Verificar conexión a la base de datos
  if (!(await checkDatabaseConnection())) {
    console.log(red('\n❌ No se pudo conectar a la base de datos. Verifica la configuración.'));
    success = false;
  }
  
  // Mostrar resumen por categorías
  showCategorySummary();
  
  console.log(bold(cyan('\n==========================================================='))); 
  
  if (success) {
    console.log(bold(green('\n✅ VERIFICACIÓN COMPLETADA CON ÉXITO')));
    console.log(green('El entorno de producción está correctamente configurado'));
    return process.exit(0);
  } else {
    console.log(bold(red('\n❌ VERIFICACIÓN FALLIDA')));
    console.log(red('Por favor, soluciona los problemas indicados antes de continuar'));
    return process.exit(1);
  }
}

// Ejecutar la función principal
main().catch(error => {
  console.error(red('Error inesperado durante la verificación:'));
  console.error(error);
  process.exit(1);
});