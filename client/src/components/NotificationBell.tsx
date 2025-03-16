import { useState, useEffect } from 'react';
import { Bell, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Link } from 'wouter';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

// Tipo para las notificaciones
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

export default function NotificationBell() {
  const { checkAuth, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  // Consultar el número de notificaciones no leídas
  const { data: notificationCountData, isLoading: countLoading } = useQuery({
    queryKey: ['/api/notifications/unread/count'],
    queryFn: getQueryFn<{ count: number }>({ on401: 'returnNull' }),
    enabled: !!user,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
  
  // Extrae el número de la respuesta
  const unreadCount = notificationCountData?.count || 0;

  // Consultar las notificaciones
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: getQueryFn<Notification[]>({ on401: 'returnNull' }),
    enabled: !!user && isOpen, // Solo cargar cuando el popover está abierto
  });

  // Marcar todas las notificaciones como leídas cuando se abre el popover
  useEffect(() => {
    if (isOpen && unreadCount > 0 && user) {
      markAllAsRead();
    }
  }, [isOpen, unreadCount, user]);

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    if (!checkAuth()) return;

    try {
      await apiRequest('/api/notifications/read/all', {
        method: 'PUT'
      });
      
      // Invalidar consultas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Eliminar una notificación
  const deleteNotification = async (notificationId: number) => {
    if (!checkAuth()) return;

    try {
      await apiRequest(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      // Invalidar consultas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
      
      toast({
        title: t('notifications.deleted'),
        description: t('notifications.deletedSuccess'),
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: t('errors.deleteError'),
        description: t('notifications.deleteError'),
        variant: "destructive",
      });
    }
  };

  // Si el usuario no está autenticado, no mostrar el componente
  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-medium">{t('notifications.title')}</div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0}
          >
            {t('notifications.markAllRead')}
          </Button>
        </div>
        <ScrollArea className="h-[300px] p-0">
          {notificationsLoading ? (
            <div className="p-4 text-center text-muted-foreground">{t('general.loading')}</div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-3 ${!notification.isRead ? 'bg-accent/50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      {notification.videoId && (
                        <Link 
                          to={`/video/${notification.videoId}`} 
                          onClick={() => setIsOpen(false)}
                          className="flex items-center text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          <Video className="h-3 w-3 mr-1" /> 
                          {t('notifications.viewVideo')}
                        </Link>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: 'short'
                        })}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => deleteNotification(notification.id)}
                    >
                      &times;
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">{t('notifications.noNotifications')}</div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}