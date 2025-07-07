import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useMobileDetection } from '../../hooks/useMobileDetection';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import styles from '../../styles/contract-builder/StepContainer.module.css';

const StepContainer = ({ 
  children, 
  currentStep, 
  onStepChange, 
  totalSteps,
  enableSwipe = true,
  className = ''
}) => {
  const containerRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const animationFrameRef = useRef(null);
  
  const { 
    isMobile, 
    isTouchDevice, 
    hapticFeedback, 
    preventIOSBounce 
  } = useMobileDetection();

  // Prevent iOS bounce when at edges
  useEffect(() => {
    if (isMobile && containerRef.current) {
      const cleanup = preventIOSBounce(containerRef.current);
      return cleanup;
    }
  }, [isMobile, preventIOSBounce]);

  // Handle swipe navigation
  const handleSwipeLeft = useCallback(() => {
    if (currentStep < totalSteps - 1 && !isTransitioning) {
      hapticFeedback('light');
      setIsTransitioning(true);
      onStepChange(currentStep + 1);
    }
  }, [currentStep, totalSteps, isTransitioning, onStepChange, hapticFeedback]);

  const handleSwipeRight = useCallback(() => {
    if (currentStep > 0 && !isTransitioning) {
      hapticFeedback('light');
      setIsTransitioning(true);
      onStepChange(currentStep - 1);
    }
  }, [currentStep, isTransitioning, onStepChange, hapticFeedback]);

  // Custom swipe tracking for real-time animation
  const trackSwipeProgress = useCallback((deltaX) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      // Apply boundaries
      const maxOffset = window.innerWidth * 0.4;
      const boundedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
      
      // Apply resistance at boundaries
      if ((currentStep === 0 && deltaX > 0) || 
          (currentStep === totalSteps - 1 && deltaX < 0)) {
        setSwipeOffset(boundedOffset * 0.3);
      } else {
        setSwipeOffset(boundedOffset);
      }
    });
  }, [currentStep, totalSteps]);

  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    velocity: 0.3,
    enabled: enableSwipe && !isTransitioning
  });

  // Enhanced touch handlers for real-time tracking
  const enhancedHandlers = {
    ...swipeHandlers,
    onTouchMove: (e) => {
      swipeHandlers.onTouchMove(e);
      
      // Track real-time swipe progress
      const touch = e.touches[0];
      const startX = e.target._touchStartX || touch.clientX;
      e.target._touchStartX = e.target._touchStartX || touch.clientX;
      const deltaX = touch.clientX - startX;
      trackSwipeProgress(deltaX);
    },
    onTouchEnd: (e) => {
      swipeHandlers.onTouchEnd(e);
      
      // Spring back animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setSwipeOffset(0);
      delete e.target._touchStartX;
    },
    onMouseMove: (e) => {
      swipeHandlers.onMouseMove(e);
      
      // Track real-time swipe progress for mouse
      if (e.buttons === 1) { // Left mouse button is down
        const startX = e.target._mouseStartX || e.clientX;
        e.target._mouseStartX = e.target._mouseStartX || e.clientX;
        const deltaX = e.clientX - startX;
        trackSwipeProgress(deltaX);
      }
    },
    onMouseUp: (e) => {
      swipeHandlers.onMouseUp(e);
      
      // Spring back animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setSwipeOffset(0);
      delete e.target._mouseStartX;
    }
  };

  // Reset transition flag after animation
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!enableSwipe || isTransitioning) return;
      
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        setIsTransitioning(true);
        onStepChange(currentStep - 1);
      } else if (e.key === 'ArrowRight' && currentStep < totalSteps - 1) {
        setIsTransitioning(true);
        onStepChange(currentStep + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableSwipe, isTransitioning, currentStep, totalSteps, onStepChange]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.stepContainer} ${className} ${isTransitioning ? styles.transitioning : ''}`}
      {...enhancedHandlers}
      role="region"
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
      style={{
        '--swipe-offset': `${swipeOffset}px`
      }}
    >
      <div className={styles.stepContent}>
        {children}
      </div>
      
      {/* Visual swipe indicators */}
      {enableSwipe && isMobile && (
        <>
          {currentStep > 0 && (
            <div className={`${styles.swipeIndicator} ${styles.swipeIndicatorLeft}`}>
              <span className={styles.swipeArrow}>‹</span>
            </div>
          )}
          {currentStep < totalSteps - 1 && (
            <div className={`${styles.swipeIndicator} ${styles.swipeIndicatorRight}`}>
              <span className={styles.swipeArrow}>›</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StepContainer;
