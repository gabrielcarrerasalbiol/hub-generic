import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Vote, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from "wouter";

interface PollOption {
  id: number;
  text: string;
}

interface Poll {
  id: number;
  title: string;
  description: string | null;
  options: PollOption[];
  isVoted?: boolean;
}

export function SidebarPoll() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const isAuthenticated = useAuth(state => state.checkAuth());
  const [hasVoted, setHasVoted] = useState(false);

  // Obtener encuesta activa para el sidebar
  const { data: activePoll, isLoading, error } = useQuery<Poll>({
    queryKey: ['/api/polls/active/sidebar'],
    queryFn: () => apiRequest('/api/polls/active/sidebar'),
  });

  useEffect(() => {
    if (activePoll?.isVoted) {
      setHasVoted(true);
    }
  }, [activePoll]);

  // Mutación para enviar voto
  const voteMutation = useMutation({
    mutationFn: (optionId: number) => 
      apiRequest(`/api/polls/${activePoll?.id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionId }),
      }),
    onSuccess: () => {
      setHasVoted(true);
      toast({
        title: "Voto registrado",
        description: "Tu voto ha sido registrado con éxito.",
      });
      // Invalidar consultas para actualizar datos
      queryClient.invalidateQueries({ queryKey: ['/api/polls/active/sidebar'] });
      queryClient.invalidateQueries({ queryKey: ['/api/polls', activePoll?.id, 'results'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al votar",
        description: error.message || "No se pudo registrar tu voto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleVote = () => {
    if (!selectedOption) return;
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión para votar",
        description: "Debes iniciar sesión para participar en las encuestas.",
        variant: "default",
      });
      return;
    }
    voteMutation.mutate(selectedOption);
  };

  if (isLoading) {
    return (
      <Card className="mt-4 border border-[#FDBE11]/20">
        <CardHeader className="py-3">
          <Skeleton className="h-5 w-full" />
        </CardHeader>
        <CardContent className="pb-3 pt-0">
          <Skeleton className="h-4 w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !activePoll) {
    return null; // No mostrar nada si hay error o no hay encuesta activa
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="mt-4 border border-[#FDBE11]/20 overflow-hidden">
        <CardHeader className="py-3 bg-gradient-to-r from-[#FDBE11]/10 to-transparent">
          <CardTitle className="text-sm flex items-center">
            <Vote className="w-4 h-4 mr-2 text-[#FDBE11]" />
            Encuesta del día
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 pt-3">
          <h4 className="font-medium text-sm mb-2">{activePoll.title}</h4>
          {activePoll.description && (
            <p className="text-xs text-muted-foreground mb-3">{activePoll.description}</p>
          )}
          
          {!hasVoted ? (
            <RadioGroup 
              value={selectedOption?.toString()}
              onValueChange={(value) => setSelectedOption(parseInt(value))}
              className="space-y-2"
            >
              {activePoll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.id.toString()} 
                    id={`option-${option.id}`} 
                    disabled={voteMutation.isPending || !isAuthenticated}
                  />
                  <Label 
                    htmlFor={`option-${option.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="py-2 px-3 bg-[#FDBE11]/5 rounded-md">
              <p className="text-sm text-center">¡Gracias por participar!</p>
              <p className="text-xs text-center text-muted-foreground mt-1">
                Puedes ver los resultados completos en la página de encuestas.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          {!hasVoted ? (
            <>
              {!isAuthenticated && (
                <div className="flex items-center text-amber-600 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Inicia sesión para votar
                </div>
              )}
              <Button 
                variant="outline"
                size="sm"
                onClick={handleVote}
                disabled={!selectedOption || voteMutation.isPending || !isAuthenticated}
                className="ml-auto"
              >
                {voteMutation.isPending ? "Enviando..." : "Votar"}
              </Button>
            </>
          ) : (
            <Link 
              href={`/polls/${activePoll.id}/results`}
              className="text-xs text-[#001C58] dark:text-[#FDBE11] hover:underline ml-auto flex items-center"
            >
              Ver resultados
              <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}