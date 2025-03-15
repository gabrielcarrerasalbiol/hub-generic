import { storage } from "../storage";
import { AIService } from "../services/aiService";
import { Video, Category } from "../../shared/schema";

/**
 * Recategoriza un video existente usando IA
 * Usa el servicio centralizado AIService que maneja el fallback automáticamente
 */
export async function recategorizeVideo(videoId: number): Promise<boolean> {
  try {
    // Delegamos la recategorización al servicio centralizado de IA
    const success = await AIService.recategorizeVideo(videoId);
    return success;
  } catch (error) {
    console.error(`Error recategorizing video ${videoId}:`, error);
    return false;
  }
}

/**
 * Recategoriza todos los videos existentes
 * Usa el servicio centralizado AIService para procesar cada video
 */
export async function recategorizeAllVideos(): Promise<{total: number, success: number}> {
  try {
    // Obtener todos los videos, aumentamos el límite a 1000 para incluir más contenido
    const videos = await storage.getVideos(1000);
    let successCount = 0;
    
    console.log(`Recategorizando ${videos.length} videos con el servicio AIService mejorado...`);
    
    // Procesar cada video de manera secuencial para evitar sobrecarga de la API
    for (const video of videos) {
      try {
        const success = await AIService.recategorizeVideo(video.id);
        if (success) {
          successCount++;
          // Log cada 10 videos para no saturar la consola
          if (successCount % 10 === 0) {
            console.log(`Progreso: ${successCount}/${videos.length} videos recategorizados correctamente`);
          }
        }
      } catch (error) {
        console.error(`Error recategorizando video ${video.id}:`, error);
      }
    }
    
    console.log(`Proceso de recategorización completado: ${successCount}/${videos.length} exitosos`);
    
    return {
      total: videos.length,
      success: successCount
    };
  } catch (error) {
    console.error("Error en el proceso de recategorización:", error);
    return {
      total: 0,
      success: 0
    };
  }
}