import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface SubscribeButtonProps {
  channelId: number;
  initialSubscribed?: boolean;
  initialNotificationsEnabled?: boolean;
}

export default function SubscribeButton({
  channelId,
  initialSubscribed = false,
  initialNotificationsEnabled = true,
}: SubscribeButtonProps) {
  const { toast } = useToast();
  const { checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialNotificationsEnabled);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar el estado actual de suscripción al canal
  const checkSubscriptionStatus = async () => {
    if (!checkAuth()) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest<{ isSubscribed: boolean }>(
        `/api/channels/${channelId}/subscription`
      );
      setIsSubscribed(response.isSubscribed);
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setIsLoading(false);
    }
  };

  // Cuando el usuario hace clic en suscribirse
  const handleSubscribe = async () => {
    if (!checkAuth()) {
      toast({
        title: "Inicia sesión para suscribirte",
        description: "Necesitas iniciar sesión para suscribirte a canales",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    if (!isSubscribed) {
      try {
        // Suscribirse al canal
        await apiRequest('/api/subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            channelId,
            notificationsEnabled: true
          })
        });
        
        setIsSubscribed(true);
        setNotificationsEnabled(true);
        toast({
          title: "¡Suscripción exitosa!",
          description: "Ahora recibirás actualizaciones de este canal",
        });
        
        // Invalidar consultas relacionadas
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/channels'] });
      } catch (error) {
        console.error("Error subscribing to channel:", error);
        toast({
          title: "Error al suscribirse",
          description: "No se pudo completar la suscripción, intenta nuevamente",
          variant: "destructive",
        });
      }
    } else {
      try {
        // Cancelar suscripción
        await apiRequest(`/api/subscriptions/${channelId}`, {
          method: 'DELETE'
        });
        
        setIsSubscribed(false);
        toast({
          title: "Suscripción cancelada",
          description: "Ya no recibirás actualizaciones de este canal",
        });
        
        // Invalidar consultas relacionadas
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/channels'] });
      } catch (error) {
        console.error("Error unsubscribing from channel:", error);
        toast({
          title: "Error al cancelar suscripción",
          description: "No se pudo cancelar la suscripción, intenta nuevamente",
          variant: "destructive",
        });
      }
    }
    
    setIsLoading(false);
  };

  // Actualizar preferencias de notificaciones
  const toggleNotifications = async () => {
    if (!checkAuth() || !isSubscribed) return;
    
    setIsLoading(true);
    
    try {
      await apiRequest(`/api/subscriptions/${channelId}`, {
        method: 'PUT',
        body: JSON.stringify({
          notificationsEnabled: !notificationsEnabled
        })
      });
      
      setNotificationsEnabled(!notificationsEnabled);
      toast({
        title: notificationsEnabled ? "Notificaciones desactivadas" : "Notificaciones activadas",
        description: notificationsEnabled 
          ? "Ya no recibirás alertas de nuevos videos" 
          : "Recibirás alertas cuando se publiquen nuevos videos",
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error al actualizar preferencias",
        description: "No se pudieron actualizar las preferencias de notificaciones",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleSubscribe}
        disabled={isLoading}
        variant={isSubscribed ? "outline" : "default"}
        className={isSubscribed ? "border-yellow-500 text-yellow-600" : "bg-gradient-to-r from-[#FDBE11] to-[#FFC72C] text-[#001C58] hover:from-[#FDC731] hover:to-[#FFD74C]"}
      >
        {isSubscribed ? "Quitar de favoritos" : "Agregar a favoritos"}
      </Button>
      
      {isSubscribed && (
        <Button 
          onClick={toggleNotifications}
          disabled={isLoading}
          variant="outline"
          size="icon"
          title={notificationsEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}
        >
          {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
        </Button>
      )}
    </div>
  );
}