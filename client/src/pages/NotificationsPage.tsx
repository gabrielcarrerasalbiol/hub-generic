import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Bell, Video, User, Check, Trash2, Rss, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'wouter';

interface Notification {
  id: number;
  userId: number;
  channelId: number | null;
  videoId: number | null;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('all');

  // Obtener notificaciones
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  // Marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    }
  });

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('/api/notifications/read/all', { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
      toast({
        title: "Notificaciones actualizadas",
        description: "Todas las notificaciones han sido marcadas como leídas",
      });
    }
  });

  // Eliminar notificación
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest(`/api/notifications/${notificationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    }
  });

  // Filtrar notificaciones según la pestaña seleccionada
  const filteredNotifications = notifications.filter(notification => {
    if (tab === 'all') return true;
    if (tab === 'unread') return !notification.isRead;
    if (tab === 'videos') return notification.type === 'video';
    if (tab === 'channels') return notification.type === 'channel';
    return true;
  });

  // Obtener el icono según el tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'channel':
        return <Rss className="h-5 w-5 text-orange-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        {notifications.length > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unread">No leídas</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="channels">Canales</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDBE11]"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No hay notificaciones</h3>
                  <p className="text-gray-500 mt-2">
                    {tab === 'all' 
                      ? 'No tienes notificaciones por el momento' 
                      : tab === 'unread'
                      ? 'No tienes notificaciones sin leer'
                      : `No tienes notificaciones de ${tab === 'videos' ? 'videos' : 'canales'}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card key={notification.id} className={notification.isRead ? "" : "border-l-4 border-l-[#FDBE11]"}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {getNotificationIcon(notification.type)}
                        <CardTitle className="ml-2 text-lg">
                          {notification.type === 'video' ? 'Nuevo video' :
                           notification.type === 'channel' ? 'Actualización de canal' :
                           'Notificación del sistema'}
                        </CardTitle>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{notification.message}</p>
                    {notification.videoId && (
                      <div className="mt-3">
                        <Link
                          to={`/video/${notification.videoId}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ver video
                        </Link>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end space-x-2">
                    {!notification.isRead && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Marcar como leída
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        deleteNotificationMutation.mutate(notification.id);
                        toast({
                          description: "Notificación eliminada"
                        });
                      }}
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Eliminar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}