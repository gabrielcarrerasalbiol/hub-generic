import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import UserManagement from '@/components/admin/UserManagement';
import VideoManagement from '@/components/admin/VideoManagement';
import PremiumChannelManagement from '@/components/admin/PremiumChannelManagement';
import RecommendedChannelManagement from '@/components/admin/RecommendedChannelManagement';
import FeaturedVideosManager from '@/components/admin/FeaturedVideosManager';
import PollManagement from '@/components/polls/PollManagement';
import LoginLogs from '@/components/admin/LoginLogs';
import ScheduledTasksManager from '@/components/admin/ScheduledTasksManager';
import SiteConfigManagement from '@/components/admin/SiteConfigManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Video, Activity, Star, Award, BarChart2, Sparkles, BarChart, Vote, LogIn, Clock, Settings } from 'lucide-react';

export default function AdminPage() {
  const { isAdmin, isSuperAdmin, checkAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    // Redirigir si el usuario no está autenticado o no es administrador
    if (!checkAuth()) {
      setLocation('/login');
    } else if (!isAdmin()) {
      setLocation('/');
    }
  }, [checkAuth, isAdmin, setLocation]);

  return (
    <div className="container max-w-7xl py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Dashboard de Estadísticas</span>
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-10">
          {isSuperAdmin() && (
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Config</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="loginlogs" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            <span>Accesos</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>Vídeos</span>
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Destacados</span>
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Premium</span>
          </TabsTrigger>
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Recomendados</span>
          </TabsTrigger>
          <TabsTrigger value="polls" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Encuestas</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Tareas</span>
          </TabsTrigger>
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Procesos</span>
          </TabsTrigger>
        </TabsList>
        
        {isSuperAdmin() && (
          <TabsContent value="config" className="space-y-6">
            <SiteConfigManagement />
          </TabsContent>
        )}
        
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="loginlogs" className="space-y-6">
          <LoginLogs />
        </TabsContent>
        
        <TabsContent value="videos" className="space-y-6">
          <VideoManagement />
        </TabsContent>
        
        <TabsContent value="featured" className="space-y-6">
          <FeaturedVideosManager />
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-6">
          <PremiumChannelManagement />
        </TabsContent>
        
        <TabsContent value="recommended" className="space-y-6">
          <RecommendedChannelManagement />
        </TabsContent>
        
        <TabsContent value="polls" className="space-y-6">
          <PollManagement />
        </TabsContent>
        
        <TabsContent value="processes" className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Procesos del Sistema</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Verificación de Videos</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Disponible
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Verifica la disponibilidad de todos los videos en sus plataformas originales y elimina aquellos que ya no están disponibles.
                </p>
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                  onClick={() => setActiveTab('videos')}
                >
                  Ir a gestión de videos
                </button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recategorización con IA</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Disponible
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Utiliza inteligencia artificial para analizar y categorizar automáticamente los videos basándose en su contenido.
                </p>
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                  onClick={() => setActiveTab('videos')}
                >
                  Ir a gestión de videos
                </button>
              </div>
              
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Importación Premium</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-xs font-medium">
                    Activo
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Gestiona canales premium y automatiza la importación de videos de fuentes de confianza para mantener el contenido actualizado.
                </p>
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                  onClick={() => setActiveTab('premium')}
                >
                  Ir a Premium
                </button>
              </div>
              
              <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Gestión de Recomendados</h3>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 rounded-full text-xs font-medium">
                    Nuevo
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Configura y administra los canales recomendados que se mostrarán a los usuarios como sugerencias de contenido de calidad.
                </p>
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                  onClick={() => setActiveTab('recommended')}
                >
                  Ir a Recomendados
                </button>
              </div>
              
              <div className="border rounded-lg p-4 bg-cyan-50 dark:bg-cyan-950">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Tareas Programadas</h3>
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100 rounded-full text-xs font-medium">
                    Nuevo
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Configura las tareas programadas para la importación automática de videos y otros procesos del sistema.
                </p>
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center gap-2"
                  onClick={() => setActiveTab('scheduled')}
                >
                  <Clock className="h-4 w-4" />
                  <span>Gestionar tareas</span>
                </button>
              </div>
              
              <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Gestión de Encuestas</h3>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 rounded-full text-xs font-medium">
                    Nuevo
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Administra las encuestas para los aficionados, crea y publica nuevas preguntas y visualiza los resultados en tiempo real.
                </p>
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center gap-2"
                  onClick={() => setActiveTab('polls')}
                >
                  <BarChart className="h-4 w-4" />
                  <span>Ir a encuestas</span>
                </button>
              </div>
              
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Dashboard de Estadísticas</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full text-xs font-medium">
                    Destacado
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Visualiza estadísticas detalladas sobre videos, categorías, plataformas y tendencias temporales con gráficos interactivos.
                </p>
                <Link href="/dashboard">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    <span>Ver dashboard</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Sección de tareas programadas */}
          <ScheduledTasksManager />
        </TabsContent>
        
        {/* Nueva pestaña para tareas programadas */}
        <TabsContent value="scheduled" className="space-y-6">
          <ScheduledTasksManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}