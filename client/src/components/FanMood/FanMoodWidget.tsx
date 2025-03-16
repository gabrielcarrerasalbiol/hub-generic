import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import MoodSelector from './MoodSelector';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Componente principal para el widget de estado de ánimo del fan
 * Permite a los usuarios registrados seleccionar su estado de ánimo actual
 * con respecto al Real Madrid y explicar la razón
 */
const FanMoodWidget = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [reason, setReason] = useState<string>('');
  const queryClient = useQueryClient();

  // Mutación para crear un nuevo estado de ánimo
  const createMoodMutation = useMutation({
    mutationFn: async (data: { moodType: string; reason: string }) => {
      return apiRequest('/api/fan-moods', {
        method: 'POST',
        data,
      });
    },
    onSuccess: () => {
      // Actualizar los datos en caché después de crear un nuevo estado de ánimo
      queryClient.invalidateQueries({ queryKey: ['/api/fan-moods'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fan-moods/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fan-moods/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fan-moods/user'] });
      
      toast({
        title: t('toast.success'),
        description: t('fanMood.savedSuccess'),
      });
      
      // Resetear el formulario después de enviar
      setReason('');
    },
    onError: (error: any) => {
      console.error('Error guardando el estado de ánimo:', error);
      toast({
        title: t('toast.error'),
        description: t('fanMood.errorSaving'),
        variant: 'destructive',
      });
    },
  });

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMood) {
      toast({
        title: t('toast.warning'),
        description: t('fanMood.selectMoodFirst'),
        variant: 'warning',
      });
      return;
    }
    
    createMoodMutation.mutate({
      moodType: selectedMood,
      reason: reason.trim(),
    });
  };

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('auth.notAuthenticated')}</AlertTitle>
        <AlertDescription>
          {t('fanMood.authRequired')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-muted-foreground mb-4">
          {t('fanMood.instructions')}
        </p>
        
        <MoodSelector 
          selectedMood={selectedMood}
          onSelectMood={setSelectedMood}
        />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="mood-reason" 
            className="block text-sm font-medium mb-1"
          >
            {t('fanMood.reasonLabel')}
          </label>
          <textarea
            id="mood-reason"
            className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background"
            placeholder={t('fanMood.reasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={250}
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {reason.length}/250
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!selectedMood || createMoodMutation.isPending}
          >
            {createMoodMutation.isPending ? t('general.saving') : t('general.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FanMoodWidget;