import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { classifyContent, enhanceSearch } from "./api/openai";
import { classifyContentWithAnthropicClaude, enhanceSearchWithAnthropicClaude } from "./api/anthropic";
import { searchYouTubeVideos, getYouTubeVideoDetails, getYouTubeChannelDetails, convertYouTubeVideoToSchema, convertYouTubeChannelToSchema } from "./api/youtube";
import { CategoryType, PlatformType, insertFavoriteSchema } from "../shared/schema";

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
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!PlatformType.safeParse(platform).success) {
        return res.status(400).json({ message: "Invalid platform" });
      }
      
      const videos = await storage.getVideosByPlatform(platform.toString(), limit);
      
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

  // Get or generate the logo
  app.get("/api/logo", async (req: Request, res: Response) => {
    try {
      // Generate the logo using Gemini AI
      const svgContent = await generateHubMadridistaLogo();
      
      // Set the appropriate content type for SVG
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svgContent);
    } catch (error) {
      console.error("Error generating logo:", error);
      res.status(500).json({ message: "Failed to generate logo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
