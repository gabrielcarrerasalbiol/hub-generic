import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Video, Category } from '@shared/schema';
import { BarChart2, PieChart as PieChartIcon, Calendar, LineChart, Activity } from 'lucide-react';
import { Link } from 'wouter';

// Colores de Real Madrid
const COLORS = ['#001C58', '#FDBE11', '#00529F', '#B6B6B6', '#B60A1C', '#F8F9FA', '#17A2B8'];

// Opciones de intervalo de tiempo
const timeOptions = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
  { value: '365', label: 'Último año' },
];

interface CategoryData {
  categoryId: number;
  count: number;
}

interface PlatformData {
  platform: string;
  count: number;
}

interface DateData {
  date: string;
  count: number;
}

interface ChannelData {
  channelId: string;
  channelTitle: string;
  count: number;
}

export default function DashboardStatistics() {
  const [timeRange, setTimeRange] = useState('30'); // Por defecto, mostrar datos de los últimos 30 días

  // Obtener categorías para mapear IDs a nombres
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    select: (data) => data as Category[],
  });

  // Obtener estadísticas por categoría
  const { data: categoryStats, isLoading: loadingCategoryStats } = useQuery({
    queryKey: ['/api/statistics/categories'],
    queryFn: () => apiRequest<CategoryData[]>('/api/statistics/categories'),
  });

  // Obtener estadísticas por plataforma
  const { data: platformStats, isLoading: loadingPlatformStats } = useQuery({
    queryKey: ['/api/statistics/platforms'],
    queryFn: () => apiRequest<PlatformData[]>('/api/statistics/platforms'),
  });

  // Obtener estadísticas diarias
  const { data: dateStats, isLoading: loadingDateStats } = useQuery({
    queryKey: ['/api/statistics/dates', timeRange],
    queryFn: () => apiRequest<DateData[]>(`/api/statistics/dates?days=${timeRange}`),
  });

  // Obtener Top canales
  const { data: channelStats, isLoading: loadingChannelStats } = useQuery({
    queryKey: ['/api/statistics/top-channels'],
    queryFn: () => apiRequest<ChannelData[]>('/api/statistics/top-channels'),
  });

  // Función para obtener el nombre de la categoría desde su ID
  const getCategoryName = (categoryId: number): string => {
    if (!categories) return `Categoría ${categoryId}`;
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : `Categoría ${categoryId}`;
  };

  // Preparar datos para gráficos
  const preparedCategoryData = React.useMemo(() => {
    if (!categoryStats) return [];
    return categoryStats.map(stat => ({
      name: getCategoryName(stat.categoryId),
      value: stat.count,
    }));
  }, [categoryStats, categories]);

  const preparedPlatformData = React.useMemo(() => {
    if (!platformStats) return [];
    return platformStats.map(stat => ({
      name: stat.platform,
      value: stat.count,
    }));
  }, [platformStats]);

  const preparedDateData = React.useMemo(() => {
    if (!dateStats) return [];
    return dateStats.map(stat => ({
      date: stat.date,
      videos: stat.count,
    }));
  }, [dateStats]);
  
  const preparedChannelData = React.useMemo(() => {
    if (!channelStats) return [];
    return channelStats.map(stat => ({
      name: stat.channelTitle,
      videos: stat.count,
    })).slice(0, 10); // Solo mostrar los top 10
  }, [channelStats]);

  // Formatear fecha para mostrar en gráfico
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Estadísticas y Análisis
        </h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período de tiempo" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="platforms">
            <BarChart2 className="h-4 w-4 mr-2" />
            Plataformas
          </TabsTrigger>
          <TabsTrigger value="trends">
            <LineChart className="h-4 w-4 mr-2" />
            Tendencias
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Resumen General */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resumen de categorías */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2 text-[#FDBE11]" />
                  Distribución por categoría
                </CardTitle>
                <CardDescription>
                  Videos agrupados por tipo de contenido
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loadingCategoryStats ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparedCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {preparedCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} videos`, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Resumen de plataformas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-[#001C58]" />
                  Distribución por plataforma
                </CardTitle>
                <CardDescription>
                  Videos agrupados por origen
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loadingPlatformStats ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={preparedPlatformData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} videos`, 'Cantidad']} />
                      <Bar dataKey="value" name="Videos" fill="#001C58" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Tendencia temporal */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-[#001C58]" />
                  Tendencia de publicación
                </CardTitle>
                <CardDescription>
                  Videos publicados por fecha en los últimos {timeRange} días
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loadingDateStats ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={preparedDateData}>
                      <defs>
                        <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#001C58" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#001C58" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        interval={timeRange === '7' ? 0 : 'preserveEnd'}
                      />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip 
                        formatter={(value) => [`${value} videos`, 'Publicados']}
                        labelFormatter={(label) => formatDate(label as string)}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="videos" 
                        stroke="#001C58" 
                        fillOpacity={1} 
                        fill="url(#colorVideos)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Categorías */}
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por categoría de contenido</CardTitle>
              <CardDescription>
                Distribución detallada de videos según su categoría
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              {loadingCategoryStats ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={preparedCategoryData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                    />
                    <Tooltip formatter={(value) => [`${value} videos`, 'Cantidad']} />
                    <Bar dataKey="value" name="Videos" fill="#FDBE11" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Plataformas */}
        <TabsContent value="platforms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por plataforma</CardTitle>
              <CardDescription>
                Distribución detallada de videos según su plataforma de origen
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              {loadingPlatformStats ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={preparedPlatformData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={130}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {preparedPlatformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} videos`, 'Cantidad']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={preparedPlatformData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value) => [`${value} videos`, 'Cantidad']} />
                        <Bar dataKey="value" name="Videos" fill="#001C58" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Tendencias */}
        <TabsContent value="trends" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tendencia temporal */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-[#001C58]" />
                  Tendencia de publicación
                </CardTitle>
                <CardDescription>
                  Videos publicados por fecha en los últimos {timeRange} días
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loadingDateStats ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={preparedDateData}>
                      <defs>
                        <linearGradient id="colorVideosTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#001C58" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#001C58" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                      />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip 
                        formatter={(value) => [`${value} videos`, 'Publicados']}
                        labelFormatter={(label) => formatDate(label as string)}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="videos" 
                        stroke="#001C58" 
                        fillOpacity={1} 
                        fill="url(#colorVideosTrend)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Canales más activos */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Canales con más contenido</CardTitle>
                <CardDescription>
                  Top canales por cantidad de videos
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loadingChannelStats ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={preparedChannelData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                      />
                      <Tooltip formatter={(value) => [`${value} videos`, 'Cantidad']} />
                      <Bar dataKey="videos" name="Videos" fill="#FDBE11" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}