import { pgTable, text, serial, integer, boolean, timestamp, uuid, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with extended fields for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").unique(),
  name: text("name"),
  profilePicture: text("profile_picture"),
  googleId: text("google_id").unique(),
  appleId: text("apple_id").unique(),
  role: text("role", { enum: ["free", "premium", "admin"] }).default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  profilePicture: true,
  googleId: true,
  appleId: true,
  role: true,
});

// Session schema for storing auth sessions
export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// OAuth tokens schema
export const oauthTokens = pgTable("oauth_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(), // 'google', 'apple'
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOAuthTokenSchema = createInsertSchema(oauthTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Video schema
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  summary: text("summary"), // Resumen del contenido generado por IA
  language: text("language"), // Idioma del video (es, en, fr, etc.)
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url").notNull(),
  embedUrl: text("embed_url").notNull(),
  platform: text("platform").notNull(), // YouTube, TikTok, Twitter, Instagram
  channelId: text("channel_id").notNull(),
  channelTitle: text("channel_title").notNull(),
  channelThumbnail: text("channel_thumbnail"),
  viewCount: integer("view_count").default(0),
  duration: text("duration"),
  publishedAt: text("published_at"),
  categoryIds: text("category_ids").array(),
  externalId: text("external_id").notNull(),
  featured: boolean("featured").default(false), // Indica si el video está destacado
  featuredOrder: integer("featured_order").default(0), // Orden de aparición si está destacado
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
});

// Channel schema
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  bannerUrl: text("banner_url"),
  platform: text("platform").notNull(), // YouTube, TikTok, Twitter, Instagram
  externalId: text("external_id").notNull(),
  subscriberCount: integer("subscriber_count").default(0),
  videoCount: integer("video_count").default(0),
});

export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
});

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Favorites schema
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  videoId: integer("video_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

// Tabla para suscripciones a canales
export const channelSubscriptions = pgTable("channel_subscriptions", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelId: integer("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userChannelIdx: primaryKey({ columns: [table.userId, table.channelId] }),
  };
});

export const insertChannelSubscriptionSchema = createInsertSchema(channelSubscriptions);

// Tabla para notificaciones de nuevos videos
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelId: integer("channel_id").references(() => channels.id, { onDelete: "set null" }),
  videoId: integer("video_id").references(() => videos.id, { onDelete: "set null" }),
  type: text("type").notNull(), // 'new_video', 'channel_update', etc.
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true, 
  createdAt: true,
  isRead: true,
});

// Historial de visualización de videos
export const viewHistory = pgTable("view_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
  watchDuration: integer("watch_duration"), // En segundos
  completionPercentage: integer("completion_percentage"), // 0-100
});

export const insertViewHistorySchema = createInsertSchema(viewHistory).omit({
  id: true,
  watchedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Session = typeof sessions.$inferSelect;

export type InsertOAuthToken = z.infer<typeof insertOAuthTokenSchema>;
export type OAuthToken = typeof oauthTokens.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
// El tipo base de Video desde la base de datos
export type VideoBase = typeof videos.$inferSelect;
// Video extendido con propiedades adicionales que se añaden en las respuestas de la API
export type Video = VideoBase & {
  isFavorite?: boolean;
};

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type InsertChannelSubscription = z.infer<typeof insertChannelSubscriptionSchema>;
export type ChannelSubscription = typeof channelSubscriptions.$inferSelect;

// Tabla de canales premium (canales seleccionados por el administrador)
export const premiumChannels = pgTable("premium_channels", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").references(() => channels.id).notNull().unique(),
  addedById: integer("added_by_id").references(() => users.id).notNull(),
  notes: text("notes"),
  priority: integer("priority").default(0), // Mayor número = mayor prioridad
  createdAt: timestamp("created_at").defaultNow(),
  lastSyncAt: timestamp("last_sync_at"), // Última vez que se importaron videos
});

export const insertPremiumChannelSchema = createInsertSchema(premiumChannels).omit({
  id: true,
  createdAt: true,
  lastSyncAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertPremiumChannel = z.infer<typeof insertPremiumChannelSchema>;
export type PremiumChannel = typeof premiumChannels.$inferSelect;

export type InsertViewHistory = z.infer<typeof insertViewHistorySchema>;
export type ViewHistory = typeof viewHistory.$inferSelect;

// Tipos de roles de usuario
export const UserRole = z.enum(["free", "premium", "admin"]);
export type UserRole = z.infer<typeof UserRole>;

// Platform type for frontend filtering
export const PlatformType = z.enum(["all", "youtube", "tiktok", "twitter", "instagram"]);
export type PlatformType = z.infer<typeof PlatformType>;

// Category type for frontend filtering
export const CategoryType = z.enum([
  "all", 
  "matches", 
  "transfers", 
  "tactics", 
  "interviews", 
  "history", 
  "fan_content",
  "news"
]);
export type CategoryType = z.infer<typeof CategoryType>;
