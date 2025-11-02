import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Volume2, Check, X } from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";

interface Word {
  deutsch: string;
  plural: string;
  arabisch: string;
  type: 'noun' | 'verb' | 'other';
}

interface ListeningModeProps {
  word: Word;
  onAnswer: (correct: boolean) => void;
  showFeedback: boolean;
  isCorrect: boolean;
  onContinue: () => void;
}

const ListeningMode = ({ word, onAnswer, showFeedback, isCorrect, onContinue }: ListeningModeProps) => {
  const [germanInput, setGermanInput] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
      setHasPlayed(true);
    }
  };

  useEffect(() => {
    // Auto-play on mount
    const timer = setTimeout(() => speak(word.deutsch), 500);
    return () => clearTimeout(timer);
  }, [word.deutsch]);

  const checkAnswer = () => {
    const userGerman = germanInput.trim();
    const correctGerman = word.deutsch.trim();
    
    let correct: boolean;
    if (word.type === 'noun') {
      correct = userGerman === correctGerman;
    } else if (word.type === 'verb') {
      correct = userGerman === correctGerman && userGerman === userGerman.toLowerCase();
    } else {
      correct = userGerman.toLowerCase() === correctGerman.toLowerCase();
    }
    
    onAnswer(correct);
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto" role="main" aria-label="Hörmodus Quiz">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-4">Hören Sie zu und schreiben Sie:</h3>
        <Button
          onClick={() => speak(word.deutsch)}
          size="lg"
          variant="secondary"
          className="gap-2"
          aria-label="Wort erneut anhören"
        >
          <Volume2 className="w-5 h-5" />
          {hasPlayed ? "Nochmal hören" : "Abspielen"}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="listening-input">
            Was haben Sie gehört?
          </label>
          <Input
            id="listening-input"
            value={germanInput}
            onChange={(e) => setGermanInput(e.target.value)}
            placeholder="Schreiben Sie hier..."
            className="text-lg"
            disabled={showFeedback}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !showFeedback) {
                checkAnswer();
              }
            }}
            aria-label="Eingabefeld für gehörtes Wort"
            autoFocus
          />
        </div>

        {!showFeedback && (
          <div className="mt-4">
            <VirtualKeyboard onKeyPress={(char) => setGermanInput(germanInput + char)} />
          </div>
        )}

        {showFeedback && (
          <>
            <div
              className={`mt-6 p-4 rounded-lg flex items-start gap-3 animate-scale-in ${
                isCorrect
                  ? "bg-green-500/10 border-2 border-green-500/50"
                  : "bg-red-500/10 border-2 border-red-500/50"
              }`}
              role="alert"
              aria-live="polite"
            >
              {isCorrect ? (
                <Check className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold mb-1">
                  {isCorrect ? "Richtig! 🎉" : "Falsch 😔"}
                </p>
                {!isCorrect && (
                  <p className="text-sm">
                    <span className="font-medium">Richtige Antwort:</span> {word.deutsch}
                  </p>
                )}
                <Button
                  onClick={() => speak(word.deutsch)}
                  variant="ghost"
                  size="sm"
                  className="mt-2 gap-1.5"
                  aria-label="Richtige Antwort anhören"
                >
                  <Volume2 className="w-4 h-4" />
                  Nochmal hören
                </Button>
              </div>
            </div>
            <Button onClick={onContinue} className="w-full mt-4" size="lg">
              Weiter
            </Button>
          </>
        )}

        {!showFeedback && (
          <Button onClick={checkAnswer} className="w-full" size="lg">
            Überprüfen
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ListeningMode;
