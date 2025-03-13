import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FeaturedVideo from "@/components/FeaturedVideo";
import VideoCard from "@/components/VideoCard";
import ChannelCard from "@/components/ChannelCard";
import PlatformFilters from "@/components/PlatformFilters";
import CategoryFilters from "@/components/CategoryFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Video, Channel, PlatformType, CategoryType } from "@shared/schema";

export default function Home() {
  const [platform, setPlatform] = useState<PlatformType>("all");
  const [category, setCategory] = useState<CategoryType>("all");

  // Fetch trending videos
  const { 
    data: trendingVideos, 
    isLoading: isTrendingLoading 
  } = useQuery({
    queryKey: ["/api/videos/trending"],
  });

  // Fetch latest videos
  const { 
    data: latestVideos, 
    isLoading: isLatestLoading 
  } = useQuery({
    queryKey: ["/api/videos/latest"],
  });

  // Fetch recommended channels
  const { 
    data: recommendedChannels, 
    isLoading: isChannelsLoading 
  } = useQuery({
    queryKey: ["/api/channels/recommended"],
  });

  // Fetch videos filtered by platform and category
  const { 
    data: filteredVideos, 
    isLoading: isFilteredLoading 
  } = useQuery({
    queryKey: ["/api/videos", { platform, category }],
    enabled: platform !== "all" || category !== "all",
  });

  // Get featured video from the top trending video
  const featuredVideo = trendingVideos && trendingVideos.length > 0 ? trendingVideos[0] : null;
  
  // Get trending videos excluding the featured one
  const trendingVideosWithoutFeatured = trendingVideos && trendingVideos.length > 1 
    ? trendingVideos.slice(1)
    : [];

  return (
    <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-y-auto">
      {/* Featured Content Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Contenido Destacado</h2>
        
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
        ) : featuredVideo ? (
          <FeaturedVideo video={featuredVideo as Video} />
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p>No hay contenido destacado disponible en este momento.</p>
          </div>
        )}
      </section>
      
      {/* Platform Filters */}
      <PlatformFilters 
        selectedPlatform={platform} 
        onSelectPlatform={(newPlatform) => setPlatform(newPlatform)} 
      />
      
      {/* Category Filters */}
      <CategoryFilters 
        selectedCategory={category} 
        onSelectCategory={(newCategory) => setCategory(newCategory)} 
      />

      {/* Filtered Videos Section (if filters are applied) */}
      {(platform !== "all" || category !== "all") && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Videos Filtrados</h2>
          
          {isFilteredLoading ? (
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
          ) : filteredVideos && filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVideos.map((video: Video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p>No se encontraron videos con los filtros seleccionados.</p>
            </div>
          )}
        </section>
      )}

      {/* Trending Videos Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Videos Populares Esta Semana</h2>
        
        {isTrendingLoading ? (
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
        ) : trendingVideosWithoutFeatured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {trendingVideosWithoutFeatured.map((video: Video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p>No hay videos populares disponibles en este momento.</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button variant="outline" className="px-6 py-2 border-[#1E3A8A] text-[#1E3A8A]">
            Ver más videos
          </Button>
        </div>
      </section>
      
      {/* Top Channels Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Canales Recomendados</h2>
        
        {isChannelsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
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
        ) : recommendedChannels && recommendedChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendedChannels.map((channel: Channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p>No hay canales recomendados disponibles en este momento.</p>
          </div>
        )}
      </section>
      
      {/* Latest Videos Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Últimos Videos</h2>
        
        {isLatestLoading ? (
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
        ) : latestVideos && latestVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {latestVideos.map((video: Video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p>No hay videos recientes disponibles en este momento.</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button variant="outline" className="px-6 py-2 border-[#1E3A8A] text-[#1E3A8A]">
            Cargar más
          </Button>
        </div>
      </section>
    </main>
  );
}
