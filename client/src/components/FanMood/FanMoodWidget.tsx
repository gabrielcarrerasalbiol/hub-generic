import React from 'react';
import { useTranslation } from 'react-i18next';
import MoodSelector from './MoodSelector';
import MoodStats from './MoodStats';
import RecentMoods from './RecentMoods';

export default function FanMoodWidget() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t('fanMood.widgetTitle')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector de estado de ánimo y estadísticas */}
        <div className="space-y-6">
          <MoodSelector />
          <MoodStats />
        </div>
        
        {/* Estados de ánimo recientes */}
        <div>
          <RecentMoods />
        </div>
      </div>
    </div>
  );
}