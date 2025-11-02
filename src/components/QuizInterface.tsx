import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Lightbulb, RotateCcw, Keyboard, Clock, Volume2, Eye, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { lektionenData } from "@/data/vocabulary";
import { WordTypeIndicator } from "@/components/WordTypeIndicator";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { Badge } from "@/components/ui/badge";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import AnswerReview from "@/components/AnswerReview";
import FlashcardMode from "@/components/FlashcardMode";
import ListeningMode from "@/components/ListeningMode";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import type { LearningMode } from "@/components/LearningModeSelector";

interface QuizInterfaceProps {
  lessonNumber: number;
  onBack: () => void;
  learningMode: LearningMode;
}

interface Word {
  deutsch: string;
  plural: string;
  arabisch: string;
  type: 'noun' | 'verb' | 'other';
}

const QuizInterface = ({ lessonNumber, onBack, learningMode }: QuizInterfaceProps) => {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [germanInput, setGermanInput] = useState("");
  const [pluralInput, setPluralInput] = useState("");
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [allAnswers, setAllAnswers] = useState<Array<{
    word: Word;
    userAnswer: { german: string; plural: string };
    correct: boolean;
  }>>([]);
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  
  const germanInputRef = useRef<HTMLInputElement>(null);
  const pluralInputRef = useRef<HTMLInputElement>(null);
  const [activeInput, setActiveInput] = useState<'german' | 'plural'>('german');

  // Touch gestures for navigation
  useSwipeGesture({
    onSwipeLeft: () => {
      if (showFeedback && currentWordIndex < allWords.length - 1) {
        handleNext();
      }
    },
    onSwipeRight: () => {
      if (showFeedback && currentWordIndex > 0) {
        setCurrentWordIndex(currentWordIndex - 1);
        setShowFeedback(false);
        setGermanInput("");
        setPluralInput("");
      }
    },
  });

  // Timer effect
  useEffect(() => {
    if (!showResults) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, showResults]);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`lesson-${lessonNumber}-progress`);
    if (savedProgress) {
      const { completedWords, score: savedScore } = JSON.parse(savedProgress);
      console.log('Loaded progress:', { completedWords, savedScore });
    }
  }, [lessonNumber]);

  useEffect(() => {
    const lesson = lektionenData.find((l) => l.lektion === lessonNumber);
    if (lesson) {
      const words: Word[] = reviewMode ? wrongWords : [
        ...(lesson.das || []).map(w => ({ ...w, type: 'noun' as const })),
        ...(lesson.der || []).map(w => ({ ...w, type: 'noun' as const })),
        ...(lesson.die || []).map(w => ({ ...w, type: 'noun' as const })),
        ...(lesson.verben || []).map(w => ({ ...w, type: 'verb' as const })),
        ...(lesson.adjektiveUndCo || []).map(w => ({ ...w, type: 'other' as const })),
      ];
      
      // Shuffle words using Fisher-Yates algorithm (only for normal mode)
      if (!reviewMode) {
        const shuffledWords = [...words];
        for (let i = shuffledWords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
        }
        setAllWords(shuffledWords);
      } else {
        setAllWords(words);
      }
    }
  }, [lessonNumber, reviewMode]);

  // Generate multiple choice options when word changes
  useEffect(() => {
    if (learningMode === 'multiple-choice' && currentWord && allWords.length > 0) {
      generateMultipleChoiceOptions();
    }
  }, [currentWordIndex, allWords, learningMode]);

  const generateMultipleChoiceOptions = () => {
    if (!currentWord || allWords.length < 4) return;
    
    // Get 3 random wrong answers
    const otherWords = allWords.filter(w => w.deutsch !== currentWord.deutsch);
    const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
    const wrongAnswers = shuffled.slice(0, 3).map(w => w.deutsch);
    
    // Combine with correct answer and shuffle
    const options = [currentWord.deutsch, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setMultipleChoiceOptions(options);
    setSelectedChoice(null);
  };

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Toggle shortcuts help
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      // Show hint
      if (e.ctrlKey && e.key === "h") {
        e.preventDefault();
        setShowHint(!showHint);
      }
      // Skip word
      if (e.key === "Escape" && !showFeedback) {
        handleSkip();
      }
      // Navigate with arrow keys when feedback is shown
      if (showFeedback) {
        if (e.key === "ArrowRight" || e.key === " ") {
          e.preventDefault();
          handleNext();
        }
      }
      // Play audio
      if (e.key === "p" && showFeedback) {
        e.preventDefault();
        speak(currentWord.deutsch);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showHint, showKeyboardShortcuts, showFeedback, currentWordIndex]);

  const currentWord = allWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / allWords.length) * 100;

  const checkAnswer = () => {
    if (!currentWord) return;

    const userGerman = germanInput.trim();
    const correctGerman = currentWord.deutsch.trim();
    const userPlural = pluralInput.trim();
    const correctPlural = currentWord.plural ? currentWord.plural.trim() : "";

    // Check if it's a noun - nouns must match case exactly (first letter uppercase)
    // Verbs must be lowercase
    // Other words are case-insensitive
    let germanCorrect: boolean;
    if (currentWord.type === 'noun') {
      germanCorrect = userGerman === correctGerman;
    } else if (currentWord.type === 'verb') {
      // Verbs must be lowercase
      germanCorrect = userGerman === correctGerman && userGerman === userGerman.toLowerCase();
    } else {
      germanCorrect = userGerman.toLowerCase() === correctGerman.toLowerCase();
    }

    let pluralCorrect: boolean;
    if (!currentWord.plural) {
      pluralCorrect = true;
    } else if (currentWord.type === 'noun') {
      pluralCorrect = userPlural === correctPlural;
    } else if (currentWord.type === 'verb') {
      // Verbs must be lowercase
      pluralCorrect = userPlural === correctPlural && userPlural === userPlural.toLowerCase();
    } else {
      pluralCorrect = userPlural.toLowerCase() === correctPlural.toLowerCase();
    }

    const bothCorrect = germanCorrect && pluralCorrect;
    setIsCorrect(bothCorrect);
    setShowFeedback(true);

    // Save answer for review
    setAllAnswers([...allAnswers, {
      word: currentWord,
      userAnswer: { german: userGerman, plural: userPlural },
      correct: bothCorrect
    }]);

    if (bothCorrect) {
      setScore(score + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      toast.success("Richtig!", {
        description: `Sehr gut gemacht! 🎉 ${newStreak > 2 ? `Streak: ${newStreak}!` : ''}`,
      });
    } else {
      setStreak(0);
      if (!wrongWords.find(w => w.deutsch === currentWord.deutsch)) {
        setWrongWords([...wrongWords, currentWord]);
      }
      let errorMsg = "";
      if (!germanCorrect) {
        errorMsg += `Richtig: ${currentWord.deutsch}`;
      }
      if (!pluralCorrect && currentWord.plural) {
        errorMsg += `${errorMsg ? " | " : ""}Plural: ${currentWord.plural}`;
      }
      toast.error("Falsch", {
        description: errorMsg,
      });
    }
    setShowHint(false);
    
    // Save progress to localStorage
    localStorage.setItem(`lesson-${lessonNumber}-progress`, JSON.stringify({
      completedWords: currentWordIndex + 1,
      score: score + (bothCorrect ? 1 : 0),
      timestamp: Date.now()
    }));
  };

  const handleSkip = () => {
    setSkippedCount(skippedCount + 1);
    if (currentWordIndex < allWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setGermanInput("");
      setPluralInput("");
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      setShowResults(true);
    }
    toast.info("Übersprungen", {
      description: "Wort wurde übersprungen",
    });
  };

  const handleNext = () => {
    if (currentWordIndex < allWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setGermanInput("");
      setPluralInput("");
      setShowFeedback(false);
      setIsCorrect(false);
      setShowHint(false);
      setSelectedChoice(null);
    } else {
      setShowResults(true);
    }
  };

  const handleMultipleChoiceSelect = (option: string) => {
    if (showFeedback) return;
    
    setSelectedChoice(option);
    const correct = option === currentWord.deutsch;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Save answer for review
    setAllAnswers([...allAnswers, {
      word: currentWord,
      userAnswer: { german: option, plural: '' },
      correct
    }]);

    if (correct) {
      setScore(score + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      toast.success("Richtig!", {
        description: `Sehr gut gemacht! 🎉 ${newStreak > 2 ? `Streak: ${newStreak}!` : ''}`,
      });
    } else {
      setStreak(0);
      if (!wrongWords.find(w => w.deutsch === currentWord.deutsch)) {
        setWrongWords([...wrongWords, currentWord]);
      }
      toast.error("Falsch", {
        description: `Richtig: ${currentWord.deutsch}`,
      });
    }
  };

  const startReviewMode = () => {
    if (wrongWords.length === 0) {
      toast.info("Keine Wörter zu wiederholen!");
      return;
    }
    setReviewMode(true);
    setCurrentWordIndex(0);
    setScore(0);
    setStreak(0);
    setGermanInput("");
    setPluralInput("");
    setShowFeedback(false);
    setShowResults(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setAllAnswers([]);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVirtualKeyPress = (char: string) => {
    const currentInputRef = activeInput === 'german' ? germanInputRef : pluralInputRef;
    const currentValue = activeInput === 'german' ? germanInput : pluralInput;
    const setValue = activeInput === 'german' ? setGermanInput : setPluralInput;
    
    if (currentInputRef.current) {
      const cursorPosition = currentInputRef.current.selectionStart || currentValue.length;
      const newValue = currentValue.slice(0, cursorPosition) + char + currentValue.slice(cursorPosition);
      setValue(newValue);
      
      // Set cursor position after inserted character
      setTimeout(() => {
        if (currentInputRef.current) {
          currentInputRef.current.focus();
          currentInputRef.current.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
        }
      }, 0);
    }
  };

  if (!currentWord) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">Keine Wörter in dieser Lektion gefunden.</p>
        <Button onClick={onBack} className="mt-4 mx-auto block">
          Zurück zur Lektionsauswahl
        </Button>
      </div>
    );
  }

  if (showAnswerReview) {
    return <AnswerReview answers={allAnswers} onClose={() => setShowAnswerReview(false)} />;
  }

  if (showResults) {
    const finalScore = score + (isCorrect ? 1 : 0);
    const answeredWords = allWords.length - skippedCount;
    const percentage = answeredWords > 0 ? Math.round((finalScore / answeredWords) * 100) : 0;
    
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <Card className="p-8 text-center border-2">
            <h2 className="text-3xl font-bold mb-4">
              {reviewMode ? "Wiederholung abgeschlossen!" : `Lektion ${lessonNumber} abgeschlossen!`}
            </h2>
            <div className="my-8">
              <div className="text-6xl font-bold text-primary mb-2 animate-scale-in">{percentage}%</div>
              <p className="text-xl text-muted-foreground">
                {finalScore} von {answeredWords} richtig
              </p>
              <div className="flex items-center justify-center gap-2 mt-3 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="text-lg font-semibold">{formatTime(elapsedTime)}</span>
              </div>
              {skippedCount > 0 && (
                <p className="text-lg text-muted-foreground mt-2">
                  {skippedCount} Wort{skippedCount > 1 ? 'e' : ''} übersprungen
                </p>
              )}
              {bestStreak > 2 && (
                <p className="text-lg font-semibold text-orange-500 mt-2 flex items-center justify-center gap-2">
                  🔥 Beste Streak: {bestStreak}
                </p>
              )}
            </div>

            <ProgressDashboard 
              totalWords={answeredWords}
              correctAnswers={finalScore}
              streak={bestStreak}
              bestScore={percentage}
            />

            <div className="space-y-2 mb-8">
              {percentage >= 90 && (
                <p className="text-lg font-semibold">Ausgezeichnet! 🎉</p>
              )}
              {percentage >= 70 && percentage < 90 && (
                <p className="text-lg font-semibold">Sehr gut! 👏</p>
              )}
              {percentage >= 50 && percentage < 70 && (
                <p className="text-lg font-semibold">Gut gemacht! 👍</p>
              )}
              {percentage < 50 && (
                <p className="text-lg font-semibold">Weiter üben! 💪</p>
              )}
            </div>

            <div className="space-y-3">
              {allAnswers.length > 0 && (
                <Button 
                  onClick={() => setShowAnswerReview(true)}
                  size="lg" 
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Eye className="w-4 h-4" />
                  Alle Antworten ansehen
                </Button>
              )}
              {!reviewMode && wrongWords.length > 0 && (
                <Button 
                  onClick={startReviewMode} 
                  size="lg" 
                  className="w-full gap-2"
                  variant="secondary"
                >
                  <RotateCcw className="w-4 h-4" />
                  Falsche Wörter wiederholen ({wrongWords.length})
                </Button>
              )}
              <Button onClick={onBack} size="lg" className="w-full">
                Zurück zur Lektionsauswahl
              </Button>
            </div>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-6">
            By Seif Mohamed Gomaa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1.5 bg-muted">
              <Clock className="w-3 h-3" />
              {formatTime(elapsedTime)}
            </Badge>
            {streak > 2 && (
              <Badge variant="outline" className="gap-1.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30">
                🔥 {streak}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            >
              <Keyboard className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showKeyboardShortcuts && (
          <Card className="p-4 mb-4 bg-muted/50 animate-fade-in" role="complementary" aria-label="Tastaturkürzel Hilfe">
            <h3 className="font-semibold mb-2 text-sm">Tastaturkürzel:</h3>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p><kbd className="px-2 py-0.5 bg-background rounded">Enter</kbd> - Antwort überprüfen</p>
              <p><kbd className="px-2 py-0.5 bg-background rounded">Ctrl+H</kbd> - Hinweis anzeigen</p>
              <p><kbd className="px-2 py-0.5 bg-background rounded">Esc</kbd> - Wort überspringen</p>
              <p><kbd className="px-2 py-0.5 bg-background rounded">→ / Space</kbd> - Nächstes Wort (nach Feedback)</p>
              <p><kbd className="px-2 py-0.5 bg-background rounded">P</kbd> - Audio abspielen (nach Feedback)</p>
              <p><kbd className="px-2 py-0.5 bg-background rounded">?</kbd> - Shortcuts anzeigen</p>
              <p className="mt-2 pt-2 border-t border-border">
                <strong>Touch-Gesten:</strong> Wischen nach links/rechts zum Navigieren
              </p>
            </div>
          </Card>
        )}

        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            {reviewMode ? "Wiederholung" : `Lektion ${lessonNumber}`}
          </p>
          <p className="font-semibold">
            Wort {currentWordIndex + 1} / {allWords.length}
          </p>
        </div>

        <Progress value={progress} className="mb-6 h-3" />

        <Card className="p-8 mb-6 border-2 animate-fade-in" role="main" aria-label="Quiz Karte">
          {learningMode === 'flashcard' ? (
            <FlashcardMode
              word={currentWord}
              onNext={handleNext}
              onKnown={() => {
                setIsCorrect(true);
                setScore(score + 1);
                const newStreak = streak + 1;
                setStreak(newStreak);
                if (newStreak > bestStreak) setBestStreak(newStreak);
                toast.success("Gewusst! 🎉");
                setTimeout(handleNext, 500);
              }}
              onUnknown={() => {
                setStreak(0);
                if (!wrongWords.find(w => w.deutsch === currentWord.deutsch)) {
                  setWrongWords([...wrongWords, currentWord]);
                }
                toast.info("Nochmal üben");
                setTimeout(handleNext, 500);
              }}
            />
          ) : learningMode === 'listening' ? (
            <ListeningMode
              word={currentWord}
              onAnswer={(correct) => {
                setIsCorrect(correct);
                setShowFeedback(true);
                if (correct) {
                  setScore(score + 1);
                  const newStreak = streak + 1;
                  setStreak(newStreak);
                  if (newStreak > bestStreak) setBestStreak(newStreak);
                } else {
                  setStreak(0);
                  if (!wrongWords.find(w => w.deutsch === currentWord.deutsch)) {
                    setWrongWords([...wrongWords, currentWord]);
                  }
                }
              }}
              showFeedback={showFeedback}
              isCorrect={isCorrect}
              onContinue={handleNext}
            />
          ) : learningMode === 'multiple-choice' ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <WordTypeIndicator type={currentWord.type} />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Was bedeutet dieses Wort?
              </p>
              <h2 className="text-4xl font-bold text-foreground mb-8" dir="rtl">
                {currentWord.arabisch}
              </h2>
              
              <div className="grid grid-cols-1 gap-3 mb-6">
                {multipleChoiceOptions.map((option, index) => {
                  const isSelected = selectedChoice === option;
                  const isCorrectAnswer = option === currentWord.deutsch;
                  const showAsCorrect = showFeedback && isCorrectAnswer;
                  const showAsWrong = showFeedback && isSelected && !isCorrectAnswer;
                  
                  return (
                    <Button
                      key={index}
                      onClick={() => handleMultipleChoiceSelect(option)}
                      disabled={showFeedback}
                      variant={showAsCorrect ? 'default' : showAsWrong ? 'destructive' : 'outline'}
                      size="lg"
                      className={`h-auto py-4 text-lg transition-all ${
                        showAsCorrect ? 'bg-green-500 hover:bg-green-600' : 
                        showAsWrong ? 'bg-red-500 hover:bg-red-600' : 
                        'hover:bg-accent'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {showAsCorrect && <Check className="w-5 h-5" />}
                        {showAsWrong && <X className="w-5 h-5" />}
                        {option}
                      </span>
                    </Button>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="mt-4">
                  <Button
                    onClick={() => speak(currentWord.deutsch)}
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    aria-label="Deutsche Übersetzung anhören"
                  >
                    <Volume2 className="w-4 h-4" />
                    Hören
                  </Button>
                </div>
              )}

              {showFeedback && (
                <div className="mt-6">
                  <Button onClick={handleNext} className="w-full" size="lg" variant="secondary" aria-label="Zum nächsten Wort">
                    {currentWordIndex < allWords.length - 1 ? (
                      <>
                        Nächstes Wort
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      "Fertig"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <WordTypeIndicator type={currentWord.type} />
                {!showFeedback && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="gap-1.5"
                    aria-label="Hinweis anzeigen"
                  >
                    <Lightbulb className={`w-4 h-4 ${showHint ? 'text-yellow-500' : ''}`} />
                    Hinweis
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Übersetzen Sie ins Deutsche:
              </p>
              <h2 className="text-4xl font-bold text-foreground mb-2" dir="rtl">
                {currentWord.arabisch}
              </h2>
              {showHint && !showFeedback && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg animate-fade-in" role="note" aria-label="Hinweis">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    💡 Anfangsbuchstabe: <span className="font-bold text-lg">
                      {currentWord.deutsch.charAt(0)}
                    </span>
                    {currentWord.type === 'noun' && ' (Nomen werden großgeschrieben!)'}
                    {currentWord.type === 'verb' && ' (Verben werden kleingeschrieben!)'}
                  </p>
                </div>
              )}
            </div>
          )}

          {learningMode === 'translation' ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground" htmlFor="german-input">
                    Deutsche Übersetzung (mit Artikel)
                  </label>
                  <Input
                    id="german-input"
                    ref={germanInputRef}
                    value={germanInput}
                    onChange={(e) => setGermanInput(e.target.value)}
                    onFocus={() => setActiveInput('german')}
                    placeholder="z.B. die Lampe"
                    className="text-lg"
                    disabled={showFeedback}
                    dir="ltr"
                    aria-label="Deutsche Übersetzung eingeben"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !showFeedback) {
                        checkAnswer();
                      }
                    }}
                  />
                </div>

                {currentWord.plural && learningMode === 'translation' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground" htmlFor="plural-input">
                      Plural
                    </label>
                    <Input
                      id="plural-input"
                      ref={pluralInputRef}
                      value={pluralInput}
                      onChange={(e) => setPluralInput(e.target.value)}
                      onFocus={() => setActiveInput('plural')}
                      placeholder="z.B. die Lampen"
                      className="text-lg"
                      disabled={showFeedback}
                      aria-label="Plural eingeben"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !showFeedback) {
                          checkAnswer();
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {!showFeedback && (
                <div className="mt-6">
                  <VirtualKeyboard onKeyPress={handleVirtualKeyPress} />
                </div>
              )}

              {showFeedback && (
                <div
                  className={`mt-6 p-4 rounded-lg animate-scale-in ${
                    isCorrect
                      ? "bg-green-500/10 border-2 border-green-500/50"
                      : "bg-red-500/10 border-2 border-red-500/50"
                  }`}
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-start gap-3">
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
                        <div className="text-sm">
                          <p>
                            <span className="font-medium">Richtige Antwort:</span>{' '}
                            {currentWord.deutsch}
                          </p>
                          {currentWord.plural && (
                            <p>
                              <span className="font-medium">Plural:</span> {currentWord.plural}
                            </p>
                          )}
                        </div>
                      )}
                      <Button
                        onClick={() => speak(currentWord.deutsch)}
                        variant="ghost"
                        size="sm"
                        className="mt-2 gap-1.5"
                        aria-label="Deutsche Übersetzung anhören"
                      >
                        <Volume2 className="w-4 h-4" />
                        Hören
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                {!showFeedback ? (
                  <>
                    <Button onClick={handleSkip} variant="outline" size="lg" aria-label="Wort überspringen">
                      Überspringen
                    </Button>
                    <Button onClick={checkAnswer} className="flex-1" size="lg" aria-label="Antwort überprüfen">
                      Überprüfen
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleNext} className="flex-1" size="lg" variant="secondary" aria-label="Zum nächsten Wort">
                    {currentWordIndex < allWords.length - 1 ? (
                      <>
                        Nächstes Wort
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      "Fertig"
                    )}
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Aktueller Stand: {score} / {currentWordIndex + (showFeedback ? 1 : 0)} richtig
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
