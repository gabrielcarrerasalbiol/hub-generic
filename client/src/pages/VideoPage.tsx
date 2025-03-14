import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/VideoPlayer";
import VideoCard from "@/components/VideoCard";
import SubscribeButton from "@/components/SubscribeButton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Video } from "@shared/schema";

interface SubscriptionStatusResponse {
  isSubscribed: boolean;
  notificationsEnabled: boolean;
}

export default function VideoPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, params] = useRoute("/video/:id");
  const videoId = params?.id ? parseInt(params.id) : 0;

  // Fetch video details
  const { 
    data: video, 
    isLoading: isVideoLoading,
    error: videoError
  } = useQuery({
    queryKey: [`/api/videos/${videoId}`],
    queryFn: getQueryFn<Video>({ on401: 'returnNull' }),
    enabled: !!videoId
  });
  
  // Obtener el estado de suscripción para este canal (si el video se cargó y el usuario está autenticado)
  const { data: subscriptionStatus } = useQuery({
    queryKey: [`/api/channels/${video?.channelId}/subscription`],
    queryFn: getQueryFn<SubscriptionStatusResponse>({ on401: 'returnNull' }),
    enabled: !!user && !!video?.channelId,
    refetchOnWindowFocus: true,
  });

  // Fetch related videos
  const { 
    data: relatedVideos = [], 
    isLoading: isRelatedLoading 
  } = useQuery({
    queryKey: ['/api/videos/trending', { limit: 4 }],
    queryFn: getQueryFn<Video[]>({ on401: 'returnNull' }),
    enabled: !!videoId
  });

  // Handle adding/removing favorites
  const handleToggleFavorite = async () => {
    if (!video) return;

    try {
      if (video.isFavorite) {
        // Remove from favorites
        await apiRequest('DELETE', `/api/favorites/${video.id}`);
        toast({
          title: "Video eliminado de favoritos",
          description: "El video ha sido eliminado de tu lista de favoritos."
        });
      } else {
        // Add to favorites
        await apiRequest('POST', '/api/favorites', { videoId: video.id });
        toast({
          title: "Video añadido a favoritos",
          description: "El video ha sido añadido a tu lista de favoritos."
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar los favoritos. Intenta de nuevo más tarde.",
        variant: "destructive"
      });
    }
  };

  // Loading state
  if (isVideoLoading) {
    return (
      <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="bg-white rounded-lg shadow-md p-4 mt-4">
              <Skeleton className="h-7 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <h2 className="font-bold text-xl mb-4">Videos relacionados</h2>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="w-full aspect-video" />
                  <div className="p-3">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (videoError || !video) {
    return (
      <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p>No se pudo cargar el video solicitado.</p>
          <Link href="/">
            <a className="mt-4 inline-block text-[#1E3A8A] hover:underline">
              Volver a la página principal
            </a>
          </Link>
        </div>
      </main>
    );
  }

  // Format view count
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Format publish date
  const formatPublishedDate = (dateString?: string): string => {
    if (!dateString) return 'Fecha desconocida';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} meses`;
    return `hace ${Math.floor(diffDays / 365)} años`;
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
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-6 px-2">
          {/* CONTROLES PRINCIPALES - MUY GRANDES Y VISIBLES - Con colores del Real Madrid */}
          <div className="w-full bg-white border-2 border-[#FDBE11] rounded-lg p-6 shadow-xl">
            {/* Título grande y acción de favorito */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-[#001C58] pr-4">{video.title}</h1>
              <button 
                className={`text-3xl p-2 rounded-full ${video.isFavorite ? 'bg-[#FDBE11] text-[#001C58]' : 'bg-gray-100 text-gray-400 hover:bg-[#FDBE11] hover:text-[#001C58]'}`}
                onClick={handleToggleFavorite}
                aria-label={video.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              >
                <i className={video.isFavorite ? 'fas fa-star' : 'far fa-star'}></i>
              </button>
            </div>
          
            {/* Información del canal y suscripción con un fondo diferente */}
            <div className="bg-[#F8F8FA] rounded-lg p-4 mb-6 shadow-md border border-[#FDBE11] flex flex-wrap md:flex-nowrap justify-between items-center">
              <div 
                onClick={() => window.location.href = `/channel/${video.channelId}`}
                className="flex items-center hover:bg-white p-2 rounded-md cursor-pointer mb-4 md:mb-0"
              >
                <img 
                  src={video.channelThumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelTitle)}&background=random&color=fff&size=128`} 
                  alt={video.channelTitle} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#FDBE11]" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelTitle)}&background=random&color=fff&size=128`;
                  }}
                />
                <div className="ml-4">
                  <p className="font-bold text-lg text-[#001C58]">{video.channelTitle}</p>
                  <p className="text-sm text-[#001C58]">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${getPlatformColor(video.platform)}`}>
                      <i className={`${getPlatformIcon(video.platform)} mr-1`}></i> 
                      {video.platform}
                    </span>
                    <span className="ml-2">{formatViewCount(video.viewCount)} visualizaciones</span>
                  </p>
                </div>
              </div>
              
              {/* Subscribe Button MUY GRANDE */}
              {user && video.channelId ? (
                <div className="flex-shrink-0 scale-125 transform">
                  <SubscribeButton 
                    channelId={parseInt(video.channelId)}
                    initialSubscribed={subscriptionStatus?.isSubscribed}
                    initialNotificationsEnabled={subscriptionStatus?.notificationsEnabled}
                  />
                </div>
              ) : (
                <div className="bg-gray-100 rounded p-3 text-center border border-[#FDBE11]">
                  <p className="text-[#001C58]">Inicia sesión para agregar a favoritos</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Video Player */}
              <VideoPlayer embedUrl={video.embedUrl} title={video.title} />
              
              {/* Video Description con mejor formato - Colores Real Madrid */}
              <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                <h3 className="font-medium text-lg mb-2 text-[#001C58]">Descripción</h3>
                {video.description ? (
                  <div className="text-gray-700 whitespace-pre-line text-sm border-l-4 border-[#FDBE11] pl-3">
                    {video.description.length > 300 
                      ? `${video.description.substring(0, 300)}...` 
                      : video.description
                    }
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Este video no tiene descripción.</p>
                )}
                <p className="text-xs text-gray-500 mt-3">Publicado: {formatPublishedDate(video.publishedAt)}</p>
              </div>
            </div>
            
            {/* Related Videos */}
            <div className="lg:col-span-1">
              <h2 className="font-bold text-xl mb-4 text-[#001C58]">Videos relacionados</h2>
              
              {isRelatedLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <Skeleton className="w-full aspect-video" />
                      <div className="p-3">
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : relatedVideos && relatedVideos.length > 0 ? (
                <div className="space-y-4">
                  {relatedVideos
                    .filter((v: Video) => v.id !== video.id)
                    .slice(0, 4)
                    .map((relatedVideo: Video) => (
                      <VideoCard key={relatedVideo.id} video={relatedVideo} compact />
                    ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <p>No hay videos relacionados disponibles.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
