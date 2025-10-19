import React from 'react';
import type { GameRound } from '../../shared/types/api';
import { GameImageButton } from './GameImageButton';

interface MobileGameScreenProps {
    currentRound: GameRound;
    leftImageUrl: string;
    rightImageUrl: string;
    selectedPosition: 'left' | 'right' | null;
    showFeedback: boolean;
    correctCount: number;
    incorrectCount: number;
    onImageClick: (position: 'left' | 'right') => void;
}

export const MobileGameScreen: React.FC<MobileGameScreenProps> = ({
    currentRound,
    leftImageUrl,
    rightImageUrl,
    selectedPosition,
    showFeedback,
    correctCount,
    incorrectCount,
    onImageClick,
}) => {
    return (
        <>
            {/* Mobile Layout: Header, Spacer for Magnifier, Middle Content, Bottom Section */}
            {/* Spacer for magnifier */}
            <div className="h-[20vh] flex-shrink-0"></div>

            {/* Middle Section: Question and Images */}
            <div className="flex-1 flex flex-col justify-start px-2 gap-1 mt-1.5">
                {/* Question and Instructions */}
                <div className="text-center">
                    <h2 className="text-lg">Which image is REAL?</h2>
                    <p className="text-muted-foreground text-xs">
                        Click on the photograph (not the AI-generated image)
                    </p>
                </div>

                {/* Images Side by Side */}
                <div className="flex-1 flex items-start justify-center mt-1.5">
                    <div className="grid grid-cols-2 gap-2 w-full max-w-5xl mx-auto">
                        {/* Left Image */}
                        <GameImageButton
                            imageUrl={leftImageUrl}
                            isSelected={selectedPosition === 'left'}
                            showFeedback={showFeedback && selectedPosition === 'left'}
                            isCorrect={currentRound.realImagePosition === 'left'}
                            disabled={showFeedback}
                            onSelect={() => onImageClick('left')}
                            isMobile={true}
                        />

                        {/* Right Image */}
                        <GameImageButton
                            imageUrl={rightImageUrl}
                            isSelected={selectedPosition === 'right'}
                            showFeedback={showFeedback && selectedPosition === 'right'}
                            isCorrect={currentRound.realImagePosition === 'right'}
                            disabled={showFeedback}
                            onSelect={() => onImageClick('right')}
                            isMobile={true}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Section: Score and Hint */}
            <div className="flex-shrink-0 mt-2">
                {/* Score Counters */}
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
                        💡 Drag to zoom • Tap to select
                    </p>
                </div>
            </div>
        </>
    );
};
