import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HistoryIcon } from 'lucide-react';

interface FanMood {
  id: number;
  userId: number;
  moodType: string;
  reason: string;
  createdAt: string;
  username: string;
  profilePicture?: string;
}

interface RecentMoodsProps {
  userId?: number;
  limit?: number;
  showAvatar?: boolean;
}

/**
 * Componente que muestra los estados de ánimo recientes de los fans
 * Puede filtrar por usuario específico o mostrar todos
 */
const RecentMoods: React.FC<RecentMoodsProps> = ({ 
  userId, 
  limit = 5,
  showAvatar = false
}) => {
  const { t, currentLanguage } = useLanguage();
  const user = useAuth((state) => state.user);

  // Emoji para cada tipo de estado de ánimo
  const moodEmojis: Record<string, string> = {
    ecstatic: '🤩',
    happy: '😄',
    optimistic: '😊',
    neutral: '😐',
    concerned: '😕',
    frustrated: '😠',
    angry: '😡',
  };

  // Colores para los badges de cada estado de ánimo
  const moodColors: Record<string, string> = {
    ecstatic: 'bg-green-100 text-green-800 border-green-200',
    happy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    optimistic: 'bg-teal-100 text-teal-800 border-teal-200',
    neutral: 'bg-blue-100 text-blue-800 border-blue-200',
    concerned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    frustrated: 'bg-orange-100 text-orange-800 border-orange-200',
    angry: 'bg-red-100 text-red-800 border-red-200',
  };

  // Seleccionar el endpoint correcto basado en el userId
  const endpoint = userId
    ? `/api/fan-moods/user/${userId}?limit=${limit}`
    : `/api/fan-moods/recent?limit=${limit}`;

  // Obtener los estados de ánimo recientes
  const { data: moods, isLoading } = useQuery({
    queryKey: [endpoint],
    enabled: !!user, // Solo cargar si el usuario está autenticado
  });

  // Formatear la fecha relativa según el idioma actual
  const formatRelativeDate = (date: string) => {
    const dateObj = new Date(date);
    return formatDistanceToNow(dateObj, { 
      addSuffix: true,
      locale: currentLanguage === 'es' ? es : enUS
    });
  };

  // Mostrar un esqueleto durante la carga
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            {showAvatar && (
              <Skeleton className="h-10 w-10 rounded-full" />
            )}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!moods || moods.length === 0) {
    return (
      <div className="text-center py-6">
        <HistoryIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-medium">
          {userId === user?.id
            ? t('fanMood.noMoodHistory')
            : t('fanMood.noRecentMoods')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {userId === user?.id
            ? t('fanMood.createYourFirst')
            : t('fanMood.beFirstCommunity')}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={userId ? "h-[400px]" : "max-h-[500px]"}>
      <div className="space-y-4 pr-4">
        {moods.map((mood: FanMood) => (
          <div key={mood.id} className="p-3 border rounded-lg">
            <div className="flex items-start gap-3">
              {showAvatar && (
                <Avatar>
                  {mood.profilePicture ? (
                    <AvatarImage src={mood.profilePicture} alt={mood.username} />
                  ) : (
                    <AvatarFallback>
                      {mood.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {showAvatar && (
                    <p className="font-medium">{mood.username}</p>
                  )}
                  
                  <Badge 
                    variant="outline" 
                    className={`${moodColors[mood.moodType]} px-2 py-0.5`}
                  >
                    <span className="mr-1">{moodEmojis[mood.moodType]}</span>
                    {t(`fanMood.moods.${mood.moodType}`)}
                  </Badge>
                </div>
                
                <p className="text-sm mb-2">
                  {mood.reason || t('fanMood.noReason')}
                </p>
                
                <p className="text-xs text-muted-foreground">
                  {formatRelativeDate(mood.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default RecentMoods;