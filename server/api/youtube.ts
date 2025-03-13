import axios from 'axios';
import { InsertVideo, InsertChannel } from '@shared/schema';

// YouTube API constants
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

interface YouTubeSearchResult {
  items: Array<{
    id: {
      kind: string;
      videoId?: string;
      channelId?: string;
    };
    snippet: {
      title: string;
      description: string;
      channelId: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
  }>;
  nextPageToken?: string;
}

interface YouTubeVideoResult {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      channelId: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

interface YouTubeChannelResult {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
    brandingSettings?: {
      image?: {
        bannerExternalUrl?: string;
      };
    };
    statistics: {
      subscriberCount: string;
      videoCount: string;
    };
  }>;
}

/**
 * Search YouTube for Real Madrid related content
 */
export async function searchYouTubeVideos(query: string, maxResults = 10, pageToken = ''): Promise<YouTubeSearchResult> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: `Real Madrid ${query}`,
        maxResults,
        pageToken,
        type: 'video',
        key: YOUTUBE_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('YouTube API search error:', error);
    return { items: [] };
  }
}

/**
 * Get video details from YouTube
 */
export async function getYouTubeVideoDetails(videoIds: string[]): Promise<YouTubeVideoResult> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('YouTube API video details error:', error);
    return { items: [] };
  }
}

/**
 * Get channel details from YouTube
 */
export async function getYouTubeChannelDetails(channelIds: string[]): Promise<YouTubeChannelResult> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
      params: {
        part: 'snippet,statistics,brandingSettings',
        id: channelIds.join(','),
        key: YOUTUBE_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('YouTube API channel details error:', error);
    return { items: [] };
  }
}

/**
 * Convert YouTube video to our schema format
 */
export function convertYouTubeVideoToSchema(
  video: YouTubeVideoResult['items'][0], 
  categoryIds: number[] = []
): InsertVideo {
  // Parse ISO 8601 duration
  const parseDuration = (isoDuration: string): string => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match && match[1]) ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = (match && match[2]) ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = (match && match[3]) ? parseInt(match[3].replace('S', '')) : 0;

    let durationString = '';
    if (hours > 0) durationString += `${hours}:`;
    durationString += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return durationString;
  };

  return {
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnailUrl: video.snippet.thumbnails.high.url,
    videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    platform: 'YouTube',
    channelId: video.snippet.channelId,
    channelTitle: video.snippet.channelTitle,
    channelThumbnail: '', // This requires a separate API call to get channel details
    viewCount: parseInt(video.statistics.viewCount, 10) || 0,
    duration: parseDuration(video.contentDetails.duration),
    publishedAt: video.snippet.publishedAt,
    categoryIds: categoryIds.map(id => id.toString()),
    externalId: video.id
  };
}

/**
 * Convert YouTube channel to our schema format
 */
export function convertYouTubeChannelToSchema(channel: YouTubeChannelResult['items'][0]): InsertChannel {
  return {
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails.high.url,
    bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || '',
    platform: 'YouTube',
    externalId: channel.id,
    subscriberCount: parseInt(channel.statistics.subscriberCount, 10) || 0,
    videoCount: parseInt(channel.statistics.videoCount, 10) || 0,
  };
}
