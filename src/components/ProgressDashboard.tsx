import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Flame, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressDashboardProps {
  totalWords: number;
  correctAnswers: number;
  streak: number;
  bestScore: number;
}

export const ProgressDashboard = ({ 
  totalWords, 
  correctAnswers, 
  streak, 
  bestScore 
}: ProgressDashboardProps) => {
  const accuracy = totalWords > 0 ? Math.round((correctAnswers / totalWords) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-2 hover:scale-105 transition-transform duration-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Genauigkeit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{accuracy}%</div>
          <Progress value={accuracy} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card className="border-2 hover:scale-105 transition-transform duration-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Beste
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{bestScore}%</div>
          <p className="text-xs text-muted-foreground mt-1">Persönlicher Rekord</p>
        </CardContent>
      </Card>

      <Card className="border-2 hover:scale-105 transition-transform duration-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{streak}</div>
          <p className="text-xs text-muted-foreground mt-1">Richtig hintereinander</p>
        </CardContent>
      </Card>

      <Card className="border-2 hover:scale-105 transition-transform duration-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Gesamt
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{correctAnswers}</div>
          <p className="text-xs text-muted-foreground mt-1">von {totalWords}</p>
        </CardContent>
      </Card>
    </div>
  );
};
