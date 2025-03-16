import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
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
import { Loader2 } from 'lucide-react';

interface PollOption {
  id: number;
  text: string;
  order: number;
  pollId: number;
}

interface Poll {
  id: number;
  title: string;
  description: string | null;
  status: 'draft' | 'published';
  showInSidebar: boolean;
  createdAt: string;
  updatedAt: string;
  options: PollOption[];
}

interface PollResult {
  optionId: number;
  optionText: string;
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
        <h1 className="text-3xl font-bold mb-6">Encuestas</h1>
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
        <h1 className="text-3xl font-bold mb-6">Encuestas</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p>No hay encuestas disponibles en este momento.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Encuestas</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {polls.map((poll) => {
          const pollDetail = pollDetails?.[poll.id];
          const hasVoted = pollDetail?.hasVoted || false;
          const results = pollDetail?.results || [];
          
          return (
            <Card key={poll.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{poll.title}</CardTitle>
                {poll.description && (
                  <CardDescription>{poll.description}</CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                {isLoadingDetails && !pollDetail ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : hasVoted || !isAuthenticated ? (
                  // Mostrar resultados si ya votó o no está autenticado
                  <div className="space-y-4">
                    {results.map((result) => (
                      <div key={result.optionId} className="space-y-1">
                        <div className="flex justify-between">
                          <span>{result.optionText}</span>
                          <span className="font-medium">
                            {result.votes} ({result.percentage}%)
                          </span>
                        </div>
                        <Progress value={result.percentage} className="h-2" />
                      </div>
                    ))}
                    
                    {!isAuthenticated && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Necesitas iniciar sesión para participar en las encuestas.
                      </p>
                    )}
                    
                    {hasVoted && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Ya has votado en esta encuesta.
                      </p>
                    )}
                  </div>
                ) : (
                  // Mostrar formulario para votar
                  <RadioGroup
                    value={votes[poll.id]?.toString()}
                    onValueChange={(value) => handleOptionChange(poll.id, parseInt(value))}
                    className="space-y-3"
                  >
                    {poll.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={option.id.toString()} 
                          id={`poll-${poll.id}-option-${option.id}`} 
                        />
                        <Label 
                          htmlFor={`poll-${poll.id}-option-${option.id}`}
                          className="cursor-pointer"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
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
                        Enviando...
                      </>
                    ) : (
                      'Votar'
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