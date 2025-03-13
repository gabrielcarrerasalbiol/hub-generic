import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Video schema
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
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

// Category schema
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Platform type for frontend filtering
export const PlatformType = z.enum(["all", "youtube", "tiktok", "twitter", "instagram"]);
export type PlatformType = z.infer<typeof PlatformType>;

// Category type for frontend filtering
export const CategoryType = z.enum([
  "all", 
  "matches", 
  "training", 
  "press", 
  "interviews", 
  "players", 
  "analysis"
]);
export type CategoryType = z.infer<typeof CategoryType>;
