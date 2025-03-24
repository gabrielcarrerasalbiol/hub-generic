/**
 * Servicio para gestionar las tareas programadas desde el panel de administración
 * Permite activar/desactivar tareas y configurar sus horarios de ejecución
 */

import { storage } from '../storage';
import { log } from '../vite';
import { ScheduledTaskConfig, InsertScheduledTaskConfig } from '@shared/schema';
import { CronJob } from 'cron';
import { executeManualImport } from '../scheduledTasks';

// Mapa global para almacenar los trabajos cron activos
// Esto permite modificar dinámicamente las tareas programadas sin reiniciar el servidor
const activeCronJobs = new Map<string, CronJob>();

/**
 * Obtiene todas las configuraciones de tareas programadas
 * @returns Lista de configuraciones de tareas programadas
 */
export async function getAllScheduledTasks(): Promise<ScheduledTaskConfig[]> {
  try {
    return await storage.getScheduledTasksConfigs();
  } catch (error) {
    log(`Error al obtener las tareas programadas: ${error}`, 'scheduledTasksManager');
    throw new Error('No se pudieron obtener las tareas programadas');
  }
}

/**
 * Obtiene una configuración de tarea programada por su ID
 * @param id ID de la tarea programada
 * @returns Configuración de la tarea programada
 */
export async function getScheduledTaskById(id: number): Promise<ScheduledTaskConfig | undefined> {
  try {
    return await storage.getScheduledTaskConfigById(id);
  } catch (error) {
    log(`Error al obtener la tarea programada con ID ${id}: ${error}`, 'scheduledTasksManager');
    throw new Error(`No se pudo obtener la tarea programada con ID ${id}`);
  }
}

/**
 * Actualiza una configuración de tarea programada
 * @param id ID de la tarea a actualizar
 * @param data Datos actualizados de la tarea
 * @returns Tarea actualizada
 */
export async function updateScheduledTask(
  id: number, 
  data: Partial<InsertScheduledTaskConfig>
): Promise<ScheduledTaskConfig> {
  try {
    // Obtener la tarea existente para comprobar cambios
    const existingTask = await storage.getScheduledTaskConfigById(id);
    if (!existingTask) {
      throw new Error(`No existe una tarea programada con ID ${id}`);
    }

    // Actualizar la tarea en la base de datos
    const updatedTask = await storage.updateScheduledTaskConfig(id, data);
    
    // Si se modificó la expresión cron o el estado, actualizar el trabajo programado
    if (
      updatedTask && 
      (data.cronExpression !== undefined || data.enabled !== undefined)
    ) {
      // Detener el trabajo existente si hay uno
      if (activeCronJobs.has(updatedTask.taskName)) {
        const job = activeCronJobs.get(updatedTask.taskName);
        job?.stop();
        activeCronJobs.delete(updatedTask.taskName);
        log(`Tarea programada ${updatedTask.taskName} detenida`, 'scheduledTasksManager');
      }

      // Si la tarea está habilitada, crear un nuevo trabajo programado
      if (updatedTask.enabled) {
        try {
          // Crear una función específica para esta tarea
          const taskFunction = getTaskFunction(updatedTask.taskName);
          
          // Crear y almacenar el nuevo trabajo programado
          const newJob = new CronJob(
            updatedTask.cronExpression,
            taskFunction,
            null,
            true, // Iniciar automáticamente
            'UTC' // Zona horaria
          );
          
          activeCronJobs.set(updatedTask.taskName, newJob);
          
          // Calcular y actualizar la próxima ejecución
          const nextRun = newJob.nextDate().toJSDate();
          await storage.updateScheduledTaskConfig(id, { nextRun });
          
          log(`Tarea programada ${updatedTask.taskName} configurada para ejecutarse en: ${nextRun}`, 'scheduledTasksManager');
        } catch (cronError) {
          log(`Error al configurar la tarea cron ${updatedTask.taskName}: ${cronError}`, 'scheduledTasksManager');
          throw new Error(`Error al configurar la tarea programada: ${cronError}`);
        }
      }
    }

    return updatedTask;
  } catch (error) {
    log(`Error al actualizar la tarea programada con ID ${id}: ${error}`, 'scheduledTasksManager');
    throw new Error(`No se pudo actualizar la tarea programada: ${error}`);
  }
}

/**
 * Ejecuta manualmente todas las tareas de importación
 * @returns Resultado de la ejecución
 */
export async function executeTasksManually() {
  try {
    log('Iniciando ejecución manual de tareas programadas...', 'scheduledTasksManager');
    
    // Ejecutar la importación manual
    log('Llamando a executeManualImport()...', 'scheduledTasksManager');
    const result = await executeManualImport();
    log(`executeManualImport() completado con éxito. Resultado: ${JSON.stringify(result)}`, 'scheduledTasksManager');
    
    // Actualizar el tiempo de última ejecución para las tareas afectadas
    log('Obteniendo configuraciones de tareas...', 'scheduledTasksManager');
    const tasks = await storage.getScheduledTasksConfigs();
    log(`Encontradas ${tasks.length} configuraciones de tareas`, 'scheduledTasksManager');
    const now = new Date();
    
    // Actualizar lastRun para la tarea de importación diaria
    const dailyImportTask = tasks.find(task => task.taskName === 'import_premium_videos');
    if (dailyImportTask) {
      log(`Actualizando lastRun para tarea import_premium_videos (ID: ${dailyImportTask.id})`, 'scheduledTasksManager');
      await storage.updateScheduledTaskConfig(dailyImportTask.id, { lastRun: now });
    } else {
      log('No se encontró la tarea import_premium_videos', 'scheduledTasksManager');
    }
    
    // Actualizar lastRun para la tarea de actualización parcial
    const partialUpdateTask = tasks.find(task => task.taskName === 'update_videos');
    if (partialUpdateTask) {
      log(`Actualizando lastRun para tarea update_videos (ID: ${partialUpdateTask.id})`, 'scheduledTasksManager');
      await storage.updateScheduledTaskConfig(partialUpdateTask.id, { lastRun: now });
    } else {
      log('No se encontró la tarea update_videos', 'scheduledTasksManager');
    }
    
    log('Ejecución manual de tareas completada con éxito', 'scheduledTasksManager');
    return result;
  } catch (error) {
    log(`Error al ejecutar tareas manualmente: ${error}`, 'scheduledTasksManager');
    throw new Error(`No se pudieron ejecutar las tareas manualmente: ${error}`);
  }
}

/**
 * Devuelve la función adecuada para cada tipo de tarea programada
 * @param taskName Nombre de la tarea
 * @returns Función para ejecutar la tarea
 */
function getTaskFunction(taskName: string): () => Promise<void> {
  // Importar dinámicamente las funciones necesarias
  switch (taskName) {
    case 'import_premium_videos':
    case 'daily_import': // Mantener compatibilidad con nombres anteriores
      return async () => {
        try {
          log('Iniciando tarea programada: Importación diaria completa', 'scheduledTasksManager');
          const result = await executeManualImport();
          log(`Tarea ${taskName} completada: Importados ${result.premiumVideos.added + result.newVideos.added} videos`, 'scheduledTasksManager');
          
          // Actualizar el tiempo de última ejecución
          const tasks = await storage.getScheduledTasksConfigs();
          const taskToUpdate = tasks.find(task => task.taskName === taskName);
          if (taskToUpdate) {
            await storage.updateScheduledTaskConfig(taskToUpdate.id, { lastRun: new Date() });
          }
        } catch (error) {
          log(`Error en tarea programada ${taskName}: ${error}`, 'scheduledTasksManager');
        }
      };
      
    case 'update_videos':
    case 'midday_update': // Mantener compatibilidad con nombres anteriores
      return async () => {
        try {
          log('Iniciando tarea programada: Actualización parcial de mediodía', 'scheduledTasksManager');
          const result = await executeManualImport();
          log(`Tarea ${taskName} completada: Importados ${result.premiumVideos.added} videos de canales premium`, 'scheduledTasksManager');
          
          // Actualizar el tiempo de última ejecución
          const tasks = await storage.getScheduledTasksConfigs();
          const taskToUpdate = tasks.find(task => task.taskName === taskName);
          if (taskToUpdate) {
            await storage.updateScheduledTaskConfig(taskToUpdate.id, { lastRun: new Date() });
          }
        } catch (error) {
          log(`Error en tarea programada ${taskName}: ${error}`, 'scheduledTasksManager');
        }
      };
      
    default:
      return async () => {
        log(`Tarea desconocida: ${taskName}, no se ejecutó ninguna acción`, 'scheduledTasksManager');
      };
  }
}

/**
 * Inicializa las tareas programadas desde la base de datos
 * Esta función debe llamarse al iniciar el servidor
 */
export async function initializeScheduledTasksFromDatabase(): Promise<void> {
  try {
    // Obtener todas las configuraciones de tareas programadas
    const tasks = await storage.getScheduledTasksConfigs();
    
    // Si no hay tareas configuradas, crear las predeterminadas
    if (!tasks || tasks.length === 0) {
      await createDefaultScheduledTasks();
      return;
    }
    
    // Iniciar todas las tareas habilitadas
    for (const task of tasks) {
      if (task.enabled) {
        try {
          const taskFunction = getTaskFunction(task.taskName);
          const job = new CronJob(
            task.cronExpression,
            taskFunction,
            null,
            true,
            'UTC'
          );
          
          activeCronJobs.set(task.taskName, job);
          
          // Actualizar el tiempo de próxima ejecución
          const nextRun = job.nextDate().toJSDate();
          await storage.updateScheduledTaskConfig(task.id, { nextRun });
          
          log(`Tarea programada ${task.taskName} iniciada, próxima ejecución: ${nextRun}`, 'scheduledTasksManager');
        } catch (error) {
          log(`Error al iniciar la tarea ${task.taskName}: ${error}`, 'scheduledTasksManager');
        }
      }
    }
    
    log(`${activeCronJobs.size} tareas programadas iniciadas desde la base de datos`, 'scheduledTasksManager');
  } catch (error) {
    log(`Error al inicializar tareas programadas desde la base de datos: ${error}`, 'scheduledTasksManager');
  }
}

/**
 * Crea las tareas programadas predeterminadas en la base de datos
 */
async function createDefaultScheduledTasks(): Promise<void> {
  try {
    // Tarea de importación diaria completa a las 00:00
    const dailyImportTask: InsertScheduledTaskConfig = {
      taskName: 'import_premium_videos',
      cronExpression: '0 0 0 * * *', // A las 00:00:00 todos los días
      enabled: true,
      description: 'Importación completa diaria de videos',
      maxItemsToProcess: 100,
      createdById: 2, // Asumimos que 2 es el ID de un administrador
      updatedById: 2
    };
    
    // Tarea de actualización parcial a las 12:00
    const middayUpdateTask: InsertScheduledTaskConfig = {
      taskName: 'update_videos',
      cronExpression: '0 0 12 * * *', // A las 12:00:00 todos los días
      enabled: true,
      description: 'Actualización parcial de videos a mediodía',
      maxItemsToProcess: 30,
      createdById: 2,
      updatedById: 2
    };
    
    // Crear las tareas en la base de datos
    const task1 = await storage.createScheduledTaskConfig(dailyImportTask);
    const task2 = await storage.createScheduledTaskConfig(middayUpdateTask);
    
    // Iniciar las tareas programadas
    const task1Function = getTaskFunction(task1.taskName);
    const task2Function = getTaskFunction(task2.taskName);
    
    const job1 = new CronJob(
      task1.cronExpression,
      task1Function,
      null,
      true,
      'UTC'
    );
    
    const job2 = new CronJob(
      task2.cronExpression,
      task2Function,
      null,
      true,
      'UTC'
    );
    
    activeCronJobs.set(task1.taskName, job1);
    activeCronJobs.set(task2.taskName, job2);
    
    // Actualizar los tiempos de próxima ejecución
    await storage.updateScheduledTaskConfig(task1.id, { nextRun: job1.nextDate().toJSDate() });
    await storage.updateScheduledTaskConfig(task2.id, { nextRun: job2.nextDate().toJSDate() });
    
    log('Tareas programadas predeterminadas creadas e iniciadas', 'scheduledTasksManager');
  } catch (error) {
    log(`Error al crear tareas programadas predeterminadas: ${error}`, 'scheduledTasksManager');
    throw new Error(`No se pudieron crear las tareas programadas predeterminadas: ${error}`);
  }
}