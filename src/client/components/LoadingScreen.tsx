import React from 'react';
import { useEffect, useState } from 'react';
import type { DailyGameData, GameRound } from '../../shared/types/api';

interface LoadingScreenProps {
  gameData: DailyGameData[];
  onLoadComplete: (rounds: GameRound[]) => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ gameData, onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const prefetchImages = async (rounds: GameRound[]): Promise<void> => {
    // Collect all image URLs (20 images total: 10 rounds × 2 images)
    const imageUrls = rounds.flatMap(round => [round.realImageUrl, round.renderImageUrl]);
    const totalImages = imageUrls.length;
    let loadedCount = 0;

    const imagePromises = imageUrls.map(
      url =>
        new Promise<void>((resolve) => {
          const img = new Image();

          img.loading = 'eager';
          img.decoding = 'async';

          img.onload = () => {
            loadedCount++;
            setProgress(Math.round((loadedCount / totalImages) * 100));
            resolve();
          };

          img.onerror = () => {
            console.warn(`Failed to load image: ${url}`);
            loadedCount++;
            setProgress(Math.round((loadedCount / totalImages) * 100));
            resolve();
          };

          // Start loading the image
          img.src = url;
        })
    );

    // Wait for all images to load (or fail gracefully)
    await Promise.all(imagePromises);
  };

  const transformAndRandomizeGameData = (data: DailyGameData[]): GameRound[] => {
    // Transform DailyGameData to GameRound format
    const rounds: GameRound[] = data.map(item => ({
      id: item.id,
      realImageUrl: item.real,
      renderImageUrl: item.render,
      source: item.source,
      realImagePosition: Math.random() < 0.5 ? 'left' : 'right', // Randomize position
    }));

    // Randomize the order of rounds (Fisher-Yates shuffle)
    const shuffled = [...rounds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }

    return shuffled;
  };

  const startLoading = async () => {
    try {
      setStatus('loading');
      setProgress(0);
      setErrorMessage(null);

      // Transform and randomize game data
      const rounds = transformAndRandomizeGameData(gameData);

      // Prefetch all images
      await prefetchImages(rounds);

      // Mark as success
      setStatus('success');

      // Auto-transition to game screen after a brief moment
      setTimeout(() => {
        onLoadComplete(rounds);
      }, 300);
    } catch (err) {
      console.error('Error prefetching images:', err);
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load game images. Please check your connection.'
      );
    }
  };

  useEffect(() => {
    void startLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = async () => {
    await startLoading();
  };

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-6">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-4xl sm:text-5xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Loading Failed</h2>
          <p className="text-foreground/80 mb-6 text-sm sm:text-base">{errorMessage}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl min-h-[44px] min-w-[44px]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="text-center max-w-md w-full px-4">
        {/* Loading Animation */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-primary"></div>
        </div>

        {/* Loading Message */}
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Preparing the game</h2>
        <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">Loading images...</p>

        {/* Progress Bar */}
        <div className="w-full bg-card rounded-full h-3 sm:h-4 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress Percentage */}
        <p className="text-xs sm:text-sm text-muted-foreground/70 mt-2">{progress}%</p>
      </div>
    </div>
  );
};
