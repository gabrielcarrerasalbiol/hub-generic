import { 
  User, InsertUser, Video, InsertVideo, Channel, 
  InsertChannel, Category, InsertCategory, Favorite, 
  InsertFavorite, Session, OAuthToken, InsertOAuthToken,
  ChannelSubscription, InsertChannelSubscription,
  Notification, InsertNotification, PremiumChannel,
  InsertPremiumChannel, ViewHistory, InsertViewHistory,
  Comment, InsertComment, RecommendedChannel, InsertRecommendedChannel
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
  deleteUser(id: number): Promise<boolean>;
  
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
  deleteVideo(id: number): Promise<boolean>;

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
  getSubscriptionsByChannelId(channelId: number): Promise<ChannelSubscription[]>;
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
  
  // Premium Channels operations
  getPremiumChannels(limit?: number, offset?: number): Promise<PremiumChannel[]>;
  getPremiumChannelById(id: number): Promise<PremiumChannel | undefined>;
  getChannelDetailsWithPremiumInfo(channelId: number): Promise<Channel & {isPremium: boolean}>;
  isPremiumChannel(channelId: number): Promise<boolean>;
  addPremiumChannel(premiumChannel: InsertPremiumChannel): Promise<PremiumChannel>;
  updatePremiumChannel(id: number, data: Partial<InsertPremiumChannel>): Promise<PremiumChannel | undefined>;
  removePremiumChannel(id: number): Promise<boolean>;
  updatePremiumChannelSyncTime(id: number): Promise<boolean>;
  
  // Recommended Channels operations
  getRecommendedChannelsList(limit?: number, offset?: number): Promise<RecommendedChannel[]>;
  getRecommendedChannelById(id: number): Promise<RecommendedChannel | undefined>;
  isRecommendedChannel(channelId: number): Promise<boolean>;
  addRecommendedChannel(recommendedChannel: InsertRecommendedChannel): Promise<RecommendedChannel>;
  updateRecommendedChannel(id: number, data: Partial<InsertRecommendedChannel>): Promise<RecommendedChannel | undefined>;
  removeRecommendedChannel(id: number): Promise<boolean>;
  
  // View History operations
  getViewHistory(userId: number, limit?: number): Promise<ViewHistory[]>;
  addViewHistory(viewHistory: InsertViewHistory): Promise<ViewHistory>;
  
  // Comment operations
  getCommentsByVideoId(videoId: number, limit?: number, offset?: number): Promise<Comment[]>;
  getCommentsByUserId(userId: number, limit?: number, offset?: number): Promise<Comment[]>;
  getCommentById(id: number): Promise<Comment | undefined>;
  getRepliesByCommentId(commentId: number, limit?: number, offset?: number): Promise<Comment[]>;
  getCommentCount(videoId: number): Promise<number>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, content: string): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  likeComment(id: number): Promise<boolean>;
  unlikeComment(id: number): Promise<boolean>;
  
  // Dashboard Statistics operations
  getVideosAddedInTimeRange(days: number): Promise<Video[]>;
  getVideosByPlatformCounts(): Promise<{platform: string, count: number}[]>;
  getVideosByCategoryCounts(): Promise<{categoryId: number, count: number}[]>;
  getVideosByDateCounts(days: number): Promise<{date: string, count: number}[]>;
  getTopChannelsByVideos(limit?: number): Promise<{channelId: string, channelTitle: string, count: number}[]>;
  
  // Initialize default data (for testing)
  initializeDefaultData?(): Promise<void>;
}

// Exportar la implementación de PostgreSQL
import { pgStorage } from './pgStorage';
export const storage = pgStorage;