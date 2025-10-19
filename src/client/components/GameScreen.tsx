import React from 'react';
import { useEffect, useState } from 'react';
import type { GameRound } from '../../shared/types/api';
import { GameImageButton } from './GameImageButton';
import { MobileGameScreen } from './MobileGameScreen';

interface GameScreenProps {
  rounds: GameRound[];
  onGameComplete: (results: {
    correct: number;
    incorrect: number;
    totalTimeMs: number;
    userAnswers: boolean[];
  }) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ rounds, onGameComplete }) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<'left' | 'right' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const currentRound = rounds[currentRoundIndex];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerHeight > window.innerWidth);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Timer effect - updates every 10ms for smooth display
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 10);

    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  // Format time as MM:SS
  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle image click
  const handleImageClick = (clickedPosition: 'left' | 'right') => {
    if (!currentRound || isComplete || showFeedback) return;

    // Set selected position and show feedback
    setSelectedPosition(clickedPosition);
    setShowFeedback(true);

    // Check if the clicked image is the real one
    const isCorrect = clickedPosition === currentRound.realImagePosition;

    // Update counts
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    // Record answer
    const newAnswers = [...userAnswers, isCorrect];
    setUserAnswers(newAnswers);

    // Wait a moment to show feedback, then proceed
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedPosition(null);

      // Check if this was the last round
      if (currentRoundIndex === rounds.length - 1) {
        // Game complete
        setIsComplete(true);
        const finalTime = Date.now() - startTime;

        onGameComplete({
          correct: isCorrect ? correctCount + 1 : correctCount,
          incorrect: isCorrect ? incorrectCount : incorrectCount + 1,
          totalTimeMs: finalTime,
          userAnswers: newAnswers,
        });
      } else {
        // Advance to next round
        setCurrentRoundIndex(prev => prev + 1);
      }
    }, 1000);
  };

  if (!currentRound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p>Loading round...</p>
      </div>
    );
  }

  // Determine which image goes on which side
  const leftImageUrl = currentRound.realImagePosition === 'left'
    ? currentRound.realImageUrl
    : currentRound.renderImageUrl;
  const rightImageUrl = currentRound.realImagePosition === 'right'
    ? currentRound.realImageUrl
    : currentRound.renderImageUrl;

  console.log('GameScreen rendered with rounds:', leftImageUrl, rightImageUrl);

  return (
    <div className={`bg-background text-foreground p-3 sm:p-4 md:p-6 ${isMobile ? 'flex flex-col h-screen' : 'flex flex-col min-h-screen h-screen max-h-screen'}`}>
      {/* Header with Round Counter and Timer */}
      <div className={`flex justify-between items-center mb-2 max-w-6xl w-full mx-auto sm:px-4 ${isMobile ? 'mx-2' : 'mb-auto'}`}>
        <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-primary">
          Round {currentRoundIndex + 1} / {rounds.length}
        </div>
        <div className="text-sm sm:text-base md:text-lg lg:text-xl font-mono text-green-400">
          {formatTime(elapsedTime)}
        </div>
      </div>

      {isMobile ? (
        <MobileGameScreen
          currentRound={currentRound}
          leftImageUrl={leftImageUrl}
          rightImageUrl={rightImageUrl}
          selectedPosition={selectedPosition}
          showFeedback={showFeedback}
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          onImageClick={handleImageClick}
        />
      ) : (
        <>
          {/* Desktop Layout: Original layout */}
          {/* Question and Instructions */}
          <div className="text-center mb-4 max-w-6xl w-full mx-auto px-2">
            <h2 className="text-lg">Which image is REAL?</h2>
            <p className="text-muted-foreground text-xs">
              Click on the photograph (not the AI-generated image)
            </p>
          </div>

          {/* Images Side by Side */}
          <div className="flex-1 flex items-center justify-center mb-2 px-2 w-full">
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full max-w-5xl mx-auto">
              {/* Left Image */}
              <GameImageButton
                imageUrl={leftImageUrl}
                isSelected={selectedPosition === 'left'}
                showFeedback={showFeedback && selectedPosition === 'left'}
                isCorrect={currentRound.realImagePosition === 'left'}
                disabled={showFeedback}
                onSelect={() => handleImageClick('left')}
                isMobile={isMobile}
              />

              {/* Right Image */}
              <GameImageButton
                imageUrl={rightImageUrl}
                isSelected={selectedPosition === 'right'}
                showFeedback={showFeedback && selectedPosition === 'right'}
                isCorrect={currentRound.realImagePosition === 'right'}
                disabled={showFeedback}
                onSelect={() => handleImageClick('right')}
                isMobile={isMobile}
              />
            </div>
          </div>

          {/* Score Counters at Bottom */}
          <div className="flex justify-center gap-3 mb-2 max-w-6xl w-full mx-auto px-2">
            <div className="text-xs">
              <span className="text-green-400 font-semibold">Correct:</span>{' '}
              <span className="font-bold">{correctCount}</span>
            </div>
            <div className="text-xs">
              <span className="text-red-400 font-semibold">Incorrect:</span>{' '}
              <span className="font-bold">{incorrectCount}</span>
            </div>
          </div>
          {/* Magnifier Usage Hint */}
          <div className="text-center mb-2 max-w-6xl w-full mx-auto px-4">
            <p className="text-muted-foreground text-xs">
              💡 Hover to zoom • Click to select
            </p>
          </div>
        </>
      )}
    </div>
  );
};
