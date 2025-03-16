import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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

interface PollResultsProps {
  pollData: {
    poll: Poll;
    results: PollResult[];
  };
}

export function PollResults({ pollData }: PollResultsProps) {
  const { poll, results } = pollData;
  
  // Calcular el total de votos
  const totalVotes = results.reduce((sum, result) => sum + result.votes, 0);
  
  // Ordenar resultados por número de votos (de mayor a menor)
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{poll.title}</CardTitle>
        {poll.description && <CardDescription>{poll.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {totalVotes === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Esta encuesta aún no tiene votos
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Total de votos: {totalVotes}
            </p>
            
            {sortedResults.map((result) => (
              <div key={result.optionId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{result.optionText}</span>
                  <span className="font-medium">{result.votes} ({result.percentage}%)</span>
                </div>
                <Progress value={result.percentage} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}