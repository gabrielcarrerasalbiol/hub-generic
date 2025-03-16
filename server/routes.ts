import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { AIService } from "./services/aiService";
import { searchYouTubeVideos, getYouTubeVideoDetails, getYouTubeChannelDetails, convertYouTubeVideoToSchema, convertYouTubeChannelToSchema } from "./api/youtube";
import { recategorizeVideo, recategorizeAllVideos } from "./api/categoryUpdater";
import { generateSummaryForVideo, generateSummariesForAllVideos } from "./api/summaryUpdater";
import { checkUnavailableVideos, deleteUnavailableVideos } from "./api/videoValidator";
import { 
  getStatisticsOverview, 
  getStatisticsByCategory, 
  getStatisticsByPlatform, 
  getStatisticsByDate, 
  getTopChannelsByVideos 
} from "./api/statistics";
import { 
  CategoryType, PlatformType, insertFavoriteSchema, Video, User, 
  insertChannelSubscriptionSchema, insertNotificationSchema, 
  ChannelSubscription, Notification, ViewHistory,
  InsertChannel, InsertRecommendedChannel, InsertVideo,
  insertPollSchema, insertPollOptionSchema, insertPollVoteSchema,
  Poll, PollOption, PollVote
} from "../shared/schema";
import { isAuthenticated, isAdmin, isPremium } from "./auth";
import { handleNewsletterSubscription } from './api/mailchimpService';
import { isValidEmail } from './api/emailService';
import { sendShareEmail } from './api/shareService';

// Demo user ID - el ID actual puede variar si se elimina y se vuelve a crear
// Se debe recuperar dinámicamente cada vez que se necesita

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a demo user if it doesn't exist
  try {
    const existingUser = await storage.getUserByUsername("demo");
    if (!existingUser) {
      await storage.createUser({ username: "demo", password: "demo" });
    }
  } catch (error) {
    console.error("Error creating demo user:", error);
  }

  // Seed some initial Real Madrid channels if they don't exist
  const seedInitialChannels = async () => {
    const channelIds = [
      "UCyZM_RyVWBpLgKRYW_eCuFw", // Real Madrid C.F.
      "UCnsAq8aDVw6KsGKIFA-MMdA", // El Chiringuito
      "UCOAxc9a76XK7M_x91Ic6C-Q", // MadridistaReal (example)
      "UC3Gz7aEk2ZQC6jrYf-U2LYg"  // Real Madrid TV (example)
    ];

    // Check if we need to create channels
    const existingChannel = await storage.getChannelByExternalId(channelIds[0]);
    if (existingChannel) return;

    try {
      const channelData = await getYouTubeChannelDetails(channelIds);
      
      if (channelData && channelData.items && channelData.items.length > 0) {
        for (const channel of channelData.items) {
          const channelSchema = convertYouTubeChannelToSchema(channel);
          await storage.createChannel(channelSchema);
        }
      }
    } catch (error) {
      console.error("Error seeding channels:", error);
    }
  };

  // Seed some initial videos if none exist
  const seedInitialVideos = async () => {
    // Check if we already have videos
    const existingVideos = await storage.getVideos(1);
    if (existingVideos.length > 0) return;

    try {
      // Search for some Real Madrid videos
      const searchResult = await searchYouTubeVideos("highlights goals", 15);
      
      if (searchResult.items && searchResult.items.length > 0) {
        const videoIds = searchResult.items
          .filter(item => item.id.videoId)
          .map(item => item.id.videoId!);
          
        const videoDetails = await getYouTubeVideoDetails(videoIds);
        
        // Get categories for classification
        const dbCategories = await storage.getCategories();
        const categories = dbCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || ''
        }));
        
        for (const video of videoDetails.items) {
          // Try to classify content, but don't block if it fails
          let categoryIds: number[] = [];
          try {
            // Usar servicio centralizado AIService con DeepSeek y fallback automático
            const classification = await AIService.classifyContent(
              video.snippet.title,
              video.snippet.description,
              categories
            );
            categoryIds = classification.categories;
          } catch (error) {
            console.warn("Could not classify video content with any AI service, continuing without categories:", error);
          }
          
          const videoSchema = convertYouTubeVideoToSchema(video, categoryIds);
          await storage.createVideo(videoSchema);
        }
      }
    } catch (error) {
      console.error("Error seeding videos:", error);
    }
  };

  // Run the seed functions in the background after server starts
  setTimeout(async () => {
    try {
      await seedInitialChannels();
      await seedInitialVideos();
    } catch (error) {
      console.error("Error seeding initial data:", error);
    }
  }, 1000);

  // API Routes
  app.get("/api/videos", async (req: Request, res: Response) => {
    try {
      const platform = req.query.platform || "all";
      const category = req.query.category || "all";
      // Para solicitudes admin, usamos un límite mucho mayor para obtener todos los videos
      const isAdminRequest = req.headers['x-admin-request'] === 'true';
      const limit = isAdminRequest ? 1000 : (parseInt(req.query.limit as string) || 20);
      
      if (!PlatformType.safeParse(platform).success) {
        return res.status(400).json({ message: "Invalid platform" });
      }
      
      if (!CategoryType.safeParse(category).success) {
        return res.status(400).json({ message: "Invalid category" });
      }
      
      let videos: Video[] = [];
      
      // Si no hay filtros específicos, obtener todos los videos
      if (platform === "all" && category === "all") {
        videos = await storage.getVideos(limit);
      } 
      // Si solo hay filtro de plataforma
      else if (platform !== "all" && category === "all") {
        videos = await storage.getVideosByPlatform(platform.toString(), limit);
      }
      // Si solo hay filtro de categoría
      else if (platform === "all" && category !== "all") {
        // Mapear nombres de categorías a IDs
        const categories = await storage.getCategories();
        const categoryId = categories.find(cat => 
          cat.name.toLowerCase() === getCategoryNameFromType(category.toString()))?.id;
        
        if (categoryId) {
          videos = await storage.getVideosByCategory(categoryId, limit);
        }
      }
      // Si hay ambos filtros
      else {
        // Mapear nombres de categorías a IDs
        const categories = await storage.getCategories();
        const categoryId = categories.find(cat => 
          cat.name.toLowerCase() === getCategoryNameFromType(category.toString()))?.id;
          
        // Primero filtramos por plataforma
        const platformVideos = await storage.getVideosByPlatform(platform.toString(), limit * 2);
        
        // Luego filtramos manualmente por categoría dentro de los resultados
        if (categoryId) {
          videos = platformVideos.filter(video => 
            video.categoryIds && video.categoryIds.includes(categoryId.toString())
          ).slice(0, limit);
        } else {
          videos = platformVideos.slice(0, limit);
        }
      }
      
      // Check if any videos are favorites
      // Obtenemos el usuario demo dinámicamente en lugar de usar un ID constante
      let videosWithFavorite = videos;
      let demoUser = await storage.getUserByUsername("demo");
      
      if (demoUser) {
        videosWithFavorite = await Promise.all(
          videos.map(async (video) => {
            const isFavorite = await storage.isFavorite(demoUser!.id, video.id);
            return { ...video, isFavorite };
          })
        );
      } else {
        // Si no hay usuario demo, ningún video es favorito
        videosWithFavorite = videos.map(video => ({
          ...video,
          isFavorite: false
        }));
      }
      
      res.json(videosWithFavorite);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });
  
  // Función auxiliar para mapear tipos de categoría a nombres
  function getCategoryNameFromType(categoryType: string): string {
    switch(categoryType) {
      case "matches": return "partidos";
      case "training": return "entrenamientos";
      case "press": return "ruedas de prensa";
      case "interviews": return "entrevistas";
      case "players": return "jugadores";
      case "analysis": return "análisis";
      default: return "";
    }
  }

  app.get("/api/videos/featured", async (req: Request, res: Response) => {
    try {
      // Obtenemos el límite de la solicitud, por defecto 50
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Obtenemos específicamente los videos destacados
      const videos = await storage.getFeaturedVideos(limit);
      
      // Check if any videos are favorites (solo si hay usuario autenticado)
      let videosWithFavorite = videos;
      if (req.user && req.user.id) {
        videosWithFavorite = await Promise.all(
          videos.map(async (video) => {
            const isFavorite = await storage.isFavorite(req.user!.id, video.id);
            return { ...video, isFavorite };
          })
        );
      } else {
        // Si no hay usuario, ningún video es favorito
        videosWithFavorite = videos.map(video => ({
          ...video,
          isFavorite: false
        }));
      }
      
      res.json(videosWithFavorite);
    } catch (error) {
      console.error("Error fetching featured videos:", error);
      res.status(500).json({ message: "Failed to fetch featured videos" });
    }
  });

  app.get("/api/videos/trending", async (req: Request, res: Response) => {
    try {
      // Obtenemos el límite de la solicitud, por defecto 200
      const limit = parseInt(req.query.limit as string) || 200;
      
      // Verificamos si el cliente solicita un límite específico para mostrar
      const displayLimit = req.query.displayLimit ? parseInt(req.query.displayLimit as string) : limit;
      
      // Obtenemos trending videos con el límite completo para análisis (200)
      const videos = await storage.getTrendingVideos(limit);
      
      // Check if any videos are favorites (solo si hay usuario autenticado)
      let videosWithFavorite = videos;
      if (req.user && req.user.id) {
        videosWithFavorite = await Promise.all(
          videos.map(async (video) => {
            const isFavorite = await storage.isFavorite(req.user!.id, video.id);
            return { ...video, isFavorite };
          })
        );
      } else {
        // Si no hay usuario, ningún video es favorito
        videosWithFavorite = videos.map(video => ({
          ...video,
          isFavorite: false
        }));
      }
      
      // Si el displayLimit es menor que el número total de videos, limitamos los resultados
      // Esto permite al cliente especificar cuántos videos quiere mostrar
      const resultsToReturn = displayLimit < videosWithFavorite.length 
        ? videosWithFavorite.slice(0, displayLimit) 
        : videosWithFavorite;
      
      res.json(resultsToReturn);
    } catch (error) {
      console.error("Error fetching trending videos:", error);
      res.status(500).json({ message: "Failed to fetch trending videos" });
    }
  });

  app.get("/api/videos/latest", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const videos = await storage.getLatestVideos(limit);
      
      // Check if any videos are favorites (solo si hay usuario autenticado)
      let videosWithFavorite = videos;
      if (req.user && req.user.id) {
        videosWithFavorite = await Promise.all(
          videos.map(async (video) => {
            const isFavorite = await storage.isFavorite(req.user!.id, video.id);
            return { ...video, isFavorite };
          })
        );
      } else {
        // Si no hay usuario, ningún video es favorito
        videosWithFavorite = videos.map(video => ({
          ...video,
          isFavorite: false
        }));
      }
      
      res.json(videosWithFavorite);
    } catch (error) {
      console.error("Error fetching latest videos:", error);
      res.status(500).json({ message: "Failed to fetch latest videos" });
    }
  });

  app.get("/api/videos/search", async (req: Request, res: Response) => {
    try {
      const query = (req.query.query as string) || (req.query.q as string) || "";
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      // Enhance search with AIService (usa DeepSeek y tiene fallback automático)
      let enhancedQuery = query;
      try {
        enhancedQuery = await AIService.enhanceSearch(query);
      } catch (error) {
        console.log("Search enhancement failed with all AI services, using original query");
      }
      
      // Search local database
      const videos = await storage.searchVideos(enhancedQuery, limit);
      
      // If we have few results, try to fetch more from YouTube
      if (videos.length < 5) {
        try {
          const searchResult = await searchYouTubeVideos(enhancedQuery, 10);
          
          if (searchResult.items && searchResult.items.length > 0) {
            const videoIds = searchResult.items
              .filter(item => item.id.videoId)
              .map(item => item.id.videoId!);
              
            const videoDetails = await getYouTubeVideoDetails(videoIds);
            const categories = (await storage.getCategories()).map(cat => ({
              id: cat.id,
              name: cat.name,
              description: cat.description || null
            }));
            
            // Add new videos to database
            for (const video of videoDetails.items) {
              const existingVideo = await storage.getVideoByExternalId(video.id);
              if (!existingVideo) {
                // Try to classify content, but don't block if it fails
                let categoryIds: number[] = [];
                try {
                  // Usar servicio centralizado AIService con DeepSeek y fallback automático
                  const classification = await AIService.classifyContent(
                    video.snippet.title,
                    video.snippet.description,
                    categories
                  );
                  categoryIds = classification.categories;
                } catch (error) {
                  console.warn("Could not classify video content with any AI service, continuing without categories:", error);
                }
                
                const videoSchema = convertYouTubeVideoToSchema(video, categoryIds);
                await storage.createVideo(videoSchema);
              }
            }
            
            // Re-query to get the new videos
            const updatedVideos = await storage.searchVideos(enhancedQuery, limit);
            
            // Check if any videos are favorites (solo si hay usuario autenticado)
            let videosWithFavorite = updatedVideos;
            if (req.user && req.user.id) {
              videosWithFavorite = await Promise.all(
                updatedVideos.map(async (video) => {
                  const isFavorite = await storage.isFavorite(req.user!.id, video.id);
                  return { ...video, isFavorite };
                })
              );
            } else {
              // Si no hay usuario, ningún video es favorito
              videosWithFavorite = updatedVideos.map(video => ({
                ...video,
                isFavorite: false
              }));
            }
            
            return res.json(videosWithFavorite);
          }
        } catch (error) {
          console.error("Error fetching videos from YouTube:", error);
        }
      }
      
      // Check if any videos are favorites (solo si hay usuario autenticado)
      let videosWithFavorite = videos;
      if (req.user && req.user.id) {
        videosWithFavorite = await Promise.all(
          videos.map(async (video) => {
            const isFavorite = await storage.isFavorite(req.user!.id, video.id);
            return { ...video, isFavorite };
          })
        );
      } else {
        // Si no hay usuario, ningún video es favorito
        videosWithFavorite = videos.map(video => ({
          ...video,
          isFavorite: false
        }));
      }
      
      res.json(videosWithFavorite);
    } catch (error) {
      console.error("Error searching videos:", error);
      res.status(500).json({ message: "Failed to search videos" });
    }
  });

  app.get("/api/videos/category/:categoryId", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const videos = await storage.getVideosByCategory(categoryId, limit);
      
      // Check if any videos are favorites (solo si hay usuario autenticado)
      let videosWithFavorite = videos;
      if (req.user && req.user.id) {
        videosWithFavorite = await Promise.all(
          videos.map(async (video) => {
            const isFavorite = await storage.isFavorite(req.user!.id, video.id);
            return { ...video, isFavorite };
          })
        );
      } else {
        // Si no hay usuario, ningún video es favorito
        videosWithFavorite = videos.map(video => ({
          ...video,
          isFavorite: false
        }));
      }
      
      res.json(videosWithFavorite);
    } catch (error) {
      console.error("Error fetching videos by category:", error);
      res.status(500).json({ message: "Failed to fetch videos by category" });
    }
  });

  app.get("/api/videos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      const video = await storage.getVideoById(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Verificar si es favorito solo si hay un usuario autenticado
      let isFavorite = false;
      if (req.user && req.user.id) {
        isFavorite = await storage.isFavorite(req.user.id, id);
      }
      
      res.json({ ...video, isFavorite });
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });
  
  // Endpoint para actualizar un video
  app.put("/api/videos/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      console.log("PUT /api/videos/:id - Request body:", req.body);
      
      const video = await storage.getVideoById(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Verificar si hay datos en el cuerpo
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "No data provided for update" });
      }
      
      // Obtener datos a actualizar del cuerpo de la solicitud
      const { featured } = req.body;
      console.log("Featured value:", featured, "Type:", typeof featured);
      
      // Si featured es booleano, actualizar featuredOrder también
      let updateData: Partial<InsertVideo> = {};
      
      if (typeof featured === 'boolean') {
        updateData = {
          featured: featured,
          featuredOrder: featured ? (video.featuredOrder || 0) : null
        };
      } else {
        // Otros campos que podrían actualizarse en el futuro
        // Asegurarnos de que updateData no esté vacío
        Object.keys(req.body).forEach(key => {
          if (req.body[key] !== undefined) {
            (updateData as any)[key] = req.body[key];
          }
        });
      }
      
      console.log("Update data:", updateData);
      
      // Verificar que updateData no esté vacío
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      // Actualizar el video
      await storage.updateVideo(id, updateData);
      
      res.json({ success: true, message: "Video updated successfully" });
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  app.get("/api/channels", async (req: Request, res: Response) => {
    try {
      const platform = req.query.platform || "all";
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (!PlatformType.safeParse(platform).success) {
        return res.status(400).json({ message: "Invalid platform" });
      }
      
      const channels = await storage.getChannelsByPlatform(platform.toString(), limit);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  app.get("/api/channels/recommended", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 4;
      const channels = await storage.getRecommendedChannels(limit);
      
      // Intentar actualizar los canales de YouTube que no tienen banner
      const updatedChannels = [...channels];
      
      for (let i = 0; i < updatedChannels.length; i++) {
        const channel = updatedChannels[i];
        
        // Solo intentar actualizar canales de YouTube que no tengan banner
        if (channel.platform === "YouTube" && (!channel.bannerUrl || channel.bannerUrl === "")) {
          try {
            console.log(`Intentando actualizar información del canal ${channel.title} (ID: ${channel.id})`);
            
            // Importar utilidades para obtener datos de YouTube
            const { getYouTubeChannelDetails, convertYouTubeChannelToSchema } = await import("./api/youtube");
            
            // Buscar detalles actualizados del canal
            const channelDetails = await getYouTubeChannelDetails([channel.externalId]);
            
            if (channelDetails.items && channelDetails.items.length > 0) {
              const channelInfo = channelDetails.items[0];
              
              // Verificar si tiene información de banner
              if (channelInfo.brandingSettings?.image?.bannerExternalUrl) {
                // Actualizar solo el banner
                await storage.updateChannel(channel.id, {
                  bannerUrl: channelInfo.brandingSettings.image.bannerExternalUrl
                });
                
                // Actualizar el objeto en la respuesta
                updatedChannels[i] = {
                  ...channel,
                  bannerUrl: channelInfo.brandingSettings.image.bannerExternalUrl
                };
                
                console.log(`Actualizado banner para canal ${channel.title}`);
              } else {
                console.log(`El canal ${channel.title} no tiene banner configurado en YouTube`);
              }
            }
          } catch (updateError) {
            console.error(`Error actualizando canal ${channel.title}:`, updateError);
            // No fallamos la solicitud completa si hay error actualizando un canal
          }
        }
      }
      
      res.json(updatedChannels);
    } catch (error) {
      console.error("Error fetching recommended channels:", error);
      res.status(500).json({ message: "Failed to fetch recommended channels" });
    }
  });

  app.get("/api/channels/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid channel ID" });
      }
      
      const channel = await storage.getChannelById(id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      res.json(channel);
    } catch (error) {
      console.error("Error fetching channel:", error);
      res.status(500).json({ message: "Failed to fetch channel" });
    }
  });

  app.get("/api/channels/:id/videos", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid channel ID" });
      }
      
      const channel = await storage.getChannelById(id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      const videos = await storage.getVideosByChannel(channel.externalId, limit);
      
      // Check if any videos are favorites (solo si hay usuario autenticado)
      let videosWithFavorite = videos;
      if (req.user && req.user.id) {
        videosWithFavorite = await Promise.all(
          videos.map(async (video) => {
            const isFavorite = await storage.isFavorite(req.user!.id, video.id);
            return { ...video, isFavorite };
          })
        );
      } else {
        // Si no hay usuario, ningún video es favorito
        videosWithFavorite = videos.map(video => ({
          ...video,
          isFavorite: false
        }));
      }
      
      res.json(videosWithFavorite);
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      res.status(500).json({ message: "Failed to fetch channel videos" });
    }
  });

  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = (await storage.getCategories()).map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || null
      }));
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/favorites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const videos = await storage.getFavoriteVideosByUserId(userId);
      
      // Add isFavorite flag (will always be true for this endpoint)
      const videosWithFavorite = videos.map(video => ({
        ...video,
        isFavorite: true
      }));
      
      res.json(videosWithFavorite);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const favorite = {
        ...req.body,
        userId
      };
      
      // Validate the input
      const result = insertFavoriteSchema.safeParse(favorite);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid favorite data", errors: result.error.errors });
      }
      
      // Check if video exists
      const video = await storage.getVideoById(favorite.videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Check if already a favorite
      const isAlreadyFavorite = await storage.isFavorite(userId, favorite.videoId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ message: "Video is already a favorite" });
      }
      
      const newFavorite = await storage.createFavorite(favorite);
      res.status(201).json(newFavorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:videoId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const videoId = parseInt(req.params.videoId);
      
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      const success = await storage.deleteFavorite(userId, videoId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Rutas para suscripciones a canales
  app.get("/api/subscriptions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as User).id;
      const subscriptions = await storage.getSubscriptionsByUserId(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/subscriptions/channels", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as User).id;
      const channels = await storage.getSubscribedChannelsByUserId(userId);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching subscribed channels:", error);
      res.status(500).json({ message: "Failed to fetch subscribed channels" });
    }
  });

  app.get("/api/channels/:channelId/subscription", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as User).id;
      const channelIdParam = req.params.channelId;
      let channelId: number;
      
      // Verificar si el channelId es numérico o un ID externo
      if (!isNaN(parseInt(channelIdParam))) {
        channelId = parseInt(channelIdParam);
      } else {
        // Buscar el canal por ID externo
        const channel = await storage.getChannelByExternalId(channelIdParam);
        if (!channel) {
          return res.status(404).json({ message: "Channel not found" });
        }
        channelId = channel.id;
      }
      
      // Verificar suscripción
      const isSubscribed = await storage.isSubscribed(userId, channelId);
      const subscription = isSubscribed ? 
        await storage.getSubscriptionsByUserId(userId).then(subs => 
          subs.find(sub => sub.channelId === channelId)) : 
        null;
      
      res.json({ 
        isSubscribed, 
        notificationsEnabled: subscription ? subscription.notificationsEnabled : false
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });

  app.post("/api/subscriptions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as User).id;
      const { channelId, notificationsEnabled = true } = req.body;
      
      if (!channelId) {
        return res.status(400).json({ message: "Channel ID is required" });
      }
      
      let channelIdNum: number;
      let channel;
      
      // Verificar si es un ID numérico o un ID externo (string)
      if (!isNaN(parseInt(channelId))) {
        channelIdNum = parseInt(channelId);
        channel = await storage.getChannelById(channelIdNum);
      } else {
        // Buscar el canal por ID externo
        channel = await storage.getChannelByExternalId(channelId);
        if (!channel) {
          return res.status(404).json({ message: "Channel not found" });
        }
        channelIdNum = channel.id;
      }
      
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      // Verificar si ya está suscrito
      const alreadySubscribed = await storage.isSubscribed(userId, channelIdNum);
      if (alreadySubscribed) {
        return res.status(400).json({ message: "Already subscribed to this channel" });
      }
      
      const subscription = await storage.createSubscription({
        userId,
        channelId: channelIdNum,
        notificationsEnabled
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to subscribe to channel" });
    }
  });

  app.put("/api/subscriptions/:channelId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as User).id;
      const channelIdParam = req.params.channelId;
      const { notificationsEnabled } = req.body;
      
      if (typeof notificationsEnabled !== 'boolean') {
        return res.status(400).json({ message: "notificationsEnabled must be a boolean value" });
      }
      
      let channelId: number;
      
      // Verificar si es un ID numérico o un ID externo (string)
      if (!isNaN(parseInt(channelIdParam))) {
        channelId = parseInt(channelIdParam);
      } else {
        // Buscar el canal por ID externo
        const channel = await storage.getChannelByExternalId(channelIdParam);
        if (!channel) {
          return res.status(404).json({ message: "Channel not found" });
        }
        channelId = channel.id;
      }
      
      // Verificar si está suscrito
      const isSubscribed = await storage.isSubscribed(userId, channelId);
      if (!isSubscribed) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      const updatedSubscription = await storage.updateSubscription(userId, channelId, notificationsEnabled);
      res.json(updatedSubscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete("/api/subscriptions/:channelId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as User).id;
      const channelIdParam = req.params.channelId;
      let channelId: number;
      
      // Verificar si es un ID numérico o un ID externo (string)
      if (!isNaN(parseInt(channelIdParam))) {
        channelId = parseInt(channelIdParam);
      } else {
        // Buscar el canal por ID externo
        const channel = await storage.getChannelByExternalId(channelIdParam);
        if (!channel) {
          return res.status(404).json({ message: "Channel not found" });
        }
        channelId = channel.id;
      }
      
      // Verificar si está suscrito
      const isSubscribed = await storage.isSubscribed(userId, channelId);
      if (!isSubscribed) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      await storage.deleteSubscription(userId, channelId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ message: "Failed to unsubscribe from channel" });
    }
  });

  // Rutas para notificaciones
  app.get("/api/notifications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as User).id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const notifications = await storage.getNotificationsByUserId(userId, limit, offset);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread/count", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as User).id;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });

  app.put("/api/notifications/:notificationId/read", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      await storage.markNotificationAsRead(notificationId);
      res.status(204).end();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/read/all", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as User).id;
      await storage.markAllNotificationsAsRead(userId);
      res.status(204).end();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:notificationId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      await storage.deleteNotification(notificationId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Endpoint para obtener todos los usuarios (solo para administradores)
  app.get("/api/users", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers(100, 0);
      
      // Devolvemos los usuarios sin información sensible
      const safeUsers = users.map((user: User) => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role
      }));
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "No se pudieron obtener los usuarios" });
    }
  });

  // Endpoint para eliminar un usuario (solo para administradores)
  app.delete("/api/users/:userId", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Verificar que el ID de usuario es válido
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuario no válido" });
      }
      
      // No permitir eliminar al propio usuario administrador que realiza la solicitud
      if (req.user && req.user.id === userId) {
        return res.status(403).json({ 
          message: "No puedes eliminar tu propia cuenta de administrador" 
        });
      }
      
      // Verificar que el usuario existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // No permitir eliminar otros administradores (solo un super admin podría)
      if (user.role === 'admin' && req.user && req.user.role !== 'super_admin') {
        return res.status(403).json({ 
          message: "No tienes permisos para eliminar otros administradores" 
        });
      }
      
      // Proceder con la eliminación
      const deleted = await storage.deleteUser(userId);
      
      if (deleted) {
        res.status(200).json({ 
          message: `Usuario ${user.username} eliminado correctamente` 
        });
      } else {
        res.status(500).json({ 
          message: "No se pudo eliminar el usuario" 
        });
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      res.status(500).json({ 
        message: "Error al procesar la solicitud de eliminación" 
      });
    }
  });

  // Endpoint para recategorizar un video específico usando IA
  app.post("/api/videos/:id/recategorize", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "ID de video inválido" });
      }
      
      const video = await storage.getVideoById(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video no encontrado" });
      }
      
      const success = await recategorizeVideo(videoId);
      
      if (success) {
        const updatedVideo = await storage.getVideoById(videoId);
        res.json({ 
          message: "Video recategorizado exitosamente", 
          video: updatedVideo,
          categories: updatedVideo?.categoryIds
        });
      } else {
        res.status(500).json({ message: "No se pudo recategorizar el video" });
      }
    } catch (error) {
      console.error("Error recategorizando video:", error);
      res.status(500).json({ message: "Error al recategorizar el video" });
    }
  });

  // Endpoint para recategorizar todos los videos usando IA
  app.post("/api/videos/recategorize/all", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const result = await recategorizeAllVideos();
      
      res.json({
        message: `Recategorización completada: ${result.success} de ${result.total} videos actualizados`,
        ...result
      });
    } catch (error) {
      console.error("Error recategorizando todos los videos:", error);
      res.status(500).json({ message: "Error al recategorizar videos" });
    }
  });
  
  // Endpoint para generar resumen para un video específico
  app.post("/api/videos/:id/generate-summary", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "ID de video inválido" });
      }
      
      const video = await storage.getVideoById(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video no encontrado" });
      }
      
      const { generateSummaryForVideo } = await import("./api/summaryUpdater");
      const success = await generateSummaryForVideo(videoId);
      
      if (success) {
        const updatedVideo = await storage.getVideoById(videoId);
        res.json({
          message: "Resumen generado correctamente",
          video: updatedVideo
        });
      } else {
        res.status(500).json({ message: "No se pudo generar el resumen del video" });
      }
    } catch (error) {
      console.error("Error generando resumen de video:", error);
      res.status(500).json({ message: "Error al generar resumen del video" });
    }
  });
  
  // Endpoint para generar resúmenes para todos los videos
  app.post("/api/videos/generate-summaries/all", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { limit = 50 } = req.body;
      const processLimit = Math.min(Math.max(parseInt(String(limit), 10) || 50, 5), 200); // Limitar entre 5 y 200
      
      const { generateSummariesForAllVideos } = await import("./api/summaryUpdater");
      const result = await generateSummariesForAllVideos(processLimit);
      
      res.json({
        message: `Generación de resúmenes completada: ${result.success} de ${result.total} videos actualizados, ${result.total - result.processed} omitidos, ${result.failed} fallidos`,
        ...result
      });
    } catch (error) {
      console.error("Error generando resúmenes para videos:", error);
      res.status(500).json({ message: "Error al generar resúmenes para videos" });
    }
  });
  
  // Endpoint para verificar disponibilidad de videos 
  // Ahora en dos pasos: primero verificar y luego confirmar el borrado
  app.post("/api/videos/verify", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Si hay una confirmación para borrar, procesamos los IDs
      if (req.body.confirm && req.body.videoIds && Array.isArray(req.body.videoIds)) {
        const videoIds = req.body.videoIds.map((id: any) => parseInt(id));
        
        // Solo procedemos si hay IDs válidos
        if (videoIds.length > 0) {
          const result = await deleteUnavailableVideos(videoIds);
          
          return res.json({
            message: `Borrado completado: ${result.deleted} de ${result.requested} videos han sido eliminados`,
            ...result
          });
        } else {
          return res.status(400).json({ message: "No se proporcionaron IDs de video válidos" });
        }
      }
      
      // Si no hay confirmación, solo verificamos la disponibilidad
      const result = await checkUnavailableVideos();
      
      let message = "";
      if (result.apiLimitReached) {
        message = `⚠️ VERIFICACIÓN LIMITADA: Límite de API de YouTube alcanzado. Solo se verificaron ${result.checked} de ${result.total} videos.`;
      } else if (result.toDelete > 0) {
        message = `⚠️ Se encontraron ${result.toDelete} videos que deberían ser eliminados. Confirme para proceder con el borrado.`;
      } else {
        message = `✅ Verificación completada: Todos los ${result.available} videos verificados están disponibles.`;
      }
      
      res.json({
        message,
        requiereConfirmacion: result.toDelete > 0,
        ...result
      });
    } catch (error) {
      console.error("Error verificando disponibilidad de videos:", error);
      res.status(500).json({ message: "Error al verificar videos" });
    }
  });

  // Endpoint para buscar y añadir nuevos videos automáticamente
  app.post("/api/videos/fetch-new", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { maxResults = 10 } = req.body;
      const limit = Math.min(Math.max(parseInt(String(maxResults), 10) || 10, 5), 100); // Limitar entre 5 y 100
      
      const { fetchAndProcessNewVideos } = await import("./api/videoFetcher");
      const result = await fetchAndProcessNewVideos(limit);
      
      res.json({
        message: `Búsqueda completada: ${result.added} de ${result.total} videos añadidos`,
        ...result
      });
    } catch (error: any) {
      console.error("Error fetching new videos:", error);
      res.status(500).json({ 
        error: "Error al buscar nuevos videos",
        details: error.message
      });
    }
  });
  
  // Endpoint para buscar y añadir todo tipo de contenido relacionado con el Real Madrid
  app.post("/api/videos/fetch-all-content", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { maxResults = 20 } = req.body;
      const limit = Math.min(Math.max(parseInt(String(maxResults), 10) || 20, 5), 100); // Limitar entre 5 y 100
      
      // Variables para seguimiento
      let total = 0;
      let added = 0;
      let errors = 0;
      
      // Obtener lista de categorías para clasificación
      const categories = await storage.getCategories();
      
      // Términos de búsqueda en español e inglés para encontrar videos diversos del Real Madrid
      const searchTerms = [
        "Real Madrid recent matches",
        "Real Madrid highlights",
        "Real Madrid goals",
        "Real Madrid transfers",
        "Real Madrid mejores jugadas",
        "Real Madrid entrevistas",
        "Real Madrid rueda de prensa",
        "Real Madrid entrenamiento",
        "Real Madrid análisis táctico"
      ];
      
      // Usamos Promise.all para ejecutar búsquedas en paralelo
      const searchPromises = searchTerms.map(async (term) => {
        try {
          const { searchYouTubeVideos, getYouTubeVideoDetails, getYouTubeChannelDetails } = await import("./api/youtube");
          const { convertYouTubeVideoToSchema, convertYouTubeChannelToSchema } = await import("./api/youtube");
          // No necesitamos importar clasificación, usamos AIService
          
          console.log(`Buscando videos con término: "${term}"`);
          
          // Buscar videos relacionados con el término
          const searchResults = await searchYouTubeVideos(term, Math.ceil(limit / searchTerms.length));
          
          if (searchResults?.items && searchResults.items.length > 0) {
            total += searchResults.items.length;
            
            // Obtener IDs de videos para buscar detalles
            const videoIds = searchResults.items
              .filter(item => item.id.videoId)
              .map(item => item.id.videoId as string);
            
            if (videoIds.length > 0) {
              // Obtener detalles completos de cada video
              const videoDetails = await getYouTubeVideoDetails(videoIds);
              
              // Procesar cada video
              for (const videoDetail of videoDetails.items) {
                try {
                  // Verificar si el video ya existe
                  const existingVideo = await storage.getVideoByExternalId(videoDetail.id);
                  
                  if (!existingVideo) {
                    // Convertir a nuestro formato
                    const videoData = convertYouTubeVideoToSchema(videoDetail);
                    
                    // Verificar si el canal existe, si no, crearlo
                    let channel = await storage.getChannelByExternalId(videoDetail.snippet.channelId);
                    
                    if (!channel) {
                      try {
                        const channelDetails = await getYouTubeChannelDetails([videoDetail.snippet.channelId]);
                        if (channelDetails.items && channelDetails.items.length > 0) {
                          const channelData = convertYouTubeChannelToSchema(channelDetails.items[0]);
                          channel = await storage.createChannel(channelData);
                        }
                      } catch (e) {
                        console.error("Error al crear canal:", e);
                      }
                    }
                    
                    // Clasificar el video con AIService (sistema centralizado con DeepSeek)
                    try {
                      const classificationResult = await AIService.classifyContent(
                        videoDetail.snippet.title,
                        videoDetail.snippet.description,
                        categories
                      );
                      
                      if (classificationResult.relevance >= 60) { // AIService usa escala 0-100
                        // El video es relevante para el Real Madrid
                        videoData.categoryIds = classificationResult.categories.map(c => c.toString());
                        await storage.createVideo(videoData);
                        added++;
                      }
                    } catch (e) {
                      console.error("Error al clasificar video:", e);
                      errors++;
                      
                      // Intentar una clasificación básica como fallback
                      const basicCategoryIds = categories
                        .filter(cat => 
                          videoDetail.snippet.title.toLowerCase().includes(cat.name.toLowerCase()) ||
                          videoDetail.snippet.description.toLowerCase().includes(cat.name.toLowerCase())
                        )
                        .map(cat => cat.id.toString());
                      
                      if (basicCategoryIds.length > 0) {
                        videoData.categoryIds = basicCategoryIds;
                        await storage.createVideo(videoData);
                        added++;
                      }
                    }
                  }
                } catch (e) {
                  errors++;
                  console.error("Error procesando video:", e);
                  // Continuar con el siguiente video
                  continue;
                }
              }
            }
          }
        } catch (error) {
          errors++;
          console.error(`Error en término de búsqueda "${term}":`, error);
        }
      });
      
      await Promise.all(searchPromises);
      
      res.json({
        message: `Búsqueda de contenido completada: ${added} de ${total} videos añadidos (${errors} errores)`,
        total,
        added,
        errors
      });
    } catch (error: any) {
      console.error("Error fetching all Real Madrid content:", error);
      res.status(500).json({ 
        error: "Error al buscar nuevo contenido del Real Madrid",
        details: error.message
      });
    }
  });

  // === PREMIUM CHANNELS ENDPOINTS ===

  // Obtener todos los canales premium (solo para administradores)
  app.get("/api/premium-channels", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const premiumChannels = await storage.getPremiumChannels();
      
      // Enriquecer con información adicional del canal
      const enrichedChannels = await Promise.all(
        premiumChannels.map(async (premiumChannel) => {
          const channel = await storage.getChannelById(premiumChannel.channelId);
          return {
            ...premiumChannel,
            channelDetails: channel
          };
        })
      );
      
      res.json(enrichedChannels);
    } catch (error: any) {
      console.error("Error fetching premium channels:", error);
      res.status(500).json({ 
        error: "Error al obtener canales premium",
        details: error.message
      });
    }
  });
  
  // Obtener canales premium para usuarios premium
  app.get("/api/premium-channels/list", isAuthenticated, isPremium, async (req: Request, res: Response) => {
    try {
      const premiumChannels = await storage.getPremiumChannels();
      
      // Enriquecer con información adicional del canal
      const enrichedChannels = await Promise.all(
        premiumChannels.map(async (premiumChannel) => {
          const channel = await storage.getChannelById(premiumChannel.channelId);
          if (!channel) return null;
          
          // Intentar actualizar la información del canal si es de YouTube y no tiene banner
          if (channel.platform === "YouTube" && channel.externalId && !channel.bannerUrl) {
            console.log(`Intentando actualizar información del canal ${channel.title} (ID: ${channel.id})`);
            try {
              const channelDetails = await getYouTubeChannelDetails([channel.externalId]);
              if (channelDetails.items && channelDetails.items.length > 0) {
                const updatedData = convertYouTubeChannelToSchema(channelDetails.items[0]);
                await storage.updateChannel(channel.id, {
                  bannerUrl: updatedData.bannerUrl,
                  thumbnailUrl: updatedData.thumbnailUrl,
                  subscriberCount: updatedData.subscriberCount,
                  videoCount: updatedData.videoCount
                });
                // Actualizar los datos locales con la nueva información
                channel.bannerUrl = updatedData.bannerUrl;
              }
            } catch (error) {
              console.error(`Error al actualizar información del canal ${channel.title}:`, error);
            }
          }
          
          return {
            id: channel.id,
            title: channel.title,
            description: channel.description,
            thumbnailUrl: channel.thumbnailUrl,
            bannerUrl: channel.bannerUrl, // Incluir bannerUrl en la respuesta
            platform: channel.platform,
            externalId: channel.externalId,
            priority: premiumChannel.priority
          };
        })
      );
      
      // Filtrar los canales nulos (por si hubo algún error)
      const filteredChannels = enrichedChannels.filter(Boolean);
      
      // Ordenar por prioridad (mayor primero)
      const sortedChannels = filteredChannels.sort((a, b) => (b?.priority || 0) - (a?.priority || 0));
      
      res.json(sortedChannels);
    } catch (error: any) {
      console.error("Error fetching premium channels for premium users:", error);
      res.status(500).json({ 
        error: "Error al obtener canales premium",
        details: error.message
      });
    }
  });

  // Agregar un canal premium por URL directa de YouTube
  app.post("/api/premium-channels/add-by-url", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { youtubeUrl, priority, notes } = req.body;
      
      if (!youtubeUrl) {
        return res.status(400).json({ error: "Se requiere la URL del canal de YouTube" });
      }
      
      // Extraer el ID del canal de YouTube de la URL
      let channelIdOrUsername = '';
      let channelId = '';
      
      try {
        const url = new URL(youtubeUrl);
        
        // Obtener el path de la URL
        const pathParts = url.pathname.split('/').filter(Boolean);
        
        // Manejar formatos especiales
        if (pathParts.length >= 1) {
          // Formato: youtube.com/@username
          if (pathParts[0].startsWith('@')) {
            channelIdOrUsername = pathParts[0];
          }
          // Formato: youtube.com/channel/UC...
          else if (pathParts[0] === 'channel' && pathParts.length >= 2) {
            channelIdOrUsername = pathParts[1];
          } 
          // Formato: youtube.com/c/nombre o youtube.com/user/nombre
          else if ((pathParts[0] === 'c' || pathParts[0] === 'user') && pathParts.length >= 2) {
            channelIdOrUsername = pathParts[1];
          }
          // Formato: youtube.com/nombrecanal
          else {
            channelIdOrUsername = pathParts[0];
          }
        }
      } catch (error) {
        return res.status(400).json({ error: "URL de YouTube no válida" });
      }
      
      if (!channelIdOrUsername) {
        return res.status(400).json({ error: "No se pudo extraer el ID o nombre del canal de la URL" });
      }
      
      // Importar los módulos necesarios
      const { getYouTubeChannelDetails, convertYouTubeChannelToSchema } = await import("./api/youtube");
      
      try {
        console.log(`Buscando canal de YouTube con identificador: "${channelIdOrUsername}"`);
        
        // Buscar detalles del canal
        const channelDetails = await getYouTubeChannelDetails([channelIdOrUsername]);
        console.log("Respuesta de la API de YouTube:", JSON.stringify(channelDetails, null, 2));
        
        if (!channelDetails.items || channelDetails.items.length === 0) {
          return res.status(404).json({ error: "No se encontró el canal de YouTube" });
        }
        
        const channelInfo = channelDetails.items[0];
        channelId = channelInfo.id;
        
        // Verificar si el canal ya existe en la base de datos
        let channel = await storage.getChannelByExternalId(channelId);
        
        // Si no existe, crearlo
        if (!channel) {
          const channelData = convertYouTubeChannelToSchema(channelInfo);
          channel = await storage.createChannel(channelData);
        }
        
        // Verificar que no sea ya un canal premium
        const isPremium = await storage.isPremiumChannel(channel.id);
        if (isPremium) {
          return res.status(400).json({ error: "Este canal ya es premium" });
        }
        
        // Agregar como canal premium
        const premiumChannel = await storage.addPremiumChannel({
          channelId: channel.id,
          priority: priority || 5,
          notes: notes || null,
          addedById: 1 // Admin por defecto para simplificar
        });
        
        res.status(201).json({
          message: "Canal premium añadido correctamente desde URL",
          channel: {
            ...premiumChannel,
            channelDetails: channel
          }
        });
      } catch (error: any) {
        console.error("Error fetching YouTube channel:", error);
        res.status(500).json({ 
          error: "Error al obtener información del canal de YouTube",
          details: error.message
        });
      }
    } catch (error: any) {
      console.error("Error adding premium channel from URL:", error);
      res.status(500).json({ 
        error: "Error al añadir canal premium desde URL",
        details: error.message
      });
    }
  });
  
  // Agregar un canal premium
  app.post("/api/premium-channels", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { channelId, priority, notes } = req.body;
      
      if (!channelId) {
        return res.status(400).json({ error: "Se requiere el ID del canal" });
      }
      
      // Verificar que el canal existe
      const channel = await storage.getChannelById(parseInt(channelId));
      if (!channel) {
        return res.status(404).json({ error: "Canal no encontrado" });
      }
      
      // Verificar que no sea ya un canal premium
      const isPremium = await storage.isPremiumChannel(parseInt(channelId));
      if (isPremium) {
        return res.status(400).json({ error: "Este canal ya es premium" });
      }
      
      const premiumChannel = await storage.addPremiumChannel({
        channelId: parseInt(channelId),
        priority: priority || 5, // Prioridad por defecto (1-10)
        notes: notes || null,
        addedById: 1 // Admin por defecto para simplificar
      });
      
      res.status(201).json({
        message: "Canal premium añadido correctamente",
        channel: {
          ...premiumChannel,
          channelDetails: channel
        }
      });
    } catch (error: any) {
      console.error("Error adding premium channel:", error);
      res.status(500).json({ 
        error: "Error al añadir canal premium",
        details: error.message
      });
    }
  });

  // Actualizar un canal premium
  app.put("/api/premium-channels/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { priority, notes } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de canal premium inválido" });
      }
      
      // Verificar que el canal premium existe
      const premiumChannel = await storage.getPremiumChannelById(id);
      if (!premiumChannel) {
        return res.status(404).json({ error: "Canal premium no encontrado" });
      }
      
      const updatedPremiumChannel = await storage.updatePremiumChannel(id, {
        priority: priority !== undefined ? priority : premiumChannel.priority,
        notes: notes !== undefined ? notes : premiumChannel.notes
      });
      
      const channel = await storage.getChannelById(premiumChannel.channelId);
      
      res.json({
        message: "Canal premium actualizado correctamente",
        channel: {
          ...updatedPremiumChannel,
          channelDetails: channel
        }
      });
    } catch (error: any) {
      console.error("Error updating premium channel:", error);
      res.status(500).json({ 
        error: "Error al actualizar canal premium",
        details: error.message
      });
    }
  });

  // Eliminar un canal premium
  app.delete("/api/premium-channels/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de canal premium inválido" });
      }
      
      // Verificar que el canal premium existe
      const premiumChannel = await storage.getPremiumChannelById(id);
      if (!premiumChannel) {
        return res.status(404).json({ error: "Canal premium no encontrado" });
      }
      
      const success = await storage.removePremiumChannel(id);
      
      if (success) {
        res.json({ message: "Canal premium eliminado correctamente" });
      } else {
        res.status(500).json({ error: "Error al eliminar canal premium" });
      }
    } catch (error: any) {
      console.error("Error removing premium channel:", error);
      res.status(500).json({ 
        error: "Error al eliminar canal premium",
        details: error.message
      });
    }
  });

  // Importar videos de todos los canales premium
  app.post("/api/premium-channels/import-videos", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { maxPerChannel = 20 } = req.body;
      const limit = Math.min(Math.max(parseInt(String(maxPerChannel)) || 20, 5), 50); // Limitar entre 5 y 50
      
      const { importPremiumChannelsVideos } = await import("./api/videoFetcher");
      const result = await importPremiumChannelsVideos(limit);
      
      res.json({
        message: `Importación completada: ${result.addedVideos} videos añadidos, ${result.skippedVideos} omitidos de ${result.totalVideos} encontrados en ${result.processedChannels} de ${result.totalChannels} canales`,
        ...result
      });
    } catch (error: any) {
      console.error("Error importing premium channel videos:", error);
      res.status(500).json({ 
        error: "Error al importar videos de canales premium",
        details: error.message
      });
    }
  });
  
  // Endpoint para actualizar videos destacados en lote
  app.post("/api/videos/featured/batch", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { videoIds, featured } = req.body;
      
      if (!Array.isArray(videoIds) || videoIds.length === 0) {
        return res.status(400).json({ message: "Se requiere un array de IDs de videos" });
      }
      
      // Verificar que featured sea un booleano
      if (typeof featured !== 'boolean') {
        return res.status(400).json({ message: "El valor de 'featured' debe ser un booleano" });
      }
      
      // Actualizar cada video
      const results = await Promise.all(
        videoIds.map(async (videoId) => {
          try {
            const video = await storage.getVideoById(videoId);
            if (!video) {
              return { videoId, success: false, message: "Video no encontrado" };
            }
            
            await storage.updateVideo(videoId, { 
              featured,
              featuredOrder: featured ? (video.featuredOrder || 0) : null
            });
            
            return { videoId, success: true };
          } catch (error) {
            console.error(`Error al actualizar el video ${videoId}:`, error);
            return { videoId, success: false, message: "Error al actualizar" };
          }
        })
      );
      
      // Contar éxitos y fallos
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      res.json({
        message: `${successCount} videos han sido ${featured ? 'destacados' : 'quitados de destacados'} correctamente`,
        results,
        stats: { total: videoIds.length, success: successCount, failures: failureCount }
      });
    } catch (error) {
      console.error("Error al actualizar videos destacados en lote:", error);
      res.status(500).json({ message: "Error al procesar la solicitud" });
    }
  });

  // Importar videos de canales con videos destacados
  app.post("/api/videos/import-featured", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { maxPerChannel = 20 } = req.body;
      const limit = Math.min(Math.max(parseInt(String(maxPerChannel)) || 20, 5), 30); // Limitar entre 5 y 30
      
      // 1. Obtener canales que tienen videos destacados
      const featuredVideos = await storage.getFeaturedVideos(200);
      
      if (!featuredVideos || featuredVideos.length === 0) {
        return res.json({
          totalChannels: 0,
          processedChannels: 0,
          totalVideos: 0,
          addedVideos: 0,
          message: "No hay videos destacados para importar más contenido"
        });
      }
      
      // 2. Extraer los IDs de canales únicos de los videos destacados
      const channelIds = [...new Set(featuredVideos.map(video => video.channelId))];
      
      // 3. Estadísticas para el frontend
      let totalVideos = 0;
      let addedVideos = 0;
      let processedChannels = 0;
      
      // 4. Importar la función necesaria
      const { importChannelVideos } = await import("./api/videoFetcher");
      
      // 5. Para cada canal, importar nuevos videos
      for (const channelId of channelIds) {
        try {
          const channelResult = await importChannelVideos(channelId, limit, true); // true = marcar como destacados
          totalVideos += channelResult.total;
          addedVideos += channelResult.added;
          processedChannels++;
        } catch (channelError) {
          console.error(`Error importing videos from channel ${channelId}:`, channelError);
          // Continuar con el siguiente canal aunque haya error
        }
      }
      
      // 6. Devolver estadísticas
      res.json({
        totalChannels: channelIds.length,
        processedChannels,
        totalVideos,
        addedVideos,
        message: `Importación de videos destacados completada. ${addedVideos} videos añadidos de ${totalVideos} encontrados en ${processedChannels} canales.`
      });
    } catch (error: any) {
      console.error("Error importing featured videos:", error);
      res.status(500).json({ 
        error: "Error al importar videos destacados", 
        details: error.message
      });
    }
  });
  


  // Importar videos de un canal específico
  app.post("/api/channels/:channelId/import-videos", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const channelId = req.params.channelId;
      const { maxResults = 20 } = req.body;
      const limit = Math.min(Math.max(parseInt(String(maxResults)) || 20, 5), 50); // Limitar entre 5 y 50
      
      // Obtener el canal
      const channel = await storage.getChannelById(parseInt(channelId));
      if (!channel) {
        return res.status(404).json({ error: "Canal no encontrado" });
      }
      
      const { importChannelVideos } = await import("./api/videoFetcher");
      const result = await importChannelVideos(channel.externalId, limit);
      
      res.json({
        message: `Importación completada: ${result.added} videos añadidos, ${result.skipped || 0} omitidos de ${result.total} encontrados del canal ${channel.title}`,
        ...result
      });
    } catch (error: any) {
      console.error("Error importing channel videos:", error);
      res.status(500).json({ 
        error: "Error al importar videos del canal",
        details: error.message
      });
    }
  });
  
  // === RECOMMENDED CHANNELS ENDPOINTS ===

  // Obtener todos los canales recomendados (solo para administradores)
  app.get("/api/recommended-channels", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const recommendedChannels = await storage.getRecommendedChannelsList();
      
      // Enriquecer con información adicional del canal
      const enrichedChannels = await Promise.all(
        recommendedChannels.map(async (recommendedChannel) => {
          const channel = await storage.getChannelById(recommendedChannel.channelId);
          return {
            ...recommendedChannel,
            channelDetails: channel
          };
        })
      );
      
      res.json(enrichedChannels);
    } catch (error: any) {
      console.error("Error fetching recommended channels:", error);
      res.status(500).json({ error: "Error al obtener los canales recomendados: " + error.message });
    }
  });

  // Listado público de canales recomendados
  app.get("/api/recommended-channels/list", async (req: Request, res: Response) => {
    try {
      const recommendedChannels = await storage.getRecommendedChannelsList();
      
      // Preparar para importar si es necesario
      const { getYouTubeChannelDetails, convertYouTubeChannelToSchema } = await import("./api/youtube");
      
      // Obtener los detalles completos de cada canal y actualizarlos si es necesario
      const channels = await Promise.all(
        recommendedChannels.map(async (rc) => {
          const channel = await storage.getChannelById(rc.channelId);
          if (!channel) return null;
          
          // Intentar actualizar la información del canal si es de YouTube y no tiene banner
          if (channel.platform === "YouTube" && channel.externalId && !channel.bannerUrl) {
            console.log(`Intentando actualizar información del canal ${channel.title} (ID: ${channel.id})`);
            try {
              const channelDetails = await getYouTubeChannelDetails([channel.externalId]);
              if (channelDetails.items && channelDetails.items.length > 0) {
                const updatedData = convertYouTubeChannelToSchema(channelDetails.items[0]);
                await storage.updateChannel(channel.id, {
                  bannerUrl: updatedData.bannerUrl,
                  thumbnailUrl: updatedData.thumbnailUrl,
                  subscriberCount: updatedData.subscriberCount,
                  videoCount: updatedData.videoCount
                });
                // Actualizar los datos locales con la nueva información
                channel.bannerUrl = updatedData.bannerUrl;
              }
            } catch (error) {
              console.error(`Error al actualizar información del canal ${channel.title}:`, error);
            }
          }
          
          return channel;
        })
      );
      
      // Filtrar canales que no existan
      const validChannels = channels.filter(Boolean);
      
      res.json(validChannels);
    } catch (error: any) {
      console.error("Error fetching recommended channels list:", error);
      res.status(500).json({ error: "Error al obtener la lista de canales recomendados: " + error.message });
    }
  });

  // Añadir un canal recomendado mediante URL
  app.post("/api/recommended-channels/add-by-url", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { url, description = "" } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "Se requiere la URL del canal" });
      }
      
      // Extraer el ID del canal de la URL
      let channelIdOrUsername = "";
      let channelPlatform = "";
      
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        // Plataforma YouTube
        channelPlatform = "youtube";
        
        try {
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          
          if (pathParts.length >= 1) {
            // Formato: youtube.com/@username
            if (pathParts[0].startsWith('@')) {
              channelIdOrUsername = pathParts[0];
            }
            // Formato: youtube.com/channel/UC...
            else if (pathParts[0] === 'channel' && pathParts.length >= 2) {
              channelIdOrUsername = pathParts[1];
            } 
            // Formato: youtube.com/c/nombre o youtube.com/user/nombre
            else if ((pathParts[0] === 'c' || pathParts[0] === 'user') && pathParts.length >= 2) {
              channelIdOrUsername = pathParts[1];
            }
            // Formato: youtube.com/nombrecanal
            else {
              channelIdOrUsername = pathParts[0];
            }
          }
        } catch (error) {
          return res.status(400).json({ error: "URL de YouTube no válida" });
        }
      } else if (url.includes("twitch.tv")) {
        // Extraer ID de canal de Twitch
        const matches = url.match(/twitch\.tv\/([^\/\?]+)/);
        channelIdOrUsername = matches ? matches[1] : "";
        channelPlatform = "twitch";
      } else if (url.includes("twitter.com") || url.includes("x.com")) {
        // Extraer ID de canal de Twitter
        const matches = url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
        channelIdOrUsername = matches ? matches[1] : "";
        channelPlatform = "twitter";
      } else if (url.includes("tiktok.com")) {
        // Extraer ID de canal de TikTok
        const matches = url.match(/tiktok\.com\/@([^\/\?]+)/);
        channelIdOrUsername = matches ? matches[1] : "";
        channelPlatform = "tiktok";
      } else if (url.includes("instagram.com")) {
        // Extraer ID de canal de Instagram
        const matches = url.match(/instagram\.com\/([^\/\?]+)/);
        channelIdOrUsername = matches ? matches[1] : "";
        channelPlatform = "instagram";
      }
      
      if (!channelIdOrUsername || !channelPlatform) {
        return res.status(400).json({ error: "No se pudo extraer el ID del canal de la URL proporcionada" });
      }
      
      // Procesamiento específico según la plataforma
      let channel;
      
      if (channelPlatform === "youtube") {
        // Importar utilidades para obtener datos de YouTube
        const { getYouTubeChannelDetails, convertYouTubeChannelToSchema } = await import("./api/youtube");
        
        try {
          console.log(`Buscando canal de YouTube con identificador: "${channelIdOrUsername}"`);
          
          // Buscar detalles del canal en la API de YouTube
          const channelDetails = await getYouTubeChannelDetails([channelIdOrUsername]);
          
          // Log completo para debug de la respuesta
          console.log("Respuesta de la API de YouTube:", JSON.stringify(channelDetails, null, 2));
          
          if (!channelDetails.items || channelDetails.items.length === 0) {
            return res.status(404).json({ error: "No se encontró el canal de YouTube" });
          }
          
          const channelInfo = channelDetails.items[0];
          const externalId = channelInfo.id;
          
          // Verificar si el canal ya existe en la base de datos
          channel = await storage.getChannelByExternalId(externalId);
          
          // Si no existe, crearlo con todos los detalles obtenidos
          if (!channel) {
            const channelData = convertYouTubeChannelToSchema(channelInfo);
            channel = await storage.createChannel(channelData);
          }
        } catch (error: any) {
          console.error("Error fetching YouTube channel:", error);
          return res.status(500).json({ 
            error: "Error al obtener información del canal de YouTube",
            details: error.message
          });
        }
      } else if (channelPlatform === "twitch") {
        // Importar utilidades para obtener datos de Twitch
        const { getTwitchUserDetails, convertTwitchChannelToSchema } = await import("./api/twitch");
        
        try {
          // Buscar detalles del canal en la API de Twitch
          const twitchUser = await getTwitchUserDetails(channelIdOrUsername);
          
          if (!twitchUser) {
            return res.status(404).json({ error: "No se encontró el canal de Twitch" });
          }
          
          // Verificar si el canal ya existe
          channel = await storage.getChannelByExternalId(twitchUser.id);
          
          // Si no existe, crearlo
          if (!channel) {
            const channelData = convertTwitchChannelToSchema(twitchUser);
            channel = await storage.createChannel(channelData);
          }
        } catch (error: any) {
          console.error("Error fetching Twitch channel:", error);
          return res.status(500).json({ 
            error: "Error al obtener información del canal de Twitch",
            details: error.message
          });
        }
      } else {
        // Para otras plataformas que todavía no tienen integración completa
        // Buscar si el canal ya existe en la base de datos
        channel = await storage.getChannelByExternalId(channelIdOrUsername);
        
        // Si el canal no existe, crear un canal básico
        if (!channel) {
          const newChannel: InsertChannel = {
            externalId: channelIdOrUsername,
            title: channelIdOrUsername, // Usar ID como título temporal
            description: description || "Canal añadido desde URL",
            platform: channelPlatform,
            thumbnailUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(channelIdOrUsername)}&background=random&color=fff&size=128`,
            subscriberCount: 0,
            bannerUrl: ""
          };
          
          channel = await storage.createChannel(newChannel);
        }
      }
      
      // Verificar si ya es un canal recomendado
      const isAlreadyRecommended = await storage.isRecommendedChannel(channel.id);
      
      if (isAlreadyRecommended) {
        return res.status(400).json({ error: "Este canal ya está en la lista de recomendados" });
      }
      
      // Añadir a canales recomendados
      const recommendedChannel: InsertRecommendedChannel = {
        channelId: channel.id,
        addedById: req.user!.id, // Añadimos el ID del usuario autenticado
        notes: description || "",
        priority: 0 // Usando priority en lugar de displayOrder para coincidir con el esquema
      };
      
      const result = await storage.addRecommendedChannel(recommendedChannel);
      
      res.status(201).json({
        success: true,
        message: "Canal recomendado añadido correctamente",
        recommendedChannel: result,
        channelDetails: channel
      });
    } catch (error: any) {
      console.error("Error adding recommended channel by URL:", error);
      res.status(500).json({ error: "Error al añadir canal recomendado: " + error.message });
    }
  });

  // Añadir un canal recomendado por ID
  app.post("/api/recommended-channels", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { channelId, notes = "", displayOrder = 0 } = req.body;
      
      if (!channelId) {
        return res.status(400).json({ error: "Se requiere el ID del canal" });
      }
      
      // Verificar que el canal existe
      const channel = await storage.getChannelById(channelId);
      if (!channel) {
        return res.status(404).json({ error: "Canal no encontrado" });
      }
      
      // Verificar si ya es un canal recomendado
      const isAlreadyRecommended = await storage.isRecommendedChannel(channelId);
      
      if (isAlreadyRecommended) {
        return res.status(400).json({ error: "Este canal ya está en la lista de recomendados" });
      }
      
      // Añadir a canales recomendados
      const recommendedChannel: InsertRecommendedChannel = {
        channelId,
        addedById: req.user!.id, // Añadimos el ID del usuario autenticado
        notes: notes || "",
        priority: displayOrder // Usando priority en lugar de displayOrder
      };
      
      const result = await storage.addRecommendedChannel(recommendedChannel);
      
      res.status(201).json({
        success: true,
        message: "Canal recomendado añadido correctamente",
        recommendedChannel: result
      });
    } catch (error: any) {
      console.error("Error adding recommended channel:", error);
      res.status(500).json({ error: "Error al añadir canal recomendado: " + error.message });
    }
  });

  // Actualizar un canal recomendado
  app.put("/api/recommended-channels/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { notes, displayOrder } = req.body;
      
      // Verificar si el canal recomendado existe
      const recommendedChannel = await storage.getRecommendedChannelById(id);
      if (!recommendedChannel) {
        return res.status(404).json({ error: "Canal recomendado no encontrado" });
      }
      
      // Actualizar los datos
      const updatedData: Partial<InsertRecommendedChannel> = {};
      
      if (notes !== undefined) {
        updatedData.notes = notes;
      }
      
      if (displayOrder !== undefined) {
        updatedData.priority = displayOrder; // Usando priority en lugar de displayOrder
      }
      
      const result = await storage.updateRecommendedChannel(id, updatedData);
      
      res.json({
        success: true,
        message: "Canal recomendado actualizado correctamente",
        recommendedChannel: result
      });
    } catch (error: any) {
      console.error("Error updating recommended channel:", error);
      res.status(500).json({ error: "Error al actualizar canal recomendado: " + error.message });
    }
  });

  // Eliminar un canal recomendado
  app.delete("/api/recommended-channels/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar si el canal recomendado existe
      const recommendedChannel = await storage.getRecommendedChannelById(id);
      if (!recommendedChannel) {
        return res.status(404).json({ error: "Canal recomendado no encontrado" });
      }
      
      const result = await storage.removeRecommendedChannel(id);
      
      if (result) {
        res.json({
          success: true,
          message: "Canal recomendado eliminado correctamente"
        });
      } else {
        res.status(500).json({ error: "No se pudo eliminar el canal recomendado" });
      }
    } catch (error: any) {
      console.error("Error removing recommended channel:", error);
      res.status(500).json({ error: "Error al eliminar canal recomendado: " + error.message });
    }
  });

  // Endpoint para importar videos de todos los canales recomendados
  app.post("/api/recommended-channels/import-videos", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { maxPerChannel = 20 } = req.body;
      const limit = Math.min(Math.max(parseInt(String(maxPerChannel)) || 20, 5), 50); // Limitar entre 5 y 50
      
      const { importRecommendedChannelsVideos } = await import("./api/videoFetcher");
      const result = await importRecommendedChannelsVideos(limit);
      
      res.json({
        message: `Importación completada: ${result.addedVideos} videos añadidos, ${result.skippedVideos} omitidos de ${result.totalVideos} encontrados en ${result.processedChannels} de ${result.totalChannels} canales`,
        ...result
      });
    } catch (error: any) {
      console.error("Error importing recommended channel videos:", error);
      res.status(500).json({ 
        error: "Error al importar videos de canales recomendados",
        details: error.message
      });
    }
  });
  
  // Importar videos por plataforma específica
  app.post("/api/videos/import-by-platform", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { platform, maxResults = 20 } = req.body;
      const limit = Math.min(Math.max(parseInt(String(maxResults)) || 20, 5), 50); // Limitar entre 5 y 50
      
      // Validar la plataforma
      if (!PlatformType.safeParse(platform).success || platform === "all") {
        return res.status(400).json({ error: "Plataforma inválida o no específica" });
      }
      
      let result;
      switch (platform) {
        case "youtube":
          const { fetchAndProcessNewVideos } = await import("./api/videoFetcher");
          result = await fetchAndProcessNewVideos(limit);
          break;
          
        case "twitch":
          // Importar videos de Twitch usando las nuevas credenciales de la API
          const { searchTwitchVideos, convertTwitchVideoToSchema, searchTwitchChannels, importTwitchChannelVideos } = await import("./api/twitch");
          
          try {
            // Primero buscamos canales populares relacionados con Real Madrid
            const channels = await searchTwitchChannels("Real Madrid", 5);
            
            if (channels.length === 0) {
              result = { 
                total: 0, 
                added: 0,
                error: "No se encontraron canales de Twitch relacionados con Real Madrid" 
              };
              break;
            }
            
            console.log(`Se encontraron ${channels.length} canales de Twitch relacionados con Real Madrid`);
            
            // Importamos videos de los canales encontrados
            let totalAdded = 0;
            let totalProcessed = 0;
            let totalSkipped = 0;
            
            for (const channel of channels) {
              console.log(`Importando videos del canal de Twitch: ${channel.display_name}`);
              
              // Utilizamos la función especializada para importar videos de un canal
              const importResult = await importTwitchChannelVideos(
                channel.id, 
                Math.ceil(limit / channels.length)
              );
              
              totalAdded += importResult.added || 0;
              totalProcessed += importResult.total || 0;
              totalSkipped += importResult.skipped || 0;
              
              // Si ya hemos importado suficientes videos, paramos
              if (totalAdded >= limit) break;
            }
            
            // Como respaldo, si no se encontraron suficientes videos en los canales,
            // también buscamos videos directamente
            if (totalAdded < limit / 2) {
              console.log("Buscando videos adicionales por búsqueda directa");
              const twitchVideos = await searchTwitchVideos("Real Madrid", limit - totalAdded);
              
              // Filtrar videos que ya hayamos procesado
              const availableCategories = await storage.getCategories();
              
              for (const video of twitchVideos) {
                try {
                  const existingVideo = await storage.getVideoByExternalId(video.id);
                  
                  if (!existingVideo) {
                    // Convertir al formato de la base de datos
                    const videoData = convertTwitchVideoToSchema(video);
                    
                    // Intentar clasificar el contenido con IA
                    try {
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
                      // Mantenemos la categoría default
                    }
                    
                    const newVideo = await storage.createVideo(videoData);
                    totalAdded++;
                    
                    // Generar resumen si es posible
                    try {
                      await AIService.generateVideoSummary(newVideo.id);
                    } catch (summaryError) {
                      console.error("Error generando resumen:", summaryError);
                    }
                  } else {
                    totalSkipped++;
                  }
                } catch (error) {
                  console.error("Error importing Twitch video:", error);
                  totalSkipped++;
                }
              }
              
              totalProcessed += twitchVideos.length;
            }
            
            result = { 
              total: totalProcessed, 
              added: totalAdded,
              skipped: totalSkipped
            };
          } catch (twitchError) {
            console.error("Error en la importación de Twitch:", twitchError);
            result = { 
              total: 0, 
              added: 0,
              error: `Error en la API de Twitch: ${twitchError.message || String(twitchError)}`
            };
          }
          break;
          
        case "twitter":
          // Importar videos de Twitter
          const { searchTwitterVideos, convertTwitterVideoToSchema, getTwitterUserDetails } = await import("./api/twitter");
          const twitterVideos = await searchTwitterVideos("Real Madrid", limit);
          
          let twitterAdded = 0;
          const twitterTotal = twitterVideos.length;
          
          for (const tweet of twitterVideos) {
            try {
              // Para Twitter necesitamos obtener detalles del usuario para cada tweet
              if (tweet.author_id) {
                const user = await getTwitterUserDetails(tweet.author_id);
                if (user && tweet.attachments?.media_keys?.length) {
                  // Asumimos que el primer adjunto multimedia es el video
                  const mediaKey = tweet.attachments.media_keys[0];
                  // Aquí simplificamos y usamos una estructura básica para representar el media
                  // En una implementación real, tendrías que obtener estos detalles de la API
                  const media = {
                    media_key: mediaKey,
                    type: 'video',
                    url: tweet.entities?.urls?.find(u => u.media_key === mediaKey)?.expanded_url || '',
                  };
                  
                  const videoData = convertTwitterVideoToSchema(tweet, user, media);
                  const existingVideo = await storage.getVideoByExternalId(tweet.id);
                  
                  if (!existingVideo) {
                    await storage.createVideo(videoData);
                    twitterAdded++;
                  }
                }
              }
            } catch (error) {
              console.error("Error importing Twitter video:", error);
            }
          }
          
          result = { total: twitterTotal, added: twitterAdded };
          break;
          
        case "tiktok":
          // Importar videos de TikTok
          const { searchTikTokVideos, convertTikTokVideoToSchema } = await import("./api/tiktok");
          const tiktokVideos = await searchTikTokVideos("Real Madrid", limit);
          
          let tiktokAdded = 0;
          const tiktokTotal = tiktokVideos.length;
          
          for (const video of tiktokVideos) {
            try {
              const videoData = convertTikTokVideoToSchema(video);
              const existingVideo = await storage.getVideoByExternalId(video.id);
              
              if (!existingVideo) {
                await storage.createVideo(videoData);
                tiktokAdded++;
              }
            } catch (error) {
              console.error("Error importing TikTok video:", error);
            }
          }
          
          result = { total: tiktokTotal, added: tiktokAdded };
          break;
          
        default:
          return res.status(400).json({ 
            error: "Plataforma no implementada",
            message: "La importación para esta plataforma aún no está disponible" 
          });
      }
      
      res.json({
        message: `Importación de ${platform} completada: ${result.added} videos añadidos de ${result.total} encontrados`,
        ...result
      });
    } catch (error: any) {
      console.error(`Error importing videos from platform:`, error);
      res.status(500).json({ 
        error: "Error al importar videos de la plataforma",
        details: error.message
      });
    }
  });
  
  // Endpoint para eliminar un video (solo admin)
  app.delete("/api/videos/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const videoId = parseInt(id);
      
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "ID de video inválido" });
      }
      
      // Verificar que el video existe
      const video = await storage.getVideoById(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video no encontrado" });
      }
      
      // Eliminar el video
      const success = await storage.deleteVideo(videoId);
      
      if (success) {
        res.status(200).json({ message: "Video eliminado correctamente" });
      } else {
        res.status(500).json({ message: "Error al eliminar el video" });
      }
    } catch (error: any) {
      console.error("Error eliminando video:", error);
      res.status(500).json({ message: `Error al eliminar video: ${error.message}` });
    }
  });
  
  // Endpoint para eliminar múltiples videos (solo admin)
  app.delete("/api/videos", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Se requiere una lista de IDs de videos" });
      }
      
      const results = { total: ids.length, deleted: 0, failed: 0 };
      
      // Eliminar cada video de la lista
      for (const id of ids) {
        try {
          const success = await storage.deleteVideo(id);
          if (success) {
            results.deleted++;
          } else {
            results.failed++;
          }
        } catch (error) {
          console.error(`Error eliminando video ID ${id}:`, error);
          results.failed++;
        }
      }
      
      res.status(200).json({
        message: `Eliminación completada. Total: ${results.total}, Eliminados: ${results.deleted}, Fallidos: ${results.failed}`,
        ...results
      });
    } catch (error: any) {
      console.error("Error eliminando videos:", error);
      res.status(500).json({ message: `Error al eliminar videos: ${error.message}` });
    }
  });

  // API Routes para estadísticas (Dashboard)
  app.get("/api/statistics/overview", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const overview = await getStatisticsOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error al obtener estadísticas generales:", error);
      res.status(500).json({ message: "Error al obtener estadísticas generales" });
    }
  });

  app.get("/api/statistics/categories", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await getStatisticsByCategory();
      res.json(stats);
    } catch (error) {
      console.error("Error al obtener estadísticas por categoría:", error);
      res.status(500).json({ message: "Error al obtener estadísticas por categoría" });
    }
  });

  app.get("/api/statistics/platforms", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await getStatisticsByPlatform();
      res.json(stats);
    } catch (error) {
      console.error("Error al obtener estadísticas por plataforma:", error);
      res.status(500).json({ message: "Error al obtener estadísticas por plataforma" });
    }
  });

  app.get("/api/statistics/dates", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const stats = await getStatisticsByDate(days);
      res.json(stats);
    } catch (error) {
      console.error("Error al obtener estadísticas por fecha:", error);
      res.status(500).json({ message: "Error al obtener estadísticas por fecha" });
    }
  });

  app.get("/api/statistics/top-channels", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const stats = await getTopChannelsByVideos(limit);
      res.json(stats);
    } catch (error) {
      console.error("Error al obtener top canales:", error);
      res.status(500).json({ message: "Error al obtener top canales" });
    }
  });

  // Historial de visualización
  app.get("/api/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const viewedVideos = await storage.getViewHistory(userId, limit);
      
      // Obtener los detalles completos de los videos
      const videoIds = viewedVideos.map(entry => entry.videoId);
      const videosWithDetails = [];
      
      for (const entry of viewedVideos) {
        const video = await storage.getVideoById(entry.videoId);
        if (video) {
          videosWithDetails.push({
            ...video,
            watchedAt: entry.watchedAt,
            watchDuration: entry.watchDuration || 0,
            completionPercentage: entry.completionPercentage || 0
          });
        }
      }
      
      res.json(videosWithDetails);
    } catch (error) {
      console.error("Error fetching view history:", error);
      res.status(500).json({ message: "Error al obtener el historial de visualizaciones" });
    }
  });
  
  // Registrar una visualización
  app.post("/api/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { videoId, watchDuration, completionPercentage } = req.body;
      
      if (!videoId) {
        return res.status(400).json({ message: "ID de video requerido" });
      }
      
      const viewHistoryEntry = await storage.addViewHistory({
        userId,
        videoId,
        watchDuration,
        completionPercentage
      });
      
      res.status(201).json(viewHistoryEntry);
    } catch (error) {
      console.error("Error adding to view history:", error);
      res.status(500).json({ message: "Error al registrar la visualización" });
    }
  });
  
  // Dashboard general para usuarios (con estadísticas personalizadas)
  app.get("/api/dashboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Obtener los videos vistos recientemente
      const recentlyViewed = await storage.getViewHistory(userId, 5);
      
      // Obtener los videos favoritos
      const favoriteVideos = await storage.getFavoriteVideosByUserId(userId);
      
      // Obtener canales suscritos
      const subscribedChannels = await storage.getSubscribedChannelsByUserId(userId);
      
      // Obtener estadísticas generales
      const videosLastWeek = await storage.getVideosAddedInTimeRange(7);
      const platformStats = await storage.getVideosByPlatformCounts();
      const categoryStats = await storage.getVideosByCategoryCounts();
      
      res.json({
        recentlyViewed,
        favoriteVideos: favoriteVideos.slice(0, 5),
        subscribedChannels: subscribedChannels.slice(0, 5),
        stats: {
          newVideosCount: videosLastWeek.length,
          platforms: platformStats,
          categories: categoryStats
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Error al obtener los datos del dashboard" });
    }
  });
  
  // Endpoint para compartir videos por email
  app.post("/api/share/email", async (req: Request, res: Response) => {
    try {
      const { videoId, videoTitle, email, message } = req.body;
      
      if (!videoId || !videoTitle || !email) {
        return res.status(400).json({ message: "Faltan datos requeridos" });
      }
      
      // Importar los servicios necesarios
      const { sendShareEmail, generateShareLink } = await import("./api/shareService");
      const { isValidEmail } = await import("./api/emailService");
      
      // Validar el formato del email
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Formato de email inválido" });
      }
      
      // Generar el enlace con la URL base del frontend (desde variables de entorno)
      const frontendUrl = process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5000';
      const shareLink = generateShareLink(videoId, frontendUrl);
      
      // Enviar el email con el enlace generado en el servidor
      await sendShareEmail(email, videoTitle, shareLink, message);
      
      // Registrar actividad (futuro: podríamos guardar estadísticas de compartición)
      console.log(`Video ${videoId} compartido por email a ${email}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error al compartir video por email:", error);
      res.status(500).json({ message: "Error al enviar el email" });
    }
  });

  // API Routes for Comments
  // Get comments for a video
  app.get("/api/videos/:videoId/comments", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.videoId);
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "ID de video inválido" });
      }
      
      const comments = await storage.getCommentsByVideoId(videoId, limit, offset);
      const count = await storage.getCommentCount(videoId);
      
      res.json({
        comments,
        count,
        limit,
        offset
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Error al obtener los comentarios" });
    }
  });
  
  // Add a new comment
  app.post("/api/videos/:videoId/comments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.videoId);
      const { content, parentId } = req.body;
      
      if (!content || content.trim() === "") {
        return res.status(400).json({ message: "El comentario no puede estar vacío" });
      }
      
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "ID de video inválido" });
      }
      
      // Verificar existencia del video
      const video = await storage.getVideoById(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video no encontrado" });
      }
      
      // Si hay parentId, verificar que exista el comentario padre
      if (parentId) {
        const parentComment = await storage.getCommentById(parentId);
        if (!parentComment) {
          return res.status(404).json({ message: "Comentario padre no encontrado" });
        }
      }
      
      const newComment = await storage.createComment({
        userId: req.user.id,
        videoId,
        parentId: parentId || null,
        content: content.trim()
      });
      
      // Si el comentario es una respuesta, obtenemos también los datos del usuario
      if (newComment.parentId) {
        // En un caso real, aquí añadiríamos la información del usuario
        // como el nombre y la foto de perfil
        const user = await storage.getUser(req.user.id);
        
        res.status(201).json({
          ...newComment,
          username: user?.username,
          profilePicture: user?.profilePicture,
          name: user?.name
        });
      } else {
        // Devolvemos el comentario principal con las respuestas vacías
        const user = await storage.getUser(req.user.id);
        
        res.status(201).json({
          ...newComment,
          username: user?.username,
          profilePicture: user?.profilePicture,
          name: user?.name,
          replies: []
        });
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Error al crear el comentario" });
    }
  });
  
  // Update a comment
  app.put("/api/comments/:commentId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.commentId);
      const { content } = req.body;
      
      if (!content || content.trim() === "") {
        return res.status(400).json({ message: "El comentario no puede estar vacío" });
      }
      
      // Verificar que el comentario existe
      const comment = await storage.getCommentById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comentario no encontrado" });
      }
      
      // Verificar que el usuario es el autor del comentario
      if (comment.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para editar este comentario" });
      }
      
      const updatedComment = await storage.updateComment(commentId, content.trim());
      
      res.json(updatedComment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Error al actualizar el comentario" });
    }
  });
  
  // Delete a comment
  app.delete("/api/comments/:commentId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.commentId);
      
      // Verificar que el comentario existe
      const comment = await storage.getCommentById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comentario no encontrado" });
      }
      
      // Verificar que el usuario es el autor del comentario o es admin
      if (comment.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para eliminar este comentario" });
      }
      
      await storage.deleteComment(commentId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Error al eliminar el comentario" });
    }
  });
  
  // Like a comment
  app.post("/api/comments/:commentId/like", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.commentId);
      
      // Verificar que el comentario existe
      const comment = await storage.getCommentById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comentario no encontrado" });
      }
      
      await storage.likeComment(commentId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking comment:", error);
      res.status(500).json({ message: "Error al dar like al comentario" });
    }
  });
  
  // Unlike a comment
  app.post("/api/comments/:commentId/unlike", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.commentId);
      
      // Verificar que el comentario existe
      const comment = await storage.getCommentById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comentario no encontrado" });
      }
      
      await storage.unlikeComment(commentId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking comment:", error);
      res.status(500).json({ message: "Error al quitar like al comentario" });
    }
  });

  // Newsletter subscription endpoint
  app.post("/api/newsletter/subscribe", handleNewsletterSubscription);

  // ========== ENCUESTAS ==========

  // Obtener todas las encuestas (admin)
  app.get("/api/polls", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const polls = await storage.getPolls(limit, offset);
      res.json(polls);
    } catch (error) {
      console.error("Error obteniendo encuestas:", error);
      res.status(500).json({ message: "Error al obtener las encuestas" });
    }
  });

  // Obtener encuestas publicadas (públicas)
  app.get("/api/polls/published", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const polls = await storage.getPublishedPolls(limit, offset);
      res.json(polls);
    } catch (error) {
      console.error("Error obteniendo encuestas publicadas:", error);
      res.status(500).json({ message: "Error al obtener las encuestas publicadas" });
    }
  });

  // Obtener la encuesta activa para el sidebar
  app.get("/api/polls/active-sidebar", async (req: Request, res: Response) => {
    try {
      const activePoll = await storage.getActiveSidebarPoll();
      
      if (!activePoll) {
        return res.status(404).json({ message: "No hay encuesta activa para mostrar en el sidebar" });
      }
      
      // Verificar si el usuario ha votado
      let hasVoted = false;
      
      if (req.user) {
        hasVoted = await storage.hasUserVotedInPoll(req.user.id, activePoll.id);
      }
      
      // Si el usuario ha votado o no está autenticado, enviar también los resultados
      let results = [];
      if (hasVoted || !req.user) {
        results = await storage.getVoteResultsByPollId(activePoll.id);
      }
      
      res.json({
        poll: activePoll,
        hasVoted,
        results: hasVoted ? results : null
      });
    } catch (error) {
      console.error("Error obteniendo encuesta activa:", error);
      res.status(500).json({ message: "Error al obtener la encuesta activa" });
    }
  });

  // Obtener una encuesta específica por ID
  app.get("/api/polls/:id", async (req: Request, res: Response) => {
    try {
      const pollId = parseInt(req.params.id);
      const poll = await storage.getPollById(pollId);
      
      if (!poll) {
        return res.status(404).json({ message: "Encuesta no encontrada" });
      }
      
      // Si la encuesta es borrador y el usuario no es admin, no permitir acceso
      if (poll.status === "draft" && (!req.user || req.user.role !== "admin")) {
        return res.status(403).json({ message: "No tienes permiso para ver esta encuesta" });
      }
      
      // Verificar si el usuario ha votado
      let hasVoted = false;
      let results = [];
      
      if (req.user) {
        hasVoted = await storage.hasUserVotedInPoll(req.user.id, poll.id);
      }
      
      // Si el usuario ha votado o no está autenticado, enviar también los resultados
      if (hasVoted || !req.user) {
        results = await storage.getVoteResultsByPollId(poll.id);
      }
      
      res.json({
        poll,
        hasVoted,
        results: hasVoted ? results : null
      });
    } catch (error) {
      console.error("Error obteniendo detalles de encuesta:", error);
      res.status(500).json({ message: "Error al obtener los detalles de la encuesta" });
    }
  });

  // Crear una nueva encuesta (admin)
  app.post("/api/polls", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const pollData = insertPollSchema.parse(req.body);
      const options = req.body.options || [];
      
      if (!options || options.length < 2) {
        return res.status(400).json({ 
          message: "La encuesta debe tener al menos 2 opciones de respuesta" 
        });
      }
      
      // Crear la encuesta
      const poll = await storage.createPoll(pollData, options);
      
      // Obtener la encuesta con sus opciones
      const pollWithOptions = await storage.getPollById(poll.id);
      
      res.status(201).json(pollWithOptions);
    } catch (error) {
      console.error("Error creando encuesta:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos de encuesta inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Error al crear la encuesta" });
    }
  });

  // Actualizar una encuesta (admin)
  app.put("/api/polls/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const pollId = parseInt(req.params.id);
      
      // Verificar que la encuesta existe
      const existingPoll = await storage.getPollById(pollId);
      if (!existingPoll) {
        return res.status(404).json({ message: "Encuesta no encontrada" });
      }
      
      // Validar y actualizar la encuesta
      const pollData = insertPollSchema.partial().parse(req.body);
      const updatedPoll = await storage.updatePoll(pollId, pollData);
      
      if (!updatedPoll) {
        return res.status(404).json({ message: "Encuesta no encontrada" });
      }
      
      // Manejar la actualización de opciones si se incluyen
      if (req.body.options) {
        const options = req.body.options;
        
        // Obtener las opciones actuales
        const currentOptions = await storage.getPollOptions(pollId);
        
        // Para las opciones existentes, actualizar o eliminar
        for (const currentOption of currentOptions) {
          const matchingOption = options.find((opt: any) => opt.id === currentOption.id);
          
          if (matchingOption) {
            // Actualizar la opción existente
            await storage.updatePollOption(currentOption.id, {
              text: matchingOption.text,
              order: matchingOption.order || currentOption.order
            });
          } else {
            // Eliminar la opción si ya no existe
            await storage.deletePollOption(currentOption.id);
          }
        }
        
        // Añadir nuevas opciones
        for (const option of options) {
          if (!option.id) {
            // Es una nueva opción
            await storage.createPollOption({
              pollId,
              text: option.text,
              order: option.order || 0
            });
          }
        }
      }
      
      // Obtener la encuesta actualizada con sus opciones
      const pollWithOptions = await storage.getPollById(pollId);
      
      res.json(pollWithOptions);
    } catch (error) {
      console.error("Error actualizando encuesta:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos de encuesta inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Error al actualizar la encuesta" });
    }
  });

  // Eliminar una encuesta (admin)
  app.delete("/api/polls/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const pollId = parseInt(req.params.id);
      
      // Verificar que la encuesta existe
      const existingPoll = await storage.getPollById(pollId);
      if (!existingPoll) {
        return res.status(404).json({ message: "Encuesta no encontrada" });
      }
      
      // Eliminar la encuesta (las opciones y votos se eliminarán en cascada)
      const deleted = await storage.deletePoll(pollId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Error al eliminar la encuesta" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error eliminando encuesta:", error);
      res.status(500).json({ message: "Error al eliminar la encuesta" });
    }
  });

  // Publicar una encuesta (admin)
  app.post("/api/polls/:id/publish", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const pollId = parseInt(req.params.id);
      
      // Verificar que la encuesta existe
      const existingPoll = await storage.getPollById(pollId);
      if (!existingPoll) {
        return res.status(404).json({ message: "Encuesta no encontrada" });
      }
      
      // Publicar la encuesta
      const updatedPoll = await storage.publishPoll(pollId);
      
      if (!updatedPoll) {
        return res.status(500).json({ message: "Error al publicar la encuesta" });
      }
      
      // Obtener la encuesta actualizada con sus opciones
      const pollWithOptions = await storage.getPollById(pollId);
      
      res.json(pollWithOptions);
    } catch (error) {
      console.error("Error publicando encuesta:", error);
      res.status(500).json({ message: "Error al publicar la encuesta" });
    }
  });

  // Convertir una encuesta a borrador (admin)
  app.post("/api/polls/:id/unpublish", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const pollId = parseInt(req.params.id);
      
      // Verificar que la encuesta existe
      const existingPoll = await storage.getPollById(pollId);
      if (!existingPoll) {
        return res.status(404).json({ message: "Encuesta no encontrada" });
      }
      
      // Despublicar la encuesta
      const updatedPoll = await storage.unpublishPoll(pollId);
      
      if (!updatedPoll) {
        return res.status(500).json({ message: "Error al despublicar la encuesta" });
      }
      
      // Obtener la encuesta actualizada con sus opciones
      const pollWithOptions = await storage.getPollById(pollId);
      
      res.json(pollWithOptions);
    } catch (error) {
      console.error("Error despublicando encuesta:", error);
      res.status(500).json({ message: "Error al despublicar la encuesta" });
    }
  });

  // Añadir una opción a una encuesta (admin)
  app.post("/api/polls/:id/options", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const pollId = parseInt(req.params.id);
      
      // Verificar que la encuesta existe
      const existingPoll = await storage.getPollById(pollId);
      if (!existingPoll) {
        return res.status(404).json({ message: "Encuesta no encontrada" });
      }
      
      // Validar la nueva opción
      const optionData = insertPollOptionSchema.omit({ pollId: true }).parse(req.body);
      
      // Crear la opción
      const option = await storage.createPollOption({
        pollId,
        text: optionData.text,
        order: optionData.order || 0
      });
      
      res.status(201).json(option);
    } catch (error) {
      console.error("Error añadiendo opción a encuesta:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos de opción inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Error al añadir la opción a la encuesta" });
    }
  });

  // Votar en una encuesta (usuario autenticado)
  app.post("/api/polls/:id/vote", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const pollId = parseInt(req.params.id);
      const optionId = parseInt(req.body.optionId);
      
      if (!optionId) {
        return res.status(400).json({ message: "Se requiere una opción de voto" });
      }
      
      // Verificar que la encuesta existe y está publicada
      const existingPoll = await storage.getPollById(pollId);
      if (!existingPoll) {
        return res.status(404).json({ message: "Encuesta no encontrada" });
      }
      
      if (existingPoll.status !== "published") {
        return res.status(403).json({ message: "Esta encuesta no está disponible para votar" });
      }
      
      // Verificar que la opción pertenece a la encuesta
      const optionBelongsToPoll = existingPoll.options.some(opt => opt.id === optionId);
      if (!optionBelongsToPoll) {
        return res.status(400).json({ message: "La opción seleccionada no pertenece a esta encuesta" });
      }
      
      // Verificar si el usuario ya ha votado
      const hasVoted = await storage.hasUserVotedInPoll(req.user.id, pollId);
      if (hasVoted) {
        return res.status(400).json({ message: "Ya has votado en esta encuesta" });
      }
      
      // Crear el voto
      const vote = await storage.createPollVote({
        pollId,
        optionId,
        userId: req.user.id
      });
      
      // Obtener los resultados actualizados
      const results = await storage.getVoteResultsByPollId(pollId);
      
      res.status(201).json({
        success: true,
        vote,
        results
      });
    } catch (error) {
      console.error("Error votando en encuesta:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos de voto inválidos", 
          errors: error.errors 
        });
      }
      
      // Manejar el error específico de voto duplicado
      if (error instanceof Error && error.message === 'El usuario ya ha votado en esta encuesta') {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error al votar en la encuesta" });
    }
  });

  // Obtener resultados de una encuesta
  app.get("/api/polls/:id/results", async (req: Request, res: Response) => {
    try {
      const pollId = parseInt(req.params.id);
      
      // Verificar que la encuesta existe
      const existingPoll = await storage.getPollById(pollId);
      if (!existingPoll) {
        return res.status(404).json({ message: "Encuesta no encontrada" });
      }
      
      // Si la encuesta es borrador y el usuario no es admin, no permitir acceso
      if (existingPoll.status === "draft" && (!req.user || req.user.role !== "admin")) {
        return res.status(403).json({ message: "No tienes permiso para ver los resultados de esta encuesta" });
      }
      
      // Obtener los resultados
      const results = await storage.getVoteResultsByPollId(pollId);
      
      res.json({
        poll: existingPoll,
        results
      });
    } catch (error) {
      console.error("Error obteniendo resultados de encuesta:", error);
      res.status(500).json({ message: "Error al obtener los resultados de la encuesta" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
