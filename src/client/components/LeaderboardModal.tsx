import React, { useEffect, useState } from 'react';
import type { LeaderboardResponse } from '../../shared/types/api';

interface LeaderboardModalProps {
    gameDate: string;
    userId: string;
    onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
    gameDate,
    userId,
    onClose,
}) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/leaderboard?date=${gameDate}&userId=${encodeURIComponent(userId)}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }

                const data: LeaderboardResponse = await response.json();
                setLeaderboard(data);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError('Failed to load leaderboard');
            } finally {
                setLoading(false);
            }
        };

        void fetchLeaderboard();
    }, [gameDate, userId]);

    const formatTime = (timeMs: number): string => {
        const totalSeconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getRankIcon = (rank: number): string => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '🏅';
    };

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-card/90 backdrop-blur-md rounded-lg border border-border max-w-sm w-full p-4 max-h-[70vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">🏆 Leaderboard</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-pulse text-muted-foreground">Loading...</div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded p-3 text-center">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {!loading && !error && leaderboard && (
                    <>
                        <div className="text-center text-xs text-muted-foreground mb-4">
                            {leaderboard.totalPlayers} player{leaderboard.totalPlayers !== 1 ? 's' : ''} today
                        </div>

                        {/* Top 10 Players */}
                        <div className="space-y-2 mb-4">
                            {leaderboard.topPlayers.map((player) => {
                                const isCurrentUser = player.username === userId || `t2_${player.username}` === userId;
                                return (
                                    <div
                                        key={player.rank}
                                        className={`flex items-center gap-3 p-2 rounded-lg ${isCurrentUser
                                            ? 'bg-primary/20 border border-primary'
                                            : 'bg-background/50 border border-border'
                                            }`}
                                    >
                                        <div className="text-xl w-8 text-center">{getRankIcon(player.rank)}</div>
                                        <img
                                            src={`https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${(player.rank % 8) + 1}.png`}
                                            alt=""
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate">
                                                {player.username}
                                                {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {player.correct}/10 • {formatTime(player.timeMs)}
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-yellow-400">#{player.rank}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Current User Rank (if not in top 10) */}
                        {leaderboard.userRank && leaderboard.userRank > 10 && (
                            <>
                                <div className="border-t border-border my-3"></div>
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/20 border border-primary">
                                    <div className="text-xl w-8 text-center">{getRankIcon(leaderboard.userRank)}</div>
                                    <img
                                        src={`https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${(leaderboard.userRank % 8) + 1}.png`}
                                        alt=""
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm truncate">
                                            You
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {leaderboard.topPlayers.find(p => p.username === userId)?.correct || 0}/10
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-yellow-400">#{leaderboard.userRank}</div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
