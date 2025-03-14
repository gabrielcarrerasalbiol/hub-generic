import { storage } from "../storage";
import { count } from "drizzle-orm";
import { Video, User, categories, channels, videos, viewHistory, users } from "../../shared/schema";
import { db } from "../db";

/**
 * Obtiene un resumen general de las estadísticas del sistema
 */
export async function getStatisticsOverview(): Promise<{
  videoCount: number;
  channelCount: number;
  userCount: number;
  videosLastWeek: number;
  videosLastMonth: number;
}> {
  // Total de videos
  const videoCount = await db.select({ count: count() }).from(videos);
  
  // Total de canales
  const channelCount = await db.select({ count: count() }).from(channels);
  
  // Total de usuarios
  const userCount = await db.select({ count: count() }).from(users);
  
  // Videos de la última semana
  const videosLastWeek = await storage.getVideosAddedInTimeRange(7);
  
  // Videos del último mes
  const videosLastMonth = await storage.getVideosAddedInTimeRange(30);
  
  return {
    videoCount: videoCount[0].count,
    channelCount: channelCount[0].count,
    userCount: userCount[0].count,
    videosLastWeek: videosLastWeek.length,
    videosLastMonth: videosLastMonth.length
  };
}

/**
 * Obtiene estadísticas por categoría
 */
export async function getStatisticsByCategory() {
  return storage.getVideosByCategoryCounts();
}

/**
 * Obtiene estadísticas por plataforma
 */
export async function getStatisticsByPlatform() {
  return storage.getVideosByPlatformCounts();
}

/**
 * Obtiene estadísticas por fecha en un rango de días
 */
export async function getStatisticsByDate(days: number) {
  return storage.getVideosByDateCounts(days);
}

/**
 * Obtiene los canales con más videos
 */
export async function getTopChannelsByVideos(limit: number = 10) {
  return storage.getTopChannelsByVideos(limit);
}

/**
 * Obtiene estadísticas de visualización de videos
 * Implementar según necesidades futuras:
 * - Videos más vistos
 * - Tiempo promedio de visualización
 * - Tasas de finalización
 */
export async function getViewingStatistics() {
  // Pendiente implementación
  return {
    mostViewedVideos: [],
    averageWatchTime: 0,
    completionRate: 0
  };
}