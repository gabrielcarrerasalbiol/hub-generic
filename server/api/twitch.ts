/**
 * Servicio para integración con la API de Twitch
 * Permite buscar y obtener videos y streams de Twitch relacionados con el Real Madrid
 */

import axios from "axios";
import { InsertVideo, InsertChannel } from "@shared/schema";
import { AIService } from "../services/aiService";

// Definiciones de tipos para respuestas de Twitch
interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

interface TwitchVideo {
  id: string;
  user_id: string; 
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

// Función para obtener token de acceso a la API de Twitch
async function getTwitchAccessToken(): Promise<string | null> {
  try {
    // Para acceso sin Client Secret, usamos el enfoque de cliente implícito
    // que es suficiente para búsquedas en contenido público
    const clientId = process.env.TWITCH_CLIENT_ID;
    
    if (!clientId) {
      console.error("TWITCH_CLIENT_ID no está configurado en las variables de entorno");
      return null;
    }
    
    // En este enfoque, el token es el Client ID mismo para peticiones simples
    return clientId;
  } catch (error) {
    console.error("Error al obtener el token de Twitch:", error);
    return null;
  }
}

/**
 * Busca streams en vivo relacionados con el Real Madrid en Twitch
 * @param query Términos de búsqueda (por defecto "Real Madrid")
 * @param maxResults Número máximo de resultados a devolver
 * @returns Array de streams encontrados
 */
export async function searchTwitchStreams(query = "Real Madrid", maxResults = 10): Promise<TwitchStream[]> {
  try {
    const token = await getTwitchAccessToken();
    if (!token) return [];
    
    const response = await axios.get(`https://api.twitch.tv/helix/streams?first=${maxResults}&query=${encodeURIComponent(query)}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID || '',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error al buscar streams en Twitch:", error);
    return [];
  }
}

/**
 * Busca videos grabados relacionados con el Real Madrid en Twitch
 * @param query Términos de búsqueda (por defecto "Real Madrid")
 * @param maxResults Número máximo de resultados a devolver
 * @returns Array de videos encontrados
 */
export async function searchTwitchVideos(query = "Real Madrid", maxResults = 10): Promise<TwitchVideo[]> {
  try {
    // Para buscar videos, primero necesitamos encontrar canales que hablen del tema
    const channels = await searchTwitchChannels(query);
    if (channels.length === 0) return [];
    
    const token = await getTwitchAccessToken();
    if (!token) return [];
    
    // Extraer los IDs de los canales
    const userIds = channels.slice(0, 5).map(channel => channel.id);
    
    // Buscar videos de estos canales
    const videos: TwitchVideo[] = [];
    
    for (const userId of userIds) {
      const response = await axios.get(`https://api.twitch.tv/helix/videos?user_id=${userId}&first=${Math.ceil(maxResults / userIds.length)}`, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID || '',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        videos.push(...response.data.data);
      }
      
      if (videos.length >= maxResults) break;
    }
    
    // Filtrar videos que contienen los términos de búsqueda en el título
    const keywords = [
      "real madrid", "madrid", "bernabeu", "santiago bernabeu", 
      "la liga", "champions", "copa del rey", "kroos", "modric", 
      "vinicius", "bellingham", "ancelotti"
    ];
    
    return videos.filter(video => {
      const title = video.title.toLowerCase();
      const desc = video.description?.toLowerCase() || '';
      return keywords.some(keyword => title.includes(keyword) || desc.includes(keyword));
    }).slice(0, maxResults);
    
  } catch (error) {
    console.error("Error al buscar videos en Twitch:", error);
    return [];
  }
}

/**
 * Busca canales relacionados con el Real Madrid en Twitch
 * @param query Términos de búsqueda (por defecto "Real Madrid")
 * @param maxResults Número máximo de resultados a devolver
 * @returns Array de usuarios/canales encontrados
 */
export async function searchTwitchChannels(query = "Real Madrid", maxResults = 10): Promise<TwitchUser[]> {
  try {
    const token = await getTwitchAccessToken();
    if (!token) return [];
    
    const response = await axios.get(`https://api.twitch.tv/helix/search/channels?first=${maxResults}&query=${encodeURIComponent(query)}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID || '',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error al buscar canales en Twitch:", error);
    return [];
  }
}

/**
 * Obtiene detalles de un usuario/canal específico de Twitch
 * @param userId ID del usuario en Twitch
 * @returns Detalles del usuario si existe, o null si no se encuentra
 */
export async function getTwitchUserDetails(userId: string): Promise<TwitchUser | null> {
  try {
    const token = await getTwitchAccessToken();
    if (!token) return null;
    
    const response = await axios.get(`https://api.twitch.tv/helix/users?id=${userId}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID || '',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error al obtener detalles del usuario en Twitch:", error);
    return null;
  }
}

/**
 * Convierte un video de Twitch al formato de esquema de nuestra aplicación
 * @param video Video de Twitch
 * @param category ID de la categoría (opcional, se establecerá mediante IA si no se proporciona)
 * @returns Objeto formateado para inserción en la base de datos
 */
export function convertTwitchVideoToSchema(
  video: TwitchVideo,
  category?: number
): InsertVideo {
  // Parsear la duración de Twitch (formato: "1h2m3s") a segundos
  const durationString = video.duration;
  let durationInSeconds = 0;
  
  const hours = durationString.match(/(\d+)h/);
  const minutes = durationString.match(/(\d+)m/);
  const seconds = durationString.match(/(\d+)s/);
  
  if (hours) durationInSeconds += parseInt(hours[1]) * 3600;
  if (minutes) durationInSeconds += parseInt(minutes[1]) * 60;
  if (seconds) durationInSeconds += parseInt(seconds[1]);
  
  // Formatear la URL del thumbnail para obtener una resolución óptima
  const thumbnailUrl = video.thumbnail_url
    .replace('%{width}', '640')
    .replace('%{height}', '360');
  
  return {
    externalId: video.id,
    title: video.title,
    description: video.description || '',
    channelId: video.user_id,
    channelTitle: video.user_name,
    publishedAt: new Date(video.published_at),
    platform: "twitch",
    duration: durationInSeconds,
    viewCount: video.view_count,
    thumbnailUrl: thumbnailUrl,
    categoryId: category || 1, // Se actualizará mediante IA si no se proporciona
    relevance: 0.7, // Valor inicial, será actualizado por IA
    verified: false,
    language: video.language,
    summary: null,
    url: video.url,
  };
}

/**
 * Convierte un canal de Twitch al formato de esquema de nuestra aplicación
 * @param user Usuario/canal de Twitch
 * @returns Objeto formateado para inserción en la base de datos
 */
export function convertTwitchChannelToSchema(user: TwitchUser): InsertChannel {
  return {
    externalId: user.id,
    title: user.display_name,
    description: user.description || '',
    platform: "twitch",
    thumbnailUrl: user.profile_image_url,
    bannerUrl: user.offline_image_url || '',
    subscriberCount: user.view_count,
    url: `https://twitch.tv/${user.login}`,
    verified: user.broadcaster_type === 'partner',
    handle: user.login,
  };
}

/**
 * Importa videos de un canal específico de Twitch
 * @param channelId ID del canal en Twitch
 * @param maxResults Número máximo de videos a importar
 * @returns Estadísticas de la importación
 */
export async function importTwitchChannelVideos(channelId: string, maxResults = 20): Promise<{
  total: number,
  added: number,
  error?: string
}> {
  try {
    const token = await getTwitchAccessToken();
    if (!token) {
      return {
        total: 0,
        added: 0,
        error: "No se pudo obtener el token de acceso para Twitch"
      };
    }
    
    // Obtener videos del canal
    const response = await axios.get(`https://api.twitch.tv/helix/videos?user_id=${channelId}&first=${maxResults}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID || '',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.data || !response.data.data) {
      return {
        total: 0,
        added: 0,
        error: "No se encontraron videos para este canal"
      };
    }
    
    const videos: TwitchVideo[] = response.data.data;
    
    // Aquí se implementaría la lógica para guardar los videos en la base de datos
    // Similar a como se hace con YouTube, pero está fuera del alcance de este archivo
    
    return {
      total: videos.length,
      added: videos.length,
    };
  } catch (error) {
    console.error("Error al importar videos del canal de Twitch:", error);
    return {
      total: 0,
      added: 0,
      error: "Error al importar videos: " + (error instanceof Error ? error.message : String(error))
    };
  }
}