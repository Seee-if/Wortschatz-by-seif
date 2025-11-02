import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnswerReviewItem {
  word: {
    deutsch: string;
    plural: string;
    arabisch: string;
    type: 'noun' | 'verb' | 'other';
  };
  userAnswer: {
    german: string;
    plural: string;
  };
  correct: boolean;
}

interface AnswerReviewProps {
  answers: AnswerReviewItem[];
  onClose: () => void;
}

const AnswerReview = ({ answers, onClose }: AnswerReviewProps) => {
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Antworten Überprüfung</h2>
          <Button onClick={onClose} variant="outline">
            Schließen
          </Button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {answers.map((answer, index) => (
            <Card
              key={index}
              className={`p-4 border-2 ${
                answer.correct
                  ? 'border-success/50 bg-success/5'
                  : 'border-destructive/50 bg-destructive/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {answer.correct ? (
                    <Check className="w-6 h-6 text-success" />
                  ) : (
                    <X className="w-6 h-6 text-destructive" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold" dir="rtl">
                      {answer.word.arabisch}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => speak(answer.word.deutsch)}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      {answer.word.type === 'noun' && 'Nomen'}
                      {answer.word.type === 'verb' && 'Verb'}
                      {answer.word.type === 'other' && 'Andere'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Deine Antwort:</p>
                      <p className={`font-medium ${!answer.correct ? 'text-destructive' : ''}`}>
                        {answer.userAnswer.german || '(leer)'}
                        {answer.userAnswer.plural && ` / ${answer.userAnswer.plural}`}
                      </p>
                    </div>

                    {!answer.correct && (
                      <div>
                        <p className="text-muted-foreground mb-1">Richtige Antwort:</p>
                        <p className="font-medium text-success">
                          {answer.word.deutsch}
                          {answer.word.plural && ` / ${answer.word.plural}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnswerReview;
