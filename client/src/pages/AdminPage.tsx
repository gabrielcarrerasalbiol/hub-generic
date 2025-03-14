import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import UserManagement from '@/components/admin/UserManagement';
import VideoManagement from '@/components/admin/VideoManagement';
import PremiumChannelManagement from '@/components/admin/PremiumChannelManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Video, Activity, Star } from 'lucide-react';

export default function AdminPage() {
  const { isAdmin, checkAuth } = useAuth();
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
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      
      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>Vídeos</span>
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Canales Premium</span>
          </TabsTrigger>
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Procesos</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="videos" className="space-y-6">
          <VideoManagement />
        </TabsContent>
        
        <TabsContent value="processes" className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Procesos del Sistema</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}