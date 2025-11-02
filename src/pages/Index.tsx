import { useState, useEffect } from "react";
import LessonSelector from "@/components/LessonSelector";
import QuizInterface from "@/components/QuizInterface";
import LearningModeSelector, { LearningMode } from "@/components/LearningModeSelector";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const Index = () => {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<LearningMode | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLessonSelect = (lessonNumber: number) => {
    setSelectedLesson(lessonNumber);
  };

  const handleModeSelect = (mode: LearningMode) => {
    setSelectedMode(mode);
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setSelectedMode(null);
  };

  const handleBackToModes = () => {
    setSelectedMode(null);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <DarkModeToggle />
      {selectedLesson === null ? (
        <LessonSelector onLessonSelect={handleLessonSelect} />
      ) : selectedMode === null ? (
        <LearningModeSelector onModeSelect={handleModeSelect} onBack={handleBackToLessons} />
      ) : (
        <QuizInterface lessonNumber={selectedLesson} onBack={handleBackToModes} learningMode={selectedMode} />
      )}
    </div>
  );
};

export default Index;
