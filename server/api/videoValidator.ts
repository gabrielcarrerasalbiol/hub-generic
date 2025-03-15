import axios from 'axios';
import { storage } from "../storage";
import { Video } from "../../shared/schema";

/**
 * Verifica si un video de YouTube está disponible
 * @param videoId ID externo del video de YouTube
 * @returns Un objeto con información sobre la disponibilidad y la razón
 */
export async function isYouTubeVideoAvailable(videoId: string): Promise<{
  available: boolean;
  reason?: string;
  shouldDelete: boolean;
}> {
  try {
    // Consulta la API de YouTube para obtener la información del video
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=status&key=${process.env.YOUTUBE_API_KEY}`
    );
    
    // Si no hay items, el video no existe o no está disponible
    if (!response.data.items || response.data.items.length === 0) {
      return { 
        available: false, 
        reason: "VIDEO_NOT_FOUND", 
        shouldDelete: true 
      };
    }
    
    // Verificamos si el video es "embeddable" (se puede incrustar)
    const videoStatus = response.data.items[0].status;
    if (videoStatus && videoStatus.embeddable === false) {
      return { 
        available: false, 
        reason: "VIDEO_NOT_EMBEDDABLE",
        shouldDelete: true
      };
    }
    
    // Verificamos el estado de privacidad
    if (videoStatus && videoStatus.privacyStatus && videoStatus.privacyStatus !== "public") {
      return {
        available: false,
        reason: `VIDEO_${videoStatus.privacyStatus.toUpperCase()}`,
        shouldDelete: true
      };
    }
    
    return { available: true, shouldDelete: false };
  } catch (error: any) {
    console.error(`Error verificando disponibilidad de video YouTube ${videoId}:`, error);
    
    // Identificar errores específicos de la API
    if (error.response) {
      // Si es un error relacionado con límites de cuota de la API
      if (error.response.status === 403 && 
          error.response.data && 
          error.response.data.error && 
          (error.response.data.error.errors?.some((e: any) => e.reason === "quotaExceeded") ||
           error.response.data.error.message?.includes("quota"))) {
        return { 
          available: false, 
          reason: "API_QUOTA_EXCEEDED",
          shouldDelete: false // No borrar cuando es un problema de cuota
        };
      }
      
      // Si es un error de autenticación
      if (error.response.status === 401 || error.response.status === 403) {
        return { 
          available: false, 
          reason: "API_AUTH_ERROR",
          shouldDelete: false // No borrar cuando es un problema de autenticación
        };
      }
    }
    
    // Para otros errores de red o desconocidos
    return { 
      available: false, 
      reason: "API_ERROR",
      shouldDelete: false // No borrar cuando hay errores generales de la API
    };
  }
}

/**
 * Verifica la disponibilidad de un video según su plataforma
 * @returns Un objeto con información sobre disponibilidad, razón y si debería eliminarse
 */
export async function isVideoAvailable(video: Video): Promise<{
  available: boolean;
  reason?: string;
  shouldDelete: boolean;
}> {
  try {
    switch(video.platform.toLowerCase()) {
      case 'youtube':
        return await isYouTubeVideoAvailable(video.externalId);
      
      // Aquí podríamos agregar más plataformas en el futuro
      case 'tiktok':
        // Implementación para TikTok
        return { available: true, shouldDelete: false }; // Stub por ahora
        
      case 'twitter':
        // Implementación para Twitter
        return { available: true, shouldDelete: false }; // Stub por ahora
        
      case 'instagram':
        // Implementación para Instagram
        return { available: true, shouldDelete: false }; // Stub por ahora
        
      default:
        console.warn(`No hay implementación para verificar videos de: ${video.platform}`);
        return { 
          available: true, 
          reason: "PLATFORM_NOT_SUPPORTED",
          shouldDelete: false 
        }; // Asumimos disponible si no sabemos cómo verificar
    }
  } catch (error) {
    console.error(`Error verificando disponibilidad del video ${video.id}:`, error);
    return { 
      available: false, 
      reason: "CHECK_ERROR",
      shouldDelete: false 
    };
  }
}

/**
 * Verifica todos los videos en la plataforma y genera un informe de los que pueden ser eliminados
 * @returns Objeto con información sobre los videos a verificar (no elimina ninguno)
 */
export async function checkUnavailableVideos(): Promise<{
  total: number;
  checked: number;
  toDelete: number;
  available: number;
  unavailableButSafe: number;
  errors: number;
  videosToDelete: { id: number; title: string; reason: string }[];
  apiLimitReached: boolean;
}> {
  const stats = {
    total: 0,
    checked: 0,
    toDelete: 0,
    available: 0,
    unavailableButSafe: 0,
    errors: 0,
    videosToDelete: [] as { id: number; title: string; reason: string }[],
    apiLimitReached: false
  };
  
  try {
    // Obtenemos todos los videos
    const videos = await storage.getVideos(1000); // Limitamos a 1000 para evitar problemas
    stats.total = videos.length;
    
    // Procesamos cada video
    for (const video of videos) {
      try {
        stats.checked++;
        
        // Verificamos disponibilidad
        const availability = await isVideoAvailable(video);
        
        if (!availability.available) {
          if (availability.reason === "API_QUOTA_EXCEEDED") {
            stats.apiLimitReached = true;
            console.warn("Límite de API alcanzado durante la verificación de videos");
            break; // Detenemos el proceso para evitar más consumo de cuota
          }
          
          if (availability.shouldDelete) {
            // Este video debe ser eliminado por violación de políticas o no disponibilidad real
            stats.toDelete++;
            stats.videosToDelete.push({
              id: video.id,
              title: video.title,
              reason: availability.reason || "DESCONOCIDO"
            });
          } else {
            // Video no disponible pero no debe eliminarse (problemas de API)
            stats.unavailableButSafe++;
          }
        } else {
          stats.available++;
        }
      } catch (error) {
        console.error(`Error procesando video ${video.id}:`, error);
        stats.errors++;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error en la verificación general de videos:', error);
    throw error;
  }
}

/**
 * Elimina los videos que han sido marcados como no disponibles por razones válidas
 * @param videoIds Lista de IDs de videos a eliminar
 * @returns Estadísticas de la operación
 */
export async function deleteUnavailableVideos(videoIds: number[]): Promise<{
  requested: number;
  deleted: number;
  failed: number;
}> {
  const stats = {
    requested: videoIds.length,
    deleted: 0,
    failed: 0
  };
  
  try {
    for (const videoId of videoIds) {
      try {
        const success = await storage.deleteVideo(videoId);
        if (success) {
          stats.deleted++;
        } else {
          stats.failed++;
        }
      } catch (error) {
        console.error(`Error eliminando video ${videoId}:`, error);
        stats.failed++;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error eliminando videos:', error);
    throw error;
  }
}