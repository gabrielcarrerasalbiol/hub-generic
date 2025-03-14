import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { classifyContent, enhanceSearch } from "./api/openai";
import { classifyContentWithAnthropicClaude, enhanceSearchWithAnthropicClaude } from "./api/anthropic";
import { searchYouTubeVideos, getYouTubeVideoDetails, getYouTubeChannelDetails, convertYouTubeVideoToSchema, convertYouTubeChannelToSchema } from "./api/youtube";
import { recategorizeVideo, recategorizeAllVideos } from "./api/categoryUpdater";
import { cleanupUnavailableVideos } from "./api/videoValidator";
import { 
  CategoryType, PlatformType, insertFavoriteSchema, Video, User, 
  insertChannelSubscriptionSchema, insertNotificationSchema, 
  ChannelSubscription, Notification
} from "../shared/schema";
import { isAuthenticated, isAdmin } from "./auth";

// Demo user ID - in a real app, this would come from authentication
const DEMO_USER_ID = 1;

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
            // First try with Anthropic Claude (primary)
            try {
              const classification = await classifyContentWithAnthropicClaude(
                video.snippet.title,
                video.snippet.description,
                categories
              );
              categoryIds = classification.categories;
            } catch (claudeError) {
              console.warn("Claude classification failed, falling back to Gemini:", claudeError);
              // Fallback to Gemini
              const classification = await classifyContent(
                video.snippet.title,
                video.snippet.description,
                categories
              );
              categoryIds = classification.categories;
            }
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
      const limit = parseInt(req.query.limit as string) || 20;
      
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
      const videosWithFavorite = await Promise.all(
        videos.map(async (video) => {
          const isFavorite = await storage.isFavorite(DEMO_USER_ID, video.id);
          return { ...video, isFavorite };
        })
      );
      
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

  app.get("/api/videos/trending", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const videos = await storage.getTrendingVideos(limit);
      
      // Check if any videos are favorites
      const videosWithFavorite = await Promise.all(
        videos.map(async (video) => {
          const isFavorite = await storage.isFavorite(DEMO_USER_ID, video.id);
          return { ...video, isFavorite };
        })
      );
      
      res.json(videosWithFavorite);
    } catch (error) {
      console.error("Error fetching trending videos:", error);
      res.status(500).json({ message: "Failed to fetch trending videos" });
    }
  });

  app.get("/api/videos/latest", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const videos = await storage.getLatestVideos(limit);
      
      // Check if any videos are favorites
      const videosWithFavorite = await Promise.all(
        videos.map(async (video) => {
          const isFavorite = await storage.isFavorite(DEMO_USER_ID, video.id);
          return { ...video, isFavorite };
        })
      );
      
      res.json(videosWithFavorite);
    } catch (error) {
      console.error("Error fetching latest videos:", error);
      res.status(500).json({ message: "Failed to fetch latest videos" });
    }
  });

  app.get("/api/videos/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string || "";
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      // Enhance search with AI if possible
      let enhancedQuery = query;
      try {
        // First try with Anthropic Claude (primary)
        try {
          enhancedQuery = await enhanceSearchWithAnthropicClaude(query);
        } catch (claudeError) {
          console.warn("Claude search enhancement failed, falling back to Gemini:", claudeError);
          // Fallback to Gemini
          enhancedQuery = await enhanceSearch(query);
        }
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
                  // First try with Anthropic Claude (primary)
                  try {
                    const classification = await classifyContentWithAnthropicClaude(
                      video.snippet.title,
                      video.snippet.description,
                      categories
                    );
                    categoryIds = classification.categories;
                  } catch (claudeError) {
                    console.warn("Claude classification failed, falling back to Gemini:", claudeError);
                    // Fallback to Gemini
                    const classification = await classifyContent(
                      video.snippet.title,
                      video.snippet.description,
                      categories
                    );
                    categoryIds = classification.categories;
                  }
                } catch (error) {
                  console.warn("Could not classify video content with any AI service, continuing without categories:", error);
                }
                
                const videoSchema = convertYouTubeVideoToSchema(video, categoryIds);
                await storage.createVideo(videoSchema);
              }
            }
            
            // Re-query to get the new videos
            const updatedVideos = await storage.searchVideos(enhancedQuery, limit);
            
            // Check if any videos are favorites
            const videosWithFavorite = await Promise.all(
              updatedVideos.map(async (video) => {
                const isFavorite = await storage.isFavorite(DEMO_USER_ID, video.id);
                return { ...video, isFavorite };
              })
            );
            
            return res.json(videosWithFavorite);
          }
        } catch (error) {
          console.error("Error fetching videos from YouTube:", error);
        }
      }
      
      // Check if any videos are favorites
      const videosWithFavorite = await Promise.all(
        videos.map(async (video) => {
          const isFavorite = await storage.isFavorite(DEMO_USER_ID, video.id);
          return { ...video, isFavorite };
        })
      );
      
      res.json(videosWithFavorite);
    } catch (error) {
      console.error("Error searching videos:", error);
      res.status(500).json({ message: "Failed to search videos" });
    }
  });

  app.get("/api/videos/category/:categoryId", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const videos = await storage.getVideosByCategory(categoryId, limit);
      
      // Check if any videos are favorites
      const videosWithFavorite = await Promise.all(
        videos.map(async (video) => {
          const isFavorite = await storage.isFavorite(DEMO_USER_ID, video.id);
          return { ...video, isFavorite };
        })
      );
      
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
      
      const isFavorite = await storage.isFavorite(DEMO_USER_ID, id);
      
      res.json({ ...video, isFavorite });
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.get("/api/channels", async (req: Request, res: Response) => {
    try {
      const platform = req.query.platform || "all";
      const limit = parseInt(req.query.limit as string) || 20;
      
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
      res.json(channels);
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
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid channel ID" });
      }
      
      const channel = await storage.getChannelById(id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      const videos = await storage.getVideosByChannel(channel.externalId, limit);
      
      // Check if any videos are favorites
      const videosWithFavorite = await Promise.all(
        videos.map(async (video) => {
          const isFavorite = await storage.isFavorite(DEMO_USER_ID, video.id);
          return { ...video, isFavorite };
        })
      );
      
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

  app.get("/api/favorites", async (req: Request, res: Response) => {
    try {
      const videos = await storage.getFavoriteVideosByUserId(DEMO_USER_ID);
      
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

  app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
      const favorite = req.body;
      
      // Set the default user ID
      favorite.userId = DEMO_USER_ID;
      
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
      const isAlreadyFavorite = await storage.isFavorite(DEMO_USER_ID, favorite.videoId);
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

  app.delete("/api/favorites/:videoId", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.videoId);
      
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      const success = await storage.deleteFavorite(DEMO_USER_ID, videoId);
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
      const channelId = parseInt(req.params.channelId);
      
      if (isNaN(channelId)) {
        return res.status(400).json({ message: "Invalid channel ID" });
      }
      
      const isSubscribed = await storage.isSubscribed(userId, channelId);
      res.json({ isSubscribed });
    } catch (error) {
      console.error("Error checking subscription:", error);
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });

  app.post("/api/subscriptions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as User).id;
      const { channelId, notificationsEnabled = true } = req.body;
      
      if (!channelId || isNaN(parseInt(channelId))) {
        return res.status(400).json({ message: "Valid channel ID is required" });
      }
      
      const channelIdNum = parseInt(channelId);
      
      // Verificar si el canal existe
      const channel = await storage.getChannelById(channelIdNum);
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
      const channelId = parseInt(req.params.channelId);
      const { notificationsEnabled } = req.body;
      
      if (isNaN(channelId)) {
        return res.status(400).json({ message: "Invalid channel ID" });
      }
      
      if (typeof notificationsEnabled !== 'boolean') {
        return res.status(400).json({ message: "notificationsEnabled must be a boolean value" });
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
      const channelId = parseInt(req.params.channelId);
      
      if (isNaN(channelId)) {
        return res.status(400).json({ message: "Invalid channel ID" });
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
  
  // Endpoint para verificar disponibilidad de videos (eliminar los no disponibles)
  app.post("/api/videos/verify", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const result = await cleanupUnavailableVideos();
      
      res.json({
        message: `Verificación completada: ${result.removed} videos eliminados de ${result.total} verificados`,
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

  // === PREMIUM CHANNELS ENDPOINTS ===

  // Obtener todos los canales premium
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
        lastSyncAt: null
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
        message: `Importación de canales premium completada: ${result.addedVideos} videos añadidos de ${result.totalVideos} encontrados en ${result.processedChannels} de ${result.totalChannels} canales`,
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
        message: `Importación completada: ${result.added} de ${result.total} videos añadidos del canal ${channel.title}`,
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

  const httpServer = createServer(app);
  return httpServer;
}
