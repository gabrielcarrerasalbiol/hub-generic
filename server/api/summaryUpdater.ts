import { storage } from '../storage';
import { Video } from '@shared/schema';
import { AIService } from '../services/aiService';

/**
 * Genera un resumen para un video existente utilizando el servicio de IA
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
    
    // Generar resumen con el servicio de IA unificado (prioriza DeepSeek)
    console.log(`Generando resumen para el video ${videoId}: ${video.title}`);
    const result = await AIService.generateVideoSummary(videoId);
    
    if (!result.success || !result.summary) {
      console.error(`No se pudo generar resumen para el video ${videoId}`);
      return false;
    }
    
    console.log(`Resumen actualizado para video ${videoId}: ${result.summary.substring(0, 100)}...`);
    console.log(`Idioma detectado: ${result.language}`);
    
    // Intentar recategorizar el video usando el resumen
    await recategorizeVideoUsingNewSummary(video, result.summary);
    
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
      const result = await AIService.classifyContent(
        video.title,
        (video.description || "") + "\n\n" + summary,
        availableCategories
      );
      
      // Si la clasificación es relevante, actualizar las categorías
      if (result.relevance >= 70) { // El nuevo servicio usa 0-100 en lugar de 0-1
        const categoryIds = result.categories.map(id => id.toString());
        console.log(`Nuevas categorías asignadas para video ${video.id}: ${categoryIds.join(', ')}`);
        
        // Actualizar solo si las categorías son diferentes
        if (!arraysAreEqual(categoryIds, video.categoryIds || undefined)) {
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
function arraysAreEqual(arr1: string[], arr2: string[] | undefined | null): boolean {
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
  try {
    console.log(`Generando resúmenes para videos sin contenido usando AIService...`);
    // Usar el método optimizado del servicio de IA
    const result = await AIService.generateSummariesForVideosWithoutSummary(limit);
    
    return {
      total: result.total,
      processed: result.processed,
      success: result.succeeded,
      failed: result.failed
    };
  } catch (error) {
    console.error("Error en generateSummariesForAllVideos:", error);
    return {
      total: 0,
      processed: 0,
      success: 0,
      failed: 0
    };
  }
}