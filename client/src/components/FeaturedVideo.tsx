import { useState } from 'react';
import { Link } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Video } from '@shared/schema';

interface FeaturedVideoProps {
  video: Video & { isFavorite?: boolean };
}

export default function FeaturedVideo({ video }: FeaturedVideoProps) {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(video.isFavorite || false);
  const [isToggling, setIsToggling] = useState(false);

  // Format view count
  const formatViewCount = (count: number | null): string => {
    if (!count) return '0';
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Format published date
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

  // Handle add to favorites
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;
    
    setIsToggling(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const url = `/api/favorites/${video.id}`;
        await apiRequest(url, {
          method: 'DELETE'
        });
        setIsFavorite(false);
        toast({
          title: "Éxito",
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
          title: "Éxito",
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

  return (
    <Link 
      href={`/video/${video.id}`}
      className="bg-white rounded-xl shadow-md overflow-hidden block"
      onClick={(e) => {
        // Prevent click if star button was clicked
        if ((e.target as HTMLElement).tagName === 'I' || 
            (e.target as HTMLElement).tagName === 'BUTTON') {
          e.preventDefault();
        }
      }}
    >
      <div className="aspect-w-16 aspect-h-9 relative">
        <iframe 
          src={video.embedUrl}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        ></iframe>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
            <p className="text-sm text-gray-600">
              {video.channelTitle} • {formatViewCount(video.viewCount)} visualizaciones • {formatPublishedDate(video.publishedAt)}
            </p>
          </div>
          <button 
            onClick={handleToggleFavorite}
            className={`text-2xl ${isFavorite ? 'text-[#FEF08A]' : 'text-gray-400 hover:text-[#FEF08A]'} focus:outline-none`}
            aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <i className={isFavorite ? 'fas fa-star' : 'far fa-star'}></i>
          </button>
        </div>
        {video.description && (
          <p className="mt-2 text-gray-700">
            {video.description.length > 150 
              ? `${video.description.substring(0, 150)}...` 
              : video.description
            }
          </p>
        )}
        <div className="flex flex-wrap mt-3 gap-2">
          {video.categoryIds && video.categoryIds.map((categoryId, index) => (
            <span 
              key={index} 
              className={index === 0 
                ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1E3A8A] text-white"
                : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              }
            >
              {categoryId === '1' && 'Partidos'}
              {categoryId === '2' && 'Entrenamientos'}
              {categoryId === '3' && 'Ruedas de prensa'}
              {categoryId === '4' && 'Entrevistas'}
              {categoryId === '5' && 'Jugadores'}
              {categoryId === '6' && 'Análisis'}
              {categoryId === '7' && 'Momentos Históricos'}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
