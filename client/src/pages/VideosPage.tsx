import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useSearch } from "../hooks/useSearch";
import { getQueryFn } from "@/lib/queryClient";
import { Video, PlatformType, CategoryType } from "@shared/schema";
// Importando los componentes como default
import PlatformFilters from "@/components/PlatformFilters";
import CategoryFilters from "@/components/CategoryFilters";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "../components/Pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid, Search, Filter, SlidersHorizontal, LayoutGrid, ArrowDownAZ, ArrowUpAZ, Flame, Clock } from "lucide-react";

export default function VideosPage() {
  const [location] = useLocation();
  const { query, setQuery, debouncedSearch } = useSearch();
  
  // Extraer parámetros de URL
  // Función para mapear nombres de categoría en español a los equivalentes en inglés
  const mapCategoryToEnum = (categoryParam: string | null): CategoryType => {
    // Si es null, devolvemos 'all'
    if (!categoryParam) return "all";
    
    // Mapa de conversión de nombres de categoría a sus equivalentes en el enum
    const categoryMap: Record<string, CategoryType> = {
      'partidos': 'matches',
      'matches': 'matches',
      'fichajes': 'transfers',
      'transfers': 'transfers',
      'tacticas': 'tactics',
      'tactics': 'tactics',
      'analisis': 'tactics',
      'análisis': 'tactics',
      'entrevistas': 'interviews',
      'interviews': 'interviews',
      'historia': 'history',
      'history': 'history',
      'afición': 'fan_content',
      'aficion': 'fan_content',
      'fan_content': 'fan_content',
      'fans': 'fan_content',
      'noticias': 'news',
      'news': 'news',
      'all': 'all'
    };
    
    // Convertir a minúsculas y normalizar (quitar acentos)
    const normalizedCategory = categoryParam.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    // Devolver la categoría mapeada o 'all' si no se encuentra
    return categoryMap[normalizedCategory] || "all";
  };
  
  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      platform: urlParams.get('platform') as PlatformType || "all",
      category: mapCategoryToEnum(urlParams.get('category'))
    };
  };
  
  // Estados
  const [platform, setPlatform] = useState<PlatformType>(getUrlParams().platform);
  const [category, setCategory] = useState<CategoryType>(getUrlParams().category);
  // Siempre mostrar los filtros expandidos por defecto
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"newest" | "popular" | "az" | "za">("newest");
  
  // Efecto para detectar cambios en la URL (navegación con enlaces externos)
  useEffect(() => {
    const handleUrlChange = () => {
      const params = getUrlParams();
      console.log("URL cambió. Nuevos parámetros:", params);
      setPlatform(params.platform);
      setCategory(params.category);
      
      // Asegurarnos de que los filtros estén visibles cuando cambia la URL
      setIsFilterOpen(true);
      
      // Resetear la página cuando cambian los filtros
      setPage(1);
    };
    
    // Añadir event listener para popstate (cuando se usa el botón atrás/adelante)
    window.addEventListener('popstate', handleUrlChange);
    
    // También verificar los parámetros cuando el componente se monta
    handleUrlChange();
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);
  const itemsPerPage = 24; // 6 filas de 4 columnas

  // Verificar si la plataforma seleccionada está disponible
  const availablePlatforms = ["all", "youtube", "twitch"];
  const isPlatformAvailable = availablePlatforms.includes(platform);
  
  // Actualizar la URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    if (platform !== "all") params.set("platform", platform);
    if (category !== "all") params.set("category", category);
    
    const newUrl = params.toString() ? `/videos?${params.toString()}` : "/videos";
    window.history.replaceState(null, "", newUrl);
  }, [platform, category]);

  // Estado para seguimiento de consultas (similar a Home.tsx)
  const [requestId, setRequestId] = useState(0);
  
  // Efecto para actualizar cuando cambian los filtros
  useEffect(() => {
    // Crear un nuevo ID de solicitud para el seguimiento
    setRequestId(prev => prev + 1);
  }, [platform, category, debouncedSearch]);
  
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
      console.log("Token añadido a la solicitud:", `Bearer ${token.substring(0, 12)}...`);
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
  
  // Consulta para obtener videos filtrados
  const { 
    data: filteredVideos = [], 
    isLoading: isFilteredLoading,
    isFetching: isFilteredFetching
  } = useQuery({
    queryKey: [`/api/videos-${platform}-${category}-${debouncedSearch}`, requestId],
    queryFn: async () => {
      // Construir URL con parámetros explícitos
      const baseUrl = "/api/videos";
      const params = new URLSearchParams();
      
      console.log(`DEBUG: Construyendo URL para platform=${platform}, category=${category}, search=${debouncedSearch}`);
      
      if (platform !== "all") {
        params.append("platform", platform);
      }
      if (category !== "all") {
        params.append("category", category);
      }
      if (debouncedSearch) {
        params.append("query", debouncedSearch);
      }
      params.append("limit", "100");
      
      const url = `${baseUrl}?${params.toString()}`;
      console.log("URL final de consulta:", url);
      
      // Añadir el token al header para invalidar caché
      const tokenAddedToHeaders = await makeRequest(url);
      return tokenAddedToHeaders;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0,
    enabled: true,
  });

  // Aplicar ordenación a los videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime();
      case "popular":
        return (b.viewCount || 0) - (a.viewCount || 0);
      case "az":
        return a.title.localeCompare(b.title);
      case "za":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  // Paginación de videos
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = page * itemsPerPage;
  const displayedVideos = sortedVideos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedVideos.length / itemsPerPage);

  // Función para restablecer filtros
  const resetFilters = () => {
    setPlatform("all");
    setCategory("all");
    setSort("newest");
    setQuery("");
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Encabezado y filtros principales */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#001C58] mb-1">Explorador de Videos</h1>
            <p className="text-slate-600 text-sm">
              Descubre todos los videos relacionados con el Real Madrid
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Input
                type="search"
                placeholder="Buscar videos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-8 min-w-[200px] md:min-w-[300px] border-slate-300"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-1 border-slate-300"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            
            <Select value={sort} onValueChange={(value) => setSort(value as any)}>
              <SelectTrigger className="w-full md:w-auto border-slate-300">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Ordenar</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Más recientes
                  </div>
                </SelectItem>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4" /> Más populares
                  </div>
                </SelectItem>
                <SelectItem value="az">
                  <div className="flex items-center gap-2">
                    <ArrowDownAZ className="h-4 w-4" /> A-Z
                  </div>
                </SelectItem>
                <SelectItem value="za">
                  <div className="flex items-center gap-2">
                    <ArrowUpAZ className="h-4 w-4" /> Z-A
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros desplegables */}
        {isFilterOpen && (
          <div className="rounded-lg border border-slate-200 p-4 mb-4 bg-white shadow-sm">
            <div className="flex flex-col space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Plataformas</h3>
                <div className="flex flex-wrap gap-2">
                  <PlatformFilters 
                    selectedPlatform={platform} 
                    onSelectPlatform={(p) => setPlatform(p as PlatformType)} 
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Categorías</h3>
                <div className="flex flex-wrap gap-2">
                  <CategoryFilters 
                    selectedCategory={category} 
                    onSelectCategory={setCategory} 
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-[#001C58]"
                >
                  Restablecer filtros
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros móviles */}
        <div className="md:hidden">
          <Tabs defaultValue="platforms">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="platforms">Plataformas</TabsTrigger>
              <TabsTrigger value="categories">Categorías</TabsTrigger>
            </TabsList>
            <TabsContent value="platforms" className="mt-2">
              <div className="flex flex-wrap gap-2">
                <PlatformFilters 
                  selectedPlatform={platform} 
                  onSelectPlatform={(p) => setPlatform(p as PlatformType)} 
                />
              </div>
            </TabsContent>
            <TabsContent value="categories" className="mt-2">
              <div className="flex flex-wrap gap-2">
                <CategoryFilters 
                  selectedCategory={category} 
                  onSelectCategory={setCategory} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Contenido principal */}
        <div className="min-h-[50vh]">
          {/* Mostrar mensaje si la plataforma no está disponible */}
          {!isPlatformAvailable ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-amber-200">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                  <Filter className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-[#001C58] mb-2">Próximamente</h3>
                <p className="text-gray-600 mb-4 max-w-xl mx-auto">
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
                  Ver todos los videos
                </Button>
              </div>
            </div>
          ) : isFilteredLoading || isFilteredFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array(12).fill(0).map((_, index) => (
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
          ) : filteredVideos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-slate-200">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-[#001C58] mb-2">No se encontraron resultados</h3>
                <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                  No hay videos que coincidan con los filtros actuales. Intenta cambiar tus criterios de búsqueda.
                </p>
                <Button 
                  variant="outline" 
                  className="border-[#FDBE11] text-[#001C58] hover:bg-[#FDBE11]/10"
                  onClick={resetFilters}
                >
                  Restablecer filtros
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Encabezado de resultados */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-600">
                  {sortedVideos.length} {sortedVideos.length === 1 ? "video encontrado" : "videos encontrados"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex"
                    disabled
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Cuadrícula de videos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {displayedVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  onPageChange={setPage} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}