import axios from 'axios';
import { storage } from "../storage";
import { Video } from "../../shared/schema";

/**
 * Verifica si un video de YouTube está disponible
 * @param videoId ID externo del video de YouTube
 */
export async function isYouTubeVideoAvailable(videoId: string): Promise<boolean> {
  try {
    // Consulta la API de YouTube para obtener la información del video
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=status&key=${process.env.YOUTUBE_API_KEY}`
    );
    
    // Si no hay items, el video no existe o no está disponible
    if (!response.data.items || response.data.items.length === 0) {
      return false;
    }
    
    // Verificamos si el video es "embeddable" (se puede incrustar)
    const videoStatus = response.data.items[0].status;
    if (videoStatus && videoStatus.embeddable === false) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error verificando disponibilidad de video YouTube ${videoId}:`, error);
    // Asumimos que no está disponible si hay un error
    return false;
  }
}

/**
 * Verifica la disponibilidad de un video según su plataforma
 */
export async function isVideoAvailable(video: Video): Promise<boolean> {
  try {
    switch(video.platform.toLowerCase()) {
      case 'youtube':
        return await isYouTubeVideoAvailable(video.externalId);
      
      // Aquí podríamos agregar más plataformas en el futuro
      case 'tiktok':
        // Implementación para TikTok
        return true; // Stub por ahora
        
      case 'twitter':
        // Implementación para Twitter
        return true; // Stub por ahora
        
      case 'instagram':
        // Implementación para Instagram
        return true; // Stub por ahora
        
      default:
        console.warn(`No hay implementación para verificar videos de: ${video.platform}`);
        return true; // Asumimos disponible si no sabemos cómo verificar
    }
  } catch (error) {
    console.error(`Error verificando disponibilidad del video ${video.id}:`, error);
    return false;
  }
}

/**
 * Verifica todos los videos en la plataforma y elimina los no disponibles
 * @returns Objeto con estadísticas de la operación
 */
export async function cleanupUnavailableVideos(): Promise<{
  total: number;
  checked: number;
  removed: number;
  available: number;
  errors: number;
}> {
  const stats = {
    total: 0,
    checked: 0,
    removed: 0,
    available: 0,
    errors: 0
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
        const isAvailable = await isVideoAvailable(video);
        
        if (!isAvailable) {
          // El video no está disponible, lo eliminamos
          // Nota: En una implementación real, probablemente querríamos
          // tener un flag "isAvailable" en lugar de eliminar directamente
          await storage.deleteVideo(video.id);
          stats.removed++;
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
    console.error('Error en la limpieza general de videos:', error);
    throw error;
  }
}