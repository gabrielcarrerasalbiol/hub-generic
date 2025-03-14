import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff, Trash2 } from 'lucide-react';
import { Channel } from '@shared/schema';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SubscriptionsPage() {
  const { checkAuth } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [channelToUnsubscribe, setChannelToUnsubscribe] = useState<Channel | null>(null);

  // Consultar canales suscritos
  const { data: subscribedChannels = [], isLoading } = useQuery({
    queryKey: ['/api/subscriptions/channels'],
    queryFn: getQueryFn<Channel[]>({ on401: 'throw' }),
  });

  // Filtrar canales según la búsqueda
  const filteredChannels = subscribedChannels.filter(channel => 
    channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (channel.description && channel.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Función para actualizar preferencias de notificación
  const updateNotificationPreference = async (channelId: number, enabled: boolean) => {
    if (!checkAuth()) return;

    try {
      await apiRequest(`/api/subscriptions/${channelId}`, {
        method: 'PUT',
        body: JSON.stringify({ notificationsEnabled: enabled })
      });
      
      // Invalidar consultas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/channels'] });
      
      toast({
        title: enabled ? "Notificaciones activadas" : "Notificaciones desactivadas",
        description: enabled 
          ? "Recibirás alertas cuando se publiquen nuevos videos" 
          : "Ya no recibirás alertas de nuevos videos",
      });
    } catch (error) {
      console.error('Error updating notification preference:', error);
      toast({
        title: "Error al actualizar preferencias",
        description: "No se pudieron actualizar las preferencias de notificaciones",
        variant: "destructive",
      });
    }
  };

  // Función para cancelar suscripción
  const unsubscribeFromChannel = async (channelId: number) => {
    if (!checkAuth()) return;

    try {
      await apiRequest(`/api/subscriptions/${channelId}`, {
        method: 'DELETE'
      });
      
      // Invalidar consultas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/channels'] });
      
      toast({
        title: "Suscripción cancelada",
        description: "Ya no recibirás actualizaciones de este canal",
      });
      
      setChannelToUnsubscribe(null);
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      toast({
        title: "Error al cancelar suscripción",
        description: "No se pudo cancelar la suscripción, intenta nuevamente",
        variant: "destructive",
      });
    }
  };

  // Generar URL para avatar de canal
  const getChannelAvatar = (channel: Channel) => {
    if (channel.thumbnailUrl) return channel.thumbnailUrl;
    
    // Usar UI-Avatars.com como fallback
    const name = encodeURIComponent(channel.title);
    return `https://ui-avatars.com/api/?name=${name}&background=random&size=128`;
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Mis suscripciones</h1>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar canales..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">Cargando suscripciones...</div>
      ) : filteredChannels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map((channel) => (
            <Card key={channel.id} className="p-4 flex flex-col">
              <div className="flex items-start gap-3">
                <img 
                  src={getChannelAvatar(channel)} 
                  alt={channel.title} 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg line-clamp-1">{channel.title}</h3>
                  {channel.platform && (
                    <div className="text-xs text-muted-foreground uppercase mb-1">
                      {channel.platform}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {channel.description || "Sin descripción"}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={channel.notificationsEnabled} 
                    onCheckedChange={(checked) => 
                      updateNotificationPreference(channel.id, checked)
                    }
                    id={`notifications-${channel.id}`}
                  />
                  <label 
                    htmlFor={`notifications-${channel.id}`}
                    className="text-sm cursor-pointer flex items-center gap-1"
                  >
                    {channel.notificationsEnabled ? (
                      <>
                        <Bell size={14} />
                        <span>Notificaciones activas</span>
                      </>
                    ) : (
                      <>
                        <BellOff size={14} />
                        <span>Notificaciones inactivas</span>
                      </>
                    )}
                  </label>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500"
                      onClick={() => setChannelToUnsubscribe(channel)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro que deseas cancelar tu suscripción a{' '}
                        <strong>{channelToUnsubscribe?.title}</strong>? 
                        Ya no recibirás notificaciones de nuevos videos de este canal.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setChannelToUnsubscribe(null)}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => {
                          if (channelToUnsubscribe) {
                            unsubscribeFromChannel(channelToUnsubscribe.id);
                          }
                        }}
                      >
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "No se encontraron canales que coincidan con tu búsqueda." 
              : "No estás suscrito a ningún canal."}
          </p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')}>Limpiar búsqueda</Button>
          )}
        </div>
      )}
    </div>
  );
}