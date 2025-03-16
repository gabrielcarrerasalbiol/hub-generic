import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Video } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Star } from "lucide-react";
import VideoCard from "@/components/VideoCard";

export default function FeaturedVideosPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch featured videos
  const { data: featuredVideos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/featured', { limit: 50 }],
  });
  
  // Filter videos based on search query
  const filteredVideos = featuredVideos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (video.channelTitle && video.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#001C58] dark:text-white flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-500" />
          {t('videos.featured_title')}
        </h1>
      </div>
      
      {/* Search input */}
      <div className="relative mb-8 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={t('search.placeholder')}
          className="pl-10 pr-4 py-2 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <Skeleton className="h-40 w-full rounded-md mb-4 dark:bg-gray-700" />
              <Skeleton className="h-6 w-3/4 mb-2 dark:bg-gray-700" />
              <Skeleton className="h-4 w-full mb-2 dark:bg-gray-700" />
              <Skeleton className="h-4 w-1/2 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        // Video grid
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard 
              key={video.id} 
              video={video}
              showFeaturedBadge={true}
            />
          ))}
        </div>
      ) : (
        // No videos found
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Star className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-[#001C58] dark:text-white text-lg">
            {searchQuery 
              ? t('search.no_results') 
              : t('videos.no_featured')}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {searchQuery 
              ? t('search.try_different')
              : t('videos.check_later')}
          </p>
          {searchQuery && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              {t('search.show_all')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}