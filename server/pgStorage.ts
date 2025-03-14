import { eq, and, desc, like, sql, asc, inArray, count } from 'drizzle-orm';
import { db } from './db';
import { IStorage } from './storage';
import {
  User, InsertUser, Video, InsertVideo, Channel,
  InsertChannel, Category, InsertCategory, Favorite,
  InsertFavorite, OAuthToken, InsertOAuthToken,
  ChannelSubscription, InsertChannelSubscription,
  Notification, InsertNotification,
  PremiumChannel, InsertPremiumChannel,
  users, videos, channels, categories, favorites, oauthTokens,
  channelSubscriptions, notifications, premiumChannels
} from '@shared/schema';

// PostgreSQL implementation of the storage interface
export class PgStorage implements IStorage {
  
  // User operations
  async getUsers(limit = 100, offset = 0): Promise<User[]> {
    const result = await db.select()
      .from(users)
      .limit(limit)
      .offset(offset);
    return result;
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    if (!googleId) return undefined;
    const result = await db.select().from(users).where(eq(users.googleId, googleId));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByAppleId(appleId: string): Promise<User | undefined> {
    if (!appleId) return undefined;
    const result = await db.select().from(users).where(eq(users.appleId, appleId));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  // OAuth operations
  async getOAuthToken(userId: number, provider: string): Promise<OAuthToken | undefined> {
    const result = await db.select()
      .from(oauthTokens)
      .where(and(
        eq(oauthTokens.userId, userId),
        eq(oauthTokens.provider, provider)
      ));
    
    return result.length > 0 ? result[0] : undefined;
  }

  async createOAuthToken(token: InsertOAuthToken): Promise<OAuthToken> {
    const result = await db.insert(oauthTokens).values(token).returning();
    return result[0];
  }

  async updateOAuthToken(id: number, tokenData: Partial<InsertOAuthToken>): Promise<OAuthToken | undefined> {
    const result = await db.update(oauthTokens)
      .set({
        ...tokenData,
        updatedAt: new Date()
      })
      .where(eq(oauthTokens.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteOAuthToken(id: number): Promise<boolean> {
    const result = await db.delete(oauthTokens)
      .where(eq(oauthTokens.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Video operations
  async getVideos(limit = 100, offset = 0): Promise<Video[]> {
    return db.select()
      .from(videos)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(videos.publishedAt));
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    const result = await db.select().from(videos).where(eq(videos.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getVideoByExternalId(externalId: string): Promise<Video | undefined> {
    const result = await db.select().from(videos).where(eq(videos.externalId, externalId));
    return result.length > 0 ? result[0] : undefined;
  }

  async getVideosByPlatform(platform: string, limit = 20): Promise<Video[]> {
    return db.select()
      .from(videos)
      .where(eq(videos.platform, platform))
      .limit(limit)
      .orderBy(desc(videos.publishedAt));
  }

  async getVideosByCategory(categoryId: number, limit = 20): Promise<Video[]> {
    // Para buscar en un array, usamos sql.raw en PostgreSQL
    return db.select()
      .from(videos)
      .where(sql`${videos.categoryIds} @> ARRAY[${categoryId.toString()}]::text[]`)
      .limit(limit)
      .orderBy(desc(videos.publishedAt));
  }

  async getVideosByChannel(channelId: string, limit = 20): Promise<Video[]> {
    return db.select()
      .from(videos)
      .where(eq(videos.channelId, channelId))
      .limit(limit)
      .orderBy(desc(videos.publishedAt));
  }

  async getTrendingVideos(limit = 20): Promise<Video[]> {
    return db.select()
      .from(videos)
      .orderBy(desc(videos.viewCount))
      .limit(limit);
  }

  async getLatestVideos(limit = 20): Promise<Video[]> {
    return db.select()
      .from(videos)
      .orderBy(desc(videos.publishedAt))
      .limit(limit);
  }

  async searchVideos(query: string, limit = 20): Promise<Video[]> {
    const searchPattern = `%${query}%`;
    return db.select()
      .from(videos)
      .where(
        sql`${videos.title} ILIKE ${searchPattern} OR ${videos.description} ILIKE ${searchPattern}`
      )
      .limit(limit);
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const result = await db.insert(videos).values(video).returning();
    return result[0];
  }

  async updateVideo(id: number, videoUpdate: Partial<InsertVideo>): Promise<Video | undefined> {
    const result = await db.update(videos)
      .set(videoUpdate)
      .where(eq(videos.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteVideo(id: number): Promise<boolean> {
    try {
      // Primero eliminar cualquier referencia en favoritos
      await db.delete(favorites)
        .where(eq(favorites.videoId, id));
      
      // Eliminar las notificaciones relacionadas
      await db.delete(notifications)
        .where(eq(notifications.videoId, id));
      
      // Finalmente, eliminar el video
      const result = await db.delete(videos)
        .where(eq(videos.id, id))
        .returning({ id: videos.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  // Channel operations
  async getChannels(limit = 100, offset = 0): Promise<Channel[]> {
    return db.select()
      .from(channels)
      .limit(limit)
      .offset(offset);
  }

  async getChannelById(id: number): Promise<Channel | undefined> {
    const result = await db.select().from(channels).where(eq(channels.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getChannelByExternalId(externalId: string): Promise<Channel | undefined> {
    const result = await db.select().from(channels).where(eq(channels.externalId, externalId));
    return result.length > 0 ? result[0] : undefined;
  }

  async getChannelsByPlatform(platform: string, limit = 20): Promise<Channel[]> {
    return db.select()
      .from(channels)
      .where(eq(channels.platform, platform))
      .limit(limit);
  }

  async getRecommendedChannels(limit = 4): Promise<Channel[]> {
    return db.select()
      .from(channels)
      .orderBy(desc(channels.subscriberCount))
      .limit(limit);
  }

  async searchChannels(query: string, limit = 20): Promise<Channel[]> {
    const searchPattern = `%${query}%`;
    return db.select()
      .from(channels)
      .where(
        sql`${channels.title} ILIKE ${searchPattern} OR ${channels.description} ILIKE ${searchPattern}`
      )
      .limit(limit);
  }

  async createChannel(channel: InsertChannel): Promise<Channel> {
    const result = await db.insert(channels).values(channel).returning();
    return result[0];
  }

  async updateChannel(id: number, channelUpdate: Partial<InsertChannel>): Promise<Channel | undefined> {
    const result = await db.update(channels)
      .set(channelUpdate)
      .where(eq(channels.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.id));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  // Favorite operations
  async getFavoritesByUserId(userId: number): Promise<Favorite[]> {
    return db.select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async getFavoriteVideosByUserId(userId: number): Promise<Video[]> {
    // Realizamos un join entre favoritos y videos
    return db.select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      thumbnailUrl: videos.thumbnailUrl,
      videoUrl: videos.videoUrl,
      embedUrl: videos.embedUrl,
      platform: videos.platform,
      channelId: videos.channelId,
      channelTitle: videos.channelTitle,
      channelThumbnail: videos.channelThumbnail,
      viewCount: videos.viewCount,
      duration: videos.duration,
      publishedAt: videos.publishedAt,
      categoryIds: videos.categoryIds,
      externalId: videos.externalId
    })
    .from(favorites)
    .innerJoin(videos, eq(favorites.videoId, videos.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values(favorite).returning();
    return result[0];
  }

  async deleteFavorite(userId: number, videoId: number): Promise<boolean> {
    const result = await db.delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.videoId, videoId)
      ))
      .returning();
    
    return result.length > 0;
  }

  async isFavorite(userId: number, videoId: number): Promise<boolean> {
    const result = await db.select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.videoId, videoId)
      ));
    
    return result.length > 0;
  }
  
  // Channel subscription operations
  async getSubscriptionsByUserId(userId: number): Promise<ChannelSubscription[]> {
    return db
      .select()
      .from(channelSubscriptions)
      .where(eq(channelSubscriptions.userId, userId));
  }

  async getSubscribedChannelsByUserId(userId: number): Promise<Channel[]> {
    const subscriptions = await db
      .select({
        channelId: channelSubscriptions.channelId
      })
      .from(channelSubscriptions)
      .where(eq(channelSubscriptions.userId, userId));
    
    if (subscriptions.length === 0) {
      return [];
    }
    
    const channelIds = subscriptions.map(sub => sub.channelId);
    
    return db
      .select()
      .from(channels)
      .where(inArray(channels.id, channelIds));
  }

  async isSubscribed(userId: number, channelId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(channelSubscriptions)
      .where(
        and(
          eq(channelSubscriptions.userId, userId),
          eq(channelSubscriptions.channelId, channelId)
        )
      );
    
    return result.length > 0;
  }

  async createSubscription(subscription: InsertChannelSubscription): Promise<ChannelSubscription> {
    const result = await db.insert(channelSubscriptions).values(subscription).returning();
    return result[0];
  }

  async updateSubscription(userId: number, channelId: number, notificationsEnabled: boolean): Promise<ChannelSubscription> {
    const result = await db
      .update(channelSubscriptions)
      .set({ notificationsEnabled })
      .where(
        and(
          eq(channelSubscriptions.userId, userId),
          eq(channelSubscriptions.channelId, channelId)
        )
      )
      .returning();
    
    return result[0];
  }

  async deleteSubscription(userId: number, channelId: number): Promise<boolean> {
    const result = await db
      .delete(channelSubscriptions)
      .where(
        and(
          eq(channelSubscriptions.userId, userId),
          eq(channelSubscriptions.channelId, channelId)
        )
      );
    
    return true;
  }
  
  // Notification operations
  async getNotificationsByUserId(userId: number, limit = 20, offset = 0): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    
    return result[0]?.count || 0;
  }

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
    
    return true;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
    
    return true;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async deleteNotification(notificationId: number): Promise<boolean> {
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));
    
    return true;
  }
  
  // Premium Channels operations
  async getPremiumChannels(limit = 100, offset = 0): Promise<PremiumChannel[]> {
    const results = await db.select({
        id: premiumChannels.id,
        channelId: premiumChannels.channelId,
        addedById: premiumChannels.addedById,
        notes: premiumChannels.notes,
        priority: premiumChannels.priority,
        createdAt: premiumChannels.createdAt,
        lastSyncAt: premiumChannels.lastSyncAt
      })
      .from(premiumChannels)
      .orderBy(desc(premiumChannels.priority))
      .limit(limit)
      .offset(offset);
    
    return results;
  }
  
  async getPremiumChannelById(id: number): Promise<PremiumChannel | undefined> {
    const result = await db.select({
        id: premiumChannels.id,
        channelId: premiumChannels.channelId,
        addedById: premiumChannels.addedById,
        notes: premiumChannels.notes,
        priority: premiumChannels.priority,
        createdAt: premiumChannels.createdAt,
        lastSyncAt: premiumChannels.lastSyncAt
      })
      .from(premiumChannels)
      .where(eq(premiumChannels.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getChannelDetailsWithPremiumInfo(channelId: number): Promise<Channel & {isPremium: boolean}> {
    const channel = await this.getChannelById(channelId);
    if (!channel) {
      throw new Error(`Canal con ID ${channelId} no encontrado`);
    }
    
    const premiumResult = await db.select({ id: premiumChannels.id })
      .from(premiumChannels)
      .where(eq(premiumChannels.channelId, channelId));
    
    return {
      ...channel,
      isPremium: premiumResult.length > 0
    };
  }
  
  async isPremiumChannel(channelId: number): Promise<boolean> {
    const result = await db.select({ id: premiumChannels.id })
      .from(premiumChannels)
      .where(eq(premiumChannels.channelId, channelId));
    return result.length > 0;
  }
  
  async addPremiumChannel(premiumChannel: InsertPremiumChannel): Promise<PremiumChannel> {
    const result = await db.insert(premiumChannels)
      .values(premiumChannel)
      .returning();
    return result[0];
  }
  
  async updatePremiumChannel(id: number, data: Partial<InsertPremiumChannel>): Promise<PremiumChannel | undefined> {
    const result = await db.update(premiumChannels)
      .set(data)
      .where(eq(premiumChannels.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async removePremiumChannel(id: number): Promise<boolean> {
    const result = await db.delete(premiumChannels)
      .where(eq(premiumChannels.id, id))
      .returning();
    return result.length > 0;
  }
  
  async updatePremiumChannelSyncTime(id: number): Promise<boolean> {
    const result = await db.update(premiumChannels)
      .set({ lastSyncAt: new Date() })
      .where(eq(premiumChannels.id, id))
      .returning();
    return result.length > 0;
  }

  // Método para inicializar la base de datos con datos predeterminados
  async initializeDefaultData(): Promise<void> {
    // Verificar si ya existen categorías
    const existingCategories = await this.getCategories();
    
    if (existingCategories.length === 0) {
      console.log('Inicializando categorías predeterminadas...');
      const defaultCategories = [
        { name: "Partidos", description: "Videos de partidos del Real Madrid" },
        { name: "Entrenamientos", description: "Videos de entrenamientos del equipo" },
        { name: "Ruedas de prensa", description: "Conferencias de prensa del club" },
        { name: "Entrevistas", description: "Entrevistas con jugadores y personal del club" },
        { name: "Jugadores", description: "Videos centrados en jugadores específicos" },
        { name: "Análisis", description: "Análisis tácticos y técnicos" },
        { name: "Momentos Históricos", description: "Momentos importantes en la historia del club" }
      ];
      
      for (const category of defaultCategories) {
        await this.createCategory(category);
      }
      console.log('Categorías predeterminadas creadas exitosamente');
    }
  }
}

// Exportar una instancia para su uso en la aplicación
export const pgStorage = new PgStorage();