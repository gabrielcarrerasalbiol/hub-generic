import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Trophy, ArrowLeft, BarChart, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from '@/lib/queryClient';
import { useLocation, useRoute, Link } from 'wouter';
import { GameDifficulty } from '@shared/schema';
import { useTranslation } from 'react-i18next';

// Tipos
interface Player {
  id: number;
  name: string;
  position: string;
  imageUrl?: string;
  country: string;
  jerseyNumber: number;
}

interface Question {
  id: number;
  player1Id: number;
  player2Id: number;
  statType: string;
  question: string;
  hint?: string;
  correctAnswer?: number;
  player1?: Player;
  player2?: Player;
  userSelection?: number;
  isCorrect?: boolean;
  explanation?: string;
}

interface Game {
  id: number;
  userId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  difficulty: string;
  completedAt?: string;
  createdAt: string;
}

interface GameWithQuestions {
  game: Game;
  questions: Question[];
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
  };
}

const StatsGame = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ gameId: string }>('/stats-game/:gameId');
  const { t } = useTranslation();
  
  const [step, setStep] = useState<'intro' | 'playing' | 'results'>('intro');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [currentGame, setCurrentGame] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [results, setResults] = useState<GameWithQuestions | null>(null);
  
  // Verificar si estamos viendo resultados de un juego existente
  useEffect(() => {
    if (params?.gameId) {
      const gameId = parseInt(params.gameId);
      setCurrentGame(gameId);
      setStep('results');
    }
  }, [params]);
  
  // Consulta para obtener los resultados de un juego
  const { 
    data: gameResults,
    isLoading: isLoadingResults,
    isError: isResultsError
  } = useQuery({
    queryKey: ['/api/stats-game', currentGame, 'results'],
    queryFn: () => apiRequest(`/api/stats-game/${currentGame}/results`),
    enabled: !!currentGame && step === 'results'
  });
  
  // Actualizar resultados cuando hay datos
  useEffect(() => {
    if (gameResults) {
      setResults(gameResults);
    }
  }, [gameResults]);
  
  // Mutación para crear un nuevo juego
  const createGameMutation = useMutation({
    mutationFn: (data: { difficulty: string; count: number }) => 
      apiRequest('/api/stats-game', { method: 'POST', data }),
    onSuccess: (data) => {
      setCurrentGame(data.id);
      setQuestions(data.questions);
      setStep('playing');
      queryClient.invalidateQueries({ queryKey: ['/api/stats-game'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo iniciar el juego. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  });
  
  // Mutación para responder a una pregunta
  const answerQuestionMutation = useMutation({
    mutationFn: ({ gameId, questionId, playerId }: { gameId: number; questionId: number; playerId: number }) =>
      apiRequest(`/api/stats-game/${gameId}/questions/${questionId}/answer`, {
        method: 'POST',
        data: { playerId }
      }),
    onSuccess: (data, variables) => {
      // Actualizar la pregunta con la respuesta y resultado
      setQuestions(questions.map(q => 
        q.id === variables.questionId 
          ? { 
              ...q, 
              userSelection: variables.playerId,
              correctAnswer: data.correctAnswer,
              isCorrect: data.isCorrect,
              explanation: data.explanation
            } 
          : q
      ));
      
      // Marcar como respondida
      setAnsweredQuestions([...answeredQuestions, variables.questionId]);
      
      // Si todas las preguntas han sido respondidas, mostrar resultados
      if (data.allAnswered) {
        setTimeout(() => {
          setStep('results');
        }, 2000);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar tu respuesta. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  });
  
  // Iniciar un nuevo juego
  const startGame = () => {
    if (!isAuthenticated) {
      toast({
        title: "Iniciar sesión requerido",
        description: "Debes iniciar sesión para jugar al minijuego de estadísticas.",
        variant: "destructive"
      });
      setLocation('/login?redirect=/stats-game');
      return;
    }
    
    createGameMutation.mutate({ 
      difficulty, 
      count: questionCount 
    });
  };
  
  // Responder una pregunta
  const answerQuestion = (playerId: number) => {
    if (!currentGame || !questions[currentQuestionIndex]) return;
    
    const questionId = questions[currentQuestionIndex].id;
    
    answerQuestionMutation.mutate({ 
      gameId: currentGame, 
      questionId, 
      playerId 
    });
    
    // Avanzar a la siguiente pregunta con un pequeño retraso
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 1500);
  };
  
  // Iniciar un nuevo juego
  const resetGame = () => {
    setStep('intro');
    setCurrentGame(null);
    setQuestions([]);
    setAnsweredQuestions([]);
    setCurrentQuestionIndex(0);
    setResults(null);
  };
  
  // Formatear tipo de estadística para mostrar
  const formatStatType = (type: string): string => {
    return t(`stats_game.stat_types.${type}`) || type;
  };
  
  // Renderizar pantalla de introducción
  const renderIntro = () => (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center bg-primary/10 rounded-t-lg">
        <CardTitle className="text-2xl text-primary">{t('stats_game.title')}</CardTitle>
        <CardDescription>{t('stats_game.subtitle')}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        <p className="text-center mb-4">
          {t('stats_game.intro_text')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('stats_game.difficulty')}</label>
            <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('stats_game.select_difficulty')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">{t('stats_game.difficulty_easy')}</SelectItem>
                <SelectItem value="medium">{t('stats_game.difficulty_medium')}</SelectItem>
                <SelectItem value="hard">{t('stats_game.difficulty_hard')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('stats_game.question_count')}</label>
            <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder={t('stats_game.select_count')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">{t('stats_game.questions', { count: 3 })}</SelectItem>
                <SelectItem value="5">{t('stats_game.questions', { count: 5 })}</SelectItem>
                <SelectItem value="10">{t('stats_game.questions', { count: 10 })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 p-4 rounded-md bg-primary/5 text-sm">
          <h4 className="font-bold mb-1">{t('stats_game.difficulty_levels')}:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>{t('stats_game.difficulty_easy')}:</strong> {t('stats_game.difficulty_easy_desc')}</li>
            <li><strong>{t('stats_game.difficulty_medium')}:</strong> {t('stats_game.difficulty_medium_desc')}</li>
            <li><strong>{t('stats_game.difficulty_hard')}:</strong> {t('stats_game.difficulty_hard_desc')}</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center pb-6">
        <Button 
          size="lg"
          onClick={startGame}
          disabled={createGameMutation.isPending}
          className="w-full max-w-sm"
        >
          {createGameMutation.isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {t('stats_game.generating_questions')}
            </>
          ) : (
            t('stats_game.start_game')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
  
  // Renderizar pregunta actual
  const renderQuestion = () => {
    if (!questions.length) return null;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswered = answeredQuestions.includes(currentQuestion.id);
    const player1 = currentQuestion.player1;
    const player2 = currentQuestion.player2;
    
    if (!player1 || !player2) return null;
    
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="bg-primary/10 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">
                {t('stats_game.question_number', { current: currentQuestionIndex + 1, total: questions.length })}
              </CardTitle>
              <CardDescription>{formatStatType(currentQuestion.statType)}</CardDescription>
            </div>
            <Progress 
              value={((currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100} 
              className="w-24 h-2" 
            />
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-center font-medium text-xl mb-4">{currentQuestion.question}</h3>
            {currentQuestion.hint && (
              <div className="text-sm text-muted-foreground text-center italic mb-4">
                {t('stats_game.hint')}: {currentQuestion.hint}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[player1, player2].map((player) => (
              <div key={player.id} className="relative">
                <Button
                  variant={isAnswered ? (player.id === currentQuestion.correctAnswer ? "default" : "destructive") : "outline"}
                  className={`w-full h-auto p-4 flex flex-col items-center hover:shadow-md transition-all ${
                    isAnswered && player.id === currentQuestion.userSelection
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  disabled={isAnswered || answerQuestionMutation.isPending}
                  onClick={() => answerQuestion(player.id)}
                >
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-2 overflow-hidden">
                    {player.imageUrl ? (
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl font-bold text-primary">{player.jerseyNumber}</div>
                    )}
                  </div>
                  <div className="text-lg font-bold">{player.name}</div>
                  <div className="text-sm">{player.position}</div>
                  <div className="text-xs mt-1">{player.country}</div>
                </Button>
              </div>
            ))}
          </div>
          
          {isAnswered && currentQuestion.explanation && (
            <div className="mt-6 p-4 bg-primary/5 rounded-lg text-sm">
              <h4 className="font-bold mb-1">{t('stats_game.explanation')}:</h4>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="justify-between">
          <div className="text-sm">
            {isAnswered ? (
              <span className={currentQuestion.isCorrect ? "text-green-600" : "text-red-600"}>
                {currentQuestion.isCorrect ? t('stats_game.correct') : t('stats_game.incorrect')}
              </span>
            ) : (
              <span>{t('stats_game.select_player')}</span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {currentQuestionIndex > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={answerQuestionMutation.isPending}
              >
                {t('stats_game.previous')}
              </Button>
            )}
            
            {currentQuestionIndex < questions.length - 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={!isAnswered || answerQuestionMutation.isPending}
              >
                {t('stats_game.next')}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  // Renderizar resultados
  const renderResults = () => {
    if (isLoadingResults) {
      return (
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">{t('stats_game.loading_results')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (isResultsError || !results) {
      return (
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('errors.somethingWrong')}</AlertTitle>
          <AlertDescription>
            {t('stats_game.results_error')}{" "}
            <Button variant="link" onClick={resetGame} className="p-0 h-auto">
              {t('stats_game.back_to_start')}
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    const { game, questions, summary } = results;
    const percentage = Math.round((summary.correctAnswers / summary.totalQuestions) * 100);
    
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="text-center bg-primary/10 rounded-t-lg">
          <Trophy className="h-10 w-10 mx-auto mb-2 text-yellow-500" />
          <CardTitle className="text-2xl">{t('stats_game.results_title')}</CardTitle>
          <CardDescription>
            {t('stats_game.difficulty')}: {t(`stats_game.difficulty_${game.difficulty}`)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">{summary.score}</div>
              <div className="text-sm">{t('stats_game.score')}</div>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold">{summary.correctAnswers}/{summary.totalQuestions}</div>
              <div className="text-sm">{t('stats_game.correct_answers')}</div>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold">{percentage}%</div>
              <div className="text-sm">{t('stats_game.accuracy')}</div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-bold text-lg mb-4">{t('stats_game.questions_detail')}</h3>
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{t('stats_game.question')} {index + 1}</h4>
                      <p className="text-sm text-muted-foreground">{formatStatType(question.statType)}</p>
                    </div>
                    <div className={`p-1 rounded text-xs ${question.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {question.isCorrect ? t('stats_game.correct') : t('stats_game.incorrect')}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{question.question}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {question.player1 && question.player2 && (
                      <>
                        <div className={`p-2 rounded ${question.correctAnswer === question.player1.id ? 'bg-green-50' : ''}`}>
                          <strong>{question.player1.name}</strong>
                          {question.correctAnswer === question.player1.id && ` (${t('stats_game.correct')})`}
                        </div>
                        <div className={`p-2 rounded ${question.correctAnswer === question.player2.id ? 'bg-green-50' : ''}`}>
                          <strong>{question.player2.name}</strong>
                          {question.correctAnswer === question.player2.id && ` (${t('stats_game.correct')})`}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {question.explanation && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>{t('stats_game.explanation')}:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="justify-center pb-6">
          <Button
            onClick={resetGame}
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('stats_game.back_to_start')}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => startGame()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('stats_game.play_again')}
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  if (!isAuthenticated) {
    return (
      <div className="container max-w-7xl mx-auto py-10 px-4">
        <Alert className="max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('stats_game.login_required')}</AlertTitle>
          <AlertDescription>
            {t('stats_game.login_message')}{" "}
            <Link href="/login?redirect=/stats-game" className="font-medium underline">
              {t('auth.login')}
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{t('stats_game.page_title')}</h1>
        <p className="text-muted-foreground">{t('stats_game.page_subtitle')}</p>
      </div>
      
      {step === 'intro' && renderIntro()}
      {step === 'playing' && renderQuestion()}
      {step === 'results' && renderResults()}
    </div>
  );
};

export default StatsGame;