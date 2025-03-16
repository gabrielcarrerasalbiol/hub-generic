import { eq, and, desc, like, sql, asc, inArray, count, not, gte } from 'drizzle-orm';
import { db } from './db';
import { IStorage } from './storage';
import {
  User, InsertUser, Video, InsertVideo, Channel,
  InsertChannel, Category, InsertCategory, Favorite,
  InsertFavorite, OAuthToken, InsertOAuthToken,
  ChannelSubscription, InsertChannelSubscription,
  Notification, InsertNotification,
  PremiumChannel, InsertPremiumChannel,
  RecommendedChannel, InsertRecommendedChannel,
  ViewHistory, InsertViewHistory,
  Comment, InsertComment,
  Poll, InsertPoll, PollOption, InsertPollOption, PollVote, InsertPollVote,
  users, videos, channels, categories, favorites, oauthTokens,
  channelSubscriptions, notifications, premiumChannels, recommendedChannels,
  viewHistory, comments, polls, pollOptions, pollVotes
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

  /**
   * Elimina un usuario y sus datos asociados
   * @param id ID del usuario a eliminar
   * @returns Promise<boolean> true si se eliminó con éxito, false en caso contrario
   */
  async deleteUser(id: number): Promise<boolean> {
    try {
      // Comenzamos una transacción para asegurar la integridad de la eliminación
      // Primero eliminamos los datos relacionados con el usuario
      // Esto evita errores por restricciones de clave foránea
      
      // 1. Eliminar notificaciones
      await db.delete(notifications).where(eq(notifications.userId, id));
      
      // 2. Eliminar favoritos
      await db.delete(favorites).where(eq(favorites.userId, id));
      
      // 3. Eliminar suscripciones a canales
      await db.delete(channelSubscriptions).where(eq(channelSubscriptions.userId, id));
      
      // 4. Eliminar historial de visualización
      await db.delete(viewHistory).where(eq(viewHistory.userId, id));
      
      // 5. Eliminar comentarios
      await db.delete(comments).where(eq(comments.userId, id));
      
      // 6. Eliminar tokens OAuth
      await db.delete(oauthTokens).where(eq(oauthTokens.userId, id));
      
      // 7. Verificar si el usuario es referenciado en canales premium y actualizar
      // Verificamos si hay referencias en premium_channels.added_by_id
      try {
        // Intentamos actualizar todas las referencias en canales premium
        // Asignamos al admin ID 4 como creador por defecto
        await db.execute(
          sql`UPDATE ${premiumChannels} SET added_by_id = 4 WHERE added_by_id = ${id}`
        );
      } catch (e) {
        console.error(`Error al actualizar referencias en canales premium para usuario ${id}:`, e);
        // Si hay un error aquí, seguimos intentando borrar el usuario
      }
      
      // 8. Finalmente, eliminar el usuario
      const result = await db.delete(users).where(eq(users.id, id)).returning();
      
      return result.length > 0;
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      return false;
    }
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
    // Aumentamos el límite predeterminado a 100 videos
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

  async getVideosByPlatform(platform: string, limit = 50): Promise<Video[]> {
    return db.select()
      .from(videos)
      .where(eq(videos.platform, platform))
      .limit(limit)
      .orderBy(desc(videos.publishedAt));
  }

  async getVideosByCategory(categoryId: number, limit = 50): Promise<Video[]> {
    // Para buscar en un array, usamos sql.raw en PostgreSQL
    return db.select()
      .from(videos)
      .where(sql`${videos.categoryIds} @> ARRAY[${categoryId.toString()}]::text[]`)
      .limit(limit)
      .orderBy(desc(videos.publishedAt));
  }

  async getVideosByChannel(channelId: string, limit = 50): Promise<Video[]> {
    return db.select()
      .from(videos)
      .where(eq(videos.channelId, channelId))
      .limit(limit)
      .orderBy(desc(videos.publishedAt));
  }

  async getFeaturedVideos(limit = 100): Promise<Video[]> {
    // Obtenemos los videos marcados como destacados, ordenados por fecha de publicación
    return db.select()
      .from(videos)
      .where(eq(videos.featured, true))
      .orderBy(desc(videos.publishedAt))
      .limit(limit);
  }

  async getTrendingVideos(limit = 200): Promise<Video[]> {
    // Obtenemos la fecha de hace 45 días para considerar videos más recientes
    const fortyfiveDaysAgo = new Date();
    fortyfiveDaysAgo.setDate(fortyfiveDaysAgo.getDate() - 45);
    
    // Primero obtenemos videos destacados (siempre primero en tendencias)
    const featuredVideos = await db.select()
      .from(videos)
      .where(eq(videos.featured, true))
      .orderBy(desc(videos.publishedAt))
      .limit(Math.ceil(limit * 0.2)); // 20% del límite para videos destacados
      
    // Calculamos cuántos videos más necesitamos
    const remainingLimit = limit - featuredVideos.length;
    
    if (remainingLimit <= 0) {
      return featuredVideos;
    }
    
    // Consulta para obtener videos populares recientes (últimos 45 días)
    // Priorizamos videos más recientes con alto número de vistas
    const recentPopular = await db.select()
      .from(videos)
      .where(
        and(
          sql`${videos.publishedAt} >= ${fortyfiveDaysAgo.toISOString()}`,
          not(inArray(videos.id, featuredVideos.map(v => v.id)))
        )
      )
      .orderBy(desc(videos.viewCount))
      .limit(Math.ceil(remainingLimit * 0.6)); // 60% del resto para videos recientes populares
      
    // Consulta para obtener videos más recientes independientemente de las vistas
    // Esto garantiza que tengamos contenido fresco, aunque no tenga muchas visualizaciones aún
    const remainingCount = remainingLimit - recentPopular.length;
    let recentVideos: any[] = [];
    
    if (remainingCount > 0) {
      recentVideos = await db.select()
        .from(videos)
        .where(
          not(inArray(
            videos.id, 
            [...featuredVideos, ...recentPopular].map(v => v.id)
          ))
        )
        .orderBy(desc(videos.publishedAt))
        .limit(remainingCount);
    }
    
    // Combinamos todos los resultados
    return [...featuredVideos, ...recentPopular, ...recentVideos];
  }

  async getLatestVideos(limit = 50): Promise<Video[]> {
    return db.select()
      .from(videos)
      .orderBy(desc(videos.publishedAt))
      .limit(limit);
  }

  async searchVideos(query: string, limit = 50): Promise<Video[]> {
    // Limpiamos la consulta y la preparamos para la búsqueda
    const cleanQuery = query.trim().toLowerCase();
    
    // Dividimos la consulta en palabras individuales para buscar coincidencias parciales
    const searchTerms = cleanQuery.split(/\s+/).filter(term => term.length > 2);
    
    // Si no hay términos válidos, devolvemos un array vacío
    if (searchTerms.length === 0) {
      return [];
    }
    
    // Creamos patrones de búsqueda para cada término
    const searchPatterns = searchTerms.map(term => `%${term}%`);
    
    // Construimos la consulta SQL con condiciones OR para cada término y cada campo
    const conditions = searchPatterns.map(pattern => {
      return sql`${videos.title} ILIKE ${pattern} OR ${videos.description} ILIKE ${pattern} OR ${videos.summary} ILIKE ${pattern} OR ${videos.channelTitle} ILIKE ${pattern}`;
    });
    
    // Combinamos las condiciones con OR
    const whereClause = sql.join(conditions, sql` OR `);
    
    // Ejecutamos la consulta con orden por relevancia (más recientes primero)
    return db.select()
      .from(videos)
      .where(whereClause)
      .orderBy(desc(videos.publishedAt))
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

  async getChannelsByPlatform(platform: string, limit = 50): Promise<Channel[]> {
    return db.select()
      .from(channels)
      .where(eq(channels.platform, platform))
      .limit(limit);
  }

  async getRecommendedChannels(limit = 8): Promise<Channel[]> {
    // Buscar canales en la tabla recommended_channels y traer sus detalles
    const recommendedChannelsData = await db.select({
      channelId: recommendedChannels.channelId,
      priority: recommendedChannels.priority
    })
    .from(recommendedChannels)
    .orderBy(desc(recommendedChannels.priority))
    .limit(limit);
    
    if (recommendedChannelsData.length === 0) {
      // Si no hay canales recomendados, devolver los más populares basado en suscriptores
      const popularChannels = await db.select()
        .from(channels)
        .orderBy(desc(channels.subscriberCount))
        .limit(limit);
        
      // Validar las URLs de las imágenes
      return popularChannels.map(channel => {
        // Fix: Verificamos y evitamos URLs nulas, indefinidas o no válidas para miniaturas
        let thumbnailUrl = channel.thumbnailUrl;
        if (!thumbnailUrl || thumbnailUrl === 'null' || thumbnailUrl === 'undefined' || !thumbnailUrl.startsWith('http')) {
          thumbnailUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=128`;
        }
        
        // Fix similar para el banner
        let bannerUrl = channel.bannerUrl;
        if (!bannerUrl || bannerUrl === 'null' || bannerUrl === 'undefined' || !bannerUrl.startsWith('http')) {
          bannerUrl = null;
        }
        
        return {
          ...channel,
          thumbnailUrl,
          bannerUrl
        };
      });
    }
    
    // Obtener detalles completos de los canales recomendados
    const channelIds = recommendedChannelsData.map(rc => rc.channelId);
    const recommendedChannelsDetails = await db.select()
      .from(channels)
      .where(inArray(channels.id, channelIds));
    
    // Ordenar por prioridad y corregir las URLs de imágenes
    return recommendedChannelsDetails
      .map(channel => {
        // Fix: Verificamos y evitamos URLs nulas, indefinidas o no válidas para miniaturas
        let thumbnailUrl = channel.thumbnailUrl;
        if (!thumbnailUrl || thumbnailUrl === 'null' || thumbnailUrl === 'undefined' || !thumbnailUrl.startsWith('http')) {
          thumbnailUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=128`;
        }
        
        // Fix similar para el banner
        let bannerUrl = channel.bannerUrl;
        if (!bannerUrl || bannerUrl === 'null' || bannerUrl === 'undefined' || !bannerUrl.startsWith('http')) {
          bannerUrl = null;
        }
        
        return {
          ...channel,
          thumbnailUrl,
          bannerUrl
        };
      })
      .sort((a, b) => {
        const aPriority = recommendedChannelsData.find(rc => rc.channelId === a.id)?.priority || 0;
        const bPriority = recommendedChannelsData.find(rc => rc.channelId === b.id)?.priority || 0;
        return bPriority - aPriority;
      });
  }

  async searchChannels(query: string, limit = 50): Promise<Channel[]> {
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
      summary: videos.summary,
      language: videos.language,
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
      externalId: videos.externalId,
      featured: videos.featured,
      featuredOrder: videos.featuredOrder
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

  async getSubscribedChannelsByUserId(userId: number): Promise<(Channel & { notificationsEnabled: boolean })[]> {
    const subscriptions = await db
      .select({
        channelId: channelSubscriptions.channelId,
        notificationsEnabled: channelSubscriptions.notificationsEnabled
      })
      .from(channelSubscriptions)
      .where(eq(channelSubscriptions.userId, userId));
    
    if (subscriptions.length === 0) {
      return [];
    }
    
    const channelIds = subscriptions.map(sub => sub.channelId);
    
    const channelsList = await db
      .select()
      .from(channels)
      .where(inArray(channels.id, channelIds));
    
    // Combinar canales con sus preferencias de notificación
    return channelsList.map(channel => {
      const subscription = subscriptions.find(sub => sub.channelId === channel.id);
      return {
        ...channel,
        notificationsEnabled: subscription ? subscription.notificationsEnabled : false
      };
    });
  }
  
  async getSubscriptionsByChannelId(channelId: number): Promise<ChannelSubscription[]> {
    return db
      .select()
      .from(channelSubscriptions)
      .where(eq(channelSubscriptions.channelId, channelId));
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
  async getNotificationsByUserId(userId: number, limit = 50, offset = 0): Promise<Notification[]> {
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
  
  // Recommended Channels operations
  async getRecommendedChannelsList(limit = 100, offset = 0): Promise<RecommendedChannel[]> {
    const results = await db.select({
        id: recommendedChannels.id,
        channelId: recommendedChannels.channelId,
        addedById: recommendedChannels.addedById,
        notes: recommendedChannels.notes,
        priority: recommendedChannels.priority,
        createdAt: recommendedChannels.createdAt
      })
      .from(recommendedChannels)
      .orderBy(desc(recommendedChannels.priority))
      .limit(limit)
      .offset(offset);
    
    return results;
  }
  
  async getRecommendedChannelById(id: number): Promise<RecommendedChannel | undefined> {
    const result = await db.select()
      .from(recommendedChannels)
      .where(eq(recommendedChannels.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async isRecommendedChannel(channelId: number): Promise<boolean> {
    const result = await db.select({ id: recommendedChannels.id })
      .from(recommendedChannels)
      .where(eq(recommendedChannels.channelId, channelId));
    return result.length > 0;
  }
  
  async addRecommendedChannel(recommendedChannel: InsertRecommendedChannel): Promise<RecommendedChannel> {
    const result = await db.insert(recommendedChannels)
      .values(recommendedChannel)
      .returning();
    return result[0];
  }
  
  async updateRecommendedChannel(id: number, data: Partial<InsertRecommendedChannel>): Promise<RecommendedChannel | undefined> {
    const result = await db.update(recommendedChannels)
      .set(data)
      .where(eq(recommendedChannels.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async removeRecommendedChannel(id: number): Promise<boolean> {
    const result = await db.delete(recommendedChannels)
      .where(eq(recommendedChannels.id, id))
      .returning();
    return result.length > 0;
  }

  // View History operations
  async getViewHistory(userId: number, limit = 50): Promise<ViewHistory[]> {
    return db.query.viewHistory.findMany({
      where: eq(viewHistory.userId, userId),
      orderBy: [desc(viewHistory.watchedAt)],
      limit
    });
  }

  async addViewHistory(viewHistoryData: InsertViewHistory): Promise<ViewHistory> {
    const existingRecord = await db.query.viewHistory.findFirst({
      where: and(
        eq(viewHistory.userId, viewHistoryData.userId),
        eq(viewHistory.videoId, viewHistoryData.videoId)
      )
    });

    if (existingRecord) {
      // Actualizar el registro existente
      const result = await db.update(viewHistory)
        .set({
          watchedAt: new Date(),
          watchDuration: viewHistoryData.watchDuration,
          completionPercentage: viewHistoryData.completionPercentage
        })
        .where(and(
          eq(viewHistory.userId, viewHistoryData.userId),
          eq(viewHistory.videoId, viewHistoryData.videoId)
        ))
        .returning();
      return result[0];
    } else {
      // Crear un nuevo registro
      const result = await db.insert(viewHistory)
        .values(viewHistoryData)
        .returning();
      return result[0];
    }
  }

  // Dashboard Statistics operations
  async getVideosAddedInTimeRange(days: number): Promise<Video[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateISOString = date.toISOString();

    // Como usamos el campo publishedAt que es texto, convertimos la fecha a texto en formato ISO
    return db.select()
      .from(videos)
      .where(sql`${videos.publishedAt} >= ${dateISOString}`)
      .orderBy(desc(videos.publishedAt));
  }

  async getVideosByPlatformCounts(): Promise<{platform: string, count: number}[]> {
    const result = await db.execute(
      sql`SELECT platform, COUNT(*) as count 
          FROM ${videos} 
          GROUP BY platform 
          ORDER BY count DESC`
    );
    return result.rows.map(row => ({
      platform: row.platform as string,
      count: Number(row.count)
    }));
  }

  async getVideosByCategoryCounts(): Promise<{categoryId: number, count: number}[]> {
    // Como los categoryIds se almacenan como un array en la tabla videos, 
    // usamos unnest para contar ocurrencias de cada categoría
    const result = await db.execute(
      sql`WITH unnested_categories AS (
            SELECT unnest(category_ids::text[])::integer as category_id
            FROM ${videos}
          )
          SELECT category_id as "categoryId", COUNT(*) as count 
          FROM unnested_categories
          GROUP BY category_id 
          ORDER BY count DESC`
    );
    return result.rows.map(row => ({
      categoryId: Number(row.categoryId),
      count: Number(row.count)
    }));
  }

  async getVideosByDateCounts(days: number): Promise<{date: string, count: number}[]> {
    // Usamos una forma diferente de manejar el intervalo con INTERVAL
    const daysValue = days || 30;
    const result = await db.execute(
      sql`SELECT 
            TO_DATE(SUBSTRING(published_at, 1, 10), 'YYYY-MM-DD') as date, 
            COUNT(*) as count 
          FROM ${videos} 
          WHERE published_at >= (NOW() - (${daysValue} || ' days')::INTERVAL)::text 
          GROUP BY TO_DATE(SUBSTRING(published_at, 1, 10), 'YYYY-MM-DD')
          ORDER BY date`
    );
    return result.rows.map(row => ({
      date: (row.date as Date).toISOString().split('T')[0],
      count: Number(row.count)
    }));
  }

  async getTopChannelsByVideos(limit = 10): Promise<{channelId: string, channelTitle: string, count: number}[]> {
    const result = await db.execute(
      sql`SELECT 
            channel_id as "channelId", 
            channel_title as "channelTitle",
            COUNT(*) as count 
          FROM ${videos} 
          GROUP BY channel_id, channel_title 
          ORDER BY count DESC 
          LIMIT ${limit}`
    );
    return result.rows.map(row => ({
      channelId: row.channelId as string,
      channelTitle: row.channelTitle as string,
      count: Number(row.count)
    }));
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

  // Comment operations
  async getCommentsByVideoId(videoId: number, limit = 50, offset = 0): Promise<Comment[]> {
    // Obtenemos primero los comentarios principales (sin padre)
    const mainComments = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        videoId: comments.videoId,
        parentId: comments.parentId,
        content: comments.content,
        likes: comments.likes,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        isEdited: comments.isEdited,
        // Incluimos los datos del usuario que comentó
        username: users.username,
        profilePicture: users.profilePicture,
        name: users.name
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.videoId, videoId),
          sql`${comments.parentId} IS NULL`
        )
      )
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    // Para cada comentario principal, buscamos sus respuestas
    const result = await Promise.all(mainComments.map(async (comment) => {
      const replies = await this.getRepliesByCommentId(comment.id);
      return {
        ...comment,
        replies: replies
      };
    }));

    return result;
  }

  async getCommentsByUserId(userId: number, limit = 50, offset = 0): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.userId, userId))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCommentById(id: number): Promise<Comment | undefined> {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    
    return result.length > 0 ? result[0] : undefined;
  }

  async getRepliesByCommentId(commentId: number, limit = 10, offset = 0): Promise<Comment[]> {
    return db
      .select({
        id: comments.id,
        userId: comments.userId,
        videoId: comments.videoId,
        parentId: comments.parentId,
        content: comments.content,
        likes: comments.likes,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        isEdited: comments.isEdited,
        // Incluimos los datos del usuario que respondió
        username: users.username,
        profilePicture: users.profilePicture,
        name: users.name
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.parentId, commentId))
      .orderBy(asc(comments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCommentCount(videoId: number): Promise<number> {
    const result = await db
      .select({
        count: count()
      })
      .from(comments)
      .where(eq(comments.videoId, videoId));
    
    return result[0].count;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(comment).returning();
    return result[0];
  }

  async updateComment(id: number, content: string): Promise<Comment | undefined> {
    const result = await db
      .update(comments)
      .set({
        content,
        updatedAt: new Date(),
        isEdited: true
      })
      .where(eq(comments.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteComment(id: number): Promise<boolean> {
    // Primero eliminamos las respuestas a este comentario
    await db
      .delete(comments)
      .where(eq(comments.parentId, id));
    
    // Luego eliminamos el comentario principal
    const result = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();
    
    return result.length > 0;
  }

  async likeComment(id: number): Promise<boolean> {
    const result = await db
      .update(comments)
      .set({
        likes: sql`${comments.likes} + 1`
      })
      .where(eq(comments.id, id))
      .returning();
    
    return result.length > 0;
  }

  async unlikeComment(id: number): Promise<boolean> {
    const result = await db
      .update(comments)
      .set({
        likes: sql`GREATEST(0, ${comments.likes} - 1)` // Aseguramos que no sea negativo
      })
      .where(eq(comments.id, id))
      .returning();
    
    return result.length > 0;
  }

  // ========== Implementación de operaciones de encuestas ==========

  // Poll operations
  async getPolls(limit = 100, offset = 0): Promise<Poll[]> {
    return db.select()
      .from(polls)
      .orderBy(desc(polls.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPublishedPolls(limit = 100, offset = 0): Promise<Poll[]> {
    return db.select()
      .from(polls)
      .where(eq(polls.status, "published"))
      .orderBy(desc(polls.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getActiveSidebarPoll(): Promise<(Poll & { options: PollOption[] }) | undefined> {
    // Buscar la encuesta activa para mostrar en el sidebar
    const activePoll = await db.select()
      .from(polls)
      .where(
        and(
          eq(polls.status, "published"),
          eq(polls.showInSidebar, true)
        )
      )
      .orderBy(desc(polls.createdAt))
      .limit(1);

    if (activePoll.length === 0) {
      return undefined;
    }

    // Obtener las opciones de la encuesta
    const options = await this.getPollOptions(activePoll[0].id);
    
    return {
      ...activePoll[0],
      options
    };
  }

  async getPollById(id: number): Promise<(Poll & { options: PollOption[] }) | undefined> {
    const pollResult = await db.select()
      .from(polls)
      .where(eq(polls.id, id));

    if (pollResult.length === 0) {
      return undefined;
    }

    // Obtener las opciones de la encuesta
    const options = await this.getPollOptions(id);
    
    return {
      ...pollResult[0],
      options
    };
  }

  async createPoll(poll: InsertPoll, options: Omit<InsertPollOption, "pollId">[]): Promise<Poll> {
    try {
      // Crear la encuesta
      const result = await db.insert(polls).values(poll).returning();
      const newPoll = result[0];
      
      // Crear las opciones asociadas a la encuesta
      if (options && options.length > 0) {
        for (let i = 0; i < options.length; i++) {
          await db.insert(pollOptions).values({
            pollId: newPoll.id,
            text: options[i].text,
            order: options[i].order || i
          });
        }
      }
      
      return newPoll;
    } catch (error) {
      console.error('Error al crear encuesta:', error);
      throw error;
    }
  }

  async updatePoll(id: number, pollData: Partial<InsertPoll>): Promise<Poll | undefined> {
    const result = await db.update(polls)
      .set({
        ...pollData,
        updatedAt: new Date()
      })
      .where(eq(polls.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deletePoll(id: number): Promise<boolean> {
    try {
      // Nota: Las opciones y votos se eliminarán automáticamente gracias a onDelete: "cascade"
      const result = await db.delete(polls)
        .where(eq(polls.id, id))
        .returning({ id: polls.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error al eliminar encuesta:', error);
      return false;
    }
  }

  async publishPoll(id: number): Promise<Poll | undefined> {
    return this.updatePoll(id, { status: "published" });
  }

  async unpublishPoll(id: number): Promise<Poll | undefined> {
    return this.updatePoll(id, { status: "draft" });
  }

  // Poll vote operations
  async getUserVotesForPoll(pollId: number, userId: number): Promise<number> {
    const votesCount = await db.select({ count: count() })
      .from(pollVotes)
      .where(
        and(
          eq(pollVotes.pollId, pollId),
          eq(pollVotes.userId, userId)
        )
      );
    
    return votesCount[0].count || 0;
  }

  async getPollResults(pollId: number): Promise<{id: number, text: string, voteCount: number}[]> {
    // Obtener las opciones de la encuesta
    const options = await this.getPollOptions(pollId);
    
    // Para cada opción, contar los votos
    const results = await Promise.all(
      options.map(async (option) => {
        const votesCount = await db.select({ count: count() })
          .from(pollVotes)
          .where(
            and(
              eq(pollVotes.pollId, pollId),
              eq(pollVotes.optionId, option.id)
            )
          );
        
        return {
          id: option.id,
          text: option.text,
          voteCount: votesCount[0].count || 0
        };
      })
    );
    
    return results;
  }
  
  // Poll option operations
  async getPollOptions(pollId: number): Promise<PollOption[]> {
    return db.select()
      .from(pollOptions)
      .where(eq(pollOptions.pollId, pollId))
      .orderBy(asc(pollOptions.order));
  }

  async createPollOption(option: InsertPollOption): Promise<PollOption> {
    const result = await db.insert(pollOptions)
      .values(option)
      .returning();
    
    return result[0];
  }

  async updatePollOption(id: number, optionData: Partial<InsertPollOption>): Promise<PollOption | undefined> {
    const result = await db.update(pollOptions)
      .set(optionData)
      .where(eq(pollOptions.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deletePollOption(id: number): Promise<boolean> {
    try {
      const result = await db.delete(pollOptions)
        .where(eq(pollOptions.id, id))
        .returning({ id: pollOptions.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error al eliminar opción de encuesta:', error);
      return false;
    }
  }
  
  // Poll vote operations
  async getPollVotes(pollId: number): Promise<PollVote[]> {
    return db.select()
      .from(pollVotes)
      .where(eq(pollVotes.pollId, pollId));
  }

  async getPollVotesByUser(userId: number, pollId?: number): Promise<PollVote[]> {
    if (pollId) {
      return db.select()
        .from(pollVotes)
        .where(
          and(
            eq(pollVotes.userId, userId),
            eq(pollVotes.pollId, pollId)
          )
        );
    } else {
      return db.select()
        .from(pollVotes)
        .where(eq(pollVotes.userId, userId));
    }
  }

  async getVoteResultsByPollId(pollId: number): Promise<{
    id: number,
    text: string,
    textEs?: string,
    voteCount: number,
    percentage: number
  }[]> {
    try {
      // Primero obtenemos todas las opciones de la encuesta
      const options = await this.getPollOptions(pollId);
      
      // Luego contamos los votos para cada opción
      const voteCounts = await db.select({
        optionId: pollVotes.optionId,
        votes: count()
      })
      .from(pollVotes)
      .where(eq(pollVotes.pollId, pollId))
      .groupBy(pollVotes.optionId);
      
      // Mapeamos los resultados y calculamos porcentajes
      const totalVotes = voteCounts.reduce((sum, option) => sum + Number(option.votes), 0);
      
      return options.map(option => {
        const voteCount = voteCounts.find(vc => vc.optionId === option.id);
        const votes = voteCount ? Number(voteCount.votes) : 0;
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        
        return {
          id: option.id,
          text: option.text,
          textEs: option.textEs,
          voteCount: votes,
          percentage
        };
      });
    } catch (error) {
      console.error('Error al obtener resultados de encuesta:', error);
      return [];
    }
  }

  async createPollVote(vote: InsertPollVote): Promise<PollVote> {
    // Verificar si el usuario ya ha votado en esta encuesta
    const existingVote = await this.hasUserVotedInPoll(vote.userId, vote.pollId);
    
    if (existingVote) {
      throw new Error('El usuario ya ha votado en esta encuesta');
    }
    
    const result = await db.insert(pollVotes)
      .values(vote)
      .returning();
    
    return result[0];
  }

  async hasUserVotedInPoll(userId: number, pollId: number): Promise<boolean> {
    const votes = await db.select()
      .from(pollVotes)
      .where(
        and(
          eq(pollVotes.userId, userId),
          eq(pollVotes.pollId, pollId)
        )
      )
      .limit(1);
    
    return votes.length > 0;
  }

  async deletePollVote(id: number): Promise<boolean> {
    try {
      const result = await db.delete(pollVotes)
        .where(eq(pollVotes.id, id))
        .returning({ id: pollVotes.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error al eliminar voto:', error);
      return false;
    }
  }
}

// Exportar una instancia para su uso en la aplicación
export const pgStorage = new PgStorage();