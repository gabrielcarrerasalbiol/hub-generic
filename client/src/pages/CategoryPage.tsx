import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Layout from "@/components/Layout";
import { Video, Category, Channel } from "@shared/schema";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowUpDown, 
  Calendar, 
  Eye, 
  Filter,
  Mic, 
  Search, 
  ThumbsUp, 
  Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CategoryPage() {
  const { categorySlug } = useParams();
  
  // Mapear slug a tipo de categoría real
  let categoryType = "all";
  let categoryTitle = "Todos los videos";
  let categoryIcon = "";
  
  switch(categorySlug) {
    case "matches":
      categoryType = "matches";
      categoryTitle = "Partidos";
      categoryIcon = "fas fa-futbol";
      break;
    case "analysis":
      categoryType = "analysis";
      categoryTitle = "Análisis";
      categoryIcon = "fas fa-comments";
      break;
    case "historic":
      categoryType = "press"; // Usamos 'press' como equivalente a momentos históricos
      categoryTitle = "Momentos Históricos";
      categoryIcon = "fas fa-trophy";
      break;
    case "players":
      categoryType = "players";
      categoryTitle = "Jugadores";
      categoryIcon = "fas fa-user";
      break;
    case "press":
      categoryType = "press";
      categoryTitle = "Noticias";
      categoryIcon = "fas fa-newspaper";
      break;
    default:
      categoryType = "all";
      categoryTitle = "Todos los Videos";
      categoryIcon = "fas fa-film";
  }

  // Estado para filtros y ordenación
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  
  // Fetch videos filtered by category
  const { data: videos = [], isLoading, refetch } = useQuery<Video[]>({
    queryKey: ['/api/videos', { category: categoryType, platform: platformFilter }],
  });
  
  // Refrescar la consulta cuando cambie la plataforma seleccionada
  useEffect(() => {
    refetch();
  }, [platformFilter, refetch]);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch channels para filtrar
  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ['/api/channels'],
  });

  // Aplicar filtros y ordenación a videos
  const filteredVideos = videos.filter((video) => {
    // Filtrar por plataforma
    if (platformFilter !== "all" && video.platform.toLowerCase() !== platformFilter.toLowerCase()) {
      return false;
    }
    
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        video.title.toLowerCase().includes(query) ||
        (video.description && video.description.toLowerCase().includes(query)) ||
        (video.channelTitle && video.channelTitle.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Función para obtener fecha segura
  const getDateTimestamp = (dateString: string | null | undefined): number => {
    if (!dateString) return 0;
    return new Date(dateString).getTime();
  };

  // Ordenar videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return getDateTimestamp(b.publishedAt) - getDateTimestamp(a.publishedAt);
      case "date-asc":
        return getDateTimestamp(a.publishedAt) - getDateTimestamp(b.publishedAt);
      case "views-desc":
        return (b.viewCount || 0) - (a.viewCount || 0);
      case "views-asc":
        return (a.viewCount || 0) - (b.viewCount || 0);
      default:
        return getDateTimestamp(b.publishedAt) - getDateTimestamp(a.publishedAt);
    }
  });

  // Plataformas disponibles
  const platforms = [
    { id: "all", name: "Todas las plataformas" },
    { id: "youtube", name: "YouTube" },
    { id: "tiktok", name: "TikTok" },
    { id: "twitter", name: "Twitter" },
    { id: "instagram", name: "Instagram" },
    { id: "twitch", name: "Twitch" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado con título de categoría */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-[#FDBE11] pb-4">
        <div className="flex items-center mb-4 sm:mb-0">
          <i className={`${categoryIcon} text-2xl text-[#FDBE11] mr-3`}></i>
          <h1 className="text-2xl font-bold text-[#001C58]">{categoryTitle}</h1>
        </div>
        
        {/* Botón de filtros para móvil */}
        <div className="sm:hidden">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
          >
            <Filter size={16} className="mr-2" />
            Filtros y ordenación
          </Button>
        </div>
        
        {/* Panel de ordenación y filtros para escritorio */}
        <div className="hidden sm:flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Más recientes</SelectItem>
                <SelectItem value="date-asc">Más antiguos</SelectItem>
                <SelectItem value="views-desc">Más vistos</SelectItem>
                <SelectItem value="views-asc">Menos vistos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map(platform => (
                <SelectItem key={platform.id} value={platform.id}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-2.5 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar en esta categoría"
              className="pl-9 w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Panel de filtros para móvil - visible solo cuando se hace clic */}
      {filterMenuOpen && (
        <div className="sm:hidden mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Más recientes</SelectItem>
                  <SelectItem value="date-asc">Más antiguos</SelectItem>
                  <SelectItem value="views-desc">Más vistos</SelectItem>
                  <SelectItem value="views-asc">Menos vistos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Plataforma</label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Buscar en esta categoría</label>
              <div className="relative">
                <Search size={16} className="absolute left-2.5 top-2.5 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Escribe para buscar"
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contador de resultados */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando {sortedVideos.length} vídeos
        {sortBy !== "date-desc" && (
          <span> ordenados por {
            sortBy === "date-asc" ? "más antiguos" : 
            sortBy === "views-desc" ? "más vistos" : 
            sortBy === "views-asc" ? "menos vistos" : ""
          }</span>
        )}
        {platformFilter !== "all" && (
          <span> en {platforms.find(p => p.id === platformFilter)?.name}</span>
        )}
        {searchQuery && (
          <span> que coinciden con "{searchQuery}"</span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, index) => (
            <div key={index} className="flex flex-col">
              <Skeleton className="h-48 w-full mb-3 rounded-md" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : sortedVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <i className="fas fa-video-slash text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 text-lg">
            No hay videos disponibles con los filtros seleccionados.
          </p>
          <p className="text-gray-500 mt-2">
            Prueba a cambiar los filtros o a seleccionar otra categoría.
          </p>
          {(platformFilter !== "all" || searchQuery) && (
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => {
                setPlatformFilter("all");
                setSearchQuery("");
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}