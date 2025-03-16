import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MoodStat {
  id: number;
  moodType: string;
  count: number;
  percentage: number;
}

interface MoodStatsProps {
  showTrend?: boolean;
}

/**
 * Componente que muestra estadísticas del estado de ánimo de los fans
 * Incluye distribución porcentual y tendencias si se solicitan
 */
const MoodStats: React.FC<MoodStatsProps> = ({ showTrend = false }) => {
  const { t } = useLanguage();
  const user = useAuth((state) => state.user);

  // Consulta para obtener estadísticas generales del estado de ánimo
  const { data: moodStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/fan-moods/stats'],
    enabled: !!user,
  });

  // Consulta para obtener tendencias si se solicitan
  const { data: moodTrends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['/api/fan-moods/trends'],
    enabled: !!showTrend && !!user,
  });

  // Mapeo de tipos de estado de ánimo a colores
  const moodColors: Record<string, string> = {
    ecstatic: 'bg-green-500',
    happy: 'bg-emerald-500',
    optimistic: 'bg-teal-500',
    neutral: 'bg-blue-500',
    concerned: 'bg-yellow-500',
    frustrated: 'bg-orange-500',
    angry: 'bg-red-500',
  };

  // Función para obtener el ícono de tendencia
  const getTrendIcon = (trend: number) => {
    if (trend > 0.05) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend < -0.05) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Función para obtener el texto de tendencia
  const getTrendText = (trend: number) => {
    if (trend > 0.05) {
      return <span className="text-green-600">{t('fanMood.trendUp')}</span>;
    } else if (trend < -0.05) {
      return <span className="text-red-600">{t('fanMood.trendDown')}</span>;
    } else {
      return <span className="text-gray-600">{t('fanMood.trendStable')}</span>;
    }
  };

  // Determinar el estado de ánimo general dominante
  const getOverallMood = () => {
    if (isLoadingStats || !moodStats) return null;
    
    const dominantMood = Object.entries(moodStats?.moodDistribution || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      [0];
    
    return dominantMood ? dominantMood[0] : null;
  };

  const dominantMood = getOverallMood();

  // Mostrar esqueleto durante la carga
  if (isLoadingStats) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!moodStats || (moodStats.totalCount === 0)) {
    return (
      <div className="text-center py-8">
        <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">{t('fanMood.noStats')}</h3>
        <p className="text-muted-foreground">{t('fanMood.beFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium mb-1">
            {t('fanMood.overallMood')}: {moodStats && moodStats.message} 
            <span className="ml-2 text-xl">
              {moodStats && dominantMood && moodStats.emojiMap?.[dominantMood]}
            </span>
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('fanMood.basedOn', { count: moodStats.totalCount })}
          </p>
        </div>
        {showTrend && moodTrends && (
          <Badge variant="outline" className="mt-2 md:mt-0 px-3 py-1.5 text-sm">
            <span className="flex items-center gap-1">
              {moodTrends.overallTrend ? getTrendIcon(moodTrends.overallTrend) : null}
              {moodTrends.overallTrend ? getTrendText(moodTrends.overallTrend) : t('fanMood.trendStable')}
            </span>
          </Badge>
        )}
      </div>

      {/* Distribución de estados de ánimo */}
      <div className="space-y-4">
        <h4 className="font-medium">{t('fanMood.distribution')}</h4>
        
        {Object.entries(moodStats.moodDistribution || {}).map(([mood, percentage]) => (
          <div key={mood} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{moodStats.emojiMap?.[mood]}</span>
                <span>{t(`fanMood.moods.${mood}`)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {(percentage as number).toFixed(1)}%
                </span>
                {showTrend && moodTrends && (
                  <span className="flex items-center">
                    {getTrendIcon(moodTrends.moodTrends?.[mood] || 0)}
                  </span>
                )}
              </div>
            </div>
            <Progress
              value={percentage as number}
              className="h-2"
              indicatorClassName={moodColors[mood] || 'bg-gray-500'}
            />
          </div>
        ))}
      </div>
      
      {/* Información adicional de la tendencia si está habilitada */}
      {showTrend && moodTrends && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">{t('fanMood.trendingSummary')}</h4>
          <p className="text-sm text-muted-foreground">
            {moodTrends.summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default MoodStats;