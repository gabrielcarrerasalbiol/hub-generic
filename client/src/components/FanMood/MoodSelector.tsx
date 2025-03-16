import React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type MoodOption = {
  id: string;
  icon: string;
  color: string;
  hoverColor: string;
  label: string;
  description: string;
};

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

/**
 * Componente para seleccionar el estado de ánimo del fan
 * Presenta opciones visuales con iconos y colores para diferentes estados
 */
const MoodSelector: React.FC<MoodSelectorProps> = ({ 
  selectedMood, 
  onSelectMood 
}) => {
  const { t } = useLanguage();
  
  // Definición de las opciones de estado de ánimo
  const moodOptions: MoodOption[] = [
    {
      id: 'ecstatic',
      icon: '🤩',
      color: 'bg-green-100 border-green-400',
      hoverColor: 'hover:bg-green-200',
      label: t('fanMood.moods.ecstatic'),
      description: t('fanMood.moodDesc.ecstatic'),
    },
    {
      id: 'happy',
      icon: '😄',
      color: 'bg-emerald-100 border-emerald-400',
      hoverColor: 'hover:bg-emerald-200',
      label: t('fanMood.moods.happy'),
      description: t('fanMood.moodDesc.happy'),
    },
    {
      id: 'optimistic',
      icon: '😊',
      color: 'bg-teal-100 border-teal-400',
      hoverColor: 'hover:bg-teal-200',
      label: t('fanMood.moods.optimistic'),
      description: t('fanMood.moodDesc.optimistic'),
    },
    {
      id: 'neutral',
      icon: '😐',
      color: 'bg-blue-100 border-blue-400',
      hoverColor: 'hover:bg-blue-200',
      label: t('fanMood.moods.neutral'),
      description: t('fanMood.moodDesc.neutral'),
    },
    {
      id: 'concerned',
      icon: '😕',
      color: 'bg-yellow-100 border-yellow-400',
      hoverColor: 'hover:bg-yellow-200',
      label: t('fanMood.moods.concerned'),
      description: t('fanMood.moodDesc.concerned'),
    },
    {
      id: 'frustrated',
      icon: '😠',
      color: 'bg-orange-100 border-orange-400',
      hoverColor: 'hover:bg-orange-200',
      label: t('fanMood.moods.frustrated'),
      description: t('fanMood.moodDesc.frustrated'),
    },
    {
      id: 'angry',
      icon: '😡',
      color: 'bg-red-100 border-red-400',
      hoverColor: 'hover:bg-red-200',
      label: t('fanMood.moods.angry'),
      description: t('fanMood.moodDesc.angry'),
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-7 md:gap-4">
        {moodOptions.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => onSelectMood(mood.id)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all',
              mood.color,
              mood.hoverColor,
              selectedMood === mood.id ? 'ring-2 ring-primary ring-offset-2' : '',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            )}
          >
            <span className="text-2xl mb-2" role="img" aria-label={mood.label}>
              {mood.icon}
            </span>
            <span className="text-sm font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
      
      {selectedMood && (
        <div className="mt-4 p-3 rounded-md bg-muted">
          <p className="text-sm">
            <span className="font-medium">{t('fanMood.yourSelection')}:</span>{' '}
            {moodOptions.find(m => m.id === selectedMood)?.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;