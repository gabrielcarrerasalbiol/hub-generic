import { storage } from '../storage';
import { Video } from '@shared/schema';
import { generateVideoSummary } from './gemini';
import { classifyContent } from './openai';

/**
 * Genera un resumen para un video existente utilizando Gemini Pro
 * @param videoId ID del video en la base de datos
 * @returns true si se actualizó correctamente, false en caso contrario
 */
export async function generateSummaryForVideo(videoId: number): Promise<boolean> {
  try {
    // Obtener el video de la base de datos
    const video = await storage.getVideoById(videoId);
    
    if (!video) {
      console.error(`Video con ID ${videoId} no encontrado`);
      return false;
    }
    
    // Si ya tiene un resumen substantivo, no lo regeneramos a menos que se fuerce
    if (video.summary && video.summary.length > 50 && !video.summary.startsWith('Contenido sobre Real Madrid:')) {
      console.log(`El video ${videoId} (${video.title}) ya tiene un resumen adecuado`);
      return true;
    }
    
    // Generar resumen con Gemini
    console.log(`Generando resumen para el video ${videoId}: ${video.title}`);
    const summary = await generateVideoSummary(video.title, video.description || "");
    
    if (!summary) {
      console.error(`No se pudo generar resumen para el video ${videoId}`);
      return false;
    }
    
    // Actualizar el video con el nuevo resumen
    const updated = await storage.updateVideo(videoId, {
      summary
    });
    
    if (!updated) {
      console.error(`Error al actualizar el resumen del video ${videoId}`);
      return false;
    }
    
    console.log(`Resumen actualizado para video ${videoId}: ${summary.substring(0, 100)}...`);
    
    // Intentar recategorizar el video usando el resumen
    await recategorizeVideoUsingNewSummary(video, summary);
    
    return true;
  } catch (error) {
    console.error(`Error generando resumen para video ${videoId}:`, error);
    return false;
  }
}

/**
 * Intenta recategorizar un video utilizando su nuevo resumen
 * para mejorar la precisión de la categorización
 */
async function recategorizeVideoUsingNewSummary(video: Video, summary: string): Promise<boolean> {
  try {
    // Obtener las categorías disponibles
    const availableCategories = await storage.getCategories();
    
    // Si el video ya tiene categorías asignadas, verificamos
    if (!video.categoryIds || video.categoryIds.length === 0 || video.categoryIds.includes('1')) {
      console.log(`Recategorizando video ${video.id} usando el resumen generado`);
      
      // Clasificar el contenido utilizando el título, descripción y resumen
      const result = await classifyContent(
        video.title,
        (video.description || "") + "\n\n" + summary,
        availableCategories
      );
      
      // Si la clasificación es relevante, actualizar las categorías
      if (result.relevance >= 0.7) {
        const categoryIds = result.categories.map(id => id.toString());
        console.log(`Nuevas categorías asignadas para video ${video.id}: ${categoryIds.join(', ')}`);
        
        // Actualizar solo si las categorías son diferentes
        if (!arraysAreEqual(categoryIds, video.categoryIds)) {
          await storage.updateVideo(video.id, {
            categoryIds
          });
          console.log(`Categorías actualizadas para video ${video.id}`);
          return true;
        } else {
          console.log(`Las categorías no cambiaron para video ${video.id}`);
        }
      } else {
        console.log(`Clasificación no relevante para video ${video.id}: ${result.relevance}`);
      }
    } else {
      console.log(`El video ${video.id} ya tiene categorías específicas asignadas: ${video.categoryIds.join(', ')}`);
    }
    
    return false;
  } catch (error) {
    console.error(`Error recategorizando video ${video.id} con nuevo resumen:`, error);
    return false;
  }
}

/**
 * Compara dos arrays para verificar si tienen los mismos elementos
 */
function arraysAreEqual(arr1: string[], arr2: string[] | undefined): boolean {
  if (!arr2) return false;
  if (arr1.length !== arr2.length) return false;
  
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  
  return sorted1.every((value, index) => value === sorted2[index]);
}

/**
 * Genera resúmenes para todos los videos que no tengan uno
 * @param limit Límite de videos a procesar en una sola ejecución (por defecto 100)
 * @returns Estadísticas de la actualización
 */
export async function generateSummariesForAllVideos(limit = 100): Promise<{
  total: number;
  processed: number;
  success: number;
  failed: number;
}> {
  const result = {
    total: 0,
    processed: 0,
    success: 0,
    failed: 0
  };
  
  try {
    // Obtener todos los videos
    const allVideos = await storage.getVideos(1000, 0); // Obtener hasta 1000 videos
    result.total = allVideos.length;
    
    // Filtrar videos sin resumen o con resumen básico
    const videosToProcess = allVideos
      .filter(video => !video.summary || 
              video.summary.length < 50 || 
              video.summary.startsWith('Contenido sobre Real Madrid:'))
      .slice(0, limit); // Limitar la cantidad de videos a procesar
    
    console.log(`Se procesarán ${videosToProcess.length} videos de un total de ${allVideos.length}`);
    
    // Procesar cada video
    for (const video of videosToProcess) {
      result.processed++;
      
      try {
        const success = await generateSummaryForVideo(video.id);
        if (success) {
          result.success++;
        } else {
          result.failed++;
        }
        
        // Esperar un breve tiempo entre solicitudes para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error procesando video ${video.id}:`, error);
        result.failed++;
      }
    }
    
    return result;
    
  } catch (error) {
    console.error("Error en generateSummariesForAllVideos:", error);
    return result;
  }
}