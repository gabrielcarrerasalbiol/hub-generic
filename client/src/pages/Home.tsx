import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import FeaturedVideo from "@/components/FeaturedVideo";
import VideoCard from "@/components/VideoCard";
import ChannelCard from "@/components/ChannelCard";
import PlatformFilters from "../components/PlatformFilters";
import CategoryFilters from "../components/CategoryFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Video, Channel, PlatformType, CategoryType } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, ExternalLink, Layers, Youtube, Twitter, Instagram } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import TwitchIcon from "@/components/icons/TwitchIcon";

export default function Home() {
  const { t } = useLanguage();
  const [platform, setPlatform] = useState<PlatformType>("all");
  const [category, setCategory] = useState<CategoryType>("all");
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch trending videos (limitado a 20)
  const { 
    data: trendingVideos = [], 
    isLoading: isTrendingLoading 
  } = useQuery({
    queryKey: ["/api/videos/trending", { limit: 20 }],
    queryFn: getQueryFn<Video[]>({ on401: 'returnNull' }),
  });

  // Fetch latest videos (limitado a 20)
  const { 
    data: latestVideos = [], 
    isLoading: isLatestLoading 
  } = useQuery({
    queryKey: ["/api/videos/latest", { limit: 20 }],
    queryFn: getQueryFn<Video[]>({ on401: 'returnNull' }),
  });

  // Fetch recommended channels (limitado a 8)
  const { 
    data: recommendedChannels = [], 
    isLoading: isChannelsLoading 
  } = useQuery({
    queryKey: ["/api/channels/recommended", { limit: 8 }],
    queryFn: getQueryFn<Channel[]>({ on401: 'returnNull' }),
  });

  // Fetch videos filtered by platform and category (limitado a 20)
  const { 
    data: filteredVideos = [], 
    isLoading: isFilteredLoading 
  } = useQuery({
    queryKey: ["/api/videos", { platform, category, limit: 20 }],
    queryFn: getQueryFn<Video[]>({ on401: 'returnNull' }),
    enabled: platform !== "all" || category !== "all",
  });
  
  // Verificar si la plataforma seleccionada está disponible
  // Consideramos "youtube" y "twitch" como plataformas disponibles
  // Las demás plataformas (tiktok, twitter, instagram) están marcadas como no disponibles por ahora
  const availablePlatforms = ["all", "youtube", "twitch"];
  const isPlatformAvailable = availablePlatforms.includes(platform);
  
  // Función para obtener el icono de la plataforma
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
          <h2 className="text-2xl font-bold">{t('home.featuredContent')}</h2>
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
                <FeaturedVideo video={video} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border-2 border-[#FDBE11] p-6 text-center">
            <p className="text-[#001C58]">{t('home.noFeaturedContent')}</p>
          </div>
        )}
      </section>
      
      {/* Videos por Plataforma - Nueva sección interactiva */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#001C58] border-l-4 border-[#FDBE11] pl-3">
            {t('home.discoverContent')}
          </h2>
          <div className="hidden md:flex space-x-1">
            <CategoryFilters 
              selectedCategory={category} 
              onSelectCategory={(newCategory) => setCategory(newCategory as CategoryType)} 
            />
          </div>
        </div>
        
        {/* Contenedor de tabs y filtros */}
        <div className="bg-gradient-to-r from-[#001C58]/5 to-[#FDBE11]/5 rounded-xl p-4 lg:p-6">
          {/* Tabs de plataformas */}
          <div className="mb-6 flex justify-center border-b border-[#FDBE11]/20 pb-4">
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 max-w-3xl">
              <Button
                variant={platform === "all" ? "default" : "ghost"}
                className={`${platform === "all" 
                  ? "bg-[#001C58] text-white border-[#FDBE11]" 
                  : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
                onClick={() => setPlatform("all")}
              >
                <Layers className="h-4 w-4 mr-2" /> {t('home.all')}
              </Button>
              
              <Button
                variant={platform === "youtube" ? "default" : "ghost"}
                className={`${platform === "youtube" 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
                onClick={() => setPlatform("youtube")}
              >
                <Youtube className="h-4 w-4 mr-2" /> YouTube
              </Button>
              
              <Button
                variant={platform === "twitch" ? "default" : "ghost"}
                className={`${platform === "twitch" 
                  ? "bg-purple-600 text-white hover:bg-purple-700" 
                  : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
                onClick={() => setPlatform("twitch")}
              >
                <TwitchIcon className="h-4 w-4 mr-2" /> Twitch
              </Button>
              
              <Button
                variant={platform === "twitter" ? "default" : "ghost"}
                className={`${platform === "twitter" 
                  ? "bg-blue-500 text-white hover:bg-blue-600" 
                  : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
                onClick={() => setPlatform("twitter")}
                disabled={true}
              >
                <Twitter className="h-4 w-4 mr-2" /> Twitter
              </Button>
              
              <Button
                variant={platform === "instagram" ? "default" : "ghost"}
                className={`${platform === "instagram" 
                  ? "bg-pink-500 text-white hover:bg-pink-600" 
                  : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
                onClick={() => setPlatform("instagram")}
                disabled={true}
              >
                <Instagram className="h-4 w-4 mr-2" /> Instagram
              </Button>
              
              <Button
                variant={platform === "tiktok" ? "default" : "ghost"}
                className={`${platform === "tiktok" 
                  ? "bg-black text-white hover:bg-gray-900" 
                  : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
                onClick={() => setPlatform("tiktok")}
                disabled={true}
              >
                <TikTokIcon className="h-4 w-4 mr-2" /> TikTok
              </Button>
            </div>
          </div>
          
          {/* Categorías en mobile */}
          <div className="block md:hidden mb-6">
            <h3 className="text-sm font-medium mb-2 text-[#001C58]">{t('home.filterByCategory')}</h3>
            <CategoryFilters 
              selectedCategory={category} 
              onSelectCategory={(newCategory) => setCategory(newCategory as CategoryType)} 
            />
          </div>
          
          {/* Contenido por plataforma */}
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
                <h3 className="text-xl font-semibold text-[#001C58] mb-2">{t('home.comingSoon')}</h3>
                <p className="text-gray-600 mb-4 max-w-xl mx-auto">
                  {t('home.workingToIncorporate', { platform: platform })}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {t('home.soonEnjoyVideos')}
                </p>
                <Button 
                  variant="outline" 
                  className="border-[#FDBE11] text-[#001C58] hover:bg-[#FDBE11]/10"
                  onClick={() => setPlatform("all")}
                >
                  {t('home.viewAllVideos')}
                </Button>
              </div>
            </div>
          ) : isFilteredLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(12)].map((_, index) => (
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
          ) : (platform !== "all" || category !== "all") && filteredVideos.length > 0 ? (
            // Videos filtrados con título y badge
            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-semibold text-[#001C58]">
                  {platform !== "all" ? (
                    <span className="flex items-center">
                      <i className={`${getPlatformIcon(platform)} mr-2 ${
                        platform === 'youtube' ? 'text-red-500' : 
                        platform === 'twitch' ? 'text-purple-500' : ''
                      }`}></i>
                      {t('home.videosFrom', { platform: platform.charAt(0).toUpperCase() + platform.slice(1) })}
                    </span>
                  ) : (
                    <span>{t('home.selectedVideos')}</span>
                  )}
                </h3>
                {category !== "all" && (
                  <span className="ml-3 px-2 py-1 bg-[#FDBE11]/20 text-[#001C58] text-xs font-medium rounded-full">
                    {category}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Ordenamos del más reciente al más antiguo basándonos en publishedAt */}
                {[...filteredVideos]
                  .sort((a, b) => {
                    // Si no hay fechas de publicación, mantenemos el orden original
                    if (!a.publishedAt || !b.publishedAt) return 0;
                    // Ordenamos del más reciente (fecha mayor) al más antiguo (fecha menor)
                    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
                  })
                  .slice(0, 12)
                  .map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
              </div>
            </div>
          ) : (
            // Videos trending por defecto
            <div>
              <h3 className="text-lg font-semibold text-[#001C58] mb-4">{t('home.featuredVideos')}</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Ordenamos del más reciente al más antiguo basándonos en publishedAt */}
                {[...trendingVideos]
                  .sort((a, b) => {
                    // Si no hay fechas de publicación, mantenemos el orden original
                    if (!a.publishedAt || !b.publishedAt) return 0;
                    // Ordenamos del más reciente (fecha mayor) al más antiguo (fecha menor)
                    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
                  })
                  .slice(0, 12)
                  .map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Botón de explorar más */}
        <div className="mt-6 flex justify-center">
          <Link href="/videos">
            <Button className="bg-[#001C58] text-white hover:bg-[#001C58]/90 flex items-center gap-2">
              {t('home.exploreAllVideos')} <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Latest Videos Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-[#001C58] border-l-4 border-[#FDBE11] pl-3">{t('home.latestVideos')}</h2>
        
        {isLatestLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, index) => (
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Mostramos solo los primeros 12 videos (3 filas de 4 columnas) */}
            {latestVideos.slice(0, 12).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-[#FDBE11]/30">
            <p className="text-[#001C58] dark:text-white">{t('home.noRecentVideosAvailable')}</p>
          </div>
        )}
      </section>
      
      {/* Trending Videos Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-[#001C58] border-l-4 border-[#FDBE11] pl-3">{t('home.popularVideosThisWeek')}</h2>
        
        {isTrendingLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, index) => (
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Mostramos solo los primeros 12 videos (3 filas de 4 columnas) */}
            {trendingVideosWithoutFeatured.slice(0, 12).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-[#FDBE11]/30">
            <p className="text-[#001C58] dark:text-white">{t('home.noPopularVideosAvailable')}</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Link href="/trending">
            <Button 
              variant="outline" 
              className="px-6 py-2 border-[#FDBE11] text-[#001C58] dark:text-white dark:border-[#FDBE11] hover:bg-[#FDBE11]/10 dark:hover:bg-[#FDBE11]/20"
            >
              {t('home.viewMoreVideos')}
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Top Channels Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-[#001C58] border-l-4 border-[#FDBE11] pl-3">{t('home.recommendedChannels')}</h2>
        
        {isChannelsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mostramos solo hasta 8 canales (2 filas de 4) */}
            {recommendedChannels.slice(0, 8).map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-[#FDBE11]/30">
            <p className="text-[#001C58] dark:text-white">{t('home.noRecommendedChannelsAvailable')}</p>
          </div>
        )}
      </section>

    </main>
  );
}
