import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import FeaturedVideo from "@/components/FeaturedVideo";
import VideoCard from "@/components/VideoCard";
import ChannelCard from "@/components/ChannelCard";
import PlatformFilters from "@/components/PlatformFilters";
import CategoryFilters from "@/components/CategoryFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Video as BaseVideo, Channel, PlatformType, CategoryType } from "@shared/schema";

// Extendemos el tipo Video para incluir isFavorite
interface Video extends BaseVideo {
  isFavorite?: boolean;
}
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [platform, setPlatform] = useState<PlatformType>("all");
  const [category, setCategory] = useState<CategoryType>("all");
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch trending videos (limitado a 20)
  const { 
    data: trendingVideos = [], 
    isLoading: isTrendingLoading 
  } = useQuery<Video[]>({
    queryKey: ["/api/videos/trending", { limit: 20 }],
  });

  // Fetch latest videos (limitado a 20)
  const { 
    data: latestVideos = [], 
    isLoading: isLatestLoading 
  } = useQuery<Video[]>({
    queryKey: ["/api/videos/latest", { limit: 20 }],
  });

  // Fetch recommended channels (limitado a 8)
  const { 
    data: recommendedChannels = [], 
    isLoading: isChannelsLoading 
  } = useQuery<Channel[]>({
    queryKey: ["/api/channels/recommended", { limit: 8 }],
  });

  // Fetch videos filtered by platform and category (limitado a 20)
  const { 
    data: filteredVideos = [], 
    isLoading: isFilteredLoading 
  } = useQuery<Video[]>({
    queryKey: ["/api/videos", { platform, category, limit: 20 }],
    enabled: platform !== "all" || category !== "all",
  });
  
  // Verificar si la plataforma seleccionada está disponible
  const isPlatformAvailable = platform === "all" || platform === "youtube";

  // Get featured videos (top 5 trending videos)
  const featuredVideos = trendingVideos.length > 0 
    ? trendingVideos.slice(0, Math.min(5, trendingVideos.length)) 
    : [];
  
  // Get trending videos excluding the featured ones
  const trendingVideosWithoutFeatured = trendingVideos.length > 5 
    ? trendingVideos.slice(5)
    : [];

  // Auto-rotate featured videos carousel
  useEffect(() => {
    if (featuredVideos.length > 1) {
      carouselIntervalRef.current = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === featuredVideos.length - 1 ? 0 : prevIndex + 1
        );
      }, 8000); // Rotate every 8 seconds
    }
    
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, [featuredVideos.length]);

  const handleNextFeatured = () => {
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === featuredVideos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevFeatured = () => {
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === 0 ? featuredVideos.length - 1 : prevIndex - 1
    );
  };

  return (
    <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-y-auto">
      {/* Featured Content Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Contenido Destacado</h2>
          {featuredVideos.length > 1 && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full" 
                onClick={handlePrevFeatured}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex space-x-1 items-center">
                {featuredVideos.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`block h-2 w-2 rounded-full ${
                      idx === currentFeaturedIndex ? 'bg-[#FDBE11]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full" 
                onClick={handleNextFeatured}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {isTrendingLoading ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex mt-3 space-x-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ) : featuredVideos.length > 0 ? (
          <div className="relative">
            {featuredVideos.map((video, index) => (
              <div 
                key={video.id} 
                className={`transition-opacity duration-500 ${
                  index === currentFeaturedIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <FeaturedVideo video={video as Video} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border-2 border-[#FDBE11] p-6 text-center">
            <p className="text-[#001C58]">No hay contenido destacado disponible en este momento.</p>
          </div>
        )}
      </section>
      
      {/* Platform Filters */}
      <div className="bg-[#F8F8FA] border border-[#FDBE11]/30 rounded-lg p-4 mb-6">
        <PlatformFilters 
          selectedPlatform={platform} 
          onSelectPlatform={(newPlatform) => setPlatform(newPlatform)} 
        />
        
        {/* Category Filters */}
        <div className="mt-4">
          <CategoryFilters 
            selectedCategory={category} 
            onSelectCategory={(newCategory) => setCategory(newCategory)} 
          />
        </div>
      </div>

      {/* Filtered Videos Section (if filters are applied) */}
      {(platform !== "all" || category !== "all") && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-[#001C58] border-l-4 border-[#FDBE11] pl-3">Videos Filtrados</h2>
          
          {!isPlatformAvailable ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-amber-200">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                  <i className={`fab fa-${platform} text-3xl ${
                    platform === 'tiktok' ? 'text-black' : 
                    platform === 'twitter' ? 'text-blue-400' : 
                    platform === 'instagram' ? 'text-pink-500' : ''
                  }`}></i>
                </div>
                <h3 className="text-xl font-semibold text-[#001C58] mb-2">Plataforma en desarrollo</h3>
                <p className="text-gray-600 mb-4">
                  Estamos trabajando para incorporar contenido de <span className="font-semibold capitalize">{platform}</span> a nuestro Hub Madridista.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Muy pronto podrás disfrutar de los mejores videos de Real Madrid desde esta plataforma.
                </p>
                <Button 
                  variant="outline" 
                  className="border-[#FDBE11] text-[#001C58] hover:bg-[#FDBE11]/10"
                  onClick={() => setPlatform("all")}
                >
                  Volver a todos los videos
                </Button>
              </div>
            </div>
          ) : isFilteredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="w-full aspect-video" />
                  <div className="p-3">
                    <Skeleton className="h-5 w-full mb-3" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="h-4 w-24 ml-2" />
                      </div>
                      <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="h-3 w-40 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVideos.map((video: Video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center border border-[#FDBE11]/30">
              <p className="text-[#001C58]">No se encontraron videos con los filtros seleccionados.</p>
            </div>
          )}
        </section>
      )}

      {/* Trending Videos Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-[#001C58] border-l-4 border-[#FDBE11] pl-3">Videos Populares Esta Semana</h2>
        
        {isTrendingLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full aspect-video" />
                <div className="p-3">
                  <Skeleton className="h-5 w-full mb-3" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-4 w-24 ml-2" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-3 w-40 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : trendingVideosWithoutFeatured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mostramos solo los primeros 9 videos (3 filas de 3) */}
            {trendingVideosWithoutFeatured.slice(0, 9).map((video: Video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-[#FDBE11]/30">
            <p className="text-[#001C58] dark:text-white">No hay videos populares disponibles en este momento.</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            className="px-6 py-2 border-[#FDBE11] text-[#001C58] dark:text-white dark:border-[#FDBE11] hover:bg-[#FDBE11]/10 dark:hover:bg-[#FDBE11]/20"
            onClick={() => window.location.href = '/trending'}
          >
            Ver más videos
          </Button>
        </div>
      </section>
      
      {/* Top Channels Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-[#001C58] border-l-4 border-[#FDBE11] pl-3">Canales Recomendados</h2>
        
        {isChannelsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-24 w-full" />
                <div className="px-4 pt-0 pb-4 relative">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-16 h-16 rounded-full -mt-8" />
                    <Skeleton className="h-5 w-32 mt-2" />
                    <Skeleton className="h-4 w-24 mb-3 mt-1" />
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-24 mt-3 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recommendedChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mostramos solo hasta 9 canales (3 filas de 3) */}
            {recommendedChannels.slice(0, 9).map((channel: Channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-[#FDBE11]/30">
            <p className="text-[#001C58] dark:text-white">No hay canales recomendados disponibles en este momento.</p>
          </div>
        )}
      </section>
      
      {/* Latest Videos Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-[#001C58] border-l-4 border-[#FDBE11] pl-3">Últimos Videos</h2>
        
        {isLatestLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full aspect-video" />
                <div className="p-3">
                  <Skeleton className="h-5 w-full mb-3" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-4 w-24 ml-2" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-3 w-40 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : latestVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mostramos solo los primeros 9 videos (3 filas de 3) */}
            {latestVideos.slice(0, 9).map((video: Video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-[#FDBE11]/30">
            <p className="text-[#001C58] dark:text-white">No hay videos recientes disponibles en este momento.</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            className="px-6 py-2 border-[#FDBE11] text-[#001C58] dark:text-white dark:border-[#FDBE11] hover:bg-[#FDBE11]/10 dark:hover:bg-[#FDBE11]/20"
            onClick={() => window.location.href = '/category/latest'}
          >
            Ver más videos
          </Button>
        </div>
      </section>
    </main>
  );
}
