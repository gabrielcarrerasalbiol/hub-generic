import axios from 'axios';
import { InsertVideo, Video } from '@shared/schema';
import { storage } from '../storage';
import { searchYouTubeVideos, getYouTubeVideoDetails, convertYouTubeVideoToSchema } from './youtube';
import { classifyContent } from './openai';
import { classifyContentWithAnthropicClaude } from './anthropic';
import { classifyContentWithGemini } from './gemini';

/**
 * Busca nuevos videos en YouTube relacionados con el Real Madrid 
 * y los categoriza automáticamente usando IA
 */
export async function fetchAndProcessNewVideos(maxResults = 15): Promise<{total: number, added: number, error?: string}> {
  try {
    // Términos de búsqueda para encontrar videos de Real Madrid
    const searchTerms = [
      "Real Madrid highlights",
      "Real Madrid goals",
      "Real Madrid analysis",
      "Real Madrid news",
      "Real Madrid players",
      "Real Madrid Vinicius",
      "Real Madrid Bellingham",
      "Real Madrid Ancelotti",
      "Real Madrid history"
    ];
    
    // Seleccionar un término de búsqueda aleatorio para diversificar resultados
    const randomIndex = Math.floor(Math.random() * searchTerms.length);
    const searchQuery = searchTerms[randomIndex];
    
    // Buscar videos en YouTube
    const searchResults = await searchYouTubeVideos(searchQuery, maxResults);
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
    
    // Procesar cada video
    for (const video of videoDetails.items) {
      try {
        // Verificar si el video ya existe en la base de datos
        const existingVideo = await storage.getVideoByExternalId(video.id);
        if (existingVideo) {
          existingIds.push(video.id);
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