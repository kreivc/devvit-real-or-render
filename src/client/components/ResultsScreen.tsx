import React from 'react';
import { useEffect, useState } from 'react';
import { context, navigateTo } from '@devvit/web/client';
import type { SaveScoreResponse } from '../../shared/types/api';
import { ShareModal } from './ShareModal';
import { LeaderboardModal } from './LeaderboardModal';

interface ResultsScreenProps {
  gameDate: string;
  correct: number;
  incorrect: number;
  totalTimeMs: number;
  sources: string[];
  onPlayAgain: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  gameDate,
  correct,
  incorrect,
  totalTimeMs,
  sources,
  onPlayAgain,
}) => {
  const { userId } = context;
  const [saveResponse, setSaveResponse] = useState<SaveScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Calculate score using the formula: (Correct × 1,000,000) + Time(ms)
  const score = correct * 1_000_000 + totalTimeMs;

  // Format time as MM:SS
  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Save score on mount
  useEffect(() => {
    const saveScore = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/save-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId || '',
            score,
            date: gameDate,
            correctGuesses: correct,
            timeMs: totalTimeMs,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save score');
        }

        const data: SaveScoreResponse = await response.json();
        setSaveResponse(data);
      } catch (err) {
        console.error('Error saving score:', err);
        setError('Failed to save score. Your results are displayed below.');
      } finally {
        setLoading(false);
      }
    };

    void saveScore();
  }, [userId, score, gameDate, correct, totalTimeMs]);

  // Share results function - opens modal
  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <>
      {showShareModal && (
        <ShareModal
          gameDate={gameDate}
          correct={correct}
          totalTimeMs={totalTimeMs}
          rank={saveResponse?.rank as number | undefined}
          totalPlayers={saveResponse?.totalPlayers as number | undefined}
          onClose={() => setShowShareModal(false)}
        />
      )}
      {showLeaderboard && (
        <LeaderboardModal
          gameDate={gameDate}
          userId={userId || ''}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
      <div className="relative flex flex-col h-full bg-background text-foreground overflow-hidden">
        {/* Leaderboard Button - Top Right (outside main content) */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-3xl sm:text-4xl hover:scale-110 transition-transform z-10"
          title="View Leaderboard"
        >
          🏆
        </button>

        {/* Main Content - Centered with max-width for desktop */}
        <div className="flex flex-col h-full justify-center px-4 py-3 mx-auto w-full max-w-md">
          {/* Compact Header */}
          <div className="text-center mb-3">
            <h1 className="text-lg font-bold">Complete! 🎉</h1>
            <p className="text-muted-foreground text-xs">{gameDate}</p>
          </div>

          {/* Compact Results Card */}
          <div className="bg-card rounded-lg p-3 mb-2 border border-border">
            {/* Score - Large and centered */}
            <div className="text-center mb-2">
              <div className="text-3xl font-bold">{correct} / 10</div>
              <p className="text-muted-foreground text-xs">Score</p>
            </div>

            {/* Stats Grid - Compact 3 columns */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{correct}</div>
                <p className="text-green-400 text-xs">Correct</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{incorrect}</div>
                <p className="text-red-400 text-xs">Incorrect</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{formatTime(totalTimeMs)}</div>
                <p className="text-muted-foreground text-xs">Time</p>
              </div>
            </div>

            {/* Ranking - Compact */}
            {loading && (
              <div className="text-center py-1">
                <div className="animate-pulse text-muted-foreground text-xs">Loading rank...</div>
              </div>
            )}

            {!loading && !error && saveResponse && (
              <>
                {saveResponse.saved && saveResponse.rank !== undefined && saveResponse.totalPlayers !== undefined && (
                  <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded p-1.5 text-center">
                    <div className="text-sm font-bold text-yellow-400">
                      Rank #{saveResponse.rank} / {saveResponse.totalPlayers}
                    </div>
                  </div>
                )}

                {!saveResponse.saved && (
                  <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded p-1.5 text-center">
                    <p className="text-blue-400 text-xs">
                      🔄 Replay - not counted
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons - Side by Side */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={handleShare}
              className="px-3 py-2 bg-green-500 hover:bg-green-500/90 active:bg-green-500/80 rounded-lg font-bold text-sm transition-colors"
            >
              💬 Share
            </button>
            <button
              onClick={onPlayAgain}
              className="px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 rounded-lg font-bold text-sm transition-colors"
            >
              🔄 Play Again
            </button>
          </div>

          {/* Photo Sources - Snappy Grid */}
          <div className="bg-card rounded-lg border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Photo Sources</span>
              <span className="text-xs text-muted-foreground">Tap to view</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {sources.map((source, index) => (
                <button
                  key={index}
                  type="button"
                  className="aspect-square bg-background border-2 border-border rounded-lg flex items-center justify-center hover:bg-primary/20 hover:border-primary active:scale-95 transition-all font-bold text-sm"
                  title={`View Round ${index + 1} source`}
                  onClick={() => navigateTo(source)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
