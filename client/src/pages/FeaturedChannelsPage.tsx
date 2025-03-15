import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Channel } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";

export default function FeaturedChannelsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all featured channels
  const { data: featuredChannels = [], isLoading } = useQuery<Channel[]>({
    queryKey: ['/api/channels/recommended', { limit: 100 }],
  });
  
  // Filter channels based on search query
  const filteredChannels = featuredChannels.filter(channel => 
    channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (channel.description && channel.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Format subcriber count
  const formatSubscriberCount = (count?: number): string => {
    if (!count && count !== 0) return "";
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M suscriptores`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K suscriptores`;
    } else {
      return `${count} suscriptores`;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#001C58] dark:text-white">Canales Destacados</h1>
      </div>
      
      {/* Search input */}
      <div className="relative mb-8 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar canales..."
          className="pl-10 pr-4 py-2 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-[#2A2040] rounded-lg shadow-md p-4">
              <div className="flex items-center">
                <Skeleton className="w-16 h-16 rounded-full dark:bg-gray-700" />
                <div className="ml-4 flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-1/2 mb-1 dark:bg-gray-700" />
                  <Skeleton className="h-3 w-1/3 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredChannels.length > 0 ? (
        // Channel grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredChannels.map((channel) => (
            <Link
              key={channel.id}
              href={`/channel/${channel.id}`}
              className="bg-white dark:bg-[#2A2040] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="h-24 bg-gradient-to-r from-[#1E3A8A] to-[#5D3FD3] flex items-center justify-center">
                {channel.bannerUrl && (
                  <img 
                    src={channel.bannerUrl} 
                    alt={channel.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start">
                  <img 
                    src={channel.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=64`} 
                    alt={channel.title} 
                    className="w-16 h-16 rounded-full border-4 border-white dark:border-[#2A2040] -mt-12 shadow-md bg-white"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=64`;
                    }}
                  />
                  <div className="ml-4 pt-1">
                    <h2 className="font-bold text-[#001C58] dark:text-white truncate">{channel.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {channel.platform === 'YouTube' && t('sidebar.youtube_channel')}
                      {channel.platform === 'TikTok' && t('sidebar.tiktok_channel')}
                      {channel.platform === 'Twitter' && t('sidebar.twitter_account')}
                      {channel.platform === 'Instagram' && t('sidebar.instagram_account')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatSubscriberCount(channel.subscriberCount)}
                    </p>
                  </div>
                </div>
                {channel.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 line-clamp-2">
                    {channel.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // No channels found
        <div className="text-center py-12">
          <p className="text-[#001C58] dark:text-white text-lg">
            No se encontraron canales que coincidan con la búsqueda
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Intenta con diferentes términos o consulta todos los canales
          </p>
          {searchQuery && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              Mostrar todos los canales
            </Button>
          )}
        </div>
      )}
    </div>
  );
}