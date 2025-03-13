import axios from 'axios';
import { InsertVideo, InsertChannel } from '../../shared/schema';

// Twitter API configuration
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || '';
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || '';
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  attachments?: {
    media_keys?: string[];
  };
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    view_count?: number;
  };
  entities?: {
    urls?: Array<{
      url: string;
      expanded_url: string;
      display_url: string;
      media_key?: string;
    }>;
  };
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  description: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
}

interface TwitterMedia {
  media_key: string;
  type: string;
  url?: string;
  preview_image_url?: string;
  duration_ms?: number;
}

/**
 * Search Twitter for Real Madrid related content
 */
export async function searchTwitterVideos(query: string, maxResults = 10): Promise<TwitterTweet[]> {
  try {
    // This would be where you'd make the actual Twitter API call
    // Twitter API v2 requires proper authentication and setup
    console.log(`Would search Twitter for: "Real Madrid ${query}" with max ${maxResults} results`);
    return [];
  } catch (error) {
    console.error('Twitter API search error:', error);
    return [];
  }
}

/**
 * Get Twitter user details
 */
export async function getTwitterUserDetails(username: string): Promise<TwitterUser | null> {
  try {
    // This would be where you'd make the actual Twitter API call
    console.log(`Would fetch Twitter user: ${username}`);
    return null;
  } catch (error) {
    console.error('Twitter API user details error:', error);
    return null;
  }
}

/**
 * Convert Twitter tweet with video to our schema format
 */
export function convertTwitterVideoToSchema(
  tweet: TwitterTweet, 
  user: TwitterUser,
  media: TwitterMedia,
  categoryIds: number[] = []
): InsertVideo {
  // Format duration from milliseconds to mm:ss
  const formatDuration = (ms?: number): string => {
    if (!ms) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    title: tweet.text.substring(0, 100) || `Tweet by @${user.username}`,
    description: tweet.text,
    thumbnailUrl: media.preview_image_url || '',
    videoUrl: `https://twitter.com/${user.username}/status/${tweet.id}`,
    embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${tweet.id}`,
    platform: 'Twitter',
    channelId: user.id,
    channelTitle: user.name,
    channelThumbnail: user.profile_image_url,
    viewCount: tweet.public_metrics.view_count || tweet.public_metrics.retweet_count + tweet.public_metrics.like_count,
    duration: formatDuration(media.duration_ms),
    publishedAt: tweet.created_at,
    categoryIds: categoryIds.map(id => id.toString()),
    externalId: tweet.id
  };
}

/**
 * Convert Twitter user to our schema format
 */
export function convertTwitterUserToSchema(user: TwitterUser): InsertChannel {
  return {
    title: user.name,
    description: user.description,
    thumbnailUrl: user.profile_image_url,
    bannerUrl: '', // Twitter API needs additional calls to get banner URL
    platform: 'Twitter',
    externalId: user.id,
    subscriberCount: user.public_metrics.followers_count,
    videoCount: Math.floor(user.public_metrics.tweet_count / 4), // Rough estimate
  };
}
