import { pgTable, text, serial, integer, boolean, timestamp, uuid, primaryKey, uniqueIndex, varchar } from "drizzle-orm/pg-core";
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
  isNotified: boolean("is_notified").default(false), // Indica si ya se han enviado notificaciones para este video
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
  platform: text("platform").notNull(), // YouTube, TikTok, Twitter, Instagram, Twitch
  externalId: text("external_id").notNull(),
  subscriberCount: integer("subscriber_count").default(0),
  videoCount: integer("video_count").default(0),
  url: text("url"), // URL del canal (perfil)
  verified: boolean("verified").default(false), // Si el canal está verificado
  handle: text("handle"), // Nombre de usuario/handle (@username)
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

// Tabla de canales recomendados (seleccionados por el administrador para mostrar en la página principal)
export const recommendedChannels = pgTable("recommended_channels", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").references(() => channels.id).notNull().unique(),
  addedById: integer("added_by_id").references(() => users.id).notNull(),
  notes: text("notes"),
  priority: integer("priority").default(0), // Mayor número = mayor prioridad
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRecommendedChannelSchema = createInsertSchema(recommendedChannels).omit({
  id: true,
  createdAt: true,
});

export type InsertRecommendedChannel = z.infer<typeof insertRecommendedChannelSchema>;
export type RecommendedChannel = typeof recommendedChannels.$inferSelect;

export type InsertViewHistory = z.infer<typeof insertViewHistorySchema>;
export type ViewHistory = typeof viewHistory.$inferSelect;

// Tipos de roles de usuario
export const UserRole = z.enum(["free", "premium", "admin"]);
export type UserRole = z.infer<typeof UserRole>;

// Platform type for frontend filtering
export const PlatformType = z.enum(["all", "youtube", "tiktok", "twitter", "instagram", "twitch"]);
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

// Tabla para comentarios en videos
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"), // Para respuestas a otros comentarios
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isEdited: boolean("is_edited").default(false).notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
  isEdited: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Tabla para encuestas
export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),          // Título principal (inglés)
  question: text("question").notNull(),    // Pregunta principal (inglés)
  status: text("status", { enum: ["draft", "published"] }).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),      // Fecha opcional de vencimiento
  createdById: integer("created_by_id").references(() => users.id, { onDelete: "set null" }),
  showInSidebar: boolean("show_in_sidebar").default(false).notNull(), // Para destacar en el sidebar
  featured: boolean("featured").default(false).notNull(), // Para destacar en la página principal
  titleEs: text("title_es"),               // Título en español
  questionEs: text("question_es"),         // Pregunta en español 
  language: text("language").default("es").notNull(), // Idioma predeterminado de la encuesta
});

export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tabla para opciones de encuestas
export const pollOptions = pgTable("poll_options", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  text: text("text").notNull(),       // Texto principal (inglés)
  textEs: text("text_es"),            // Texto en español
  order: integer("order").default(0).notNull(), // Para ordenar las opciones
});

export const insertPollOptionSchema = createInsertSchema(pollOptions).omit({
  id: true,
});

// Tabla para respuestas a encuestas
export const pollVotes = pgTable("poll_votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  optionId: integer("option_id").notNull().references(() => pollOptions.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPollVoteSchema = createInsertSchema(pollVotes).omit({
  id: true,
  createdAt: true,
});

export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Poll = typeof polls.$inferSelect;

export type InsertPollOption = z.infer<typeof insertPollOptionSchema>;
export type PollOption = typeof pollOptions.$inferSelect;

export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;
export type PollVote = typeof pollVotes.$inferSelect;

// Esquema para los jugadores del Real Madrid
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  number: integer("number"),
  country: text("country").notNull(),
  birthDate: text("birth_date"),
  height: integer("height"), // en cm
  weight: integer("weight"), // en kg
  photo: text("photo"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Esquema para las estadísticas de los jugadores
export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  season: text("season").notNull(), // Ejemplo: "2024/2025"
  goals: integer("goals").default(0),
  assists: integer("assists").default(0),
  appearances: integer("appearances").default(0),
  yellowCards: integer("yellow_cards").default(0),
  redCards: integer("red_cards").default(0),
  minutesPlayed: integer("minutes_played").default(0),
  passAccuracy: integer("pass_accuracy"), // porcentaje
  aerialDuelsWon: integer("aerial_duels_won").default(0),
  rating: integer("rating"), // calificación del 1-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Esquema para registrar las rondas del mini-juego de estadísticas
export const statsGames = pgTable("stats_games", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  score: integer("score").default(0),
  totalQuestions: integer("total_questions").default(0),
  correctAnswers: integer("correct_answers").default(0),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).default("medium"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStatsGameSchema = createInsertSchema(statsGames).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

// Esquema para las preguntas individuales del juego de estadísticas
export const statsGameQuestions = pgTable("stats_game_questions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => statsGames.id).notNull(),
  player1Id: integer("player1_id").references(() => players.id).notNull(),
  player2Id: integer("player2_id").references(() => players.id).notNull(),
  statType: text("stat_type", { 
    enum: ["goals", "assists", "appearances", "yellowCards", "redCards", 
           "minutesPlayed", "passAccuracy", "aerialDuelsWon", "rating"] 
  }).notNull(),
  userSelection: integer("user_selection").references(() => players.id),
  correctAnswer: integer("correct_answer").references(() => players.id).notNull(),
  isCorrect: boolean("is_correct"),
  explanation: text("explanation"),
  question: text("question"),
  hint: text("hint"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStatsGameQuestionSchema = createInsertSchema(statsGameQuestions).omit({
  id: true,
  createdAt: true,
});

// Tipos para los esquemas
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;
export type PlayerStats = typeof playerStats.$inferSelect;

export type InsertStatsGame = z.infer<typeof insertStatsGameSchema>;
export type StatsGame = typeof statsGames.$inferSelect;

export type InsertStatsGameQuestion = z.infer<typeof insertStatsGameQuestionSchema>;
export type StatsGameQuestion = typeof statsGameQuestions.$inferSelect;

// Enum para los tipos de estadísticas
export const StatType = z.enum([
  "goals", "assists", "appearances", "yellowCards", "redCards", 
  "minutesPlayed", "passAccuracy", "aerialDuelsWon", "rating"
]);
export type StatType = z.infer<typeof StatType>;

// Enum para las dificultades del juego
export const GameDifficulty = z.enum(["easy", "medium", "hard"]);
export type GameDifficulty = z.infer<typeof GameDifficulty>;

// Tabla para los registros de inicio de sesión
export const loginLogs = pgTable("login_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: text("details"),
});

export const insertLoginLogSchema = createInsertSchema(loginLogs).omit({
  id: true,
});

export type InsertLoginLog = z.infer<typeof insertLoginLogSchema>;
export type LoginLog = typeof loginLogs.$inferSelect;
