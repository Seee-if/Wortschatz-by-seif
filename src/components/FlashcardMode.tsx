import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, RotateCcw } from "lucide-react";
import { WordTypeIndicator } from "./WordTypeIndicator";

interface Word {
  deutsch: string;
  plural: string;
  arabisch: string;
  type: 'noun' | 'verb' | 'other';
}

interface FlashcardModeProps {
  word: Word;
  onNext: () => void;
  onKnown: () => void;
  onUnknown: () => void;
}

const FlashcardMode = ({ word, onNext, onKnown, onUnknown }: FlashcardModeProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Card
        className="w-full max-w-md h-64 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? "Karteikarte zeigt deutsche Übersetzung" : "Karteikarte zeigt arabisches Wort"}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsFlipped(!isFlipped);
          }
        }}
      >
        <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {!isFlipped ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 backface-hidden">
              <p className="text-sm text-muted-foreground mb-4">Arabisches Wort:</p>
              <h2 className="text-4xl font-bold text-center" dir="rtl">
                {word.arabisch}
              </h2>
              <p className="text-sm text-muted-foreground mt-6">Tippen zum Umdrehen</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 rotate-y-180 backface-hidden">
              <div className="flex items-center gap-2 mb-4">
                <WordTypeIndicator type={word.type} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(word.deutsch);
                  }}
                  className="gap-1.5"
                  aria-label="Deutsche Übersetzung anhören"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
              <h2 className="text-3xl font-bold text-center mb-2">
                {word.deutsch}
              </h2>
              {word.plural && (
                <p className="text-xl text-muted-foreground">
                  Plural: {word.plural}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {isFlipped && (
        <div className="flex gap-3 w-full max-w-md animate-fade-in">
          <Button
            onClick={() => {
              onUnknown();
              setIsFlipped(false);
            }}
            variant="destructive"
            size="lg"
            className="flex-1"
            aria-label="Wort als unbekannt markieren"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Nochmal üben
          </Button>
          <Button
            onClick={() => {
              onKnown();
              setIsFlipped(false);
            }}
            variant="default"
            size="lg"
            className="flex-1"
            aria-label="Wort als bekannt markieren"
          >
            Gewusst ✓
          </Button>
        </div>
      )}

      {!isFlipped && (
        <p className="text-sm text-muted-foreground text-center animate-fade-in">
          Klicken Sie auf die Karte, um die Antwort zu sehen
        </p>
      )}
    </div>
  );
};

export default FlashcardMode;
