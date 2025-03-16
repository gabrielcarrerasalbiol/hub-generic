import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  SmilePlus,
  ThumbsUp,
  Lightbulb,
  CircleDashed,
  AlertCircle,
  XCircle,
  Frown,
} from 'lucide-react';

interface MoodStat {
  id: number;
  date: string;
  totalCount: number;
  ecstaticCount: number;
  happyCount: number;
  hopefulCount: number;
  neutralCount: number;
  concernedCount: number;
  frustratedCount: number;
  disappointedCount: number;
  overallMood: string;
  createdAt: string;
  updatedAt: string;
}

interface MoodTrend {
  date: string;
  overallMood: string;
  totalCount: number;
}

export default function MoodStats() {
  const { t } = useTranslation();

  // Obtener las estadísticas del día actual
  const {
    data: todayStats,
    isLoading: isTodayStatsLoading,
    error: todayStatsError
  } = useQuery({
    queryKey: ['/api/fan-moods/stats/today'],
    refetchInterval: 60000 // Refrescar cada minuto
  });

  // Obtener la tendencia de la última semana
  const {
    data: trendData,
    isLoading: isTrendLoading,
    error: trendError
  } = useQuery({
    queryKey: ['/api/fan-moods/trend'],
    refetchInterval: 300000 // Refrescar cada 5 minutos
  });

  // Iconos para cada estado de ánimo
  const moodIcons = {
    ecstatic: <SmilePlus className="h-5 w-5" />,
    happy: <ThumbsUp className="h-5 w-5" />,
    hopeful: <Lightbulb className="h-5 w-5" />,
    neutral: <CircleDashed className="h-5 w-5" />,
    concerned: <AlertCircle className="h-5 w-5" />,
    frustrated: <XCircle className="h-5 w-5" />,
    disappointed: <Frown className="h-5 w-5" />
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

  // Determinar el color de la barra de progreso basado en el tipo de estado de ánimo
  const getProgressColor = (moodType: string): string => {
    switch (moodType) {
      case 'ecstatic':
        return 'bg-green-500';
      case 'happy':
        return 'bg-emerald-500';
      case 'hopeful':
        return 'bg-sky-500';
      case 'neutral':
        return 'bg-gray-500';
      case 'concerned':
        return 'bg-amber-500';
      case 'frustrated':
        return 'bg-orange-500';
      case 'disappointed':
        return 'bg-red-500';
      default:
        return '';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(navigator.language, {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  };

  // Obtener el porcentaje de cada estado de ánimo
  const getMoodPercentage = (count: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // Renderizar mensaje de estado
  const renderStatusMessage = () => {
    if (todayStatsError) {
      return <p className="text-center text-muted-foreground">{t('fanMood.errorLoadingStats')}</p>;
    }

    if (isTodayStatsLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );
    }

    if (todayStats && todayStats.message) {
      return <p className="text-center text-muted-foreground">{t('fanMood.noStatsToday')}</p>;
    }

    if (todayStats && todayStats.totalCount === 0) {
      return <p className="text-center text-muted-foreground">{t('fanMood.noVotesToday')}</p>;
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('fanMood.communityMood')}</CardTitle>
        <CardDescription>{t('fanMood.statsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {renderStatusMessage()}

        {todayStats && !todayStats.message && todayStats.totalCount > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('fanMood.overallMood')}:</span>
              <Badge className={`${moodColors[todayStats.overallMood]}`}>
                {moodIcons[todayStats.overallMood as keyof typeof moodIcons]}
                <span className="ml-1">{t(`fanMood.moods.${todayStats.overallMood}`)}</span>
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground text-right">
              {t('fanMood.totalVotes')}: {todayStats.totalCount}
            </div>

            <div className="space-y-3">
              {(['ecstatic', 'happy', 'hopeful', 'neutral', 'concerned', 'frustrated', 'disappointed'] as const).map((mood) => {
                const count = todayStats[`${mood}Count` as keyof MoodStat] as number;
                const percentage = getMoodPercentage(count, todayStats.totalCount);
                
                if (percentage === 0) return null;
                
                return (
                  <div key={mood} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center">
                        {moodIcons[mood]}
                        <span className="ml-1">{t(`fanMood.moods.${mood}`)}</span>
                      </span>
                      <span>{percentage}% ({count})</span>
                    </div>
                    <Progress value={percentage} className={getProgressColor(mood)} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tendencia semanal */}
        {!isTrendLoading && !trendError && trendData && trendData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">{t('fanMood.weeklyTrend')}</h3>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {trendData.map((day: MoodTrend) => (
                <div key={day.date} className="flex flex-col items-center">
                  <Badge className={`${moodColors[day.overallMood]} w-8 h-8 rounded-full flex items-center justify-center mb-1`}>
                    {moodIcons[day.overallMood as keyof typeof moodIcons]}
                  </Badge>
                  <span>{formatDate(day.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}