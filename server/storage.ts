import { 
  User, InsertUser, Video, InsertVideo, Channel, 
  InsertChannel, Category, InsertCategory, Favorite, 
  InsertFavorite, Session, OAuthToken, InsertOAuthToken,
  ChannelSubscription, InsertChannelSubscription,
  Notification, InsertNotification
} from "../shared/schema";

// Storage interface defining all operations
export interface IStorage {
  // User operations
  getUsers(limit?: number, offset?: number): Promise<User[]>;
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
  
  // Channel subscription operations
  getSubscriptionsByUserId(userId: number): Promise<ChannelSubscription[]>;
  getSubscribedChannelsByUserId(userId: number): Promise<Channel[]>;
  isSubscribed(userId: number, channelId: number): Promise<boolean>;
  createSubscription(subscription: InsertChannelSubscription): Promise<ChannelSubscription>;
  updateSubscription(userId: number, channelId: number, notificationsEnabled: boolean): Promise<ChannelSubscription>;
  deleteSubscription(userId: number, channelId: number): Promise<boolean>;
  
  // Notification operations
  getNotificationsByUserId(userId: number, limit?: number, offset?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  markNotificationAsRead(notificationId: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  deleteNotification(notificationId: number): Promise<boolean>;
  
  // Initialize default data (for testing)
  initializeDefaultData?(): Promise<void>;
}

// Exportar la implementación de PostgreSQL
import { pgStorage } from './pgStorage';
export const storage = pgStorage;