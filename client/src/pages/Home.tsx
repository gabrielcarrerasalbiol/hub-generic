import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import FeaturedVideo from "@/components/FeaturedVideo";
import VideoCard from "@/components/VideoCard";
import ChannelCard from "@/components/ChannelCard";
import PlatformFilters from "../components/PlatformFilters";
import HomeFilters from "../components/HomeFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Video, Channel, PlatformType, CategoryType } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import SEO from "@/components/SEO";
import { homePageSchema } from "@/lib/schemaData";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();
  const [platform, setPlatformState] = useState<PlatformType>("all");
  const [category, setCategoryState] = useState<CategoryType>("all");
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Funciones intermedias para garantizar compatibilidad de tipos
  const setPlatform = (newPlatform: PlatformType) => {
    setPlatformState(newPlatform);
    // Restablecer el filtro de categoría cuando se cambia la plataforma
    // para evitar combinar un filtro de categoría con una plataforma que no tiene videos
    setCategoryState("all");
  };
  
  const setCategory = (newCategory: CategoryType) => {
    setCategoryState(newCategory);
  };
  
  // Array de imágenes para el slider
  const bannerImages = [
    {
      src: "/images/real-madrid-fans-back.jpg",
      alt: "Real Madrid Fans"
    },
    {
      src: "/images/real-madrid-fans-stadium.jpg", 
      alt: "Real Madrid Stadium"
    },
    {
      src: "/images/real-madrid-hero.jpg",
      alt: "Real Madrid Hero"
    }
  ];

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

  // Estado para seguimiento de consultas
  const [requestId, setRequestId] = useState(0);

  // Función para obtener token
  const getToken = () => {
    return localStorage.getItem('token') || '';
  };
  
  // Función auxiliar para hacer peticiones HTTP
  const makeRequest = async (url: string) => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("Token añadido a la consulta:", `Bearer ${token.substring(0, 12)}...`);
    }
    
    // Agregamos un parámetro de tiempo único para evitar el caché del navegador
    const separator = url.includes('?') ? '&' : '?';
    const urlWithNoCache = `${url}${separator}_=${Date.now()}`;
    
    console.log("Realizando petición a:", url);
    const response = await fetch(urlWithNoCache, { 
      headers,
      // Asegurarnos de que no se use la caché
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Error en la consulta: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Resultados obtenidos: ${data.length} videos`);
    return data;
  };
  
  // Efecto para actualizar cuando cambian los filtros
  useEffect(() => {
    // Crear un nuevo ID de solicitud para el seguimiento
    setRequestId(prev => prev + 1);
  }, [platform, category]);
  
  // Fetch videos filtered by platform and category (limitado a 20)
  const { 
    data: filteredVideos = [], 
    isLoading: isFilteredLoading,
    refetch: refetchFilteredVideos
  } = useQuery({
    queryKey: [`/api/videos-${platform}-${category}`, requestId],
    queryFn: async () => {
      // Construir URL con parámetros explícitos
      const baseUrl = "/api/videos";
      const params = new URLSearchParams();
      
      console.log(`DEBUG: Construyendo URL para platform=${platform}, category=${category}`);
      
      if (platform !== "all") {
        params.append("platform", platform);
      }
      if (category !== "all") {
        params.append("category", category);
      }
      params.append("limit", "20");
      
      const url = `${baseUrl}?${params.toString()}`;
      console.log("URL final de consulta:", url);
      
      // Aquí agregamos un token para que sea diferente en cada solicitud
      // Esto fuerza a React Query a invalidar la caché
      const token = Date.now(); // Timestamp actual
      console.log("Token añadido a la solicitud:", token);
      
      // Añadir el token al header
      const tokenAddedToHeaders = await makeRequest(url);
      return tokenAddedToHeaders;
    },
    refetchOnWindowFocus: false,
    // Importante: asegurarnos de que se vuelva a ejecutar cuando cambie la categoría o plataforma
    refetchOnMount: true,
    // Podemos agregar staleTime: 0 para que siempre recargue los datos
    staleTime: 0,
    enabled: true,
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
  
  // Ya no es necesario el efecto para rotar imágenes, usamos una imagen estática

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
      {/* Encabezado principal - SEO */}
      {/* SEO optimizado para la página de inicio */}
      <SEO
        title="Hub Madridista | Agregador de contenido del Real Madrid"
        description="Descubre los mejores videos y contenido del Real Madrid, seleccionados de todas las plataformas: YouTube, Twitter, Twitch y más."
        keywords="Real Madrid, videos, mejores, fútbol, LaLiga, Champions League, YouTube, Twitch, aficionados"
        ogType="website"
        twitterCard="summary_large_image"
        structuredData={homePageSchema()}
      />
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
          {/* Filtros de categoría para desktop - ahora manejados por HomeFilters */}
        </div>
        
        {/* Contenedor de tabs y filtros */}
        <div 
          className="bg-gradient-to-r from-[#001C58]/5 to-[#FDBE11]/5 rounded-xl p-4 lg:p-6"
          style={{
            backgroundColor: '#f8f9fa',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            minHeight: '450px',
            position: 'relative',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
          {/* Componente de filtros unificado */}
          <HomeFilters
            platform={platform}
            setPlatform={setPlatform}
            category={category}
            setCategory={setCategory}
            onFilterChange={refetchFilteredVideos}
          />
          
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
                  onClick={() => setPlatform("all" as PlatformType)}
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
                    {t(`categories.${category}`, category)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      <section 
        className="mb-10 p-6 rounded-xl bg-gradient-to-r from-[#001C58] to-[#0a337d]" 
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#001C58]/80 to-transparent rounded-xl"></div>
        <h2 className="text-xl font-bold mb-4 text-white border-l-4 border-[#FDBE11] pl-3 relative z-10">{t('home.recommendedChannels')}</h2>
        
        {isChannelsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
