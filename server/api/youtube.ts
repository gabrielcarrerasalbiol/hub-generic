import axios from 'axios';
import { InsertVideo, InsertChannel } from '../../shared/schema';

// YouTube API constants
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

interface YouTubeSearchResult {
  items: Array<{
    id: {
      kind: string;
      videoId?: string;
      channelId?: string;
    };
    snippet: {
      title: string;
      description: string;
      channelId: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
  }>;
  nextPageToken?: string;
}

interface YouTubeVideoResult {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      channelId: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

interface YouTubeChannelResult {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
    brandingSettings?: {
      image?: {
        bannerExternalUrl?: string;
      };
    };
    statistics: {
      subscriberCount: string;
      videoCount: string;
    };
  }>;
}

/**
 * Obtiene todos los videos de un canal específico de YouTube
 * @param channelId ID del canal de YouTube
 * @param maxResults Número máximo de resultados a devolver (entre 1 y 50)
 * @param pageToken Token de paginación para obtener la siguiente página de resultados
 * @returns Objeto con los resultados de la búsqueda
 */
export async function getChannelVideos(
  channelId: string,
  maxResults = 50,
  pageToken = ''
): Promise<YouTubeSearchResult> {
  try {
    // Normalizar el canal ID por si se proporciona una URL completa
    let normalizedChannelId = channelId;
    
    // Si es una URL de YouTube, extraer el ID del canal
    if (channelId.includes('youtube.com')) {
      // Extraer de URL del canal (/channel/ID o /c/NOMBRE o /user/NOMBRE)
      const match = channelId.match(/\/channel\/([^\/\?]+)|\/c\/([^\/\?]+)|\/user\/([^\/\?]+)/);
      if (match) {
        normalizedChannelId = match[1] || match[2] || match[3];
      }
    }
    
    // Limitar el número de resultados entre 1 y 50 (limitación de la API de YouTube)
    const limit = Math.min(Math.max(maxResults, 1), 50);
    
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        channelId: normalizedChannelId,
        maxResults: limit,
        pageToken,
        order: 'date', // Ordenar por fecha de publicación (más recientes primero)
        type: 'video',
        relevanceLanguage: 'es', // Preferencia por videos en español
        key: YOUTUBE_API_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('YouTube API channel videos error:', error);
    return { items: [] };
  }
}

/**
 * Search YouTube for Real Madrid related content
 * Con preferencia por contenido en español y de canales populares
 */
export async function searchYouTubeVideos(
  query: string, 
  maxResults = 10, 
  pageToken = '', 
  relevanceLanguage = 'es',
  order = 'relevance'
): Promise<YouTubeSearchResult> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: `Real Madrid ${query}`,
        maxResults,
        pageToken,
        type: 'video',
        relevanceLanguage, // Priorizar videos en español
        order, // Opciones: 'date', 'rating', 'relevance', 'title', 'videoCount', 'viewCount'
        videoDefinition: 'high', // Solo videos de alta definición
        key: YOUTUBE_API_KEY
      }
    });
    
    // Si estamos buscando canales populares (viewCount), el resultado ya viene ordenado
    if (order === 'viewCount') {
      return response.data;
    }
    
    // Para otros tipos de búsqueda, hacemos un procesamiento adicional
    return response.data;
  } catch (error) {
    console.error('YouTube API search error:', error);
    return { items: [] };
  }
}

/**
 * Get video details from YouTube
 * Divide los IDs en grupos de 50 (límite de la API de YouTube) para manejar solicitudes grandes
 */
export async function getYouTubeVideoDetails(videoIds: string[]): Promise<YouTubeVideoResult> {
  try {
    // YouTube API limita a 50 IDs por solicitud, dividir en lotes si es necesario
    const MAX_IDS_PER_REQUEST = 50;
    let allItems: YouTubeVideoResult['items'] = [];
    
    // Procesar en lotes de 50 IDs
    for (let i = 0; i < videoIds.length; i += MAX_IDS_PER_REQUEST) {
      const batchIds = videoIds.slice(i, i + MAX_IDS_PER_REQUEST);
      
      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: batchIds.join(','),
          key: YOUTUBE_API_KEY
        }
      });
      
      if (response.data.items && response.data.items.length > 0) {
        allItems = [...allItems, ...response.data.items];
      }
      
      // Pequeña pausa entre solicitudes para evitar límites de tasa de la API
      if (videoIds.length > MAX_IDS_PER_REQUEST && i + MAX_IDS_PER_REQUEST < videoIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return { items: allItems };
  } catch (error) {
    console.error('YouTube API video details error:', error);
    return { items: [] };
  }
}

/**
 * Get channel details from YouTube
 * Divide los IDs en grupos de 50 (límite de la API de YouTube) para manejar solicitudes grandes
 */
export async function getYouTubeChannelDetails(channelIds: string[]): Promise<YouTubeChannelResult> {
  try {
    // YouTube API limita a 50 IDs por solicitud, dividir en lotes si es necesario
    const MAX_IDS_PER_REQUEST = 50;
    let allItems: YouTubeChannelResult['items'] = [];
    
    // Procesar en lotes de 50 IDs
    for (let i = 0; i < channelIds.length; i += MAX_IDS_PER_REQUEST) {
      const batchIds = channelIds.slice(i, i + MAX_IDS_PER_REQUEST);
      
      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
        params: {
          part: 'snippet,statistics,brandingSettings',
          id: batchIds.join(','),
          key: YOUTUBE_API_KEY
        }
      });
      
      if (response.data.items && response.data.items.length > 0) {
        allItems = [...allItems, ...response.data.items];
      }
      
      // Pequeña pausa entre solicitudes para evitar límites de tasa de la API
      if (channelIds.length > MAX_IDS_PER_REQUEST && i + MAX_IDS_PER_REQUEST < channelIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return { items: allItems };
  } catch (error) {
    console.error('YouTube API channel details error:', error);
    return { items: [] };
  }
}

/**
 * Convert YouTube video to our schema format
 */
export function convertYouTubeVideoToSchema(
  video: YouTubeVideoResult['items'][0], 
  categoryIds: number[] = []
): InsertVideo {
  // Parse ISO 8601 duration
  const parseDuration = (isoDuration: string): string => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match && match[1]) ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = (match && match[2]) ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = (match && match[3]) ? parseInt(match[3].replace('S', '')) : 0;

    let durationString = '';
    if (hours > 0) durationString += `${hours}:`;
    durationString += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return durationString;
  };

  return {
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnailUrl: video.snippet.thumbnails.high.url,
    videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    platform: 'YouTube',
    channelId: video.snippet.channelId,
    channelTitle: video.snippet.channelTitle,
    channelThumbnail: '', // This requires a separate API call to get channel details
    viewCount: parseInt(video.statistics.viewCount, 10) || 0,
    duration: parseDuration(video.contentDetails.duration),
    publishedAt: video.snippet.publishedAt,
    categoryIds: categoryIds.map(id => id.toString()),
    externalId: video.id
  };
}

/**
 * Convert YouTube channel to our schema format
 */
export function convertYouTubeChannelToSchema(channel: YouTubeChannelResult['items'][0]): InsertChannel {
  return {
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails.high.url,
    bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || '',
    platform: 'YouTube',
    externalId: channel.id,
    subscriberCount: parseInt(channel.statistics.subscriberCount, 10) || 0,
    videoCount: parseInt(channel.statistics.videoCount, 10) || 0,
  };
}
