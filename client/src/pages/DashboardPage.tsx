import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';
import DashboardStatistics from '@/components/dashboard/Statistics';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart2,
  PieChart,
  Calendar,
  Activity,
  Users,
  PlayCircle,
  Bookmark,
  BarChart,
  TrendingUp,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function DashboardPage() {
  const { user, checkAuth, isAdmin } = useAuth();
  
  // Solo administradores pueden acceder al dashboard
  if (!checkAuth() || !isAdmin()) {
    return <Redirect to="/" />;
  }

  // Consultar estadísticas resumidas
  const { data: statsOverview, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/statistics/overview'],
    queryFn: () => apiRequest('/api/statistics/overview'),
  });

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '0';
    return new Intl.NumberFormat('es-ES').format(num);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Videos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <PlayCircle className="mr-2 h-5 w-5 text-[#FDBE11]" />
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : formatNumber(statsOverview?.videoCount)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Canales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-[#001C58]" />
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : formatNumber(statsOverview?.channelCount)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vídeos esta semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-[#001C58]" />
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : formatNumber(statsOverview?.videosLastWeek)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-[#FDBE11]" />
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : formatNumber(statsOverview?.userCount)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos y estadísticas */}
      <DashboardStatistics />
    </div>
  );
}