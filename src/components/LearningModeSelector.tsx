import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Ear, CheckCircle } from "lucide-react";

export type LearningMode = 'translation' | 'flashcard' | 'listening' | 'multiple-choice';

interface LearningModeSelectorProps {
  onModeSelect: (mode: LearningMode) => void;
  onBack: () => void;
}

const LearningModeSelector = ({ onModeSelect, onBack }: LearningModeSelectorProps) => {
  const modes = [
    {
      id: 'translation' as LearningMode,
      title: 'Übersetzung',
      description: 'Übersetze arabische Wörter ins Deutsche',
      icon: BookOpen,
      color: 'bg-primary/10 hover:bg-primary/20',
    },
    {
      id: 'flashcard' as LearningMode,
      title: 'Karteikarten',
      description: 'Lerne mit Karteikarten',
      icon: Brain,
      color: 'bg-secondary/10 hover:bg-secondary/20',
    },
    {
      id: 'listening' as LearningMode,
      title: 'Hören',
      description: 'Höre und schreibe',
      icon: Ear,
      color: 'bg-accent/10 hover:bg-accent/20',
    },
    {
      id: 'multiple-choice' as LearningMode,
      title: 'Multiple Choice',
      description: 'Schnelles Quiz mit 4 Optionen',
      icon: CheckCircle,
      color: 'bg-primary/10 hover:bg-primary/20',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Wähle einen Lernmodus</h2>
          <p className="text-muted-foreground">
            Verschiedene Modi für effektives Lernen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${mode.color}`}
                onClick={() => onModeSelect(mode.id)}
                role="button"
                tabIndex={0}
                aria-label={`${mode.title} Modus wählen`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onModeSelect(mode.id);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-background">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{mode.title}</h3>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button onClick={onBack} variant="outline" size="lg" className="w-full">
          Zurück zur Lektionsauswahl
        </Button>
      </div>
    </div>
  );
};

export default LearningModeSelector;
