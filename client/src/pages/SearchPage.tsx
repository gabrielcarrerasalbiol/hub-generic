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

  // Estado para rastrear cuándo se inicia una búsqueda
  const [isSearching, setIsSearching] = useState(false);

  // Estado para controlar manualmente cuándo realizar la búsqueda
  const [shouldSearch, setShouldSearch] = useState(false);
  
  // Efectuar búsqueda solo cuando searchQuery cambia desde la URL o por botón explícito
  useEffect(() => {
    // Si el searchQuery viene de la URL y tiene más de 1 carácter, permitir búsqueda
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const query = searchParams.get('q');
    
    if (query && query.length > 1 && query === searchQuery) {
      setShouldSearch(true);
    }
  }, [location]);
  
  // Fetch search results
  const { 
    data: videos = [], 
    isLoading, 
    isFetching, 
    error,
    refetch
  } = useQuery<Video[]>({
    queryKey: ['/api/videos/search', searchQuery],
    queryFn: async () => {
      // Indicamos que estamos buscando
      setIsSearching(true);
      try {
        // Ahora utilizamos 'q' para que coincida con lo que espera el backend
        const response = await fetch(`/api/videos/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
          throw new Error('Error al buscar videos');
        }
        const data = await response.json();
        return data;
      } finally {
        // Después de completar la búsqueda (éxito o error)
        setTimeout(() => setIsSearching(false), 500); // Pequeño retraso para evitar parpadeos
        // Resetear el estado de búsqueda después de completarla
        setShouldSearch(false);
      }
    },
    enabled: !!searchQuery && shouldSearch, // Solo buscar cuando ambos son true
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
    
    // Solo ejecutar la búsqueda cuando se hace submit del formulario
    if (searchQuery.trim().length > 1) {
      setShouldSearch(true); // Activar la búsqueda solo al enviar el formulario
    }
  };

  // Handle platform change
  const handlePlatformChange = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    params.set('platform', platform);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    
    setLocation(`/search?${params.toString()}`);
    // No es necesario volver a buscar, solo filtrar los resultados existentes
  };

  // Handle category change
  const handleCategoryChange = (category: CategoryType) => {
    setSelectedCategory(category);
    
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    if (selectedPlatform !== 'all') params.set('platform', selectedPlatform);
    params.set('category', category);
    
    setLocation(`/search?${params.toString()}`);
    // No es necesario volver a buscar, solo filtrar los resultados existentes
  };

  // Función para convertir categorías a ID numéricos
  const getCategoryId = (category: CategoryType): number => {
    switch(category) {
      case 'matches': return 1;
      case 'transfers': return 2;
      case 'tactics': return 3;
      case 'interviews': return 4;
      case 'history': return 5;
      case 'fan_content': return 6;
      case 'news': return 7;
      default: return 0;
    }
  }

  // Filter videos by platform and category
  const filteredVideos = videos.filter(video => {
    const matchesPlatform = selectedPlatform === 'all' || video.platform === selectedPlatform;
    
    const categoryId = getCategoryId(selectedCategory);
    const matchesCategory = selectedCategory === 'all' || 
      (video.categoryIds && categoryId > 0 && video.categoryIds.includes(String(categoryId)));
    
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
              disabled={isLoading || isFetching || isSearching}
            />
          </div>
          <Button 
            type="submit" 
            className="bg-[#001C58] hover:bg-[#001C58]/90 min-w-[100px]"
            disabled={isLoading || isFetching || isSearching || !searchQuery.trim()}
          >
            {(isLoading || isFetching || isSearching) ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Buscando...</span>
              </div>
            ) : (
              'Buscar'
            )}
          </Button>
        </form>

        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium mb-2 dark:text-white">Filtrar por plataforma:</p>
              {(isLoading || isFetching || isSearching) && (
                <div className="w-3 h-3 border-2 border-[#FDBE11] border-t-transparent rounded-full animate-spin mb-2"></div>
              )}
            </div>
            <div className={`${(isLoading || isFetching || isSearching) ? 'opacity-50 pointer-events-none' : ''}`}>
              <PlatformFilters 
                selectedPlatform={selectedPlatform} 
                onSelectPlatform={handlePlatformChange} 
              />
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium mb-2 dark:text-white">Filtrar por categoría:</p>
              {(isLoading || isFetching || isSearching) && (
                <div className="w-3 h-3 border-2 border-[#FDBE11] border-t-transparent rounded-full animate-spin mb-2"></div>
              )}
            </div>
            <div className={`${(isLoading || isFetching || isSearching) ? 'opacity-50 pointer-events-none' : ''}`}>
              <CategoryFilters 
                selectedCategory={selectedCategory} 
                onSelectCategory={handleCategoryChange} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Display loading state - mostrar tanto cuando está cargando inicialmente como cuando está haciendo una nueva búsqueda */}
      {(isLoading || isFetching || isSearching) && (
        <>
          {/* Spinner principal - se muestra incluso durante las búsquedas posteriores */}
          <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-8 text-center mb-6">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#FDBE11] border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-semibold mb-2 dark:text-white">Buscando contenido...</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Estamos buscando los mejores resultados para "{searchQuery}". Esto puede tomar unos segundos.
              </p>
            </div>
          </div>
          
          {/* Skeletons de tarjetas con efecto de pulsación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md overflow-hidden animate-pulse">
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
        </>
      )}

      {/* Display error state */}
      {error && (
        <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-6 text-center">
          <div className="flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error en la búsqueda</h2>
            <p className="dark:text-gray-300 mb-4">No se pudieron cargar los resultados de búsqueda. Por favor, intenta de nuevo con otros términos o comprueba tu conexión a internet.</p>
            <div className="flex gap-4">
              <Button onClick={() => {
                setShouldSearch(true); // Activar búsqueda al intentar nuevamente
              }} className="bg-[#001C58] hover:bg-[#001C58]/90">
                Intentar nuevamente
              </Button>
              <Button onClick={() => {
                setSearchQuery('');
                setLocation('/search');
              }} variant="outline">
                Reiniciar búsqueda
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Display empty state */}
      {!isLoading && !isFetching && !isSearching && !error && searchQuery && filteredVideos.length === 0 && (
        <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">No se encontraron resultados</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            No hemos encontrado videos que coincidan con tu búsqueda. Prueba con otros términos o filtros diferentes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => {
              setSelectedPlatform('all');
              setSelectedCategory('all');
              setLocation(`/search?q=${searchQuery}`);
            }} variant="outline">
              Limpiar filtros
            </Button>
            <Button onClick={() => {
              setShouldSearch(true); // Activar búsqueda al intentar nuevamente
            }} className="bg-[#001C58] hover:bg-[#001C58]/90">
              Intentar nuevamente
            </Button>
          </div>
        </div>
      )}

      {/* Display empty state before search */}
      {!isLoading && !isFetching && !isSearching && !searchQuery && (
        <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Busca contenido del Real Madrid</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ingresa términos de búsqueda para encontrar videos, noticias y contenido relacionado con el Real Madrid.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Benzema', 'Vinicius Jr', 'Bellingham', 'Ancelotti', 'Champions'].map(term => (
              <Button 
                key={term}
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery(term);
                  setLocation(`/search?q=${term}`);
                  setShouldSearch(true); // Activar búsqueda para términos predefinidos
                }}
                className="border-[#FDBE11] text-[#FDBE11] hover:bg-[#FDBE11]/10"
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Display search results */}
      {!isLoading && !isFetching && !isSearching && !error && filteredVideos.length > 0 && (
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