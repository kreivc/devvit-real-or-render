import React from 'react';
import { useEffect, useState } from 'react';
import { context } from '@devvit/web/client';
import type { CheckPlayedResponse } from '../../shared/types/api';
import { LeaderboardModal } from './LeaderboardModal';

interface TitleScreenProps {
  gameDate: string;
  onPlay: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ gameDate, onPlay }) => {
  const { userId } = context;
  const [playData, setPlayData] = useState<CheckPlayedResponse | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Get initial data from context (passed from splash screen)
  const totalPlayersToday = playData?.totalPlayersToday || 0;

  // ASCII art title (smaller version)
  const asciiTitle = `
██████╗ ███████╗ █████╗ ██╗         ██████╗ ██████╗
 ██╔══██╗██╔════╝██╔══██╗██║        ██╔═══██╗██╔══██╗
 ██████╔╝█████╗  ███████║██║        ██║   ██║██████╔╝
 ██╔══██╗██╔══╝  ██╔══██║██║        ██║   ██║██╔══██╗
 ██║  ██║███████╗██║  ██║███████╗   ╚██████╔╝██║  ██║
 ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═╝  ╚═╝

██████╗ ███████╗███╗   ██╗██████╗ ███████╗██████╗ ██╗
██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗██║
██████╔╝█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝██║
██╔══██╗██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗╚═╝
██║  ██║███████╗██║ ╚████║██████╔╝███████╗██║  ██║██╗
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝
`.trim();

  // Lazy load play status after initial render
  useEffect(() => {
    const checkPlayStatus = async () => {
      try {
        const playResponse = await fetch(
          `/api/check-played-today?userId=${encodeURIComponent(userId || '')}&date=${gameDate}`
        );

        if (playResponse.ok) {
          const data: CheckPlayedResponse = await playResponse.json();
          setPlayData(data);

          // Trigger warning animation with a slight delay for smooth transition
          if (data.played) {
            setTimeout(() => setShowWarning(true), 100);
          }
        }
      } catch (err) {
        console.error('Error checking play status:', err);
        // Silently fail - user can still play
      }
    };

    void checkPlayStatus();
  }, [userId, gameDate]);

  return (
    <>
      {showLeaderboard && (
        <LeaderboardModal
          gameDate={gameDate}
          userId={userId || ''}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
      <div className="relative flex flex-col items-center justify-center h-full bg-background text-foreground p-3 overflow-hidden">
        {/* Game Date - Top Left */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 text-foreground/70 text-xs sm:text-sm font-mono">
          {gameDate}
        </div>

        {/* Leaderboard Button - Top Right */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-3xl sm:text-4xl hover:scale-110 transition-transform"
          title="View Leaderboard"
        >
          🏆
        </button>

        {/* Main Content - Center */}
        <div className="flex flex-col items-center z-10">
          {/* ASCII Art Title */}
          <pre className="ascii-art text-primary text-center overflow-x-auto whitespace-pre font-mono leading-tight px-2 max-w-full text-[0.475rem] sm:text-xs mb-4 overflow-y-hidden">
            {asciiTitle}
          </pre>

          {/* Game Description */}
          <div className="mb-3">
            <p className="text-center text-foreground/60 text-xs sm:text-sm max-w-md">
              Can you tell the difference between
            </p>
            <p className="text-center text-foreground/60 text-xs sm:text-sm max-w-md">
              real photos and AI-generated images?
            </p>
          </div>


          {/* Play Button */}
          <button
            type="button"
            onClick={onPlay}
            className={`relative py-3 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 shadow-lg min-h-[44px] my-2 flex items-center justify-center ${playData?.played ? 'px-10' : 'px-8'
              }`}
          >
            <span className={`transition-opacity duration-300 ${playData?.played ? 'opacity-0' : 'opacity-100'}`}>
              Play
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playData?.played ? 'opacity-100' : 'opacity-0'}`}>
              Play Again
            </span>
          </button>

          {/* Player Count */}
          <div className="text-center mb-2">
            <p className="text-xs sm:text-sm text-foreground/70">
              {totalPlayersToday} {totalPlayersToday === 1 ? 'person' : 'people'} play this challenge
            </p>
          </div>

          {/* Warning if already played (lazy loaded) */}
          <p className={`text-xs text-yellow-400 text-center transition-all duration-500 ease-out ${showWarning
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-2 pointer-events-none'
            }`}>
            ⚠️ Replays won't count on leaderboard
          </p>
        </div>

        {/* User Rank Badge - Bottom Right (lazy loaded) */}
        <div
          className={`absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-yellow-500/10 border border-yellow-500 rounded-lg px-3 py-2 backdrop-blur-sm transition-all duration-500 ease-out ${playData?.played && playData.score
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-2 pointer-events-none'
            }`}
        >
          <div className="text-yellow-400 text-lg sm:text-xl font-bold">
            #{playData?.score?.rank}
          </div>
        </div>
      </div>
    </>
  );
};
