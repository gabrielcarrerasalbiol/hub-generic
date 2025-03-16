import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PollResult {
  optionId: number;
  optionText: string;
  votes: number;
  percentage: number;
}

interface PollData {
  id: number;
  title: string;
  totalVotes: number;
  results: PollResult[];
}

// Variantes de animación para los resultados
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const barVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: { 
    width: "100%", 
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export function PollResults({ pollId, onClose }: { pollId: number; onClose: () => void }) {
  const [pollData, setPollData] = useState<PollData | null>(null);

  // Consulta para obtener resultados de una encuesta
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/polls', pollId, 'results'],
    queryFn: () => apiRequest(`/api/polls/${pollId}/results`),
  });

  // Actualizar datos cuando se carga la respuesta
  useEffect(() => {
    if (data) {
      setPollData(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Error al cargar los resultados de la encuesta</p>
        </CardContent>
      </Card>
    );
  }

  if (!pollData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>No hay resultados disponibles para esta encuesta</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card>
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CardTitle>{pollData.title}</CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <motion.div 
              className="text-sm text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Total de votos: <span className="font-medium">{pollData.totalVotes}</span>
            </motion.div>

            {pollData.results.map((result, index) => (
              <motion.div 
                key={result.optionId} 
                className="space-y-1"
                variants={itemVariants}
              >
                <div className="flex justify-between">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    {result.optionText}
                  </motion.span>
                  <motion.span 
                    className="font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  >
                    {result.votes} ({result.percentage}%)
                  </motion.span>
                </div>
                <motion.div variants={barVariants}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.percentage}%` }}
                    transition={{ 
                      duration: 1.2,
                      delay: 0.5 + index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <Progress 
                      value={result.percentage} 
                      className="h-2"
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}

            {pollData.totalVotes === 0 && (
              <motion.p 
                className="text-sm text-muted-foreground mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Esta encuesta aún no tiene votos
              </motion.p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}