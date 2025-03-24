/**
 * Servicio para integración con la API de Twitch
 * Permite buscar y obtener videos y streams de Twitch relacionados con el Real Madrid
 */

import axios from "axios";
import { InsertVideo, InsertChannel } from "@shared/schema";
import { AIService } from "../services/aiService";

// Variables para propósitos de depuración
let lastTwitchApiCall = '';
let lastTwitchApiResponse = {};
import { storage } from "../storage";
import { processVideoNotifications } from "./notificationService";

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
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error("TWITCH_CLIENT_ID o TWITCH_CLIENT_SECRET no están configurados en las variables de entorno");
      return null;
    }
    
    // Obtener token de acceso usando las credenciales configuradas
    const tokenResponse = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
    );
    
    if (tokenResponse.data && tokenResponse.data.access_token) {
      console.log("Token de acceso para Twitch obtenido correctamente");
      return tokenResponse.data.access_token;
    } else {
      console.error("No se pudo obtener un token de acceso para Twitch");
      return null;
    }
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
    // Para Twitch ampliamos palabras clave para capturar más contenido
    const keywords = [
      "real madrid", "madrid", "bernabeu", "santiago bernabeu", 
      "la liga", "champions", "copa del rey", "kroos", "modric", 
      "vinicius", "bellingham", "ancelotti", "merengue", "chiringuito", 
      "jugones", "directo", "futbol", "liga", "deportes", "pedrerol", "jota",
      "real", "camacho", "florentino", "perez", "valverde", "rodrygo", "nacho",
      "carvajal", "courtois", "mbappe", "lunin", "hala", "endrick", "rudiger",
      "alaba", "militao", "tchouameni", "camavinga", "brahim", "guti", "raul"
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
 * Obtiene detalles de un usuario/canal de Twitch por nombre de login
 * @param login Nombre de login del usuario en Twitch (ej: 'elchiringuitodirectoo')
 * @returns Detalles del usuario si existe, o null si no se encuentra
 */
export async function getTwitchUserDetailsByLogin(login: string): Promise<TwitchUser | null> {
  try {
    const token = await getTwitchAccessToken();
    if (!token) {
      console.error("No se pudo obtener el token de acceso para Twitch");
      return null;
    }
    
    // Limpiar el nombre de usuario - quitar caracteres no válidos y asegurarse de que no tenga prefijo @
    let cleanLogin = login.trim();
    if (cleanLogin.startsWith('@')) {
      cleanLogin = cleanLogin.substring(1);
    }
    
    console.log(`Buscando canal de Twitch con login: "${cleanLogin}"`);
    
    try {
      // Guardamos los datos de la llamada para debugging
      lastTwitchApiCall = `https://api.twitch.tv/helix/users?login=${encodeURIComponent(cleanLogin)}`;
      
      const response = await axios.get(lastTwitchApiCall, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID || '',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Guardar respuesta para debugging
      lastTwitchApiResponse = response.data || {};
      
      console.log("Respuesta de la API de Twitch:", JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      } else {
        console.log(`No se encontró usuario de Twitch con login: ${cleanLogin}`);
        return null;
      }
    } catch (apiError: any) {
      console.error(`Error en la API de Twitch al buscar el login '${cleanLogin}':`, apiError.response?.data || apiError.message);
      
      // Intentar con una búsqueda general si falla la búsqueda por login exacto
      try {
        console.log(`Intentando búsqueda general para '${cleanLogin}'...`);
        const searchUrl = `https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(cleanLogin)}&first=1`;
        lastTwitchApiCall = searchUrl;
        
        const searchResponse = await axios.get(searchUrl, {
          headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID || '',
            'Authorization': `Bearer ${token}`
          }
        });
        
        lastTwitchApiResponse = searchResponse.data || {};
        console.log("Resultado de la búsqueda general:", JSON.stringify(searchResponse.data, null, 2));
        
        if (searchResponse.data && searchResponse.data.data && searchResponse.data.data.length > 0) {
          console.log(`Búsqueda general encontró canal similar: ${searchResponse.data.data[0].display_name}`);
          return searchResponse.data.data[0];
        }
      } catch (searchError) {
        console.error("Error en búsqueda alternativa:", searchError);
      }
      
      return null;
    }
  } catch (error: any) {
    console.error("Error general al obtener detalles del usuario en Twitch:", error.message);
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
  category: number = 1
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
    publishedAt: video.published_at, // Mantener como string, la conversión ocurre en el Storage
    platform: "twitch",
    duration: String(durationInSeconds), // Convertir a string para cumplir con el esquema
    viewCount: video.view_count,
    thumbnailUrl: thumbnailUrl,
    videoUrl: video.url,
    embedUrl: `https://player.twitch.tv/?video=${video.id}&parent=${process.env.TWITCH_PARENT_DOMAIN || 'replit.app'}`,
    language: video.language,
    summary: null,
    categoryIds: [String(category || 1)],
    featured: false,
    featuredOrder: 0,
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
  skipped?: number,
  error?: string
}> {
  try {
    const token = await getTwitchAccessToken();
    if (!token) {
      return {
        total: 0,
        added: 0,
        skipped: 0,
        error: "No se pudo obtener el token de acceso para Twitch"
      };
    }
    
    // Primero verificamos que el canal exista
    const userResponse = await axios.get(`https://api.twitch.tv/helix/users?id=${channelId}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID || '',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!userResponse.data || !userResponse.data.data || userResponse.data.data.length === 0) {
      return {
        total: 0,
        added: 0,
        skipped: 0,
        error: "Canal de Twitch no encontrado"
      };
    }
    
    const userData: TwitchUser = userResponse.data.data[0];
    
    // Verificar si el canal ya existe en nuestra base de datos
    let channelInDb = await storage.getChannelByExternalId(userData.id);
    if (!channelInDb) {
      // Si no existe, lo creamos
      const channelData = convertTwitchChannelToSchema(userData);
      channelInDb = await storage.createChannel(channelData);
      console.log(`Canal de Twitch añadido a la base de datos: ${channelData.title}`);
    } else {
      console.log(`Canal de Twitch ya existe en la base de datos: ${channelInDb.title}`);
    }
    
    // Obtener videos del canal
    const response = await axios.get(`https://api.twitch.tv/helix/videos?user_id=${channelId}&first=${maxResults}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID || '',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.data || !response.data.data || response.data.data.length === 0) {
      return {
        total: 0,
        added: 0,
        skipped: 0,
        error: "No se encontraron videos para este canal"
      };
    }
    
    const videos: TwitchVideo[] = response.data.data;
    console.log(`Se encontraron ${videos.length} videos en el canal de Twitch ${userData.display_name}`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    // Obtener categorías para clasificación IA
    const availableCategories = await storage.getCategories();
    
    // Umbrales para filtrar videos - Reducimos a 10 visualizaciones para ser más inclusivos con Twitch
    const MIN_VIEW_COUNT = 10; // Umbral muy bajo para Twitch
    
    // Procesar cada video
    for (const video of videos) {
      try {
        // Verificar si el video ya existe en la base de datos
        const existingVideo = await storage.getVideoByExternalId(video.id);
        if (existingVideo) {
          skippedCount++;
          continue;
        }
        
        // Para canales específicos, aceptamos todos los videos
        // porque son muy relevantes aunque tengan pocas visualizaciones
        const lowViewChannelExceptions = [
          "elchiringuitodirectoo", "elchiringuitoenvivo", "jugoneslmoficial", 
          "real_madrid_hala", "realmadrid", "real_madrid_tvlive", 
          "real_madrid_vs_huesca2", "real_madridvs_barcelona"
        ];
        
        // Sólo filtramos por visualizaciones si no es uno de los canales de excepción
        if (video.view_count < MIN_VIEW_COUNT && 
            !lowViewChannelExceptions.includes(userData.login.toLowerCase())) {
          console.log(`Ignorando video de Twitch ${video.id} con solo ${video.view_count} visualizaciones`);
          skippedCount++;
          continue;
        }
        
        // Para canales específicos, permitimos todos sus videos
        // sin filtro adicional de palabras clave
        const skipKeywordCheckChannels = [
          "elchiringuitodirectoo", "elchiringuitoenvivo", "jugoneslmoficial",
          "real_madrid_hala", "realmadrid", "real_madrid_tvlive", 
          "real_madrid_vs_huesca2", "real_madridvs_barcelona"
        ];
        
        // Si es uno de los canales de excepción, no hacemos filtrado de palabras clave
        if (skipKeywordCheckChannels.includes(userData.login.toLowerCase())) {
          console.log(`Canal prioritario ${userData.login}: Omitiendo filtro de palabras clave`);
        } else {
          // Filtrar por relevancia: el título o descripción debe contener palabras clave de Real Madrid
          // Para Twitch ampliamos el conjunto de palabras clave para capturar más contenido
          const keywords = [
            "real madrid", "madrid", "bernabeu", "santiago bernabeu", 
            "la liga", "champions", "copa del rey", "kroos", "modric", 
            "vinicius", "bellingham", "ancelotti", "merengue", "chiringuito", 
            "jugones", "directo", "futbol", "liga", "deportes", "pedrerol", "jota",
            "real", "camacho", "florentino", "perez", "valverde", "rodrygo", "nacho",
            "carvajal", "courtois", "mbappe", "lunin", "hala", "endrick", "rudiger",
            "alaba", "militao", "tchouameni", "camavinga", "brahim", "guti", "raul"
          ];
          
          const title = video.title.toLowerCase();
          const desc = video.description?.toLowerCase() || '';
          const isRelevant = keywords.some(keyword => title.includes(keyword) || desc.includes(keyword));
          
          if (!isRelevant) {
            console.log(`Ignorando video no relevante: ${video.title}`);
            skippedCount++;
            continue;
          }
        }
        
        // Este código está duplicado y debe ser eliminado
        // ya que ya se ha manejado en el bloque condicional anterior
        
        // Convertir al formato de esquema
        const videoData = convertTwitchVideoToSchema(video);
        
        // Clasificar contenido con AIService para asignar categorías
        try {
          // Utilizar el servicio AIService centralizado para clasificación
          const classificationResult = await AIService.classifyContent(
            videoData.title,
            videoData.description || "",
            availableCategories
          );
          
          if (classificationResult && classificationResult.categories.length > 0) {
            videoData.categoryIds = classificationResult.categories.map(id => id.toString());
          }
          
        } catch (aiError) {
          console.error("Error clasificando contenido con IA:", aiError);
          // Mantenemos la categoría default (1)
        }
        
        // Crear el video en la base de datos
        const createdVideo = await storage.createVideo(videoData);
        addedCount++;
        
        // Después generamos el resumen usando el ID interno, que es el parámetro que espera generateVideoSummary
        try {
          const summaryResult = await AIService.generateVideoSummary(createdVideo.id);
          
          if (summaryResult && summaryResult.success) {
            console.log(`Resumen generado para video ${createdVideo.id} de Twitch`);
            // No necesitamos hacer nada más aquí, el método ya actualiza la base de datos
          }
          
        } catch (summaryError) {
          console.error("Error generando resumen:", summaryError);
          // El video ya está guardado, continuamos con el procesamiento
        }
        
        // Enviar notificaciones a los suscriptores del canal
        try {
          await processVideoNotifications(createdVideo.id);
        } catch (notificationError) {
          console.error(`Error enviando notificaciones para el video ${createdVideo.id}:`, notificationError);
        }
        
      } catch (error) {
        console.error(`Error procesando video de Twitch ${video.id}:`, error);
      }
    }
    
    return {
      total: videos.length,
      added: addedCount,
      skipped: skippedCount
    };
  } catch (error) {
    console.error("Error al importar videos del canal de Twitch:", error);
    return {
      total: 0,
      added: 0,
      skipped: 0,
      error: "Error al importar videos: " + (error instanceof Error ? error.message : String(error))
    };
  }
}