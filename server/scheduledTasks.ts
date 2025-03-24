/**
 * Sistema de tareas programadas para Hub Madridista
 * 
 * Permite ejecutar tareas de mantenimiento y actualización de forma automática
 * en horarios específicos sin intervención manual.
 * 
 * Las tareas incluyen:
 * - Importación automática de videos de canales premium
 * - Búsqueda e importación de nuevos videos relevantes
 * - Recategorización de videos sin categoría
 * - Generación de resúmenes para videos sin resumen
 */

import { CronJob } from 'cron';
import { log } from './vite';
import { storage } from './storage';
import { fetchAndProcessNewVideos } from './api/videoFetcher';
import { importPremiumChannelsVideos } from './api/videoFetcher';
// Importamos directamente de los archivos individuales
import { AIService } from './services/aiService';
import { recategorizeAllVideos } from './api/categoryUpdater';
// Comentamos temporalmente para evitar errores de circular imports
// import { initializeScheduledTasksFromDatabase } from './api/scheduledTasksManager';

// Variables para almacenar las tareas programadas activas
let nightlyImportJob: CronJob | null = null;
let middayUpdateJob: CronJob | null = null;

/**
 * Configura e inicia las tareas programadas
 */
export function setupScheduledTasks(): void {
  log('Configurando tareas programadas...', 'scheduledTasks');
  
  // Configurar las tareas predeterminadas sin intentar cargar desde la BD por ahora
  // Después agregaremos la funcionalidad para cargar desde la BD
  setupDefaultScheduledTasks();
  log('Tareas programadas configuradas correctamente', 'scheduledTasks');
}

/**
 * Configura las tareas programadas predeterminadas si no se pueden cargar desde la base de datos
 */
function setupDefaultScheduledTasks(): void {
  try {
    // Importación completa nocturna a las 00:00 UTC
    nightlyImportJob = new CronJob(
      '0 0 0 * * *', // A las 00:00:00 todos los días (medianoche)
      executeNightlyTasks,
      null,
      true,
      'UTC'
    );
    
    // Actualización parcial a las 12:00 UTC
    middayUpdateJob = new CronJob(
      '0 0 12 * * *', // A las 12:00:00 todos los días (mediodía)
      executePartialUpdate,
      null,
      true,
      'UTC'
    );
    
    log('Tareas programadas predeterminadas configuradas correctamente', 'scheduledTasks');
    log(`Próxima importación completa: ${nightlyImportJob.nextDate().toJSDate()}`, 'scheduledTasks');
    log(`Próxima actualización parcial: ${middayUpdateJob.nextDate().toJSDate()}`, 'scheduledTasks');
  } catch (error) {
    log(`Error al configurar tareas programadas predeterminadas: ${error}`, 'scheduledTasks');
  }
}

/**
 * Ejecuta todas las tareas nocturnas programadas
 */
async function executeNightlyTasks(): Promise<void> {
  log('Iniciando tareas nocturnas programadas', 'scheduledTasks');
  
  try {
    // 1. Importar videos de canales premium
    const premiumResult = await importPremiumChannelsVideos(50);
    log(`Importados ${premiumResult.addedVideos} videos premium de ${premiumResult.processedChannels} canales`, 'scheduledTasks');
    
    // 2. Buscar e importar nuevos videos
    const newVideosResult = await fetchAndProcessNewVideos(30);
    log(`Importados ${newVideosResult.added} videos nuevos de ${newVideosResult.total} encontrados`, 'scheduledTasks');
    
    // 3. Recategorizar videos sin categoría
    const recategorizeResult = await recategorizeAllVideos();
    log(`Recategorizados ${recategorizeResult.success} de ${recategorizeResult.total} videos`, 'scheduledTasks');
    
    // 4. Generar resúmenes para videos sin resumen (temporalmente deshabilitado)
    // const summaryResult = await AIService.generateSummariesForVideosWithoutSummary(30);
    // log(`Generados ${summaryResult.success} de ${summaryResult.total} resúmenes de videos`, 'scheduledTasks');
    
    log('Tareas nocturnas completadas exitosamente', 'scheduledTasks');
  } catch (error) {
    log(`Error al ejecutar tareas nocturnas: ${error}`, 'scheduledTasks');
  }
}

/**
 * Ejecuta una actualización parcial a media día
 * Solo busca nuevos videos, sin realizar tareas intensivas de procesamiento
 */
async function executePartialUpdate(): Promise<void> {
  log('Iniciando actualización parcial programada', 'scheduledTasks');
  
  try {
    // 1. Importar videos de canales premium
    const premiumResult = await importPremiumChannelsVideos(20);
    log(`Importados ${premiumResult.addedVideos} videos premium de ${premiumResult.processedChannels} canales`, 'scheduledTasks');
    
    // 2. Buscar e importar solo algunos videos nuevos
    const newVideosResult = await fetchAndProcessNewVideos(15);
    log(`Importados ${newVideosResult.added} videos nuevos de ${newVideosResult.total} encontrados`, 'scheduledTasks');
    
    log('Actualización parcial completada exitosamente', 'scheduledTasks');
  } catch (error) {
    log(`Error al ejecutar actualización parcial: ${error}`, 'scheduledTasks');
  }
}

/**
 * Ejecuta una importación manual desde código
 * Esta función puede ser llamada desde las rutas API para pruebas
 */
export async function executeManualImport(): Promise<{
  premiumVideos: { total: number, added: number, channels: number },
  newVideos: { total: number, added: number }
}> {
  log('Iniciando importación manual solicitada por administrador', 'scheduledTasks');
  
  try {
    // 1. Importar videos de canales premium
    const premiumResult = await importPremiumChannelsVideos(25);
    
    // 2. Buscar e importar nuevos videos
    const newVideosResult = await fetchAndProcessNewVideos(20);
    
    log('Importación manual completada exitosamente', 'scheduledTasks');
    
    return {
      premiumVideos: {
        total: premiumResult.totalVideos,
        added: premiumResult.addedVideos,
        channels: premiumResult.processedChannels
      },
      newVideos: newVideosResult
    };
  } catch (error) {
    log(`Error al ejecutar importación manual: ${error}`, 'scheduledTasks');
    throw new Error(`Error al ejecutar importación manual: ${error}`);
  }
}