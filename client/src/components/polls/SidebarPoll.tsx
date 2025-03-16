import { useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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

interface SidebarPollResponse {
  poll: Poll;
  hasVoted: boolean;
  results: PollResult[] | null;
}

export function SidebarPoll() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Obtener la encuesta activa para el sidebar
  const { data, isLoading, isError } = useQuery<SidebarPollResponse>({
    queryKey: ['/api/polls/active-sidebar'],
    queryFn: () => apiRequest('/api/polls/active-sidebar'),
    refetchOnWindowFocus: false
  });

  // Mutación para votar
  const voteMutation = useMutation({
    mutationFn: (optionId: number) => apiRequest(`/api/polls/${data?.poll.id}/vote`, {
      method: 'POST',
      data: { optionId }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls/active-sidebar'] });
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

  const handleVote = () => {
    if (!selectedOption) {
      toast({
        title: 'Selecciona una opción',
        description: 'Debes seleccionar una opción para votar',
        variant: 'destructive'
      });
      return;
    }

    voteMutation.mutate(selectedOption);
  };

  // Si está cargando, mostrar un esqueleto
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Encuesta</CardTitle>
        </CardHeader>
        <CardContent className="py-4 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Si hay un error o no hay encuesta activa, no mostrar nada
  if (isError || !data) {
    return null;
  }

  const { poll, hasVoted, results } = data;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{poll.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {hasVoted || !isAuthenticated ? (
          // Mostrar resultados si ya votó o no está autenticado
          <div className="space-y-3">
            {results?.map((result) => (
              <div key={result.optionId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{result.optionText}</span>
                  <span className="font-medium">{result.percentage}%</span>
                </div>
                <Progress value={result.percentage} className="h-2" />
              </div>
            ))}
            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground mt-2">
                <Link href="/login" className="text-primary underline">
                  Inicia sesión
                </Link>{' '}
                para participar en encuestas
              </p>
            )}
          </div>
        ) : (
          // Mostrar formulario de votación si no ha votado y está autenticado
          <RadioGroup
            value={selectedOption?.toString()}
            onValueChange={(value) => setSelectedOption(parseInt(value))}
            className="space-y-2"
          >
            {poll.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </CardContent>
      {isAuthenticated && !hasVoted && (
        <CardFooter className="pt-2">
          <Button
            onClick={handleVote}
            disabled={voteMutation.isPending || !selectedOption}
            className="w-full"
            size="sm"
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
}