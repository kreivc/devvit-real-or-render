import React, { useState } from 'react';

interface ShareModalProps {
    gameDate: string;
    correct: number;
    totalTimeMs: number;
    rank: number | undefined;
    totalPlayers: number | undefined;
    isFirstPlay: boolean;
    onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    correct,
    totalTimeMs,
    rank,
    totalPlayers,
    isFirstPlay,
    onClose,
}) => {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Format time as MM:SS:mmm
    const formatTime = (timeMs: number): string => {
        const totalSeconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = timeMs % 1000;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/post-comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment: comment.trim(),
                    score: correct,
                    time: formatTime(totalTimeMs),
                    rank,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error posting comment:', err);
            setError('Failed to post comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-card/90 backdrop-blur-md rounded-lg border border-border max-w-md w-full p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {success ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">✅</div>
                        <h2 className="text-xl font-bold text-green-400">Comment Posted!</h2>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-bold">💬 Comment Your Results</h2>
                                <button
                                    onClick={onClose}
                                    className="text-muted-foreground hover:text-foreground text-2xl leading-none"
                                    disabled={isSubmitting}
                                >
                                    ×
                                </button>
                            </div>
                            {!isFirstPlay && (
                                <p className="text-xs text-yellow-400 bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded p-2">
                                    ℹ️ Sharing your first game score (replays don't count)
                                </p>
                            )}
                        </div>

                        <div className="bg-background rounded-lg p-3 mb-4 border border-border">
                            <div className="text-center mb-2">
                                <div className="text-2xl font-bold">{correct}/10</div>
                                <div className="text-xs text-muted-foreground">in {formatTime(totalTimeMs)}</div>
                            </div>
                            {rank && totalPlayers && (
                                <div className="text-center text-sm text-yellow-400">
                                    Rank #{rank} of {totalPlayers}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-2">
                                Your thoughts (optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="How did you find today's challenge?"
                                className="w-full bg-background border border-border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={4}
                                maxLength={500}
                                disabled={isSubmitting}
                            />
                            <div className="text-xs text-muted-foreground text-right mt-1">
                                {comment.length}/500
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded p-2 mb-4 text-center">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 bg-background border border-border hover:bg-background/90 active:bg-background/80 rounded-lg font-bold text-sm transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-500/90 active:bg-green-500/80 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
