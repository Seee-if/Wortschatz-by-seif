import { Button } from "@/components/ui/button";

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
}

const VirtualKeyboard = ({ onKeyPress }: VirtualKeyboardProps) => {
  const germanChars = ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', 'ß'];

  return (
    <div className="flex flex-wrap gap-2 justify-center p-3 bg-secondary/20 rounded-lg border border-border">
      {germanChars.map((char) => (
        <Button
          key={char}
          variant="outline"
          size="sm"
          onClick={() => onKeyPress(char)}
          className="min-w-[2.5rem] h-10 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
        >
          {char}
        </Button>
      ))}
    </div>
  );
};

export default VirtualKeyboard;
