import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SmilePlus,
  ThumbsUp,
  Lightbulb,
  CircleDashed,
  AlertCircle,
  XCircle,
  Frown,
} from 'lucide-react';

interface Mood {
  id: number;
  userId: number;
  mood: 'ecstatic' | 'happy' | 'hopeful' | 'neutral' | 'concerned' | 'frustrated' | 'disappointed';
  reason: string | null;
  relatedToMatch: boolean;
  matchId: number | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    username: string;
    profilePicture?: string;
  };
}

export default function RecentMoods() {
  const { t } = useTranslation();
  
  // Obtener estados de ánimo recientes
  const {
    data: recentMoods,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/fan-moods/recent'],
    refetchInterval: 30000 // Refrescar cada 30 segundos
  });

  // Iconos para cada estado de ánimo
  const moodIcons = {
    ecstatic: <SmilePlus className="h-4 w-4" />,
    happy: <ThumbsUp className="h-4 w-4" />,
    hopeful: <Lightbulb className="h-4 w-4" />,
    neutral: <CircleDashed className="h-4 w-4" />,
    concerned: <AlertCircle className="h-4 w-4" />,
    frustrated: <XCircle className="h-4 w-4" />,
    disappointed: <Frown className="h-4 w-4" />
  };

  // Configuración de colores para cada estado de ánimo
  const moodColors: Record<string, string> = {
    ecstatic: 'bg-green-100 border-green-500 text-green-800',
    happy: 'bg-emerald-100 border-emerald-500 text-emerald-800',
    hopeful: 'bg-sky-100 border-sky-500 text-sky-800',
    neutral: 'bg-gray-100 border-gray-500 text-gray-800',
    concerned: 'bg-amber-100 border-amber-500 text-amber-800',
    frustrated: 'bg-orange-100 border-orange-500 text-orange-800',
    disappointed: 'bg-red-100 border-red-500 text-red-800'
  };

  // Formatear tiempo relativo
  const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSecs < 60) {
      return t('time.justNow');
    } else if (diffInMins < 60) {
      return t('time.minutesAgo', { count: diffInMins });
    } else if (diffInHours < 24) {
      return t('time.hoursAgo', { count: diffInHours });
    } else {
      return t('time.daysAgo', { count: diffInDays });
    }
  };

  // Obtener iniciales desde el ID de usuario
  const getInitials = (userId: number): string => {
    return `U${userId.toString().slice(-2)}`;
  };

  // Generar color basado en userId
  const getUserColor = (userId: number): string => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[userId % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('fanMood.recentMoods')}</CardTitle>
          <CardDescription>{t('fanMood.recentMoodsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('fanMood.recentMoods')}</CardTitle>
          <CardDescription>{t('fanMood.recentMoodsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">{t('fanMood.errorLoadingMoods')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('fanMood.recentMoods')}</CardTitle>
        <CardDescription>{t('fanMood.recentMoodsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {(!recentMoods || recentMoods.length === 0) ? (
          <p className="text-center text-muted-foreground py-4">{t('fanMood.noRecentMoods')}</p>
        ) : (
          <div className="space-y-4">
            {recentMoods.map((mood: Mood) => (
              <div key={mood.id} className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={mood.user?.profilePicture} alt={mood.user?.username || `${t('user')} ${mood.userId}`} />
                  <AvatarFallback className={getUserColor(mood.userId)}>
                    {mood.user?.username ? mood.user.username.substring(0, 2).toUpperCase() : getInitials(mood.userId)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${moodColors[mood.mood]}`}>
                      {moodIcons[mood.mood]}
                      <span className="ml-1">{t(`fanMood.moods.${mood.mood}`)}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(mood.createdAt)}
                    </span>
                  </div>
                  
                  {mood.reason && (
                    <p className="mt-1 text-sm">{mood.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}