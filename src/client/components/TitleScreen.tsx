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

  // Get initial data from context (passed from splash screen)
  const totalPlayersToday = playData?.totalPlayersToday || 0;

  // ASCII art title (smaller version)
  const asciiTitle = `
██████╗ ███████╗ █████╗ ██╗          ██████╗ ██████╗ 
██╔══██╗██╔════╝██╔══██╗██║         ██╔═══██╗██╔══██╗
██████╔╝█████╗  ███████║██║         ██║   ██║██████╔╝
██╔══██╗██╔══╝  ██╔══██║██║         ██║   ██║██╔══██╗
██║  ██║███████╗██║  ██║███████╗    ╚██████╔╝██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝     ╚═════╝ ╚═╝  ╚═╝
                                                       
██████╗ ███████╗███╗   ██╗██████╗ ███████╗██████╗    
██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗   
██████╔╝█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝   
██╔══██╗██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗   
██║  ██║███████╗██║ ╚████║██████╔╝███████╗██║  ██║   
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝   
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
          <pre className="ascii-art text-primary text-center overflow-x-auto whitespace-pre font-mono leading-tight px-2 max-w-full text-[0.53rem] sm:text-xs mb-4">
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
            className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 rounded-lg font-bold text-base sm:text-lg transition-colors shadow-lg min-h-[44px] my-2"
          >
            {playData?.played ? 'Play Again' : 'Play'}
          </button>

          {/* Player Count */}
          <div className="text-center mb-2">
            <p className="text-xs sm:text-sm text-foreground/70">
              {totalPlayersToday} {totalPlayersToday === 1 ? 'person' : 'people'} play this challenge
            </p>
          </div>

          {/* Warning if already played (lazy loaded) */}
          {playData?.played && (
            <p className="text-xs text-yellow-400 text-center">
              ⚠️ Replays won't count on leaderboard
            </p>
          )}
        </div>

        {/* User Rank Badge - Bottom Right (lazy loaded) */}
        {playData?.played && playData.score && (
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-yellow-500/10 border border-yellow-500 rounded-lg px-3 py-2 backdrop-blur-sm">
            <div className="text-yellow-400 text-lg sm:text-xl font-bold">
              #{playData.score.rank}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
