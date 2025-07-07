import { useRef, useCallback } from 'react';

/**
 * Hook for handling swipe navigation gestures
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback for left swipe
 * @param {Function} options.onSwipeRight - Callback for right swipe
 * @param {number} options.threshold - Minimum distance for swipe (default: 50px)
 * @param {number} options.velocity - Minimum velocity for swipe (default: 0.3)
 * @param {boolean} options.enabled - Enable/disable swipe handling (default: true)
 */
export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  velocity = 0.3,
  enabled = true
} = {}) {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchStartTime = useRef(null);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;

    const touch = e.touches?.[0] || e;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    isSwiping.current = false;
  }, [enabled]);

  const handleTouchMove = useCallback((e) => {
    if (!enabled || touchStartX.current === null) return;

    const touch = e.touches?.[0] || e;
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Determine if horizontal swipe (prevent vertical scrolling interference)
    if (!isSwiping.current && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping.current = true;
      e.preventDefault();
    }

    // Continue preventing default if swiping
    if (isSwiping.current) {
      e.preventDefault();
    }
  }, [enabled]);

  const handleTouchEnd = useCallback((e) => {
    if (!enabled || touchStartX.current === null || !isSwiping.current) {
      // Reset refs
      touchStartX.current = null;
      touchStartY.current = null;
      touchStartTime.current = null;
      isSwiping.current = false;
      return;
    }

    const touch = e.changedTouches?.[0] || e;
    const deltaX = touch.clientX - touchStartX.current;
    const deltaTime = Date.now() - touchStartTime.current;
    const swipeVelocity = Math.abs(deltaX) / deltaTime;

    // Check if swipe meets threshold and velocity requirements
    if (Math.abs(deltaX) >= threshold || swipeVelocity >= velocity) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset refs
    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
    isSwiping.current = false;
  }, [enabled, threshold, velocity, onSwipeLeft, onSwipeRight]);

  // Support both touch and mouse events
  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleTouchStart,
    onMouseMove: (e) => {
      if (touchStartX.current !== null) {
        handleTouchMove(e);
      }
    },
    onMouseUp: handleTouchEnd,
    onMouseLeave: handleTouchEnd
  };

  return handlers;
}

export default useSwipeNavigation;
