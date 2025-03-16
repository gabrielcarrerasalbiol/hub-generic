import axios from 'axios';
import { InsertVideo, Video, PremiumChannel, Channel, User } from '@shared/schema';
import { storage } from '../storage';
import { 
  searchYouTubeVideos, 
  getYouTubeVideoDetails, 
  convertYouTubeVideoToSchema,
  getChannelVideos,
  getYouTubeChannelDetails,
  convertYouTubeChannelToSchema
} from './youtube';
import {
  searchTwitchVideos,
  convertTwitchVideoToSchema,
  searchTwitchChannels,
  getTwitchUserDetails,
  convertTwitchChannelToSchema,
  importTwitchChannelVideos
} from './twitch';
import { classifyContent } from './openai';
import { classifyContentWithAnthropicClaude } from './anthropic';
import { classifyContentWithGemini, generateVideoSummary } from './gemini';
import { sendNewVideoNotificationEmail } from './emailService';
import { processVideoNotifications } from './notificationService';
import { AIService } from '../services/aiService';

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
        
        // Generar un resumen del video con Gemini y detectar idioma
        let summary = "";
        let language = "en"; // Idioma por defecto
        try {
          console.log("Generando resumen para el video:", videoData.title);
          const summaryResult = await generateVideoSummary(videoData.title, videoData.description || "");
          summary = summaryResult.summary;
          language = summaryResult.language;
          console.log(`Resumen generado: ${summary}`);
          console.log(`Idioma detectado: ${language}`);
          
          // Recategorizar utilizando también el resumen generado
          if (summary) {
            console.log("Mejorando categorización con el resumen generado");
            try {
              const enhancedClassification = await classifyContent(
                videoData.title,
                videoData.description + "\n\n" + summary, // Combinar descripción y resumen para mejor categorización
                availableCategories
              );
              
              // Si la categorización mejorada es relevante, usarla
              if (enhancedClassification.relevance >= 0.7) {
                categories = enhancedClassification.categories;
                console.log("Categorías mejoradas usando resumen:", categories);
              }
            } catch (classifyError) {
              console.error("Error en la recategorización con resumen:", classifyError);
              // Mantener las categorías originales
            }
          }
        } catch (summaryError) {
          console.error("Error generando resumen con Gemini:", summaryError);
          summary = `Contenido sobre Real Madrid: ${videoData.title}`;
        }

        // Crear el video en la base de datos con las categorías asignadas y el resumen
        const newVideo: InsertVideo = {
          ...videoData,
          summary,
          language,
          categoryIds: categories.map(id => id.toString()),
          featured: false,
          isNotified: false // Por defecto, no ha sido notificado aún
        };
        
        // Crear video y obtener el objeto con ID asignado
        const createdVideo = await storage.createVideo(newVideo);
        addedCount++;
        
        // Enviar notificaciones a los suscriptores del canal (solo si no se enviaron previamente)
        try {
          const notificationResult = await processVideoNotifications(createdVideo.id);
          if (notificationResult.alreadyNotified) {
            console.log(`El video ${createdVideo.title} ya había sido notificado anteriormente. Se omiten notificaciones duplicadas.`);
          } else {
            console.log(`Notificaciones enviadas para el video ${createdVideo.title}: ${notificationResult.total} suscriptores, ${notificationResult.emailsSent} emails enviados`);
          }
        } catch (notificationError) {
          console.error(`Error enviando notificaciones para el video ${createdVideo.id}:`, notificationError);
        }
        
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
 * Importa videos de canales recomendados
 * @param maxPerChannel Número máximo de videos a importar por canal
 * @returns Estadísticas de la importación
 */
export async function importRecommendedChannelsVideos(maxPerChannel = 20): Promise<{
  totalChannels: number;
  processedChannels: number;
  totalVideos: number;
  addedVideos: number;
  skippedVideos: number;
  errors: string[];
}> {
  const result = {
    totalChannels: 0,
    processedChannels: 0,
    totalVideos: 0,
    addedVideos: 0,
    skippedVideos: 0,
    errors: [] as string[]
  };

  try {
    // Obtener todos los canales recomendados
    const recommendedChannelsList = await storage.getRecommendedChannelsList();
    result.totalChannels = recommendedChannelsList.length;

    if (recommendedChannelsList.length === 0) {
      result.errors.push("No hay canales recomendados configurados");
      return result;
    }

    // Procesar cada canal recomendado
    for (const recommendedChannel of recommendedChannelsList) {
      try {
        // Obtener información del canal
        const channel = await storage.getChannelById(recommendedChannel.channelId);
        if (!channel) {
          result.errors.push(`Canal con ID ${recommendedChannel.channelId} no encontrado`);
          continue;
        }

        console.log(`Importando videos del canal recomendado: ${channel.title} (${channel.platform})`);
        
        // Importar videos del canal según su plataforma
        let importResult;
        
        if (channel.platform.toLowerCase() === 'youtube') {
          // Para YouTube, usamos el ID externo directamente
          importResult = await importChannelVideos(channel.externalId, maxPerChannel);
        } 
        else if (channel.platform.toLowerCase() === 'twitch') {
          // Para Twitch, usamos la función especializada de importación
          importResult = await importTwitchChannelVideos(channel.externalId, maxPerChannel);
          
          // Si hay error, intentamos completar la importación usando búsqueda alternativa
          if (importResult.error) {
            try {
              console.log(`Intentando método alternativo para canal Twitch: ${channel.title}`);
              // Usamos el handle (nombre de usuario) o título del canal para buscar
              const searchQuery = channel.handle || channel.title;
              const videos = await searchTwitchVideos(`${searchQuery} real madrid`, maxPerChannel);
              
              if (videos && videos.length > 0) {
                console.log(`Se encontraron ${videos.length} videos mediante búsqueda alternativa`);
                
                let addedCount = 0;
                let skippedCount = 0;
                
                // Obtener categorías para clasificación
                const availableCategories = await storage.getCategories();
                
                for (const video of videos) {
                  try {
                    // Verificar si el video ya existe en la base de datos
                    const existingVideo = await storage.getVideoByExternalId(video.id);
                    if (existingVideo) {
                      skippedCount++;
                      continue;
                    }
                    
                    // Convertir al formato de nuestro esquema
                    const videoData = convertTwitchVideoToSchema(video);
                    videoData.isNotified = false; // Asegurarse de que el video no ha sido notificado
                    
                    // Guardar en la base de datos
                    const savedVideo = await storage.createVideo(videoData);
                    addedCount++;
                    
                    // Generar resumen
                    await AIService.generateVideoSummary(savedVideo.id);
                    
                    // Procesar notificaciones
                    try {
                      const notificationResult = await processVideoNotifications(savedVideo.id);
                      if (notificationResult.alreadyNotified) {
                        console.log(`El video ${savedVideo.title} ya había sido notificado. Se omiten notificaciones.`);
                      } else {
                        console.log(`Notificaciones enviadas para el video ${savedVideo.title}: ${notificationResult.total} suscriptores, ${notificationResult.emailsSent} emails`);
                      }
                    } catch (notifError) {
                      console.error(`Error notificando video ${savedVideo.id}:`, notifError);
                    }
                  } catch (videoError) {
                    console.error(`Error procesando video de Twitch: ${videoError}`);
                  }
                }
                
                // Actualizar resultado con los videos encontrados por búsqueda alternativa
                importResult = {
                  total: videos.length,
                  added: addedCount,
                  skipped: skippedCount,
                  error: null
                };
              }
            } catch (twitchError) {
              console.error(`Error en búsqueda alternativa de Twitch: ${twitchError}`);
            }
          }
        }
        // Añadir soporte para otras plataformas según sea necesario
        else {
          importResult = {
            total: 0,
            added: 0,
            skipped: 0,
            error: `Plataforma '${channel.platform}' no soportada para importación automática`
          };
        }

        // Actualizar estadísticas
        if (importResult) {
          result.totalVideos += importResult.total;
          result.addedVideos += importResult.added;
          result.skippedVideos += (importResult.skipped || 0);
          result.processedChannels++;
          
          if (importResult.error) {
            result.errors.push(`Error en canal ${channel.title}: ${importResult.error}`);
          }
        }
      } catch (channelError: any) {
        console.error(`Error procesando canal recomendado #${recommendedChannel.channelId}:`, channelError);
        result.errors.push(`Error en canal #${recommendedChannel.channelId}: ${channelError.message || 'Error desconocido'}`);
      }
    }

    return result;
  } catch (error: any) {
    console.error("Error importando videos de canales recomendados:", error);
    result.errors.push(`Error general: ${error.message || 'Error desconocido'}`);
    return result;
  }
}

/**
 * Importa videos de canales premium
 * @param maxPerChannel Número máximo de videos a importar por canal
 * @returns Estadísticas de la importación
 */
export async function importPremiumChannelsVideos(maxPerChannel = 20): Promise<{
  totalChannels: number;
  processedChannels: number;
  totalVideos: number;
  addedVideos: number;
  skippedVideos: number;
  errors: string[];
}> {
  const result = {
    totalChannels: 0,
    processedChannels: 0,
    totalVideos: 0,
    addedVideos: 0,
    skippedVideos: 0,
    errors: [] as string[]
  };

  try {
    // Obtener todos los canales premium
    const premiumChannels = await storage.getPremiumChannels();
    result.totalChannels = premiumChannels.length;

    if (premiumChannels.length === 0) {
      result.errors.push("No hay canales premium configurados");
      return result;
    }

    // Procesar cada canal premium
    for (const premiumChannel of premiumChannels) {
      try {
        // Obtener información del canal
        const channel = await storage.getChannelById(premiumChannel.channelId);
        if (!channel) {
          result.errors.push(`Canal con ID ${premiumChannel.channelId} no encontrado`);
          continue;
        }

        console.log(`Importando videos del canal premium: ${channel.title} (${channel.platform})`);
        
        // Importar videos del canal según su plataforma
        let importResult;
        
        if (channel.platform.toLowerCase() === 'youtube') {
          // Para YouTube, usamos el ID externo directamente
          importResult = await importChannelVideos(channel.externalId, maxPerChannel);
        } 
        else if (channel.platform.toLowerCase() === 'twitch') {
          // Para Twitch, usamos la función especializada de importación
          importResult = await importTwitchChannelVideos(channel.externalId, maxPerChannel);
          
          // Si hay error, intentamos completar la importación usando búsqueda alternativa
          if (importResult.error) {
            try {
              console.log(`Intentando método alternativo para canal Twitch: ${channel.title}`);
              // Usamos el handle (nombre de usuario) o título del canal para buscar
              const searchQuery = channel.handle || channel.title;
              const videos = await searchTwitchVideos(`${searchQuery} real madrid`, maxPerChannel);
              
              if (videos && videos.length > 0) {
                console.log(`Se encontraron ${videos.length} videos mediante búsqueda alternativa`);
                
                let addedCount = 0;
                let skippedCount = 0;
                
                // Obtener categorías para clasificación
                const availableCategories = await storage.getCategories();
                
                for (const video of videos) {
                  try {
                    // Verificar si el video ya existe en la base de datos
                    const existingVideo = await storage.getVideoByExternalId(video.id);
                    if (existingVideo) {
                      skippedCount++;
                      continue;
                    }
                    
                    // Convertir al formato de nuestro esquema
                    const videoData = convertTwitchVideoToSchema(video);
                    videoData.isNotified = false; // Asegurarse de que el video no ha sido notificado
                    
                    // Guardar en la base de datos
                    const savedVideo = await storage.createVideo(videoData);
                    addedCount++;
                    
                    // Generar resumen
                    await AIService.generateVideoSummary(savedVideo.id);
                    
                    // Procesar notificaciones
                    try {
                      const notificationResult = await processVideoNotifications(savedVideo.id);
                      if (notificationResult.alreadyNotified) {
                        console.log(`El video ${savedVideo.title} ya había sido notificado. Se omiten notificaciones.`);
                      } else {
                        console.log(`Notificaciones enviadas para el video ${savedVideo.title}: ${notificationResult.total} suscriptores, ${notificationResult.emailsSent} emails`);
                      }
                    } catch (notifError) {
                      console.error(`Error notificando video ${savedVideo.id}:`, notifError);
                    }
                  } catch (videoError) {
                    console.error(`Error procesando video de Twitch: ${videoError}`);
                  }
                }
                
                // Actualizar resultado con los videos encontrados por búsqueda alternativa
                importResult = {
                  total: videos.length,
                  added: addedCount,
                  skipped: skippedCount,
                  error: null
                };
              }
            } catch (twitchError) {
              console.error(`Error en búsqueda alternativa de Twitch: ${twitchError}`);
            }
          }
        }
        // Añadir soporte para otras plataformas según sea necesario
        else {
          importResult = {
            total: 0,
            added: 0,
            skipped: 0,
            error: `Plataforma '${channel.platform}' no soportada para importación automática`
          };
        }

        // Actualizar estadísticas
        if (importResult) {
          result.totalVideos += importResult.total;
          result.addedVideos += importResult.added;
          result.skippedVideos += (importResult.skipped || 0);
          result.processedChannels++;
          
          if (importResult.error) {
            result.errors.push(`Error en canal ${channel.title}: ${importResult.error}`);
          }
        }
      } catch (channelError: any) {
        console.error(`Error procesando canal premium #${premiumChannel.id}:`, channelError);
        result.errors.push(`Error en canal premium #${premiumChannel.id}: ${channelError.message || 'Error desconocido'}`);
      }
    }

    // Actualizar la fecha de última sincronización para todos los canales premium procesados
    for (const premiumChannel of premiumChannels) {
      try {
        await storage.updatePremiumChannelSyncTime(premiumChannel.id);
      } catch (updateError) {
        console.error(`Error actualizando fecha de sincronización del canal #${premiumChannel.id}:`, updateError);
      }
    }

    return result;
  } catch (error: any) {
    console.error("Error importando videos de canales premium:", error);
    result.errors.push(`Error general: ${error.message || 'Error desconocido'}`);
    return result;
  }
}

/**
 * Importa videos de un canal específico de YouTube
 * @param channelId ID externo del canal en YouTube
 * @param maxResults Número máximo de videos a importar
 * @returns Estadísticas de la importación
 */
export async function importChannelVideos(
  channelId: string,
  maxResults = 50
): Promise<{
  total: number;
  added: number;
  skipped: number;
  error: string | null;
}> {
  try {
    console.log(`Importando hasta ${maxResults} videos del canal ${channelId}`);
    
    // Obtener videos del canal
    const videos = await getChannelVideos(channelId, maxResults);
    if (!videos || !videos.items || videos.items.length === 0) {
      return { total: 0, added: 0, skipped: 0, error: "No se encontraron videos en el canal" };
    }
    
    console.log(`Se encontraron ${videos.items.length} videos en el canal`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    // Obtener categorías para clasificación
    const availableCategories = await storage.getCategories();
    
    // Procesar cada video
    for (const video of videos.items) {
      try {
        // Verificar si el video ya existe en la base de datos
        const existingVideo = await storage.getVideoByExternalId(video.id.videoId);
        if (existingVideo) {
          skippedCount++;
          continue;
        }
        
        // Obtener detalles completos del video
        const videoDetails = await getYouTubeVideoDetails([video.id.videoId]);
        if (!videoDetails.items || videoDetails.items.length === 0) {
          console.log(`No se pudieron obtener detalles del video ${video.id.videoId}, saltando...`);
          skippedCount++;
          continue;
        }
        
        const videoDetail = videoDetails.items[0];
        
        // Convertir al formato de nuestro esquema
        const videoData = convertYouTubeVideoToSchema(videoDetail);
        
        // Clasificar el contenido utilizando IA
        let categories: number[] = [];
        let summary = "";
        let language = "es"; // Por defecto español para contenido de Real Madrid
        
        try {
          console.log(`Clasificando video ${videoData.title}`);
          // Intentar clasificar con el servicio unificado de IA
          const result = await AIService.classifyContent(
            videoData.title,
            videoData.description || "",
            availableCategories
          );
          categories = result.categories;
          
          // Generar resumen automáticamente
          console.log(`Generando resumen para el video ${videoData.title}`);
          try {
            const summaryResult = await generateVideoSummary(videoData.title, videoData.description || "");
            summary = summaryResult.summary;
            language = summaryResult.language;
            console.log(`Resumen generado: ${summary.substring(0, 100)}...`);
          } catch (summaryError) {
            console.error(`Error generando resumen: ${summaryError}`);
            summary = `Contenido sobre Real Madrid: ${videoData.title}`;
          }
        } catch (classificationError) {
          console.error(`Error clasificando video: ${classificationError}`);
          // Si falla la clasificación, usar categoría general por defecto
          categories = [1];
        }
        
        // Crear el video en la base de datos con las categorías asignadas y el resumen
        const newVideo: InsertVideo = {
          ...videoData,
          summary,
          language,
          categoryIds: categories.map(id => id.toString()),
          featured: false,
          isNotified: false // Por defecto, no ha sido notificado aún
        };
        
        // Crear video y obtener el objeto con ID asignado
        const createdVideo = await storage.createVideo(newVideo);
        addedCount++;
        
        // Enviar notificaciones a los suscriptores del canal (solo si no se enviaron previamente)
        try {
          const notificationResult = await processVideoNotifications(createdVideo.id);
          if (notificationResult.alreadyNotified) {
            console.log(`El video ${createdVideo.title} ya había sido notificado anteriormente. Se omiten notificaciones duplicadas.`);
          } else {
            console.log(`Notificaciones enviadas para el video ${createdVideo.title}: ${notificationResult.total} suscriptores, ${notificationResult.emailsSent} emails enviados`);
          }
        } catch (notificationError) {
          console.error(`Error enviando notificaciones para el video ${createdVideo.id}:`, notificationError);
        }
        
      } catch (error) {
        console.error(`Error procesando video: ${error}`);
        skippedCount++;
      }
    }
    
    return {
      total: videos.items.length,
      added: addedCount,
      skipped: skippedCount,
      error: null
    };
    
  } catch (error: any) {
    console.error(`Error importando videos del canal ${channelId}:`, error);
    return {
      total: 0,
      added: 0,
      skipped: 0,
      error: error.message || "Error desconocido al importar videos"
    };
  }
}