import { 
  User, InsertUser, Video, InsertVideo, Channel, 
  InsertChannel, Category, InsertCategory, Favorite, 
  InsertFavorite, Session, OAuthToken, InsertOAuthToken,
  videos, categories, channels, favorites, oauthTokens, users
} from "../shared/schema";

// Storage interface defining all operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByAppleId(appleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // OAuth operations
  getOAuthToken(userId: number, provider: string): Promise<OAuthToken | undefined>;
  createOAuthToken(token: InsertOAuthToken): Promise<OAuthToken>;
  updateOAuthToken(id: number, tokenData: Partial<InsertOAuthToken>): Promise<OAuthToken | undefined>;
  deleteOAuthToken(id: number): Promise<boolean>;

  // Video operations
  getVideos(limit?: number, offset?: number): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  getVideoByExternalId(externalId: string): Promise<Video | undefined>;
  getVideosByPlatform(platform: string, limit?: number): Promise<Video[]>;
  getVideosByCategory(categoryId: number, limit?: number): Promise<Video[]>;
  getVideosByChannel(channelId: string, limit?: number): Promise<Video[]>;
  getTrendingVideos(limit?: number): Promise<Video[]>;
  getLatestVideos(limit?: number): Promise<Video[]>;
  searchVideos(query: string, limit?: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined>;

  // Channel operations
  getChannels(limit?: number, offset?: number): Promise<Channel[]>;
  getChannelById(id: number): Promise<Channel | undefined>;
  getChannelByExternalId(externalId: string): Promise<Channel | undefined>;
  getChannelsByPlatform(platform: string, limit?: number): Promise<Channel[]>;
  getRecommendedChannels(limit?: number): Promise<Channel[]>;
  searchChannels(query: string, limit?: number): Promise<Channel[]>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannel(id: number, channel: Partial<InsertChannel>): Promise<Channel | undefined>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Favorite operations
  getFavoritesByUserId(userId: number): Promise<Favorite[]>;
  getFavoriteVideosByUserId(userId: number): Promise<Video[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, videoId: number): Promise<boolean>;
  isFavorite(userId: number, videoId: number): Promise<boolean>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private channels: Map<number, Channel>;
  private categoryMap: Map<number, Category>;
  private favoriteMap: Map<number, Favorite>;
  private oauthTokenMap: Map<number, OAuthToken>;
  
  // ID counters for auto-increment
  private userIdCounter: number;
  private videoIdCounter: number;
  private channelIdCounter: number;
  private categoryIdCounter: number;
  private favoriteIdCounter: number;
  private oauthTokenIdCounter: number;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.channels = new Map();
    this.categoryMap = new Map();
    this.favoriteMap = new Map();
    this.oauthTokenMap = new Map();

    this.userIdCounter = 1;
    this.videoIdCounter = 1;
    this.channelIdCounter = 1;
    this.categoryIdCounter = 1;
    this.favoriteIdCounter = 1;
    this.oauthTokenIdCounter = 1;

    // Initialize with default categories
    this.initializeCategories();
  }

  private initializeCategories() {
    const defaultCategories = [
      { name: "Partidos", description: "Videos de partidos del Real Madrid" },
      { name: "Entrenamientos", description: "Videos de entrenamientos del equipo" },
      { name: "Ruedas de prensa", description: "Ruedas de prensa del club" },
      { name: "Entrevistas", description: "Entrevistas con jugadores y staff" },
      { name: "Jugadores", description: "Contenido enfocado en jugadores específicos" },
      { name: "Análisis", description: "Análisis tácticos y técnicos" },
      { name: "Momentos históricos", description: "Momentos históricos del club" },
    ];

    defaultCategories.forEach(cat => {
      const category: InsertCategory = {
        name: cat.name,
        description: cat.description || null,
      };
      this.createCategory(category);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Video operations
  async getVideos(limit = 100, offset = 0): Promise<Video[]> {
    return Array.from(this.videos.values())
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(offset, offset + limit);
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideoByExternalId(externalId: string): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(
      (video) => video.externalId === externalId,
    );
  }

  async getVideosByPlatform(platform: string, limit = 20): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter((video) => platform === 'all' || video.platform.toLowerCase() === platform.toLowerCase())
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, limit);
  }

  async getVideosByCategory(categoryId: number, limit = 20): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter((video) => video.categoryIds && video.categoryIds.includes(categoryId.toString()))
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, limit);
  }

  async getVideosByChannel(channelId: string, limit = 20): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter((video) => video.channelId === channelId)
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, limit);
  }

  async getTrendingVideos(limit = 20): Promise<Video[]> {
    return Array.from(this.videos.values())
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, limit);
  }

  async getLatestVideos(limit = 20): Promise<Video[]> {
    return Array.from(this.videos.values())
      .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async searchVideos(query: string, limit = 20): Promise<Video[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.videos.values())
      .filter(
        (video) =>
          video.title.toLowerCase().includes(lowercaseQuery) ||
          (video.description && video.description.toLowerCase().includes(lowercaseQuery))
      )
      .slice(0, limit);
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const newVideo: Video = {
      id,
      title: video.title,
      description: video.description || null,
      thumbnailUrl: video.thumbnailUrl || null,
      videoUrl: video.videoUrl,
      embedUrl: video.embedUrl,
      platform: video.platform,
      channelId: video.channelId,
      channelTitle: video.channelTitle,
      channelThumbnail: video.channelThumbnail || null,
      viewCount: video.viewCount || 0,
      duration: video.duration || null,
      publishedAt: video.publishedAt || null,
      categoryIds: video.categoryIds || [],
      externalId: video.externalId
    };
    this.videos.set(id, newVideo);
    return newVideo;
  }

  async updateVideo(id: number, videoUpdate: Partial<InsertVideo>): Promise<Video | undefined> {
    const existingVideo = this.videos.get(id);
    if (!existingVideo) return undefined;

    const updatedVideo = { ...existingVideo, ...videoUpdate };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  // Channel operations
  async getChannels(limit = 100, offset = 0): Promise<Channel[]> {
    return Array.from(this.channels.values())
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(offset, offset + limit);
  }

  async getChannelById(id: number): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async getChannelByExternalId(externalId: string): Promise<Channel | undefined> {
    return Array.from(this.channels.values()).find(
      (channel) => channel.externalId === externalId,
    );
  }

  async getChannelsByPlatform(platform: string, limit = 20): Promise<Channel[]> {
    return Array.from(this.channels.values())
      .filter((channel) => platform === 'all' || channel.platform.toLowerCase() === platform.toLowerCase())
      .sort((a, b) => (b.subscriberCount || 0) - (a.subscriberCount || 0))
      .slice(0, limit);
  }

  async getRecommendedChannels(limit = 4): Promise<Channel[]> {
    return Array.from(this.channels.values())
      .sort((a, b) => (b.subscriberCount || 0) - (a.subscriberCount || 0))
      .slice(0, limit);
  }

  async searchChannels(query: string, limit = 20): Promise<Channel[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.channels.values())
      .filter(
        (channel) =>
          channel.title.toLowerCase().includes(lowercaseQuery) ||
          (channel.description && channel.description.toLowerCase().includes(lowercaseQuery))
      )
      .slice(0, limit);
  }

  async createChannel(channel: InsertChannel): Promise<Channel> {
    const id = this.channelIdCounter++;
    const newChannel: Channel = {
      id,
      title: channel.title,
      description: channel.description || null,
      thumbnailUrl: channel.thumbnailUrl || null,
      bannerUrl: channel.bannerUrl || null,
      platform: channel.platform,
      externalId: channel.externalId,
      subscriberCount: channel.subscriberCount || null,
      videoCount: channel.videoCount || null
    };
    this.channels.set(id, newChannel);
    return newChannel;
  }

  async updateChannel(id: number, channelUpdate: Partial<InsertChannel>): Promise<Channel | undefined> {
    const existingChannel = this.channels.get(id);
    if (!existingChannel) return undefined;

    const updatedChannel = { ...existingChannel, ...channelUpdate };
    this.channels.set(id, updatedChannel);
    return updatedChannel;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categoryMap.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categoryMap.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = {
      id,
      name: category.name,
      description: category.description || null
    };
    this.categoryMap.set(id, newCategory);
    return newCategory;
  }

  // Favorite operations
  async getFavoritesByUserId(userId: number): Promise<Favorite[]> {
    return Array.from(this.favoriteMap.values()).filter(
      (favorite) => favorite.userId === userId,
    );
  }

  async getFavoriteVideosByUserId(userId: number): Promise<Video[]> {
    const favorites = await this.getFavoritesByUserId(userId);
    const videoIds = favorites.map((favorite) => favorite.videoId);
    return Array.from(this.videos.values()).filter((video) =>
      videoIds.includes(video.id)
    );
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteIdCounter++;
    const newFavorite: Favorite = {
      id,
      userId: favorite.userId,
      videoId: favorite.videoId,
      createdAt: new Date()
    };
    this.favoriteMap.set(id, newFavorite);
    return newFavorite;
  }

  async deleteFavorite(userId: number, videoId: number): Promise<boolean> {
    const favorites = Array.from(this.favoriteMap.entries());
    for (const [id, favorite] of favorites) {
      if (favorite.userId === userId && favorite.videoId === videoId) {
        this.favoriteMap.delete(id);
        return true;
      }
    }
    return false;
  }

  async isFavorite(userId: number, videoId: number): Promise<boolean> {
    return Array.from(this.favoriteMap.values()).some(
      (favorite) => favorite.userId === userId && favorite.videoId === videoId,
    );
  }
}

export const storage = new MemStorage();
