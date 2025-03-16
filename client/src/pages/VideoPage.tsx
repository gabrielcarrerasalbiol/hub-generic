import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import VideoCard from "@/components/VideoCard";
import SubscribeButton from "@/components/SubscribeButton";
import ShareVideoModal from "@/components/ShareVideoModal";
import CommentSection from "@/components/CommentSection";
import SEO from "@/components/SEO";
import { videoSchema } from "@/lib/schemaData";
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
  const [shareModalOpen, setShareModalOpen] = useState(false);

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
        await apiRequest<any>(`/api/favorites/${video.id}`, {
          method: 'DELETE'
        });
        toast({
          title: "Video eliminado de favoritos",
          description: "El video ha sido eliminado de tu lista de favoritos."
        });
      } else {
        // Add to favorites
        await apiRequest<any>('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ videoId: video.id })
        });
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
      case 'twitch':
        return 'bg-purple-600';
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
      case 'twitch':
        return 'fab fa-twitch';
      default:
        return 'fas fa-play';
    }
  };

  // SEO optimizado para videos
  const videoLang = video.language || 'es';
  const videoMetaDescription = video.description 
    ? (video.description.length > 160 ? `${video.description.substring(0, 157)}...` : video.description)
    : `Video de ${video.channelTitle} sobre el Real Madrid. Ver en Hub Madridista, el agregador de contenido madridista.`;
  
  return (
    <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-y-auto">
      {/* SEO optimizado para páginas de video */}
      <SEO
        title={`${video.title} | Hub Madridista`}
        description={videoMetaDescription}
        keywords={`Real Madrid, videos, ${video.channelTitle}, fútbol, LaLiga`}
        ogImage={video.thumbnailUrl || ''}
        ogType="video"
        twitterCard="summary_large_image"
        lang={videoLang === 'es' ? 'es' : 'en'}
        structuredData={videoSchema(video)}
      />
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-6 px-2">
          {/* Información principal del video */}
          <div className="w-full bg-white border-2 border-[#FDBE11] rounded-lg p-6 shadow-xl">
            {/* Título del video y botón de favoritos */}
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-[#001C58] flex-grow">{video.title}</h1>
                <div className="flex space-x-2">
                  {/* Botón de compartir */}
                  <Button 
                    variant="outline" 
                    className="flex items-center border-[#FDBE11] text-[#001C58] hover:bg-[#FDBE11]/10"
                    onClick={() => setShareModalOpen(true)}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="mr-1"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    Compartir
                  </Button>
                  
                  {/* Botón de favoritos (solo para usuarios autenticados) */}
                  {user && (
                    <button 
                      className={`flex-shrink-0 flex items-center px-3 py-1 rounded text-sm 
                      ${video.isFavorite 
                        ? 'bg-red-50 text-red-500 border border-red-200' 
                        : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200'}`}
                      onClick={handleToggleFavorite}
                      aria-label={video.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill={video.isFavorite ? "currentColor" : "none"}
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-1"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      {video.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Video Player */}
              <VideoPlayer embedUrl={video.embedUrl} title={video.title} videoId={video.id} />
              
              {/* Video Summary - Solo visible para usuarios registrados */}
              {user && video.summary && video.summary.length > 0 && (
                <div className="bg-[#F8F8FA] border-2 border-[#FDBE11] rounded-lg shadow-md p-4 mt-4">
                  <div className="flex items-center mb-2">
                    <i className="fas fa-lightbulb text-[#FDBE11] mr-2"></i>
                    <h3 className="font-bold text-lg text-[#001C58]">Resumen AI</h3>
                    <span className="ml-2 px-2 py-1 text-xs bg-[#001C58] text-white rounded-full">Premium</span>
                  </div>
                  <div className="text-gray-800 whitespace-pre-line text-sm">
                    {video.summary}
                  </div>
                </div>
              )}

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
            
            {/* Canal, Comentarios y Videos Relacionados */}
            <div className="lg:col-span-1">
              {/* Información del canal */}
              <div 
                onClick={() => window.location.href = `/channel/${video.channelId}`}
                className="bg-white rounded-lg shadow-md p-4 mb-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center mb-3">
                  <img 
                    src={video.channelThumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelTitle)}&background=362C5A&color=fff&size=128`} 
                    alt={video.channelTitle} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FDBE11]" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelTitle)}&background=362C5A&color=fff&size=128`;
                    }}
                  />
                  <div className="ml-3">
                    <p className="font-bold text-md text-[#001C58]">{video.channelTitle}</p>
                    <p className="text-xs text-[#001C58]">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getPlatformColor(video.platform)}`}>
                        <i className={`${getPlatformIcon(video.platform)} mr-1`}></i> 
                        {video.platform}
                      </span>
                    </p>
                  </div>
                </div>
                {user && video.channelId && (
                  <SubscribeButton 
                    channelId={video.channelId}
                    initialSubscribed={subscriptionStatus?.isSubscribed}
                    initialNotificationsEnabled={subscriptionStatus?.notificationsEnabled}
                  />
                )}
              </div>
              
              {/* Sección de comentarios */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <CommentSection videoId={video.id} />
              </div>
              
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
      
      {/* Modal de compartir */}
      {video && (
        <ShareVideoModal
          videoId={video.id}
          videoTitle={video.title}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </main>
  );
}
