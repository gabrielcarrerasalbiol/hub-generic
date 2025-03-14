import { Video } from '@shared/schema';
import { storage } from '../storage';
import { generateVideoSummary } from './gemini';

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

    // Verificar si ya tiene un resumen
    if (video.summary && video.summary.length > 10) {
      console.log(`El video ${videoId} ya tiene un resumen: "${video.summary}"`);
      return true; // Ya tiene un resumen válido
    }

    console.log(`Generando resumen para video ${videoId}: ${video.title}`);
    
    // Generar un resumen utilizando Gemini
    const summary = await generateVideoSummary(
      video.title,
      video.description || ""
    );

    // Actualizar el video en la base de datos
    const updated = await storage.updateVideo(videoId, { summary });
    if (!updated) {
      console.error(`No se pudo actualizar el video ${videoId}`);
      return false;
    }

    console.log(`Resumen generado y actualizado para video ${videoId}: "${summary}"`);
    return true;
  } catch (error) {
    console.error(`Error generando resumen para video ${videoId}:`, error);
    return false;
  }
}

/**
 * Genera resúmenes para todos los videos que no tengan uno
 * @param limit Límite de videos a procesar en una sola ejecución (por defecto 50)
 * @returns Estadísticas de la actualización
 */
export async function generateSummariesForAllVideos(limit = 50): Promise<{
  total: number;
  updated: number;
  skipped: number;
  failed: number;
}> {
  const result = {
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0
  };

  try {
    // Obtener todos los videos (con un límite para no sobrecargar)
    const videos = await storage.getVideos(limit);
    result.total = videos.length;

    if (videos.length === 0) {
      console.log("No hay videos para procesar");
      return result;
    }

    console.log(`Procesando ${videos.length} videos para generar resúmenes`);

    // Procesar cada video
    for (const video of videos) {
      // Si ya tiene un resumen válido, omitirlo
      if (video.summary && video.summary.length > 10) {
        console.log(`Omitiendo video ${video.id} que ya tiene resumen: "${video.summary.substring(0, 30)}..."`);
        result.skipped++;
        continue;
      }

      // Generar y actualizar el resumen
      const success = await generateSummaryForVideo(video.id);
      
      if (success) {
        result.updated++;
      } else {
        result.failed++;
      }

      // Pequeña pausa para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return result;
  } catch (error) {
    console.error("Error generando resúmenes para videos:", error);
    return result;
  }
}