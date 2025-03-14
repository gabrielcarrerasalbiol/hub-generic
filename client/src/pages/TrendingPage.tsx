import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowDownAZ, ArrowUpAZ, TrendingUp, Trophy, Calendar, Eye } from "lucide-react";

export default function TrendingPage() {
  const [timeframe, setTimeframe] = useState<string>("week");
  const [sortBy, setSortBy] = useState<string>("views");
  const [minViews, setMinViews] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch trending videos
  const { 
    data: trendingVideos = [], 
    isLoading 
  } = useQuery({
    queryKey: ["/api/videos/trending"],
  });

  // Filter and sort trending videos
  const filteredVideos = Array.isArray(trendingVideos) ? trendingVideos.filter((video: Video) => {
    // Filter by minimum views
    if (video.viewCount && video.viewCount < minViews) return false;
    
    // Filter by search query
    if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  }) : [];

  // Sort videos based on selected criteria
  const sortedVideos = [...filteredVideos].sort((a: Video, b: Video) => {
    switch (sortBy) {
      case "views":
        return (b.viewCount || 0) - (a.viewCount || 0);
      case "date": {
        // Manejar cuidadosamente los valores nulos o inválidos
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      }
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      default:
        return (b.viewCount || 0) - (a.viewCount || 0);
    }
  });

  // Format view count for display
  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Get maximum views for slider
  const maxViews = Array.isArray(trendingVideos) && trendingVideos.length > 0
    ? Math.max(...trendingVideos.map((video: Video) => video.viewCount || 0))
    : 1000000;

  return (
    <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#001C58]">Videos en Tendencia</h1>
          <p className="text-gray-600 mt-1">Descubre los videos más populares de Real Madrid</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="outline" 
            className="border-[#FDBE11] text-[#001C58] hover:bg-[#FDBE11]/10"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Ver análisis de tendencias
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Periodo de tiempo</h3>
            <Tabs defaultValue={timeframe} onValueChange={setTimeframe} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="day">Hoy</TabsTrigger>
                <TabsTrigger value="week">Esta semana</TabsTrigger>
                <TabsTrigger value="month">Este mes</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Ordenar por</h3>
            <RadioGroup defaultValue={sortBy} onValueChange={setSortBy} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="views" id="sort-views" />
                <Label htmlFor="sort-views" className="flex items-center">
                  <Eye className="mr-1 h-4 w-4" /> Más vistas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id="sort-date" />
                <Label htmlFor="sort-date" className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> Más recientes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="title_asc" id="sort-title-asc" />
                <Label htmlFor="sort-title-asc" className="flex items-center">
                  <ArrowDownAZ className="mr-1 h-4 w-4" /> Título (A-Z)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="title_desc" id="sort-title-desc" />
                <Label htmlFor="sort-title-desc" className="flex items-center">
                  <ArrowUpAZ className="mr-1 h-4 w-4" /> Título (Z-A)
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Filtros adicionales</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="search">Buscar por título</Label>
                </div>
                <Input
                  id="search"
                  placeholder="Escribe para buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="min-views">Vistas mínimas</Label>
                  <span className="text-sm text-gray-500">
                    {minViews > 0 ? formatViewCount(minViews) : "Sin mínimo"}
                  </span>
                </div>
                <Slider
                  id="min-views"
                  min={0}
                  max={maxViews}
                  step={1000}
                  value={[minViews]}
                  onValueChange={(value) => setMinViews(value[0])}
                  className="my-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total videos</p>
              <h3 className="text-2xl font-bold text-[#001C58] mt-1">
                {Array.isArray(trendingVideos) ? trendingVideos.length : 0}
              </h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Trophy className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vistas totales</p>
              <h3 className="text-2xl font-bold text-[#001C58] mt-1">
                {Array.isArray(trendingVideos) 
                  ? formatViewCount(trendingVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0))
                  : 0}
              </h3>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
              <Eye className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Filtrados</p>
              <h3 className="text-2xl font-bold text-[#001C58] mt-1">
                {sortedVideos.length}
              </h3>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Promedio de vistas</p>
              <h3 className="text-2xl font-bold text-[#001C58] mt-1">
                {Array.isArray(trendingVideos) && trendingVideos.length > 0
                  ? formatViewCount(trendingVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0) / trendingVideos.length)
                  : 0}
              </h3>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <h2 className="text-xl font-bold mb-4 text-[#001C58] border-l-4 border-[#FDBE11] pl-3">
        {sortedVideos.length} {sortedVideos.length === 1 ? "Video Encontrado" : "Videos Encontrados"}
      </h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
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
      ) : sortedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedVideos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-[#FDBE11]/30">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-[#001C58] mb-2">No se encontraron videos</h3>
            <p className="text-gray-600 mb-6">
              No hay videos que coincidan con los filtros seleccionados. Intenta modificar los criterios de búsqueda.
            </p>
            <Button 
              variant="outline" 
              className="border-[#FDBE11] text-[#001C58] hover:bg-[#FDBE11]/10"
              onClick={() => {
                setSearchQuery("");
                setMinViews(0);
                setSortBy("views");
                setTimeframe("week");
              }}
            >
              Restablecer filtros
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}