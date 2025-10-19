import { useState, useRef, useCallback, useEffect, RefObject } from 'react';

// Constants
const MAGNIFIER_SIZE_DESKTOP = 150; // px
const MAGNIFIER_SIZE_MOBILE = 120; // px (smaller for mobile)
const MAGNIFICATION = 2.5; // zoom level
const MOBILE_BREAKPOINT = 768; // px
const TAP_THRESHOLD_MS = 200; // max duration for tap

type UseMagnifierProps = {
  disabled: boolean;
  hasError: boolean;
  showFeedback: boolean;
  onSelect: () => void;
  isMobile: boolean;
};

type UseMagnifierReturn = {
  showMagnifier: boolean;
  magnifierPosition: { x: number; y: number };
  magnifierSize: number;
  imageRef: RefObject<HTMLDivElement | null>;
  imgElementRef: RefObject<HTMLImageElement | null>;
  isMobile: boolean;
  getMagnifierBackgroundPosition: () => {
    backgroundSize: string;
    backgroundPosition: string;
  };
  handlers: {
    onMouseEnter: () => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onClick: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
    onContextMenu: (e: React.MouseEvent | React.TouchEvent) => void;
  };
};

export function useMagnifier({
  disabled,
  hasError,
  showFeedback,
  onSelect,
  isMobile,
}: UseMagnifierProps): UseMagnifierReturn {
  // State management
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });


  // Refs
  const imageRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);

  // Touch tracking state
  const touchStartTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  // Mobile detection logic based on aspect ratio
  // If height > width, it's mobile (portrait orientation)
  // If width > height, it's desktop/PC (landscape orientation)


  // Get magnifier size based on device
  const getMagnifierSize = useCallback(() => {
    return isMobile ? MAGNIFIER_SIZE_MOBILE : MAGNIFIER_SIZE_DESKTOP;
  }, [isMobile]);

  // Calculate magnifier position without bounds checking (allow edge access)
  const calculateMagnifierPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!imageRef.current) return { x: 0, y: 0 };

      const rect = imageRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      return { x, y };
    },
    []
  );

  // Calculate background position for object-fit: cover
  const getMagnifierBackgroundPosition = useCallback(() => {
    if (!imageRef.current || !imgElementRef.current) {
      return { backgroundSize: '0px 0px', backgroundPosition: '0px 0px' };
    }

    const img = imgElementRef.current;
    const container = imageRef.current;

    // Check if image is loaded
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      return { backgroundSize: '0px 0px', backgroundPosition: '0px 0px' };
    }

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = containerWidth / containerHeight;

    let renderedWidth: number;
    let renderedHeight: number;
    let offsetX = 0;
    let offsetY = 0;

    // Calculate rendered dimensions for object-fit: cover
    if (imgAspect > containerAspect) {
      // Image is wider - height fills container
      renderedHeight = containerHeight;
      renderedWidth = renderedHeight * imgAspect;
      offsetX = (containerWidth - renderedWidth) / 2;
    } else {
      // Image is taller - width fills container
      renderedWidth = containerWidth;
      renderedHeight = renderedWidth / imgAspect;
      offsetY = (containerHeight - renderedHeight) / 2;
    }

    // Calculate magnified size
    const magnifiedWidth = renderedWidth * MAGNIFICATION;
    const magnifiedHeight = renderedHeight * MAGNIFICATION;

    // Calculate background position based on cursor position
    const x = magnifierPosition.x - offsetX;
    const y = magnifierPosition.y - offsetY;

    const bgX = (x / renderedWidth) * magnifiedWidth;
    const bgY = (y / renderedHeight) * magnifiedHeight;

    const magnifierSize = isMobile ? MAGNIFIER_SIZE_MOBILE : MAGNIFIER_SIZE_DESKTOP;

    return {
      backgroundSize: `${magnifiedWidth}px ${magnifiedHeight}px`,
      backgroundPosition: `-${bgX - magnifierSize / 2}px -${bgY - magnifierSize / 2}px`,
    };
  }, [magnifierPosition, isMobile]);

  // Mouse event handlers
  const handleMouseEnter = useCallback(() => {
    if (disabled || hasError || showFeedback) return;
    setShowMagnifier(true);
  }, [disabled, hasError, showFeedback]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || hasError || showFeedback) return;

      const pos = calculateMagnifierPosition(e.clientX, e.clientY);
      setMagnifierPosition(pos);
      setShowMagnifier(true);
    },
    [disabled, hasError, showFeedback, calculateMagnifierPosition]
  );

  const handleMouseLeave = useCallback(() => {
    setShowMagnifier(false);
  }, []);

  const handleClick = useCallback(() => {
    if (disabled || hasError || showFeedback) return;
    setShowMagnifier(false);
    onSelect();
  }, [disabled, hasError, showFeedback, onSelect]);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || hasError || showFeedback) return;

      const touch = e.touches[0];
      if (!touch) return;

      touchStartTimeRef.current = Date.now();
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      hasMovedRef.current = false;

      const pos = calculateMagnifierPosition(touch.clientX, touch.clientY);
      setMagnifierPosition(pos);
    },
    [disabled, hasError, showFeedback, calculateMagnifierPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || hasError || showFeedback) return;

      const touch = e.touches[0];
      if (!touch) return;

      // Track movement
      const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);

      if (deltaX > 5 || deltaY > 5) {
        hasMovedRef.current = true;
      }

      const pos = calculateMagnifierPosition(touch.clientX, touch.clientY);
      setMagnifierPosition(pos);
      setShowMagnifier(true);
    },
    [disabled, hasError, showFeedback, calculateMagnifierPosition]
  );

  const handleTouchEnd = useCallback(() => {
    if (disabled || hasError || showFeedback) return;

    const touchDuration = Date.now() - touchStartTimeRef.current;
    const isTap = touchDuration < TAP_THRESHOLD_MS && !hasMovedRef.current;

    setShowMagnifier(false);

    // Only trigger selection on quick tap without movement
    if (isTap) {
      onSelect();
    }

    // Reset tracking
    touchStartTimeRef.current = 0;
    hasMovedRef.current = false;
  }, [disabled, hasError, showFeedback, onSelect]);

  const handleTouchCancel = useCallback(() => {
    setShowMagnifier(false);
    touchStartTimeRef.current = 0;
    hasMovedRef.current = false;
  }, []);

  // Context menu prevention
  const handleContextMenu = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  }, []);

  return {
    showMagnifier,
    magnifierPosition,
    magnifierSize: getMagnifierSize(),
    imageRef,
    imgElementRef,
    isMobile,
    getMagnifierBackgroundPosition,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onClick: handleClick,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      onContextMenu: handleContextMenu,
    },
  };
}
