import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, TrendingUp } from "lucide-react";
import { lektionenData } from "@/data/vocabulary.js";

interface LessonSelectorProps {
  onLessonSelect: (lessonNumber: number) => void;
}

const LessonSelector = ({ onLessonSelect }: LessonSelectorProps) => {
  const lessons = Array.from({ length: 18 }, (_, i) => i + 1);

  const getWordCount = (lessonNumber: number) => {
    const lesson = lektionenData.find((l) => l.lektion === lessonNumber);
    if (!lesson) return 0;
    
    const count = 
      (lesson.das?.length || 0) +
      (lesson.der?.length || 0) +
      (lesson.die?.length || 0) +
      (lesson.verben?.length || 0) +
      (lesson.adjektiveUndCo?.length || 0);
    
    return count;
  };

  const getLessonProgress = (lessonNumber: number) => {
    const savedProgress = localStorage.getItem(`lesson-${lessonNumber}-progress`);
    if (!savedProgress) return null;
    
    try {
      const { completedWords, score, timestamp } = JSON.parse(savedProgress);
      const totalWords = getWordCount(lessonNumber);
      const percentage = totalWords > 0 ? Math.round((score / totalWords) * 100) : 0;
      return { completedWords, score, percentage, timestamp };
    } catch {
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-secondary mr-3" aria-hidden="true" />
            <h1 className="text-5xl font-bold text-foreground">
              Deutsch Lernen
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mt-2">
            Wählen Sie eine Lektion zum Üben
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" role="list" aria-label="Lektionen">
          {lessons.map((lesson) => {
            const progress = getLessonProgress(lesson);
            return (
              <Card
                key={lesson}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden relative"
                onClick={() => onLessonSelect(lesson)}
                role="listitem"
              >
                {progress && (
                  <div className="absolute top-2 right-2 z-10">
                    {progress.percentage >= 90 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" aria-label="Lektion abgeschlossen" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-secondary" aria-label="In Bearbeitung" />
                    )}
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="w-full h-32 flex flex-col items-center justify-center gap-1 hover:bg-accent/20 group-hover:scale-105 transition-transform"
                  aria-label={`Lektion ${lesson} mit ${getWordCount(lesson)} Wörtern${progress ? `, ${progress.percentage}% abgeschlossen` : ''}`}
                >
                  <span className="text-sm text-muted-foreground font-medium">
                    Lektion
                  </span>
                  <span className="text-3xl font-bold text-primary group-hover:text-accent transition-colors">
                    {lesson}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getWordCount(lesson)} Wörter
                  </span>
                  {progress && (
                    <span className="text-xs font-semibold text-secondary mt-1">
                      {progress.percentage}% ✓
                    </span>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="p-6 bg-card/50 backdrop-blur" role="complementary" aria-label="Informationen">
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              Wie funktioniert es?
            </h3>
            <p className="text-muted-foreground mb-4">
              Wählen Sie eine Lektion und einen Lernmodus aus. Sie können zwischen verschiedenen Modi wählen: klassische Übersetzung, Karteikarten, Hören oder umgekehrte Übersetzung.
            </p>
            <div className="flex flex-wrap gap-2 justify-center text-sm">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                PWA installierbar
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Fortschritt gespeichert
              </Badge>
              <Badge variant="secondary">
                Offline verfügbar
              </Badge>
            </div>
          </Card>
          <p className="text-sm text-muted-foreground mt-6">
            By Seif Mohamed Gomaa
          </p>
        </div>
      </div>
    </div>
  );
};

export default LessonSelector;
