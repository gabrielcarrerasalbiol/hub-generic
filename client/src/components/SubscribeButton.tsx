import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialNotificationsEnabled);
  const [isLoading, setIsLoading] = useState(false);
  
  // Cargar el estado inicial de suscripción cuando se monta el componente
  useEffect(() => {
    if (user && channelId && channelId !== 'undefined') {
      checkSubscriptionStatus();
    }
  }, [channelId, user]);

  // Inicializar estado desde props cuando se reciben nuevos valores
  useEffect(() => {
    setIsSubscribed(initialSubscribed);
    setNotificationsEnabled(initialNotificationsEnabled);
  }, [initialSubscribed, initialNotificationsEnabled]);

  // Verificar el estado actual de suscripción al canal
  const checkSubscriptionStatus = async () => {
    if (!checkAuth() || !channelId || channelId === 'undefined') return;
    
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
        title: t('auth.loginRequired'),
        description: t('auth.loginToSubscribe'),
        variant: "destructive",
      });
      return;
    }
    
    if (!channelId || channelId === 'undefined') {
      toast({
        title: t('errors.processingError'),
        description: t('errors.channelIdentificationError'),
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
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        setIsSubscribed(true);
        setNotificationsEnabled(true);
        toast({
          title: t('subscriptions.success'),
          description: t('subscriptions.successMessage'),
        });
        
        // Invalidar consultas relacionadas
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/channels'] });
      } catch (error) {
        console.error("Error subscribing to channel:", error);
        toast({
          title: t('errors.subscriptionError'),
          description: t('errors.subscriptionErrorMessage'),
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
        setNotificationsEnabled(false);
        toast({
          title: "Suscripción cancelada",
          description: "Ya no recibirás actualizaciones de este canal",
        });
        
        // Invalidar consultas relacionadas
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/channels'] });
        if (channelId && channelId !== 'undefined') {
          queryClient.invalidateQueries({ queryKey: [`/api/channels/${channelId}/subscription`] });
        }
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
    if (!checkAuth() || !isSubscribed || !channelId || channelId === 'undefined') return;
    
    setIsLoading(true);
    
    try {
      await apiRequest(`/api/subscriptions/${channelId}`, {
        method: 'PUT',
        body: JSON.stringify({
          notificationsEnabled: !notificationsEnabled
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const newNotificationState = !notificationsEnabled;
      setNotificationsEnabled(newNotificationState);
      toast({
        title: newNotificationState ? "Notificaciones activadas" : "Notificaciones desactivadas",
        description: newNotificationState 
          ? "Recibirás alertas cuando se publiquen nuevos videos" 
          : "Ya no recibirás alertas de nuevos videos",
      });
      
      // Invalidar consultas relacionadas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/channels'] });
      if (channelId && channelId !== 'undefined') {
        queryClient.invalidateQueries({ queryKey: [`/api/channels/${channelId}/subscription`] });
      }
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
        onClick={(e) => {
          e.preventDefault(); // Prevenir la navegación
          e.stopPropagation(); // Detener la propagación del evento
          handleSubscribe();
        }}
        disabled={isLoading}
        variant={isSubscribed ? "outline" : "default"}
        className={isSubscribed ? "border-brand-secondary text-brand-secondary px-5" : "bg-gradient-to-r from-brand-secondary to-brand-secondary text-brand-primary hover:from-brand-secondary hover:to-brand-secondary/80 px-5"}
      >
        {isSubscribed ? "Quitar canal" : "Agregar canal"}
      </Button>
      
      {isSubscribed && (
        <Button 
          onClick={(e) => {
            e.preventDefault(); // Prevenir la navegación
            e.stopPropagation(); // Detener la propagación del evento
            toggleNotifications();
          }}
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