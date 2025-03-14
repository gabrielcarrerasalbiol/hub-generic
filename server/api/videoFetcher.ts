import axios from 'axios';
import { InsertVideo, Video } from '@shared/schema';
import { storage } from '../storage';
import { 
  searchYouTubeVideos, 
  getYouTubeVideoDetails, 
  convertYouTubeVideoToSchema,
  getChannelVideos,
  getYouTubeChannelDetails,
  convertYouTubeChannelToSchema
} from './youtube';
import { classifyContent } from './openai';
import { classifyContentWithAnthropicClaude } from './anthropic';
import { classifyContentWithGemini } from './gemini';

/**
 * Busca nuevos videos en YouTube relacionados con el Real Madrid 
 * y los categoriza automáticamente usando IA
 * Prioriza contenido en español y de canales con alto índice de visualizaciones
 */
export async function fetchAndProcessNewVideos(maxResults = 15): Promise<{total: number, added: number, error?: string}> {
  try {
    // Términos de búsqueda en español para encontrar videos de Real Madrid
    const searchTerms = [
      "Real Madrid highlights",
      "Real Madrid mejores momentos",
      "Real Madrid goles",
      "Real Madrid análisis",
      "Real Madrid noticias",
      "Real Madrid jugadores",
      "Real Madrid Vinicius",
      "Real Madrid Bellingham",
      "Real Madrid Ancelotti",
      "Real Madrid historia",
      "Real Madrid fichajes",
      "Real Madrid la liga",
      "Real Madrid Champions",
      "Real Madrid resumen partido",
      "Real Madrid entrevistas",
      "Real Madrid rueda de prensa"
    ];
    
    // Seleccionar un término de búsqueda aleatorio para diversificar resultados
    const randomIndex = Math.floor(Math.random() * searchTerms.length);
    const searchQuery = searchTerms[randomIndex];
    
    // Orden aleatorio para variar entre relevancia y visualizaciones
    // viewCount: prioriza videos con más visualizaciones
    // relevance: prioriza videos más relevantes a la búsqueda
    const searchOrders = ['viewCount', 'relevance'];
    const orderIndex = Math.floor(Math.random() * searchOrders.length);
    const selectedOrder = searchOrders[orderIndex];
    
    // Buscar videos en YouTube (con preferencia para español y el orden seleccionado)
    const searchResults = await searchYouTubeVideos(searchQuery, maxResults, '', 'es', selectedOrder);
    if (!searchResults.items || searchResults.items.length === 0) {
      return { total: 0, added: 0, error: "No se encontraron videos" };
    }
    
    // Extraer los IDs de los videos
    const videoIds = searchResults.items
      .filter(item => item.id.videoId)
      .map(item => item.id.videoId as string);
    
    if (videoIds.length === 0) {
      return { total: 0, added: 0, error: "No se encontraron IDs de videos válidos" };
    }
    
    // Obtener detalles completos de los videos
    const videoDetails = await getYouTubeVideoDetails(videoIds);
    if (!videoDetails.items || videoDetails.items.length === 0) {
      return { total: videoIds.length, added: 0, error: "No se pudieron obtener detalles de los videos" };
    }
    
    let addedCount = 0;
    const existingIds = [];
    
    // Obtener categorías una sola vez para todas las clasificaciones
    const availableCategories = await storage.getCategories();
    
    // Definir umbral mínimo de visualizaciones para considerar un video de calidad
    const MIN_VIEW_COUNT = 1000; // Videos con menos de 1000 visualizaciones serán ignorados
    
    // Procesar cada video
    for (const video of videoDetails.items) {
      try {
        // Verificar si el video ya existe en la base de datos
        const existingVideo = await storage.getVideoByExternalId(video.id);
        if (existingVideo) {
          existingIds.push(video.id);
          continue;
        }
        
        // Filtrar videos con pocas visualizaciones
        const viewCount = parseInt(video.statistics.viewCount, 10) || 0;
        if (viewCount < MIN_VIEW_COUNT) {
          console.log(`Ignorando video ${video.id} con solo ${viewCount} visualizaciones`);
          continue;
        }
        
        // Convertir al formato de nuestro esquema
        const videoData = convertYouTubeVideoToSchema(video);
        
        // Clasificar el contenido utilizando IA
        let categories: number[] = [];
        
        // Intentar con diferentes servicios de IA en caso de fallo
        try {
          // Intentar con OpenAI
          const result = await classifyContent(
            videoData.title,
            videoData.description || "",
            availableCategories
          );
          categories = result.categories;
        } catch (openaiError) {
          console.error("Error con OpenAI, intentando con Claude:", openaiError);
          try {
            // Intentar con Anthropic Claude
            const result = await classifyContentWithAnthropicClaude(
              videoData.title,
              videoData.description || "",
              availableCategories
            );
            categories = result.categories;
          } catch (claudeError) {
            console.error("Error con Claude, intentando con Gemini:", claudeError);
            try {
              // Intentar con Google Gemini
              const result = await classifyContentWithGemini(
                videoData.title,
                videoData.description || "",
                availableCategories
              );
              categories = result.categories;
            } catch (geminiError) {
              console.error("Error con Gemini, usando categorización básica:", geminiError);
              // Fallback a categorización básica
              categories = [1]; // Asignar a categoría general por defecto
            }
          }
        }
        
        // Crear el video en la base de datos con las categorías asignadas
        const newVideo: InsertVideo = {
          ...videoData,
          categoryIds: categories.map(id => id.toString()),
          featured: false
        };
        
        await storage.createVideo(newVideo);
        addedCount++;
        
      } catch (error) {
        console.error(`Error procesando video ${video.id}:`, error);
      }
    }
    
    return {
      total: videoDetails.items.length,
      added: addedCount
    };
    
  } catch (error: any) {
    console.error("Error en fetchAndProcessNewVideos:", error);
    return {
      total: 0,
      added: 0,
      error: error.message || "Error desconocido al buscar videos"
    };
  }
}

/**
 * Importa todos los videos de un canal específico de YouTube
 * @param channelId ID o URL del canal de YouTube
 * @param maxResults Número máximo de videos a importar (entre 1 y 50)
 * @returns Objeto con estadísticas de la importación
 */
export async function importChannelVideos(
  channelId: string,
  maxResults = 50
): Promise<{total: number, added: number, channelInfo?: any, error?: string}> {
  try {
    // Validar entrada
    if (!channelId) {
      return { total: 0, added: 0, error: "Se requiere el ID o URL del canal" };
    }
    
    // Obtener información del canal primero para agregar a nuestra base de datos
    let normalizedChannelId = channelId;
    
    // Si es una URL de YouTube, extraer el ID del canal
    if (channelId.includes('youtube.com')) {
      const match = channelId.match(/\/channel\/([^\/\?]+)|\/c\/([^\/\?]+)|\/user\/([^\/\?]+)/);
      if (match) {
        normalizedChannelId = match[1] || match[2] || match[3];
      }
    }
    
    console.log(`Buscando canal con ID: ${normalizedChannelId}`);
    
    // Buscar el canal en YouTube
    const channelDetails = await getYouTubeChannelDetails([normalizedChannelId]);
    if (!channelDetails.items || channelDetails.items.length === 0) {
      return { 
        total: 0, 
        added: 0, 
        error: "No se encontró el canal especificado. Verifica el ID o URL del canal." 
      };
    }
    
    const channelInfo = channelDetails.items[0];
    console.log(`Encontrado canal: ${channelInfo.snippet.title}`);
    
    // Verificar si el canal ya existe en nuestra base de datos, si no, agregarlo
    let channelInDb = await storage.getChannelByExternalId(channelInfo.id);
    if (!channelInDb) {
      const channelData = convertYouTubeChannelToSchema(channelInfo);
      channelInDb = await storage.createChannel(channelData);
      console.log(`Canal agregado a la base de datos: ${channelData.title}`);
    } else {
      console.log(`Canal ya existe en la base de datos: ${channelInDb.title}`);
    }
    
    // Obtener videos del canal
    const channelVideos = await getChannelVideos(channelInfo.id, maxResults);
    if (!channelVideos.items || channelVideos.items.length === 0) {
      return { 
        total: 0, 
        added: 0, 
        channelInfo: channelInDb,
        error: "No se encontraron videos en este canal" 
      };
    }
    
    // Extraer los IDs de los videos
    const videoIds = channelVideos.items
      .filter(item => item.id.videoId)
      .map(item => item.id.videoId as string);
    
    if (videoIds.length === 0) {
      return { 
        total: 0, 
        added: 0, 
        channelInfo: channelInDb,
        error: "No se encontraron IDs de videos válidos" 
      };
    }
    
    // Obtener detalles completos de los videos
    const videoDetails = await getYouTubeVideoDetails(videoIds);
    if (!videoDetails.items || videoDetails.items.length === 0) {
      return { 
        total: videoIds.length, 
        added: 0,
        channelInfo: channelInDb,
        error: "No se pudieron obtener detalles de los videos" 
      };
    }
    
    let addedCount = 0;
    const existingIds: string[] = [];
    
    // Obtener categorías una sola vez para todas las clasificaciones
    const availableCategories = await storage.getCategories();
    
    // Definir umbral mínimo de visualizaciones para considerar un video de calidad
    const MIN_VIEW_COUNT = 500; // Videos con menos de 500 visualizaciones serán ignorados
    
    // Procesar cada video
    for (const video of videoDetails.items) {
      try {
        // Verificar si el video ya existe en la base de datos
        const existingVideo = await storage.getVideoByExternalId(video.id);
        if (existingVideo) {
          existingIds.push(video.id);
          continue;
        }
        
        // Filtrar videos con pocas visualizaciones
        const viewCount = parseInt(video.statistics.viewCount, 10) || 0;
        if (viewCount < MIN_VIEW_COUNT) {
          console.log(`Ignorando video ${video.id} con solo ${viewCount} visualizaciones`);
          continue;
        }
        
        // Convertir al formato de nuestro esquema
        const videoData = convertYouTubeVideoToSchema(video);
        
        // Clasificar el contenido con IA utilizando OpenAI, Claude o Gemini
        let categories: number[] = [];
        
        try {
          // Intentar con OpenAI primero
          const result = await classifyContent(
            videoData.title,
            videoData.description || "",
            availableCategories
          );
          categories = result.categories;
        } catch (openaiError) {
          console.error("Error con OpenAI, intentando con Claude:", openaiError);
          try {
            // Intentar con Anthropic Claude
            const result = await classifyContentWithAnthropicClaude(
              videoData.title,
              videoData.description || "",
              availableCategories
            );
            categories = result.categories;
          } catch (claudeError) {
            console.error("Error con Claude, intentando con Gemini:", claudeError);
            try {
              // Intentar con Google Gemini
              const result = await classifyContentWithGemini(
                videoData.title,
                videoData.description || "",
                availableCategories
              );
              categories = result.categories;
            } catch (geminiError) {
              console.error("Error con Gemini, usando categorización básica:", geminiError);
              // Fallback a categorización básica
              categories = [1]; // Asignar a categoría general por defecto
            }
          }
        }
        
        // Crear el video en la base de datos con las categorías asignadas
        const newVideo: InsertVideo = {
          ...videoData,
          categoryIds: categories.map(id => id.toString()),
          featured: false
        };
        
        await storage.createVideo(newVideo);
        addedCount++;
        
      } catch (error) {
        console.error(`Error procesando video ${video.id}:`, error);
      }
    }
    
    return {
      total: videoDetails.items.length,
      added: addedCount,
      channelInfo: channelInDb,
      existingVideos: existingIds.length
    };
    
  } catch (error: any) {
    console.error("Error en importChannelVideos:", error);
    return {
      total: 0,
      added: 0,
      error: error.message || "Error desconocido al importar videos del canal"
    };
  }
}