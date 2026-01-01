import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Redirect, Link } from "wouter";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Clock,
  Calendar,
  BarChart,
  Eye,
  PlayCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Video } from "@shared/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Tipo para historial con estadísticas adicionales
interface VideoHistory extends Video {
  watchedAt: string;
  watchDuration: number;
  completionPercentage: number;
}

// Tipo para las estadísticas agrupadas por día
interface DailyStats {
  date: string;
  count: number;
  watchTime: number;
  avgCompletion: number;
}

// Definir colores para las gráficas
const COLORS = ['#FDBE11', '#001C58', '#8884d8', '#82ca9d', '#ffc658'];

export default function HistoryPage() {
  const { user, checkAuth } = useAuth();
  const [periodFilter, setPeriodFilter] = useState<'all' | '7' | '30' | '90'>('all');
  
  // Redirigir si no hay sesión iniciada
  if (!checkAuth()) {
    return <Redirect to="/login" />;
  }

  // Obtener el historial de videos
  const { 
    data: historyVideos = [], 
    isLoading,
    isError,
    refetch
  } = useQuery<VideoHistory[]>({
    queryKey: ['/api/history'],
    queryFn: () => apiRequest('/api/history'),
  });

  // Filtrar videos por período seleccionado
  const getFilteredVideos = (): VideoHistory[] => {
    if (periodFilter === 'all') return historyVideos;
    
    const now = new Date();
    const daysAgo = parseInt(periodFilter);
    const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
    
    return historyVideos.filter(video => {
      const watchedDate = new Date(video.watchedAt);
      return watchedDate >= cutoffDate;
    });
  };
  
  const filteredVideos = getFilteredVideos();
  
  // Generar estadísticas
  const generateStats = () => {
    const videos = getFilteredVideos();
    
    if (videos.length === 0) {
      return {
        totalVideos: 0,
        totalWatchTime: 0,
        avgCompletion: 0,
        dailyStats: [],
        platformData: [],
        categoryData: []
      };
    }
    
    // Estadísticas generales
    const totalVideos = videos.length;
    const totalWatchTime = videos.reduce((sum, video) => sum + (video.watchDuration || 0), 0);
    const avgCompletion = videos.reduce((sum, video) => sum + (video.completionPercentage || 0), 0) / totalVideos;
    
    // Agrupar por días para la gráfica
    const dailyMap = new Map<string, DailyStats>();
    
    videos.forEach(video => {
      const date = new Date(video.watchedAt).toISOString().split('T')[0];
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          count: 0,
          watchTime: 0,
          avgCompletion: 0
        });
      }
      
      const stats = dailyMap.get(date)!;
      stats.count += 1;
      stats.watchTime += video.watchDuration || 0;
      stats.avgCompletion += video.completionPercentage || 0;
    });
    
    // Calcular promedios por día
    const dailyStats = Array.from(dailyMap.values()).map(stats => {
      return {
        ...stats,
        avgCompletion: stats.avgCompletion / stats.count
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
    
    // Estadísticas por plataforma
    const platformMap = new Map<string, number>();
    videos.forEach(video => {
      const platform = video.platform;
      platformMap.set(platform, (platformMap.get(platform) || 0) + 1);
    });
    
    const platformData = Array.from(platformMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    
    // Estadísticas por categoría
    const categoryMap = new Map<number, number>();
    videos.forEach(video => {
      video.categoryIds?.forEach(catId => {
        // Convertir a número si es necesario
        const categoryId = typeof catId === 'string' ? parseInt(catId, 10) : catId;
        if (!isNaN(categoryId)) {
          categoryMap.set(categoryId, (categoryMap.get(categoryId) || 0) + 1);
        }
      });
    });
    
    const categoryData = Array.from(categoryMap.entries()).map(([id, value]) => ({
      name: getCategoryName(id),
      value
    }));
    
    return {
      totalVideos,
      totalWatchTime,
      avgCompletion,
      dailyStats,
      platformData,
      categoryData
    };
  };
  
  const stats = generateStats();
  
  // Formatear tiempo de visualización (en segundos) a formato legible
  const formatWatchTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} segundos`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} horas`;
    return `${hours} h ${remainingMinutes} min`;
  };
  
  // Obtener nombre de categoría a partir del ID
  function getCategoryName(categoryId: number): string {
    switch (categoryId) {
      case 1: return "Partidos";
      case 2: return "Entrenamientos";
      case 3: return "Ruedas de prensa";
      case 4: return "Entrevistas";
      case 5: return "Jugadores";
      case 6: return "Análisis";
      case 7: return "Momentos Históricos";
      default: return `Categoría ${categoryId}`;
    }
  }

  return (
    <main className="flex-1 bg-gray-100 dark:bg-[#2C2152] p-4 md:p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 dark:text-white">Mi Historial</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Revisa tus videos vistos y analiza tus estadísticas de visualización.
        </p>
      </div>
      
      {/* Filtros de período */}
      <div className="mb-6">
        <Tabs defaultValue={periodFilter} onValueChange={(value) => setPeriodFilter(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todo</TabsTrigger>
            <TabsTrigger value="7">Últimos 7 días</TabsTrigger>
            <TabsTrigger value="30">Últimos 30 días</TabsTrigger>
            <TabsTrigger value="90">Últimos 90 días</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Estado de carga */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      )}
      
      {/* Error */}
      {isError && (
        <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="dark:text-gray-300">No se pudo cargar tu historial. Por favor, intenta de nuevo más tarde.</p>
        </div>
      )}
      
      {/* Sin historial */}
      {!isLoading && !isError && filteredVideos.length === 0 && (
        <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-8 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-brand-secondary/70 mb-4" />
          <h2 className="text-xl font-semibold mb-2 dark:text-white">
            {periodFilter === 'all' 
              ? "No has visto ningún video aún" 
              : `No has visto videos en los últimos ${periodFilter} días`}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Cuando veas videos, aparecerán aquí para que puedas llevar un seguimiento.
          </p>
          <Link href="/" className="px-6 py-3 bg-[#1E3A8A] text-white rounded-md font-medium hover:bg-blue-800 transition duration-200 inline-block">
            Explorar videos
          </Link>
        </div>
      )}
      
      {/* Estadísticas de visualización */}
      {!isLoading && !isError && filteredVideos.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Videos vistos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <PlayCircle className="mr-2 h-5 w-5 text-brand-secondary" />
                  <div className="text-2xl font-bold">
                    {stats.totalVideos}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tiempo total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-brand-primary" />
                  <div className="text-2xl font-bold">
                    {formatWatchTime(stats.totalWatchTime)}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Promedio visto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-brand-primary" />
                  <div className="text-2xl font-bold">
                    {Math.round(stats.avgCompletion)}%
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Último visto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-brand-secondary" />
                  <div className="text-xl font-bold">
                    {filteredVideos.length > 0 ? new Date(filteredVideos[0].watchedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Gráficas de distribución */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Distribución por plataforma */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {stats.platformData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.platformData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No hay datos suficientes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Distribución por categoría */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {stats.categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No hay datos suficientes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Lista de videos vistos */}
          <h2 className="text-xl font-bold mb-4 dark:text-white">Videos vistos recientemente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video) => (
              <div key={`${video.id}-${video.watchedAt}`} className="relative">
                <VideoCard video={video} />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Visto: {new Date(video.watchedAt).toLocaleDateString()}</span>
                    <span>{Math.round(video.completionPercentage)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}