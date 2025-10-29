import React from 'react';
import { useEffect, useState } from 'react';
import { context } from '@devvit/web/client';
import type { CheckPlayedResponse } from '../../shared/types/api';
import { LeaderboardModal } from './LeaderboardModal';

interface TitleScreenProps {
  gameDate: string;
  onPlay: () => void;
  titleThumbUrl?: string | undefined;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ gameDate, onPlay, titleThumbUrl }) => {
  // Safely access context properties - context might not be fully initialized
  const userId = context?.userId;
  const [playData, setPlayData] = useState<CheckPlayedResponse | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [glitchedTitle, setGlitchedTitle] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);

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

  // Pixelated tearing off effect - controlled sequential animation with ease-in-out
  useEffect(() => {
    const MAX_TORN_PIXELS = 75; // Maximum number of pixels to tear off
    const BASE_INTERVAL = 30; // Base ms between each pixel tear/repair
    const PERFECT_PAUSE = 3000; // Pause duration (ms) when title is fully restored

    // Ease-in-out function (cubic)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    // Split title into lines to identify regions
    const lines = asciiTitle.split('\n');
    const chars = asciiTitle.split('');

    // Calculate character positions for each line
    let currentPos = 0;
    const lineRanges: Array<{ start: number; end: number }> = [];

    lines.forEach((line) => {
      lineRanges.push({ start: currentPos, end: currentPos + line.length });
      currentPos += line.length + 1; // +1 for newline
    });

    // Get character indices only from "OR" and "RENDER" sections
    // Lines 0-5 are "REAL OR" (we want columns for "OR" only - roughly after position 20)
    // Lines 7-12 are "RENDER" (we want all of these)
    const charIndices: number[] = [];
    chars.forEach((char, idx) => {
      if (char === '\n' || char === ' ') return;

      // Find which line this character is on
      const lineIndex = lineRanges.findIndex(range => idx >= range.start && idx < range.end);

      if (lineIndex >= 7 && lineIndex <= 12) {
        // Only affect "RENDER" section - include all characters from these lines
        charIndices.push(idx);
      }
      // Lines 0-5 (REAL OR) are excluded - they won't tear
    });

    const tornIndices: number[] = []; // Indices of torn characters (FIFO queue)
    let isTearing = true; // true = tearing phase, false = repairing phase
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextUpdate = () => {
      // Calculate progress through current phase (0 to 1)
      const progress = isTearing
        ? tornIndices.length / MAX_TORN_PIXELS
        : 1 - (tornIndices.length / MAX_TORN_PIXELS);

      // Apply ease-in-out: slow at start/end, fast in middle
      const easedProgress = easeInOutCubic(progress);

      // Calculate interval: slower at edges (higher interval), faster in middle (lower interval)
      // Range from BASE_INTERVAL to BASE_INTERVAL * 3
      const interval = BASE_INTERVAL + (BASE_INTERVAL * 2 * (1 - easedProgress));

      timeoutId = setTimeout(updateTitle, interval);
    };

    const updateTitle = () => {
      if (isTearing) {
        // Tearing phase: add one random pixel
        if (tornIndices.length < MAX_TORN_PIXELS && tornIndices.length < charIndices.length) {
          // Find indices that aren't torn yet
          const availableIndices = charIndices.filter(idx => !tornIndices.includes(idx));
          if (availableIndices.length > 0) {
            const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            if (randomIdx !== undefined) {
              tornIndices.push(randomIdx);
            }
          }
        } else {
          // Max tearing reached, switch to repair phase
          isTearing = false;
        }
      } else {
        // Repairing phase: remove first torn pixel (FIFO)
        if (tornIndices.length > 0) {
          tornIndices.shift(); // Remove first element
        } else {
          // All repaired - title is in perfect condition
          // Wait before starting next tearing cycle
          isTearing = true;

          // Build the perfect title
          const perfect = chars.join('');
          setGlitchedTitle(perfect);

          // Schedule next tear after pause
          timeoutId = setTimeout(updateTitle, PERFECT_PAUSE);
          return;
        }
      }

      // Build the glitched title
      const glitched = chars.map((char, idx) => {
        if (tornIndices.includes(idx)) {
          return ' ';
        }
        return char;
      }).join('');

      setGlitchedTitle(glitched);

      // Schedule next update with dynamic timing
      scheduleNextUpdate();
    };

    // Start the animation
    scheduleNextUpdate();

    return () => clearTimeout(timeoutId);
  }, [asciiTitle]);

  // Fade in metadata (date, leaderboard, rank) after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMetadata(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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
      <div className="relative flex items-center justify-center h-full bg-background text-foreground p-3 overflow-hidden">
        {/* Game Date - Top Left (fade in) */}
        <div
          className={`absolute top-[15px] left-3 sm:top-4 sm:left-4 text-foreground/70 text-xs sm:text-sm font-mono transition-all duration-1000 ease-out ${showMetadata ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
        >
          {gameDate}
        </div>

        {/* Leaderboard Button - Top Right (fade in) */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className={`absolute top-2 right-2 sm:top-4 sm:right-4 text-3xl sm:text-4xl hover:scale-110 transition-all duration-1000 ease-out ${showMetadata ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          title="View Leaderboard"
        >
          🏆
        </button>

        {/* Main Content - Center */}
        <div className="flex flex-col items-center z-10 flex-1">
          {/* ASCII Art Title with pixelated tearing effect */}
          <pre
            className="ascii-art text-primary text-center overflow-x-auto whitespace-pre font-mono leading-tight px-2 max-w-full text-[0.475rem] sm:text-xs md:text-sm mb-4 overflow-y-hidden"
          >
            {glitchedTitle || asciiTitle}
          </pre>

          {/* Game Description */}
          <div className="mb-3">
            <p className="text-center text-foreground/60 text-xs sm:text-sm max-w-md">
              Can you tell the difference between
            </p>
            <p className="text-center text-foreground/60 text-xs sm:text-sm max-w-md">
              REAL photos and AI-generated images?
            </p>
          </div>


          {/* Play Button with pulsing animation */}
          <button
            type="button"
            onClick={onPlay}
            className={`relative py-3 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 shadow-lg min-h-[44px] my-2 flex items-center justify-center animate-pulse-slow ${playData?.played ? 'px-10' : 'px-8'
              }`}
          >
            {/* Animated border effect */}
            <span className="absolute inset-0 rounded-lg border-2 border-foreground/30 animate-ping opacity-75 group-hover:opacity-100" />

            <span className={`transition-opacity duration-300 ${playData?.played ? 'opacity-0' : 'opacity-100'}`}>
              Play Now
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playData?.played ? 'opacity-100' : 'opacity-0'}`}>
              Play Again
            </span>
          </button>

          {/* Warning if already played (lazy loaded) */}
          <p className={`text-xs text-yellow-400 text-center mb-2 transition-all duration-500 ease-out ${showWarning
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-2 pointer-events-none'
            }`}>
            ⚠️ Replays won't count on leaderboard
          </p>
        </div>

        {/* Player Count and Average Stats - Bottom Center */}
        <div className={`absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-center ${totalPlayersToday === 0 ? 'hidden' : 'block'}`}>
          <p className="text-xs sm:text-sm text-foreground/70">
            {totalPlayersToday} played this challenge
          </p>
          {playData?.averageStats && (
            <p className="text-xs sm:text-sm text-foreground/50 mt-1">
              Avg: {playData.averageStats.avgCorrect}/10 correct • {playData.averageStats.avgTimeSeconds}s
            </p>
          )}
        </div>

        {/* Side Image - Bottom Left (1:1 square, only shown if provided) */}
        {titleThumbUrl && titleThumbUrl?.trim() !== '' && (
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-24 h-24 sm:w-40 sm:h-40 aspect-square rounded-lg overflow-hidden shadow-lg animate-pulse-slow">
            <img
              src={titleThumbUrl}
              alt="Side content"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* User Rank Badge - Bottom Right (fade in with metadata) */}
        <div
          className={`absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-yellow-500/10 border border-yellow-500 rounded-lg px-3 py-2 backdrop-blur-sm transition-all duration-1000 ease-out ${totalPlayersToday === 0 ? 'hidden' : (showMetadata && playData?.played && playData.score
            ? 'block opacity-100 transform translate-y-0'
            : 'block opacity-0 transform translate-y-2 pointer-events-none')
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
