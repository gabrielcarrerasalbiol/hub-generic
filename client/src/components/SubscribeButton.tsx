import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface SubscribeButtonProps {
  channelId: number | string;
  initialSubscribed?: boolean;
  initialNotificationsEnabled?: boolean;
}

export default function SubscribeButton({
  channelId,
  initialSubscribed = false,
  initialNotificationsEnabled = false,
}: SubscribeButtonProps) {
  const { toast } = useToast();
  const { checkAuth, user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialNotificationsEnabled);
  const [isLoading, setIsLoading] = useState(false);
  
  // Cargar el estado inicial de suscripción cuando se monta el componente
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [channelId, user]);

  // Verificar el estado actual de suscripción al canal
  const checkSubscriptionStatus = async () => {
    if (!checkAuth()) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest<{ isSubscribed: boolean; notificationsEnabled: boolean }>(
        `/api/channels/${channelId}/subscription`
      );
      setIsSubscribed(response.isSubscribed);
      if (response.notificationsEnabled !== undefined) {
        setNotificationsEnabled(response.notificationsEnabled);
      }
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
        await apiRequest('POST', '/api/subscriptions', {
          channelId,
          notificationsEnabled: true
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
        await apiRequest('DELETE', `/api/subscriptions/${channelId}`);
        
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
      await apiRequest('PUT', `/api/subscriptions/${channelId}`, {
        notificationsEnabled: !notificationsEnabled
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
    <div className="flex gap-2 pr-4">
      <Button 
        onClick={handleSubscribe}
        disabled={isLoading}
        variant={isSubscribed ? "outline" : "default"}
        className={isSubscribed ? "border-yellow-500 text-yellow-600 px-5" : "bg-gradient-to-r from-[#FDBE11] to-[#FFC72C] text-[#001C58] hover:from-[#FDC731] hover:to-[#FFD74C] px-5"}
      >
        {isSubscribed ? "Quitar canal" : "Agregar canal"}
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