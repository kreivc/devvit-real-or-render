import { useState } from 'react';
import { context } from '@devvit/web/client';
import type { DailyGameData, GameRound } from '../shared/types/api';
import { TitleScreen } from './components/TitleScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';

type CurrentScreen = 'title' | 'loading' | 'game' | 'results';

interface GameResults {
  correct: number;
  incorrect: number;
  totalTimeMs: number;
  userAnswers: boolean[];
}

// Render game
export const App = () => {
  const { postData } = context;
  const gameData = postData?.gameData as DailyGameData[] | undefined;
  const gameDate = postData?.date as string | undefined;

  // State management for game flow
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('title');
  const [gameRounds, setGameRounds] = useState<GameRound[]>([]);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);

  if (!gameData || !gameDate) return null;

  // Handler: Title Screen -> Loading Screen
  const handlePlay = () => {
    setCurrentScreen('loading');
  };

  // Handler: Loading Screen -> Game Screen
  const handleLoadComplete = (rounds: GameRound[]) => {
    setGameRounds(rounds);
    setCurrentScreen('game');
  };

  // Handler: Game Screen -> Results Screen
  const handleGameComplete = (results: GameResults) => {
    setGameResults(results);
    setCurrentScreen('results');
  };

  // Handler: Results Screen -> Loading Screen (Play Again)
  const handlePlayAgain = () => {
    setGameRounds([]);
    setGameResults(null);
    setCurrentScreen('loading');
  };

  // Render current screen based on state
  switch (currentScreen) {
    case 'title':
      return <TitleScreen gameDate={gameDate} onPlay={handlePlay} />;

    case 'loading':
      return <LoadingScreen gameData={gameData} onLoadComplete={handleLoadComplete} />;

    case 'game':
      return <GameScreen rounds={gameRounds} onGameComplete={handleGameComplete} />;

    case 'results':
      {
        if (!gameResults) {
          // Fallback if results are missing (shouldn't happen)
          return <TitleScreen gameDate={gameDate} onPlay={handlePlay} />;
        }

        // Extract sources from game rounds for attribution
        const sources = gameRounds.map((round) => round.source);

        return (
          <ResultsScreen
            gameDate={gameDate}
            correct={gameResults.correct}
            incorrect={gameResults.incorrect}
            totalTimeMs={gameResults.totalTimeMs}
            sources={sources}
            onPlayAgain={handlePlayAgain}
          />
        );
      }

    default:
      return <TitleScreen gameDate={gameDate} onPlay={handlePlay} />;
  }
};
