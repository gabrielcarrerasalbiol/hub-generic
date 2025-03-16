import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Video } from '@shared/schema';
import VideoCard from '@/components/VideoCard';
import { Helmet } from 'react-helmet';
import { Sparkles } from 'lucide-react';
import ContentLayout from '@/components/layouts/ContentLayout';
import EmptyState from '@/components/EmptyState';
import LoadingVideos from '@/components/LoadingVideos';

export default function FeaturedVideosPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);

  // Obtener videos destacados
  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/featured'],
  });

  // Filtrar por plataforma cuando cambie la selección o los datos
  useEffect(() => {
    if (!videos) return;
    
    if (selectedPlatform === 'all') {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(
        videos.filter(video => video.platform.toLowerCase() === selectedPlatform.toLowerCase())
      );
    }
  }, [selectedPlatform, videos]);

  const platforms = [
    { id: 'all', name: 'Todas las plataformas' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'twitch', name: 'Twitch' },
    { id: 'twitter', name: 'Twitter' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'instagram', name: 'Instagram' },
  ];

  return (
    <>
      <Helmet>
        <title>Videos Destacados | Hub Madridista</title>
        <meta name="description" content="Los mejores videos destacados del Real Madrid seleccionados por nuestro equipo editorial." />
      </Helmet>

      <ContentLayout>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">Videos Destacados</h1>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Descubre el contenido más relevante del Real Madrid seleccionado por nuestro equipo editorial.
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  selectedPlatform === platform.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {platform.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <LoadingVideos count={8} />
        ) : filteredVideos.length === 0 ? (
          <EmptyState
            title="No hay videos destacados"
            description={
              selectedPlatform === 'all'
                ? "Aún no tenemos videos destacados para mostrarte."
                : `No hay videos destacados de ${
                    platforms.find(p => p.id === selectedPlatform)?.name || selectedPlatform
                  } en este momento.`
            }
            iconName="sparkles"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} showFeaturedBadge={true} />
            ))}
          </div>
        )}
      </ContentLayout>
    </>
  );
}