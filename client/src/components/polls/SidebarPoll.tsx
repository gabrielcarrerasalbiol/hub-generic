import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Loader2, ChevronDown, ChevronUp, AlertCircle, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type PollOption = {
  id: number;
  text: string;
  textEs?: string;
  order: number;
};

type Poll = {
  id: number;
  title: string;
  question: string;
  titleEs?: string;
  questionEs?: string;
  language: string;
  status: string;
  options: PollOption[];
  isVoted?: boolean;
};

type SidebarPollProps = {
  onVote?: () => void;
};

export function SidebarPoll({ onVote }: SidebarPollProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loadingPoll, setLoadingPoll] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [results, setResults] = useState<{
    id: number;
    text: string;
    voteCount: number;
    percentage: number;
  }[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Determinar si usamos texto en español o inglés según el idioma actual
  const isSpanish = i18n.language === 'es';

  const fetchActivePoll = async () => {
    try {
      setLoadingPoll(true);
      const response = await apiRequest<Poll | null>(
        "/api/polls/active/sidebar"
      );
      setPoll(response);
      if (response && response.isVoted) {
        fetchResults(response.id);
      }
    } catch (error) {
      console.error("Error fetching poll:", error);
    } finally {
      setLoadingPoll(false);
    }
  };

  const fetchResults = async (pollId: number) => {
    try {
      const response = await apiRequest<{
        results: {
          id: number;
          text: string;
          textEs?: string;
          voteCount: number;
          percentage: number;
        }[];
      }>(`/api/polls/${pollId}/results`);
      
      // Si hay texto en español disponible y el idioma es español, lo preferimos
      const processedResults = response.results.map(result => ({
        ...result,
        // Mostrar texto en español si está disponible y el idioma es español
        text: isSpanish && result.textEs ? result.textEs : result.text
      }));
      
      setResults(processedResults);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching poll results:", error);
    }
  };

  const handleVote = async () => {
    if (!isAuthenticated) {
      toast({
        title: t("poll.loginRequired"),
        description: t("poll.loginToVoteMessage"),
      });
      return;
    }

    // Si el usuario ya votó, simplemente mostrar los resultados
    if (poll?.isVoted) {
      fetchResults(poll.id);
      toast({
        title: t("poll.alreadyVoted"),
        description: t("poll.viewingResults"),
      });
      return;
    }

    if (!selectedOption || !poll) return;

    try {
      setVoting(true);
      await apiRequest(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        body: JSON.stringify({ optionId: selectedOption }),
      });

      await fetchResults(poll.id);

      toast({
        title: t("poll.voteRegistered"),
        description: t("poll.thankYouForVoting"),
      });

      if (onVote) {
        onVote();
      }
    } catch (error: any) {
      toast({
        title: t("poll.voteFailed"),
        description: error.message || t("poll.errorOccurred"),
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    fetchActivePoll();
  }, []);
  
  // Si ya votó, mostrar resultados automáticamente
  useEffect(() => {
    if (poll?.isVoted && !showResults) {
      fetchResults(poll.id);
    }
  }, [poll]);

  if (loadingPoll) {
    return (
      <Card className="mt-4 bg-accent/20">
        <CardContent className="p-4 flex justify-center items-center min-h-[200px]">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!poll) {
    return null;
  }

  // Crear el título para mostrar (bilingüe)
  const pollTitle = isSpanish && poll.titleEs ? poll.titleEs : poll.title;
  const pollQuestion = isSpanish && poll.questionEs ? poll.questionEs : poll.question;

  return (
    <Card className="mt-4 overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground p-3">
        <CardTitle className="text-base font-medium flex justify-between items-center">
          {t("poll.fanPoll")}
          {!isAuthenticated && (
            <div className="flex items-center text-xs text-primary-foreground/80 gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>{t("poll.loginToVote")}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-0">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <span className="text-sm font-medium">
              {pollTitle}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <h3 className="text-sm font-semibold mb-3">
              {pollQuestion}
            </h3>

            {showResults ? (
              <div className="space-y-3">
                {results.map((option) => (
                  <div key={option.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{option.text}</span>
                      <span className="font-medium">{option.percentage}%</span>
                    </div>
                    <motion.div
                      className="h-2 bg-accent rounded-full overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${option.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </motion.div>
                    <div className="text-xs text-muted-foreground">
                      {option.voteCount} {t("poll.votes")}
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex flex-col items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {t("poll.resultsLive")}
                  </Badge>
                  <Link to="/polls/results">
                    <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
                      <BarChart3 className="h-3.5 w-3.5" />
                      {t("poll.viewAllResults")}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {poll.options.map((option) => (
                    <Button
                      key={option.id}
                      variant={selectedOption === option.id ? "default" : "outline"}
                      className="w-full justify-start text-left font-normal"
                      onClick={() => setSelectedOption(option.id)}
                    >
                      {/* Mostrar texto en español si está disponible y el idioma es español */}
                      {isSpanish && option.textEs ? option.textEs : option.text}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    size="sm"
                    variant="link"
                    className="text-xs px-0"
                    onClick={() => {
                      if (poll) {
                        fetchResults(poll.id);
                      }
                    }}
                  >
                    {t("poll.viewResults")}
                  </Button>
                  <Button
                    size="sm"
                    disabled={!selectedOption || voting || !isAuthenticated || poll?.isVoted}
                    onClick={handleVote}
                  >
                    {voting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {poll?.isVoted ? t("poll.alreadyVoted") : t("poll.vote")}
                  </Button>
                </div>
                {!isAuthenticated && (
                  <div className="mt-3 text-xs text-center text-muted-foreground">
                    <button 
                      className="text-primary underline hover:text-primary/80"
                      onClick={() => {
                        toast({
                          title: t("poll.loginRequired"),
                          description: t("poll.loginToVoteMessage"),
                        });
                      }}
                    >
                      {t("poll.loginToVote")}
                    </button>
                  </div>
                )}
                {isAuthenticated && poll?.isVoted && (
                  <div className="mt-3 text-xs text-center text-amber-600">
                    {t("poll.alreadyVotedMessage")}
                  </div>
                )}
                
                <div className="mt-3 pt-2 border-t text-center">
                  <Link to="/polls/results">
                    <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1 mx-auto">
                      <BarChart3 className="h-3.5 w-3.5" />
                      {t("poll.viewAllResults")}
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}