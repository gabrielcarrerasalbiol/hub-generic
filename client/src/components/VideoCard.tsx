import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Video } from '@shared/schema';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  compact?: boolean;
}

export default function VideoCard({ video, compact = false }: VideoCardProps) {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(video.isFavorite || false);
  
  // Actualizar el estado si la prop video.isFavorite cambia
  useEffect(() => {
    setIsFavorite(video.isFavorite || false);
  }, [video.isFavorite]);
  const [isToggling, setIsToggling] = useState(false);

  // Helper functions for formatting
  const formatViewCount = (count: number | null): string => {
    if (!count) return '0';
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatPublishedDate = (dateString?: string | null): string => {
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

  // Handle toggle favorite
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;
    
    setIsToggling(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const url = `/api/favorites/${video.id}`;
        await apiRequest<any>(url, {
          method: 'DELETE'
        });
        setIsFavorite(false);
        toast({
          description: "Video eliminado de favoritos",
        });
      } else {
        // Add to favorites
        await apiRequest<any>('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ videoId: video.id })
        });
        setIsFavorite(true);
        toast({
          description: "Video añadido a favoritos",
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar los favoritos",
        variant: "destructive"
      });
    } finally {
      setIsToggling(false);
    }
  };

  if (compact) {
    // Compact layout for related videos
    return (
      <Link 
        href={`/video/${video.id}`}
        className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 flex border border-[#FDBE11]/20 hover:border-[#FDBE11]/60 dark:border-[#FDBE11]/30 dark:hover:border-[#FDBE11]/80"
        onClick={(e) => {
          // Prevent click if star button was clicked
          if ((e.target as HTMLElement).tagName === 'I' || 
              (e.target as HTMLElement).tagName === 'BUTTON') {
            e.preventDefault();
          }
        }}
      >
          <div className="relative w-1/3">
            <img 
              src={video.thumbnailUrl || `https://via.placeholder.com/480x360/1E3A8A/FFFFFF/?text=${encodeURIComponent(video.title || 'Sin miniatura')}`} 
              alt={video.title} 
              className="w-full h-full object-cover aspect-video"
            />
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
              {video.duration || '0:00'}
            </div>
          </div>
          <div className="p-3 w-2/3">
            <h3 className="font-medium text-sm line-clamp-2 dark:text-white">
              {video.title}
            </h3>
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {formatViewCount(video.viewCount)} visualizaciones
              </div>
              <button 
                onClick={handleToggleFavorite}
                className={cn(
                  "text-sm",
                  isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
                )}
                aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>
          </div>
      </Link>
    );
  }

  // Default card layout
  return (
    <Link 
      href={`/video/${video.id}`}
      className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 border border-[#FDBE11]/20 hover:border-[#FDBE11]/60 dark:border-[#FDBE11]/30 dark:hover:border-[#FDBE11]/80"
      onClick={(e) => {
        // Prevent click if star button was clicked
        if ((e.target as HTMLElement).tagName === 'I' || 
            (e.target as HTMLElement).tagName === 'BUTTON') {
          e.preventDefault();
        }
      }}
    >
      <div className="relative">
        <img 
          src={video.thumbnailUrl || `https://via.placeholder.com/480x360/1E3A8A/FFFFFF/?text=${encodeURIComponent(video.title || 'Sin miniatura')}`} 
          alt={video.title} 
          className="w-full aspect-video object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
          {video.duration || '0:00'}
        </div>
        <div className={`absolute top-2 left-2 text-white text-xs px-1.5 py-0.5 rounded flex items-center ${getPlatformColor(video.platform)}`}>
          <i className={`${getPlatformIcon(video.platform)} mr-1`}></i> {video.platform}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 h-10 dark:text-white">
          {video.title}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <img 
              src={video.channelThumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelTitle || 'C')}&background=random&color=fff&size=36`} 
              alt={video.channelTitle} 
              className="w-6 h-6 rounded-full"
            />
            <span className="ml-2 text-xs text-gray-600 dark:text-gray-300">{video.channelTitle}</span>
          </div>
          <button 
            onClick={handleToggleFavorite}
            className={cn(
              "text-sm",
              isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
            )}
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-300">
          {formatViewCount(video.viewCount)} visualizaciones • {formatPublishedDate(video.publishedAt)}
        </div>
      </div>
    </Link>
  );
}
