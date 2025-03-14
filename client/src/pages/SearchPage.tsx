import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Video } from '@shared/schema';
import VideoCard from '@/components/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PlatformFilters from '@/components/PlatformFilters';
import CategoryFilters from '@/components/CategoryFilters';
import { PlatformType, CategoryType } from '@shared/schema';

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [visibleVideos, setVisibleVideos] = useState(12);
  
  // Parse query params from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const query = searchParams.get('q');
    const platform = searchParams.get('platform') as PlatformType || 'all';
    const category = searchParams.get('category') as CategoryType || 'all';
    
    if (query) {
      setSearchQuery(query);
    }
    
    if (PlatformType.safeParse(platform).success) {
      setSelectedPlatform(platform);
    }
    
    if (CategoryType.safeParse(category).success) {
      setSelectedCategory(category);
    }
  }, [location]);

  // Fetch search results
  const { 
    data: videos = [], 
    isLoading, 
    error,
    refetch
  } = useQuery<Video[]>({
    queryKey: ['/api/videos/search', searchQuery],
    enabled: !!searchQuery,
  });

  // Handle form submission for new search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    if (selectedPlatform !== 'all') params.set('platform', selectedPlatform);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    
    setLocation(`/search?${params.toString()}`);
    refetch();
  };

  // Handle platform change
  const handlePlatformChange = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    params.set('platform', platform);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    
    setLocation(`/search?${params.toString()}`);
  };

  // Handle category change
  const handleCategoryChange = (category: CategoryType) => {
    setSelectedCategory(category);
    
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    if (selectedPlatform !== 'all') params.set('platform', selectedPlatform);
    params.set('category', category);
    
    setLocation(`/search?${params.toString()}`);
  };

  // Filter videos by platform and category
  const filteredVideos = videos.filter(video => {
    const matchesPlatform = selectedPlatform === 'all' || video.platform === selectedPlatform;
    
    const matchesCategory = selectedCategory === 'all' || (
      video.categoryIds && video.categoryIds.includes(
        selectedCategory === 'matches' ? 1 : 
        selectedCategory === 'transfers' ? 2 :
        selectedCategory === 'tactics' ? 3 :
        selectedCategory === 'interviews' ? 4 :
        selectedCategory === 'history' ? 5 :
        selectedCategory === 'fan_content' ? 6 :
        selectedCategory === 'news' ? 7 : 0
      )
    );
    
    return matchesPlatform && matchesCategory;
  });

  // Load more results
  const handleLoadMore = () => {
    setVisibleVideos(prev => prev + 12);
  };

  return (
    <main className="flex-1 bg-gray-100 dark:bg-[#2C2152] p-4 md:p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 dark:text-white">Resultados de búsqueda</h1>
        {searchQuery && (
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Resultados para: <span className="font-semibold">"{searchQuery}"</span>
          </p>
        )}
      </div>

      {/* Search form */}
      <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar videos de Real Madrid..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="bg-[#001C58] hover:bg-[#001C58]/90">
            Buscar
          </Button>
        </form>

        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2">
            <p className="text-sm font-medium mb-2 dark:text-white">Filtrar por plataforma:</p>
            <PlatformFilters 
              selectedPlatform={selectedPlatform} 
              onSelectPlatform={handlePlatformChange} 
            />
          </div>
          <div className="md:w-1/2">
            <p className="text-sm font-medium mb-2 dark:text-white">Filtrar por categoría:</p>
            <CategoryFilters 
              selectedCategory={selectedCategory} 
              onSelectCategory={handleCategoryChange} 
            />
          </div>
        </div>
      </div>

      {/* Display loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md overflow-hidden">
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
      )}

      {/* Display error state */}
      {error && (
        <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="dark:text-gray-300">No se pudieron cargar los resultados de búsqueda. Por favor, intenta de nuevo con otros términos.</p>
        </div>
      )}

      {/* Display empty state */}
      {!isLoading && !error && searchQuery && filteredVideos.length === 0 && (
        <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">No se encontraron resultados</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            No hemos encontrado videos que coincidan con tu búsqueda. Prueba con otros términos o filtros diferentes.
          </p>
          <Button onClick={() => {
            setSelectedPlatform('all');
            setSelectedCategory('all');
            setLocation(`/search?q=${searchQuery}`);
          }} variant="outline">
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Display empty state before search */}
      {!isLoading && !searchQuery && (
        <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Busca contenido del Real Madrid</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ingresa términos de búsqueda para encontrar videos, noticias y contenido relacionado con el Real Madrid.
          </p>
        </div>
      )}

      {/* Display search results */}
      {!isLoading && !error && filteredVideos.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.slice(0, visibleVideos).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          
          {/* Load more button */}
          {filteredVideos.length > visibleVideos && (
            <div className="mt-8 text-center">
              <Button 
                onClick={handleLoadMore}
                variant="outline" 
                className="px-6 py-2 border-[#001C58] text-[#001C58] dark:border-[#FDBE11] dark:text-[#FDBE11]"
              >
                Cargar más resultados
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}