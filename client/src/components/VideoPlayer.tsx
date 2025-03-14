import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  embedUrl: string;
  title: string;
  videoId: number;  // Añadido para poder registrar la visualización
}

export default function VideoPlayer({ embedUrl, title, videoId }: VideoPlayerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [watchDuration, setWatchDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Añadir manejador para eventos de iframe y mensajes de postMessage
  useEffect(() => {
    // Registra la visualización cuando el componente se monta
    if (user && videoId && !isPlaying) {
      setIsPlaying(true);
      setWatchStartTime(Date.now());
      
      // Registro inicial de visualización con 0% de completado
      registerView(0, 0);
    }
    
    // Inicia un timer para actualizar el tiempo de visualización cada 10 segundos
    if (isPlaying && user) {
      timerRef.current = setInterval(() => {
        if (watchStartTime) {
          const currentDuration = Math.floor((Date.now() - watchStartTime) / 1000);
          setWatchDuration(currentDuration);
          
          // Actualiza la visualización cada 10 segundos con una estimación de porcentaje
          // Asumiendo que un video promedio dura 300 segundos (5 minutos)
          const estimatedCompletion = Math.min(Math.floor((currentDuration / 300) * 100), 100);
          registerView(currentDuration, estimatedCompletion);
        }
      }, 10000);
    }
    
    // Limpia el timer cuando el componente se desmonta
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        
        // Registra la duración final al desmontar
        if (watchStartTime && user) {
          const finalDuration = Math.floor((Date.now() - watchStartTime) / 1000);
          const estimatedCompletion = Math.min(Math.floor((finalDuration / 300) * 100), 100);
          registerView(finalDuration, estimatedCompletion);
        }
      }
    };
  }, [user, videoId, isPlaying, watchStartTime]);
  
  // Función para registrar la visualización
  const registerView = async (duration: number, completion: number) => {
    if (!user || !videoId) return;
    
    try {
      const data = {
        videoId,
        watchDuration: duration,
        completionPercentage: completion
      };
      
      await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hubmadridista_token')}`
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      console.log(`Visualización registrada: ${duration}s, ${completion}%`);
    } catch (error) {
      console.error('Error al registrar visualización:', error);
    }
  };
  
  // Make sure YouTube embeds have autoplay disabled and related videos disabled
  const formatEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/embed/')) {
      // Add parameters to YouTube embed URL
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}rel=0&enablejsapi=1`;
    }
    return url;
  };

  return (
    <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md overflow-hidden">
      <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
        <iframe
          ref={iframeRef}
          src={formatEmbedUrl(embedUrl)}
          title={title}
          frameBorder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
          style={{ maxHeight: '500px' }}
        ></iframe>
      </div>
    </div>
  );
}
