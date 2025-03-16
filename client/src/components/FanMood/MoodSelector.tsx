import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import {
  SmilePlus,
  ThumbsUp,
  Lightbulb,
  CircleDashed,
  AlertCircle,
  XCircle,
  Frown,
  Info,
  History,
  CheckCircle
} from 'lucide-react';

type MoodType = 'ecstatic' | 'happy' | 'hopeful' | 'neutral' | 'concerned' | 'frustrated' | 'disappointed';

interface Mood {
  id: number;
  userId: number;
  mood: MoodType;
  reason: string | null;
  relatedToMatch: boolean;
  matchId: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function MoodSelector() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [reason, setReason] = useState('');
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]);

  // Cargar el estado de ánimo actual del usuario si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentMood();
    }
  }, [isAuthenticated]);

  // Función para obtener el estado de ánimo actual del usuario
  const fetchCurrentMood = async () => {
    try {
      const response = await fetch('/api/fan-moods/me/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && !data.message) {
          setCurrentMood(data);
          // Preseleccionar el mood actual para actualización
          setSelectedMood(data.mood);
          setReason(data.reason || '');
        }
      }
    } catch (error) {
      console.error('Error fetching current mood:', error);
    }
  };

  // Función para obtener el historial de estados de ánimo
  const fetchMoodHistory = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/fan-moods/me/history?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMoodHistory(data);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Error fetching mood history:', error);
      toast({
        title: t('error'),
        description: t('fanMood.errorFetchingHistory'),
        variant: 'destructive'
      });
    }
  };

  // Función para enviar/actualizar el estado de ánimo
  const handleSubmitMood = async () => {
    if (!isAuthenticated) {
      toast({
        title: t('authRequired'),
        description: t('fanMood.loginRequired'),
        variant: 'default'
      });
      return;
    }

    if (!selectedMood) {
      toast({
        title: t('validation.required'),
        description: t('fanMood.selectMoodFirst'),
        variant: 'default'
      });
      return;
    }

    setIsSubmitting(true);

    const moodData = {
      mood: selectedMood,
      reason: reason.trim() || null,
      relatedToMatch: false,
      matchId: null
    };

    try {
      let url = '/api/fan-moods';
      let method = 'POST';

      // Si ya existe un estado de ánimo, actualizarlo en lugar de crear uno nuevo
      if (currentMood) {
        url = `/api/fan-moods/${currentMood.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(moodData)
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentMood(data);
        
        toast({
          title: currentMood ? t('fanMood.updated') : t('fanMood.created'),
          description: t('fanMood.moodRegistered'),
          variant: 'default'
        });
        
        // Invalidar caché para actualizar datos
        queryClient.invalidateQueries({ queryKey: ['/api/fan-moods/recent'] });
        queryClient.invalidateQueries({ queryKey: ['/api/fan-moods/stats/today'] });
        queryClient.invalidateQueries({ queryKey: ['/api/fan-moods/trend'] });
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description: errorData.message || t('fanMood.errorSubmitting'),
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting mood:', error);
      toast({
        title: t('error'),
        description: t('fanMood.errorSubmitting'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mapeo de iconos para cada estado de ánimo
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
  const moodColors: Record<MoodType, string> = {
    ecstatic: 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200',
    happy: 'bg-emerald-100 border-emerald-500 text-emerald-800 hover:bg-emerald-200',
    hopeful: 'bg-sky-100 border-sky-500 text-sky-800 hover:bg-sky-200',
    neutral: 'bg-gray-100 border-gray-500 text-gray-800 hover:bg-gray-200',
    concerned: 'bg-amber-100 border-amber-500 text-amber-800 hover:bg-amber-200',
    frustrated: 'bg-orange-100 border-orange-500 text-orange-800 hover:bg-orange-200',
    disappointed: 'bg-red-100 border-red-500 text-red-800 hover:bg-red-200'
  };

  // Obtener el color del estado de ánimo seleccionado
  const getSelectedMoodColor = (mood: MoodType): string => {
    return selectedMood === mood 
      ? `${moodColors[mood].replace('hover:bg-', '').replace('bg-', 'bg-')}` 
      : '';
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(navigator.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('fanMood.title')}</CardTitle>
          <CardDescription>{t('fanMood.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 gap-3">
            <Info className="h-10 w-10 text-primary" />
            <p className="text-center font-medium">{t('fanMood.loginRequired')}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" asChild>
            <a href="/login">{t('login.title')}</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('fanMood.title')}</CardTitle>
            <CardDescription>{t('fanMood.description')}</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (showHistory) {
                setShowHistory(false);
              } else {
                fetchMoodHistory();
              }
            }}
          >
            {showHistory ? <CheckCircle className="h-5 w-5" /> : <History className="h-5 w-5" />}
            <span className="ml-1">{showHistory ? t('fanMood.back') : t('fanMood.history')}</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!showHistory ? (
          <>
            {currentMood && (
              <div className="mb-4 p-2 bg-muted rounded-md">
                <p className="text-sm font-medium">{t('fanMood.currentMood')}: </p>
                <Badge className={moodColors[currentMood.mood]}>
                  {moodIcons[currentMood.mood]}
                  <span className="ml-1">{t(`fanMood.moods.${currentMood.mood}`)}</span>
                </Badge>
                {currentMood.reason && (
                  <p className="mt-2 text-sm italic">{currentMood.reason}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {t('fanMood.lastUpdated')}: {formatDate(currentMood.updatedAt)}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label>{t('fanMood.selectMood')}</Label>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mt-2">
                  {(['ecstatic', 'happy', 'hopeful', 'neutral', 'concerned', 'frustrated', 'disappointed'] as MoodType[]).map((mood) => (
                    <Button
                      key={mood}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`flex flex-col items-center p-2 border ${getSelectedMoodColor(mood)} ${moodColors[mood]}`}
                      onClick={() => setSelectedMood(mood)}
                    >
                      {moodIcons[mood]}
                      <span className="text-xs mt-1">{t(`fanMood.moods.${mood}`)}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">{t('fanMood.reason')}</Label>
                <Textarea
                  id="reason"
                  placeholder={t('fanMood.reasonPlaceholder')}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('fanMood.yourHistory')}</h3>
            
            {moodHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">{t('fanMood.noHistory')}</p>
            ) : (
              <div className="divide-y">
                {moodHistory.map((mood) => (
                  <div key={mood.id} className="py-3">
                    <div className="flex items-center gap-2">
                      <Badge className={moodColors[mood.mood]}>
                        {moodIcons[mood.mood]}
                        <span className="ml-1">{t(`fanMood.moods.${mood.mood}`)}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(mood.createdAt)}</span>
                    </div>
                    {mood.reason && (
                      <p className="mt-1 text-sm">{mood.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {!showHistory && (
        <CardFooter>
          <Button 
            onClick={handleSubmitMood} 
            className="w-full"
            disabled={isSubmitting || !selectedMood}
          >
            {isSubmitting ? t('loading') : currentMood ? t('fanMood.updateMood') : t('fanMood.submitMood')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}