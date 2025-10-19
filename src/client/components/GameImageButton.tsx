import { createPortal } from 'react-dom';
import { useMagnifier } from '../hooks/useMagnifier';

type GameImageButtonProps = {
  imageUrl: string;
  isSelected: boolean;
  showFeedback: boolean;
  isCorrect?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  isMobile: boolean;
};

export function GameImageButton({
  imageUrl,
  isSelected,
  showFeedback,
  isCorrect = false,
  hasError = false,
  disabled = false,
  onSelect,
  isMobile,
}: GameImageButtonProps) {
  const {
    showMagnifier,
    magnifierPosition,
    magnifierSize,
    imageRef,
    imgElementRef,
    getMagnifierBackgroundPosition,
    handlers,
  } = useMagnifier({
    disabled,
    hasError,
    showFeedback,
    onSelect,
    isMobile,
  });

  // Magnifier element with circular styling
  const magnifierElement = showMagnifier && (
    <div
      className="pointer-events-none absolute z-50 rounded-full border-4 border-white shadow-2xl"
      style={{
        width: `${magnifierSize}px`,
        height: `${magnifierSize}px`,
        left: isMobile ? '50%' : `${magnifierPosition.x}px`,
        top: isMobile ? '5%' : `${magnifierPosition.y}px`,
        transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
        backgroundImage: `url(${imageUrl})`,
        backgroundRepeat: 'no-repeat',
        ...getMagnifierBackgroundPosition(),
      }}
    />
  );

  return (
    <>
      <button
        type="button"
        className={`
          relative overflow-hidden rounded-lg transition-all w-full
          min-h-[44px] min-w-[44px]
          ${isSelected ? 'ring-4 ring-primary' : 'ring-2 ring-border'}
          ${disabled || hasError ? 'cursor-not-allowed' : 'cursor-pointer hover:ring-primary/50 active:ring-primary/85'}
        `}
        style={{
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
        }}
        disabled={disabled || hasError}
        {...handlers}
      >
        <div
          ref={imageRef}
          className="relative aspect-square w-full select-none"
          style={{ touchAction: 'none' }}
        >
          <img
            ref={imgElementRef}
            src={imageUrl}
            alt="Game option"
            className="h-full w-full object-cover"
            draggable={false}
          />

          {/* Desktop: inline magnifier */}
          {!isMobile && magnifierElement}

          {/* Feedback overlay for correct/incorrect states */}
          {showFeedback && (
            <div
              className={`
                absolute inset-0 flex items-center justify-center font-bold text-2xl text-white md:text-4xl
                ${isCorrect ? 'bg-green-500/90' : 'bg-red-500/90'}
              `}
            >
              {isCorrect ? '✓ Correct!' : '✗ Wrong'}
            </div>
          )}

          {/* Error state overlay */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
              <div className="text-center text-muted-foreground">
                <div className="text-2xl">⚠️</div>
                <div className="text-sm">Failed to load</div>
              </div>
            </div>
          )}
        </div>
      </button>

      {/* Mobile: portal magnifier at top center */}
      {isMobile && showMagnifier && createPortal(magnifierElement, document.body)}
    </>
  );
}
