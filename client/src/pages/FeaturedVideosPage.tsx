import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Video } from '@shared/schema';
import VideoCard from '@/components/VideoCard';
import { Helmet } from 'react-helmet';
import { Sparkles } from 'lucide-react';
import ContentLayout from '@/components/layouts/ContentLayout';
import EmptyState from '@/components/EmptyState';
import LoadingVideos from '@/components/LoadingVideos';
import { useTranslation } from 'react-i18next';

export default function FeaturedVideosPage() {
  const { t } = useTranslation();
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
    { id: 'all' },
    { id: 'youtube' },
    { id: 'twitch' },
    { id: 'twitter' },
    { id: 'tiktok' },
    { id: 'instagram' },
  ];

  return (
    <>
      <Helmet>
        <title>{t('featuredVideosPage.metaTitle')}</title>
        <meta name="description" content={t('featuredVideosPage.metaDescription')} />
      </Helmet>

      <ContentLayout>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">{t('featuredVideosPage.title')}</h1>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('featuredVideosPage.description')}
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
                {t(`featuredVideosPage.platforms.${platform.id}`)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <LoadingVideos count={8} />
        ) : filteredVideos.length === 0 ? (
          <EmptyState
            title={t('featuredVideosPage.empty.title')}
            description={
              selectedPlatform === 'all'
                ? t('featuredVideosPage.empty.allDescription')
                : t('featuredVideosPage.empty.platformDescription', {
                    platform: platforms.find(p => p.id === selectedPlatform)?.name || selectedPlatform
                  })
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