import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, LockIcon } from 'lucide-react';

interface PollOption {
  id: number;
  text: string;
  textEs?: string;
  order: number;
  pollId: number;
}

interface Poll {
  id: number;
  title: string;
  titleEs?: string;
  question: string;
  questionEs?: string;
  status: 'draft' | 'published';
  showInSidebar: boolean;
  createdAt: string;
  updatedAt: string;
  options: PollOption[];
}

interface PollResult {
  optionId: number;
  optionText: string;
  optionTextEs?: string;
  votes: number;
  percentage: number;
}

interface PollResponse {
  poll: Poll;
  hasVoted: boolean;
  results: PollResult[] | null;
}

export default function PollsPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [votes, setVotes] = useState<Record<number, number>>({});
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';

  // Obtener todas las encuestas publicadas
  const { data: polls, isLoading } = useQuery<Poll[]>({
    queryKey: ['/api/polls/published'],
    queryFn: () => apiRequest('/api/polls/published')
  });

  // Obtener detalles individuales de cada encuesta (incluye estado de voto y resultados)
  const { data: pollDetails, isLoading: isLoadingDetails } = useQuery<Record<number, PollResponse>>({
    queryKey: ['/api/polls/details'],
    queryFn: async () => {
      // Solo hacer la consulta si tenemos encuestas
      if (!polls || polls.length === 0) return {};

      // Obtener detalles de cada encuesta
      const details: Record<number, PollResponse> = {};
      
      await Promise.all(
        polls.map(async (poll) => {
          try {
            const response = await apiRequest(`/api/polls/${poll.id}`);
            details[poll.id] = response;
          } catch (error) {
            console.error(`Error fetching details for poll ${poll.id}:`, error);
          }
        })
      );
      
      return details;
    },
    enabled: !!polls && polls.length > 0
  });

  // Mutación para votar
  const voteMutation = useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: number, optionId: number }) => 
      apiRequest(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        data: { optionId }
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls/details'] });
      queryClient.invalidateQueries({ queryKey: [`/api/polls/${variables.pollId}`] });
      toast({
        title: '¡Voto registrado!',
        description: 'Gracias por participar en la encuesta'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Error al registrar tu voto',
        variant: 'destructive'
      });
    }
  });

  const handleVote = (pollId: number) => {
    const optionId = votes[pollId];
    
    if (!optionId) {
      toast({
        title: 'Selecciona una opción',
        description: 'Debes seleccionar una opción para votar',
        variant: 'destructive'
      });
      return;
    }

    voteMutation.mutate({ pollId, optionId });
  };

  const handleOptionChange = (pollId: number, optionId: number) => {
    setVotes((prev) => ({
      ...prev,
      [pollId]: optionId
    }));
  };

  // Manejar estado de carga
  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{t('polls.title')}</h1>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Si no hay encuestas, mostrar mensaje
  if (!polls || polls.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{t('polls.title')}</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p>{t('polls.noPollsAvailable')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t('polls.title')}</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {polls.map((poll) => {
          const pollDetail = pollDetails?.[poll.id];
          const hasVoted = pollDetail?.hasVoted || false;
          const results = pollDetail?.results || [];
          
          // Gestión de contenido multilingüe
          const pollTitle = isSpanish && poll.titleEs ? poll.titleEs : poll.title;
          const pollQuestion = isSpanish && poll.questionEs ? poll.questionEs : poll.question;
          
          return (
            <Card key={poll.id} className="overflow-hidden">
              <CardHeader className="bg-primary/10">
                <CardTitle className="text-xl">{pollTitle}</CardTitle>
                <CardDescription className="mt-1">{pollQuestion}</CardDescription>
                {hasVoted && (
                  <Badge variant="outline" className="mt-2 bg-primary/5">
                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                    {t('polls.voted')}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="pt-6">
                {isLoadingDetails && !pollDetail ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : hasVoted || !isAuthenticated ? (
                  // Mostrar resultados si ya votó o no está autenticado
                  <div className="space-y-4">
                    {results.map((result) => {
                      // Texto de opciones en el idioma correspondiente
                      const optionText = isSpanish && result.optionTextEs 
                        ? result.optionTextEs 
                        : result.optionText;
                        
                      return (
                        <div key={result.optionId} className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span>{optionText}</span>
                            <span className="font-medium">
                              {result.percentage}%
                            </span>
                          </div>
                          <motion.div
                            className="h-2.5 bg-accent rounded-full overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.5 }}
                          >
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${result.percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            />
                          </motion.div>
                          <div className="text-xs text-muted-foreground">
                            {result.votes} {t('poll.votes')}
                          </div>
                        </div>
                      );
                    })}
                    
                    {!isAuthenticated && (
                      <div className="mt-4 p-3 bg-accent/30 rounded-md flex items-center gap-2 text-sm">
                        <LockIcon className="h-4 w-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {t('polls.loginRequired')}
                        </p>
                      </div>
                    )}
                    
                    {hasVoted && (
                      <div className="mt-4 text-center">
                        <Badge variant="outline" className="text-xs">
                          {t('polls.resultsLive')}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  // Mostrar formulario para votar
                  <RadioGroup
                    value={votes[poll.id]?.toString()}
                    onValueChange={(value) => handleOptionChange(poll.id, parseInt(value))}
                    className="space-y-3"
                  >
                    {poll.options.map((option) => {
                      // Texto de opciones en el idioma correspondiente
                      const optionText = isSpanish && option.textEs 
                        ? option.textEs 
                        : option.text;
                      
                      return (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={option.id.toString()} 
                            id={`poll-${poll.id}-option-${option.id}`} 
                          />
                          <Label 
                            htmlFor={`poll-${poll.id}-option-${option.id}`}
                            className="cursor-pointer"
                          >
                            {optionText}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}
              </CardContent>
              
              {isAuthenticated && !hasVoted && (
                <CardFooter>
                  <Button
                    onClick={() => handleVote(poll.id)}
                    disabled={voteMutation.isPending}
                    className="w-full"
                  >
                    {voteMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('polls.sending')}
                      </>
                    ) : (
                      t('polls.vote')
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}