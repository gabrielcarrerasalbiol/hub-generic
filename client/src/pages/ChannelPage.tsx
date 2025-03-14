import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import VideoCard from "@/components/VideoCard";
import SubscribeButton from "@/components/SubscribeButton";
import { getQueryFn } from "@/lib/queryClient";
import { Video, Channel } from "@shared/schema";

// Extendemos el tipo Channel para incluir información de suscripción
interface ChannelWithSubscription extends Channel {
  isSubscribed?: boolean;
  notificationsEnabled?: boolean;
}

interface SubscriptionStatusResponse {
  isSubscribed: boolean;
  notificationsEnabled: boolean;
}
import { useAuth } from "@/hooks/useAuth";

export default function ChannelPage() {
  // Get the channel ID from the URL
  const [, params] = useRoute("/channel/:id");
  const channelId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  
  // Check subscription status
  const { data: subscriptionStatus } = useQuery({
    queryKey: [`/api/channels/${channelId}/subscription`],
    queryFn: getQueryFn<SubscriptionStatusResponse>({ on401: 'returnNull' }),
    enabled: !!channelId && !!user,
  });

  // Fetch channel details
  const { 
    data: channel = {} as Channel, 
    isLoading: isChannelLoading, 
    error: channelError 
  } = useQuery({
    queryKey: [`/api/channels/${channelId}`],
    queryFn: getQueryFn<Channel>({ on401: 'returnNull' }),
    enabled: !!channelId,
  });

  // Fetch channel videos
  const { 
    data: videos = [], 
    isLoading: isVideosLoading, 
    error: videosError 
  } = useQuery({
    queryKey: [`/api/channels/${channelId}/videos`],
    queryFn: getQueryFn<Video[]>({ on401: 'returnNull' }),
    enabled: !!channelId,
  });

  // Display loading state
  if (isChannelLoading) {
    return (
      <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-6 relative">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <Skeleton className="w-24 h-24 rounded-full -mt-12 md:-mt-16 border-4 border-white" />
              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full aspect-video" />
                <div className="p-3">
                  <Skeleton className="h-5 w-full mb-3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-3 w-40 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Display error state
  if (channelError || !channel) {
    return (
      <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p>No se pudo cargar la información del canal.</p>
        </div>
      </main>
    );
  }

  // Format subscriber and video counts
  const formatCount = (count: number | null): string => {
    if (count === null) return '0';
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Determine platform-specific styling
  const getPlatformColor = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'bg-red-500';
      case 'tiktok':
        return 'bg-black';
      case 'twitter':
        return 'bg-blue-400';
      case 'instagram':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPlatformIcon = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'fab fa-youtube';
      case 'tiktok':
        return 'fab fa-tiktok';
      case 'twitter':
        return 'fab fa-twitter';
      case 'instagram':
        return 'fab fa-instagram';
      default:
        return 'fas fa-play';
    }
  };

  return (
    <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Channel Banner */}
        <div 
          className="h-48 bg-[#1E3A8A]" 
          style={channel.bannerUrl ? { backgroundImage: `url(${channel.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        ></div>
        
        {/* Channel Info */}
        <div className="p-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <img 
              src={channel.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=128`} 
              alt={channel.title} 
              className="w-24 h-24 rounded-full -mt-12 md:-mt-16 border-4 border-white object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=128`;
              }}
            />
            
            <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
              <div className="flex items-center flex-col md:flex-row">
                <h1 className="text-2xl font-bold">{channel.title}</h1>
                <span className={`ml-0 md:ml-3 mt-2 md:mt-0 text-xs px-2 py-1 text-white rounded-full ${getPlatformColor(channel.platform)}`}>
                  <i className={`${getPlatformIcon(channel.platform)} mr-1`}></i> 
                  {channel.platform}
                </span>
              </div>
              
              <div className="flex items-center mt-2 space-x-4 justify-center md:justify-start">
                <span className="text-sm text-gray-600">
                  <i className="fas fa-users mr-1"></i> 
                  {formatCount(channel.subscriberCount)} suscriptores
                </span>
                <span className="text-sm text-gray-600">
                  <i className="fas fa-video mr-1"></i> 
                  {formatCount(channel.videoCount)} videos
                </span>
              </div>
              
              <div className="mt-4">
                <SubscribeButton 
                  channelId={channel.id} 
                  initialSubscribed={subscriptionStatus?.isSubscribed || false}
                  initialNotificationsEnabled={subscriptionStatus?.notificationsEnabled || false}
                />
              </div>
              
              {channel.description && (
                <p className="mt-4 text-sm text-gray-700">{channel.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Channel Videos */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Videos del Canal</h2>
        
        {isVideosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full aspect-video" />
                <div className="p-3">
                  <Skeleton className="h-5 w-full mb-3" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : videosError || !videos || videos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p>No hay videos disponibles para este canal.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video: Video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
            
            {videos.length >= 8 && (
              <div className="mt-4 text-center">
                <Button variant="outline" className="px-6 py-2 border-[#1E3A8A] text-[#1E3A8A]">
                  Cargar más videos
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
