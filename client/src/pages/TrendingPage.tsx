import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowDownAZ, ArrowUpAZ, TrendingUp, Trophy, Calendar, Eye, PieChart, BarChart, AreaChart, LineChart, ChevronDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TrendingPage() {
  const [timeframe, setTimeframe] = useState<string>("week");
  const [sortBy, setSortBy] = useState<string>("views");
  const [minViews, setMinViews] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleVideos, setVisibleVideos] = useState<number>(9);
  const VIDEOS_PER_PAGE = 9; // Cambiado a 9 para mostrar bloques de 3x3
  
  // Función para obtener el nombre de la categoría según su ID
  const getCategoryName = (categoryId: number): string => {
    const categoryMap: Record<number, string> = {
      1: "Partidos",
      2: "Entrenamientos",
      3: "Ruedas de prensa",
      4: "Entrevistas",
      5: "Jugadores",
      6: "Análisis",
      7: "Momentos Históricos"
    };
    
    return categoryMap[categoryId] || `Categoría ${categoryId}`;
  };

  // Fetch trending videos - pedimos 100 videos en lugar de los 50 por defecto
  const { 
    data: trendingVideos = [], 
    isLoading 
  } = useQuery({
    queryKey: ["/api/videos/trending?displayLimit=100"],
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
    
  // Función para cargar más videos
  const loadMoreVideos = () => {
    setVisibleVideos(prev => prev + VIDEOS_PER_PAGE);
  };

  // Resetear la paginación cuando cambian los filtros
  useEffect(() => {
    setVisibleVideos(VIDEOS_PER_PAGE);
  }, [searchQuery, minViews, sortBy]);

  return (
    <main className="flex-1 bg-gray-100 dark:bg-[#2A2040] p-4 md:p-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#001C58] dark:text-white">Videos en Tendencia</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Descubre los videos más populares de Real Madrid</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-[#FDBE11] text-[#001C58] dark:text-white dark:border-[#FDBE11] hover:bg-[#FDBE11]/10 dark:hover:bg-[#FDBE11]/20"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver análisis de tendencias
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-2xl font-bold text-[#001C58]">Análisis de Tendencias</DialogTitle>
                <DialogDescription>
                  Información detallada sobre los videos en tendencia del Real Madrid
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="summary" className="w-full h-full flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-4 flex-shrink-0 bg-white sticky top-0 z-10">
                    <TabsTrigger value="summary">Resumen</TabsTrigger>
                    <TabsTrigger value="platforms">Plataformas</TabsTrigger>
                    <TabsTrigger value="categories">Categorías</TabsTrigger>
                    <TabsTrigger value="top10">Top 10</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="pt-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold flex items-center">
                            <PieChart className="mr-2 h-5 w-5 text-[#FDBE11]" />
                            Distribución por Plataforma
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {Array.isArray(trendingVideos) && trendingVideos.length > 0 ? (
                            <div className="space-y-4">
                              {/* Calculamos distribución por plataforma */}
                              {Object.entries(
                                trendingVideos.reduce((acc, video) => {
                                  const platform = video.platform || 'desconocida';
                                  acc[platform] = (acc[platform] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([platform, count]: [string, number]) => (
                                <div key={platform} className="flex items-center">
                                  <div className="w-32 capitalize font-medium">{platform}</div>
                                  <div className="flex-1">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div 
                                        className="bg-[#001C58] h-2.5 rounded-full" 
                                        style={{ width: `${Math.round((count / trendingVideos.length) * 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="w-16 text-right text-sm">
                                    {count.toString()} videos
                                  </div>
                                  <div className="w-16 text-right text-sm font-medium">
                                    {Math.round((count / trendingVideos.length) * 100)}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-8 text-center text-gray-500">
                              No hay datos suficientes
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold flex items-center">
                            <BarChart className="mr-2 h-5 w-5 text-[#FDBE11]" />
                            Distribución por Categoría
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {Array.isArray(trendingVideos) && trendingVideos.length > 0 ? (
                            <div className="space-y-4">
                              {/* Calculamos distribución por categoría (usando el primer ID de categoría de cada video) */}
                              {Object.entries(
                                trendingVideos.reduce((acc, video) => {
                                  if (video.categoryIds && video.categoryIds.length > 0) {
                                    video.categoryIds.forEach((catId: number) => {
                                      acc[catId.toString()] = (acc[catId.toString()] || 0) + 1;
                                    });
                                  } else {
                                    acc['sin-categoria'] = (acc['sin-categoria'] || 0) + 1;
                                  }
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([catId, count]: [string, number]) => (
                                <div key={catId} className="flex items-center">
                                  <div className="w-32 capitalize font-medium">
                                    {catId === 'sin-categoria' ? 'Sin categoría' : getCategoryName(parseInt(catId))}
                                  </div>
                                  <div className="flex-1">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div 
                                        className="bg-[#FDBE11] h-2.5 rounded-full" 
                                        style={{ width: `${Math.round((count / trendingVideos.length) * 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="w-16 text-right text-sm">
                                    {count.toString()} videos
                                  </div>
                                  <div className="w-16 text-right text-sm font-medium">
                                    {Math.round((count / trendingVideos.length) * 100)}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-8 text-center text-gray-500">
                              No hay datos suficientes
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold flex items-center">
                            <AreaChart className="mr-2 h-5 w-5 text-[#FDBE11]" />
                            Estadísticas de visualizaciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {Array.isArray(trendingVideos) && trendingVideos.length > 0 ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total de vistas:</span>
                                <span className="font-medium">
                                  {formatViewCount(trendingVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0))}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Promedio por video:</span>
                                <span className="font-medium">
                                  {formatViewCount(trendingVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0) / trendingVideos.length)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Vistas máximas:</span>
                                <span className="font-medium">
                                  {formatViewCount(Math.max(...trendingVideos.map(v => v.viewCount || 0)))}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Vistas mínimas:</span>
                                <span className="font-medium">
                                  {formatViewCount(Math.min(...trendingVideos.filter(v => v.viewCount && v.viewCount > 0).map(v => v.viewCount || 0)))}
                                </span>
                              </div>

                              <div className="h-12 flex items-end mt-2">
                                {trendingVideos
                                  .sort((a, b) => (a.viewCount || 0) - (b.viewCount || 0))
                                  .map((video, index) => {
                                    const height = (video.viewCount || 0) / maxViews * 100;
                                    return (
                                      <div
                                        key={index}
                                        className="flex-1 bg-[#001C58] mx-px"
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                        title={`${video.title}: ${video.viewCount || 0} vistas`}
                                      ></div>
                                    );
                                  })}
                              </div>
                            </div>
                          ) : (
                            <div className="py-8 text-center text-gray-500">
                              No hay datos suficientes
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold flex items-center">
                            <LineChart className="mr-2 h-5 w-5 text-[#FDBE11]" />
                            Videos por antigüedad
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {Array.isArray(trendingVideos) && trendingVideos.length > 0 ? (
                            <div className="space-y-4">
                              {/* Calculamos distribución por fecha de publicación */}
                              {Object.entries(
                                trendingVideos.reduce((acc, video) => {
                                  if (!video.publishedAt) return acc;
                                  
                                  const publishDate = new Date(video.publishedAt);
                                  const now = new Date();
                                  const diffTime = Math.abs(now.getTime() - publishDate.getTime());
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  
                                  let period = '';
                                  if (diffDays <= 7) {
                                    period = 'última-semana';
                                  } else if (diffDays <= 30) {
                                    period = 'último-mes';
                                  } else if (diffDays <= 90) {
                                    period = 'último-trimestre';
                                  } else {
                                    period = 'más-antiguos';
                                  }
                                  
                                  acc[period] = (acc[period] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([period, count]: [string, number]) => {
                                let label = '';
                                switch(period) {
                                  case 'última-semana': label = 'Última semana'; break;
                                  case 'último-mes': label = 'Último mes'; break;
                                  case 'último-trimestre': label = 'Último trimestre'; break;
                                  case 'más-antiguos': label = 'Más antiguos'; break;
                                }
                                
                                return (
                                  <div key={period} className="flex items-center">
                                    <div className="w-32 capitalize font-medium">{label}</div>
                                    <div className="flex-1">
                                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                          className="bg-[#001C58] h-2.5 rounded-full" 
                                          style={{ width: `${Math.round((count / trendingVideos.length) * 100)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <div className="w-16 text-right text-sm">
                                      {count.toString()} videos
                                    </div>
                                    <div className="w-16 text-right text-sm font-medium">
                                      {Math.round((count / trendingVideos.length) * 100)}%
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="py-8 text-center text-gray-500">
                              No hay datos suficientes
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="platforms" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(trendingVideos) && trendingVideos.length > 0 && 
                        Object.entries(
                          trendingVideos.reduce((acc, video) => {
                            const platform = video.platform || 'desconocida';
                            if (!acc[platform]) {
                              acc[platform] = {
                                count: 0,
                                views: 0,
                                videos: []
                              };
                            }
                            acc[platform].count += 1;
                            acc[platform].views += (video.viewCount || 0);
                            acc[platform].videos.push(video);
                            return acc;
                          }, {} as Record<string, {count: number, views: number, videos: Video[]}>)
                        ).map(([platform, data]) => (
                          <Card key={platform}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg font-semibold capitalize flex items-center">
                                {platform === 'youtube' && <svg className="h-5 w-5 mr-2 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>}
                                {platform === 'tiktok' && <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M19.321 5.562a5.122 5.122 0 01-.443-.258 6.228 6.228 0 01-1.137-.966c-1.345-1.459-1.254-3.158-1.237-3.604l.001-.032A.493.493 0 0016.012.21h-3.618a.493.493 0 00-.493.493v12.730c0 1.133-.92 2.054-2.054 2.054a2.055 2.055 0 01-2.054-2.054c0-1.134.92-2.054 2.054-2.054.2 0 .394.029.577.083v-3.638a.493.493 0 00-.493-.493c-.048 0-4.776.453-4.776 6.16 0 3.41 2.775 6.185 6.185 6.185 3.409 0 6.184-2.775 6.184-6.184V7.538c1.162.749 2.487 1.136 3.93 1.136h.082a.493.493 0 00.493-.493V5.562h-2.716z"/></svg>}
                                {platform === 'twitter' && <svg className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/></svg>}
                                {platform === 'instagram' && <svg className="h-5 w-5 mr-2 text-pink-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>}
                                {platform}
                              </CardTitle>
                              <CardDescription>
                                {data.count} videos - {formatViewCount(data.views)} vistas totales
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Promedio de vistas:</span>
                                  <span className="font-medium">
                                    {formatViewCount(data.views / data.count)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Video más visto:</span>
                                  <span className="font-medium">
                                    {formatViewCount(Math.max(...data.videos.map(v => v.viewCount || 0)))}
                                  </span>
                                </div>
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium mb-2">Top 3 videos de {platform}:</h4>
                                  <div className="space-y-2">
                                    {data.videos
                                      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                                      .slice(0, 3)
                                      .map((video, idx) => (
                                        <div key={video.id} className="flex items-center gap-2">
                                          <div className="w-6 h-6 bg-[#001C58] text-white rounded-full flex items-center justify-center text-xs font-medium">
                                            {idx + 1}
                                          </div>
                                          <div className="flex-1 text-sm font-medium truncate" title={video.title}>
                                            {video.title}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {formatViewCount(video.viewCount || 0)}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      }
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="categories" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(trendingVideos) && trendingVideos.length > 0 &&
                        (() => {
                          // Creamos un mapa de categorías
                          const categoryMap: Record<string, {count: number, views: number, videos: Video[]}> = {};
                          
                          // Procesamos cada video y asignamos a sus categorías
                          trendingVideos.forEach(video => {
                            if (video.categoryIds && video.categoryIds.length > 0) {
                              video.categoryIds.forEach((catId: number) => {
                                const catIdStr = catId.toString();
                                if (!categoryMap[catIdStr]) {
                                  categoryMap[catIdStr] = {
                                    count: 0,
                                    views: 0,
                                    videos: []
                                  };
                                }
                                categoryMap[catIdStr].count += 1;
                                categoryMap[catIdStr].views += (video.viewCount || 0);
                                categoryMap[catIdStr].videos.push(video);
                              });
                            } else {
                              if (!categoryMap['sin-categoria']) {
                                categoryMap['sin-categoria'] = {
                                  count: 0,
                                  views: 0,
                                  videos: []
                                };
                              }
                              categoryMap['sin-categoria'].count += 1;
                              categoryMap['sin-categoria'].views += (video.viewCount || 0);
                              categoryMap['sin-categoria'].videos.push(video);
                            }
                          });
                          
                          // Generamos las tarjetas para cada categoría
                          return Object.entries(categoryMap).map(([catId, data]) => (
                            <Card key={catId}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold flex items-center">
                                  {catId === 'sin-categoria' ? (
                                    'Sin categoría'
                                  ) : (
                                    getCategoryName(parseInt(catId))
                                  )}
                                </CardTitle>
                                <CardDescription>
                                  {data.count} videos - {formatViewCount(data.views)} vistas totales
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Promedio de vistas:</span>
                                    <span className="font-medium">
                                      {formatViewCount(data.views / data.count)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Video más visto:</span>
                                    <span className="font-medium">
                                      {formatViewCount(Math.max(...data.videos.map(v => v.viewCount || 0)))}
                                    </span>
                                  </div>
                                  <div className="mt-4">
                                    <h4 className="text-sm font-medium mb-2">Top 3 videos de esta categoría:</h4>
                                    <div className="space-y-2">
                                      {data.videos
                                        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                                        .slice(0, 3)
                                        .map((video, idx) => (
                                          <div key={video.id} className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-[#FDBE11] text-white rounded-full flex items-center justify-center text-xs font-medium">
                                              {idx + 1}
                                            </div>
                                            <div className="flex-1 text-sm font-medium truncate" title={video.title}>
                                              {video.title}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {formatViewCount(video.viewCount || 0)}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ));
                        })()
                      }
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="top10" className="pt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold flex items-center">
                          <Trophy className="mr-2 h-5 w-5 text-[#FDBE11]" />
                          Top 10 Videos Más Vistos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Array.isArray(trendingVideos) && trendingVideos.length > 0 ? (
                          <div className="space-y-4">
                            {trendingVideos
                              .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                              .slice(0, 10)
                              .map((video, idx) => {
                                const maxViews = trendingVideos[0].viewCount || 1;
                                const percentage = ((video.viewCount || 0) / maxViews) * 100;
                                
                                return (
                                  <div key={video.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#001C58] text-white rounded-full flex items-center justify-center font-bold">
                                      {idx + 1}
                                    </div>
                                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                      {video.thumbnailUrl ? (
                                        <img 
                                          src={video.thumbnailUrl} 
                                          alt={video.title} 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                                          Sin imagen
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex flex-col">
                                        <span className="font-medium truncate" title={video.title}>
                                          {video.title}
                                        </span>
                                        <div className="flex items-center text-xs text-gray-500 truncate">
                                          <span>{video.channelTitle}</span>
                                          <span className="mx-1">•</span>
                                          <span>{video.platform}</span>
                                          {video.publishedAt && (
                                            <>
                                              <span className="mx-1">•</span>
                                              <span>
                                                {new Date(video.publishedAt).toLocaleDateString()}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                          <div 
                                            className="bg-[#FDBE11] h-1.5 rounded-full" 
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold">
                                        {formatViewCount(video.viewCount || 0)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        vistas
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="py-8 text-center text-gray-500">
                            No hay datos suficientes
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedVideos.slice(0, visibleVideos).map((video: Video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          
          {/* Botón para cargar más videos */}
          {visibleVideos < sortedVideos.length && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={loadMoreVideos}
                variant="outline" 
                className="border-[#FDBE11] text-[#001C58] dark:text-white dark:border-[#FDBE11] hover:bg-[#FDBE11]/10 dark:hover:bg-[#FDBE11]/20"
              >
                <ChevronDown className="mr-2 h-4 w-4" />
                Cargar más videos ({sortedVideos.length - visibleVideos} restantes)
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-[#FDBE11]/30">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-[#001C58] dark:text-white mb-2">No se encontraron videos</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              No hay videos que coincidan con los filtros seleccionados. Intenta modificar los criterios de búsqueda.
            </p>
            <Button 
              variant="outline" 
              className="border-[#FDBE11] text-[#001C58] dark:text-white dark:border-[#FDBE11] hover:bg-[#FDBE11]/10 dark:hover:bg-[#FDBE11]/20"
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