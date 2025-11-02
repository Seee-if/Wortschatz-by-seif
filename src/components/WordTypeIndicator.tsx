import { Badge } from "@/components/ui/badge";
import { BookOpen, Zap, Hash } from "lucide-react";

interface WordTypeIndicatorProps {
  type: 'noun' | 'verb' | 'other';
}

export const WordTypeIndicator = ({ type }: WordTypeIndicatorProps) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'noun':
        return {
          label: 'Nomen',
          icon: BookOpen,
          className: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
        };
      case 'verb':
        return {
          label: 'Verb',
          icon: Zap,
          className: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
        };
      case 'other':
        return {
          label: 'Andere',
          icon: Hash,
          className: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1.5 ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};
