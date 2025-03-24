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

import { storage } from './storage';
import { CronJob } from 'cron';
import { importPremiumChannelsVideos } from './api/videoFetcher';
import { fetchAndProcessNewVideos } from './api/videoFetcher';
import { recategorizeAllVideos } from './api/categoryUpdater';
import { generateSummariesForAllVideos } from './api/summaryUpdater';
import { log } from './vite';

const MAX_VIDEOS_PER_CHANNEL = 30; // Número máximo de videos a importar por canal
const MAX_SEARCH_RESULTS = 50; // Número máximo de videos a buscar en general

/**
 * Inicializa y programa las tareas automáticas
 */
export function setupScheduledTasks(): void {
  log('Configurando tareas programadas...', 'scheduledTasks');

  // Tarea principal a las 00:00 cada día
  // Formato cron: segundos minutos horas día-del-mes mes día-de-la-semana
  const dailyImportJob = new CronJob(
    '0 0 0 * * *', // A las 00:00:00 todos los días
    executeNightlyTasks,
    null,
    false, // No iniciar automáticamente
    'UTC' // Zona horaria
  );

  // Tarea adicional a las 12:00 cada día para obtener contenido reciente
  const midDayUpdateJob = new CronJob(
    '0 0 12 * * *', // A las 12:00:00 todos los días
    executePartialUpdate,
    null,
    false,
    'UTC'
  );

  // Iniciar las tareas programadas
  dailyImportJob.start();
  midDayUpdateJob.start();

  log('Tareas programadas configuradas correctamente', 'scheduledTasks');
  
  // Mostrar próximas ejecuciones
  log(`Próxima importación completa: ${dailyImportJob.nextDate()}`, 'scheduledTasks');
  log(`Próxima actualización parcial: ${midDayUpdateJob.nextDate()}`, 'scheduledTasks');
}

/**
 * Ejecuta todas las tareas nocturnas programadas
 */
async function executeNightlyTasks(): Promise<void> {
  try {
    log('Iniciando importación automática nocturna...', 'scheduledTasks');
    
    // 1. Importar videos de canales premium (más importantes)
    const premiumImportResult = await importPremiumChannelsVideos(MAX_VIDEOS_PER_CHANNEL);
    log(`Importación de canales premium completada: ${premiumImportResult.addedVideos} de ${premiumImportResult.totalVideos} videos añadidos`, 'scheduledTasks');
    
    // 2. Buscar nuevos videos relacionados con el Real Madrid
    const newVideosResult = await fetchAndProcessNewVideos(MAX_SEARCH_RESULTS);
    log(`Búsqueda de videos completada: ${newVideosResult.added} de ${newVideosResult.total} videos añadidos`, 'scheduledTasks');
    
    // 3. Recategorizar videos sin categoría o con categorías incompletas
    const recategorizationResult = await recategorizeAllVideos();
    log(`Recategorización completada: ${recategorizationResult.success} de ${recategorizationResult.total} videos recategorizados`, 'scheduledTasks');
    
    // 4. Generar resúmenes para videos sin resumen
    const summariesResult = await generateSummariesForAllVideos(100);
    log(`Generación de resúmenes completada: ${summariesResult.success} de ${summariesResult.total} videos actualizados`, 'scheduledTasks');
    
    log('Importación automática nocturna completada con éxito', 'scheduledTasks');
  } catch (error) {
    log(`Error en la importación automática nocturna: ${error}`, 'scheduledTasks');
  }
}

/**
 * Ejecuta una actualización parcial a media día
 * Solo busca nuevos videos, sin realizar tareas intensivas de procesamiento
 */
async function executePartialUpdate(): Promise<void> {
  try {
    log('Iniciando actualización parcial...', 'scheduledTasks');
    
    // Solo buscar nuevos videos relevantes de canales premium
    const premiumImportResult = await importPremiumChannelsVideos(10); // Menos videos que en la actualización nocturna
    log(`Actualización de canales premium completada: ${premiumImportResult.addedVideos} de ${premiumImportResult.totalVideos} videos añadidos`, 'scheduledTasks');
    
    log('Actualización parcial completada con éxito', 'scheduledTasks');
  } catch (error) {
    log(`Error en la actualización parcial: ${error}`, 'scheduledTasks');
  }
}

/**
 * Ejecuta una importación manual desde código
 * Esta función puede ser llamada desde las rutas API para pruebas
 */
export async function executeManualImport(): Promise<{
  premiumVideos: { total: number, added: number },
  newVideos: { total: number, added: number },
}> {
  try {
    log('Iniciando importación manual...', 'scheduledTasks');
    
    // 1. Importar videos de canales premium
    const premiumImportResult = await importPremiumChannelsVideos(MAX_VIDEOS_PER_CHANNEL);
    
    // 2. Buscar nuevos videos relacionados con el Real Madrid
    const newVideosResult = await fetchAndProcessNewVideos(MAX_SEARCH_RESULTS);
    
    log('Importación manual completada con éxito', 'scheduledTasks');
    
    return {
      premiumVideos: {
        total: premiumImportResult.totalVideos,
        added: premiumImportResult.addedVideos
      },
      newVideos: {
        total: newVideosResult.total,
        added: newVideosResult.added
      }
    };
  } catch (error) {
    log(`Error en la importación manual: ${error}`, 'scheduledTasks');
    throw error;
  }
}