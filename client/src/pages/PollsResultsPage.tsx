import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Calendar, Vote } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PollOption {
  id: number;
  text: string;
  textEs?: string;
  voteCount: number;
  percentage: number;
}

interface Poll {
  id: number;
  title: string;
  titleEs?: string;
  question: string;
  questionEs?: string;
  status: 'draft' | 'published';
  createdAt: string;
  totalVotes: number;
  options: PollOption[];
}

// Variantes de animación para los resultados
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
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

export default function PollsResultsPage() {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';
  const [selectedTab, setSelectedTab] = useState<string>('all');
  
  // Obtener todas las encuestas publicadas
  const { data: polls, isLoading } = useQuery<Poll[]>({
    queryKey: ['/api/polls/published'],
    queryFn: async () => {
      const publishedPolls = await apiRequest('/api/polls/published');
      
      // Para cada encuesta, obtener sus resultados
      const pollsWithResults = await Promise.all(
        publishedPolls.map(async (poll: any) => {
          try {
            const pollDetailsResponse = await apiRequest(`/api/polls/${poll.id}/results`);
            return {
              ...poll,
              totalVotes: pollDetailsResponse.totalVotes || 0,
              options: pollDetailsResponse.results || []
            };
          } catch (error) {
            console.error(`Error fetching results for poll ${poll.id}:`, error);
            return {
              ...poll,
              totalVotes: 0,
              options: []
            };
          }
        })
      );
      
      return pollsWithResults;
    }
  });
  
  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isSpanish ? 'es' : 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{t('polls.resultsTitle')}</h1>
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
        <h1 className="text-3xl font-bold mb-6">{t('polls.resultsTitle')}</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p>{t('polls.noPollsAvailable')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrar encuestas según la pestaña seleccionada
  const filteredPolls = selectedTab === 'all' 
    ? polls 
    : selectedTab === 'popular' 
      ? [...polls].sort((a, b) => b.totalVotes - a.totalVotes) 
      : selectedTab === 'recent' 
        ? [...polls].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : polls;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">{t('polls.resultsTitle')}</h1>
      <p className="text-muted-foreground mb-6">{t('polls.resultsDescription')}</p>
      
      <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{t('polls.allPolls')}</TabsTrigger>
          <TabsTrigger value="popular">{t('polls.popularPolls')}</TabsTrigger>
          <TabsTrigger value="recent">{t('polls.recentPolls')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab}>
          <motion.div 
            className="grid gap-6 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredPolls.map((poll) => {
              // Gestión de contenido multilingüe
              const pollTitle = isSpanish && poll.titleEs ? poll.titleEs : poll.title;
              const pollQuestion = isSpanish && poll.questionEs ? poll.questionEs : poll.question;
              
              return (
                <motion.div key={poll.id} variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader className="bg-primary/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{pollTitle}</CardTitle>
                          <CardDescription className="mt-1">{pollQuestion}</CardDescription>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Vote className="h-3.5 w-3.5" />
                          {poll.totalVotes} {t('poll.votes')}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center mt-2">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(poll.createdAt)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {poll.options.map((option) => {
                          // Texto de opciones en el idioma correspondiente
                          const optionText = isSpanish && option.textEs 
                            ? option.textEs 
                            : option.text;
                            
                          return (
                            <div key={option.id} className="space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span>{optionText}</span>
                                <span className="font-medium">
                                  {option.percentage}%
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
                                  animate={{ width: `${option.percentage}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 }}
                                />
                              </motion.div>
                              <div className="text-xs text-muted-foreground">
                                {option.voteCount} {t('poll.votes')}
                              </div>
                            </div>
                          );
                        })}
                        <div className="mt-4 flex justify-end">
                          <Badge variant="outline" className="text-xs bg-primary/5">
                            {t('polls.resultsLive')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}