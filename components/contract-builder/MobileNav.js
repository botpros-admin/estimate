import React, { useState, useEffect } from 'react';
import { useMobileDetection } from '../../hooks/useMobileDetection';
import styles from '../../styles/contract-builder/MobileNav.module.css';

const MobileNav = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack, 
  onSave,
  canGoNext = true,
  canGoBack = true,
  showSave = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const { 
    isMobile, 
    hapticFeedback,
    isKeyboardVisible,
    safeAreaInsets 
  } = useMobileDetection();

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll);
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [lastScrollY, isMobile]);
  // Hide when keyboard is visible
  useEffect(() => {
    if (isKeyboardVisible) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [isKeyboardVisible]);

  const handleBack = () => {
    if (!canGoBack || currentStep === 0) return;
    hapticFeedback('light');
    onBack();
  };

  const handleNext = () => {
    if (!canGoNext || currentStep === totalSteps - 1) return;
    hapticFeedback('light');
    onNext();
  };

  const handleSave = () => {
    hapticFeedback('medium');
    onSave();
  };

  // Don't render on desktop
  if (!isMobile) return null;

  const navStyle = {
    paddingBottom: safeAreaInsets.bottom || 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
  };

  return (
    <nav 
      className={`${styles.mobileNav} ${className}`} 
      style={navStyle}
      role="navigation"
      aria-label="Step navigation"
    >
      <div className={styles.navContent}>
        <button
          className={`${styles.navButton} ${styles.backButton}`}
          onClick={handleBack}
          disabled={!canGoBack || currentStep === 0}
          aria-label="Go to previous step"
        >
          <span className={styles.buttonIcon}>←</span>
          <span className={styles.buttonText}>Back</span>
        </button>
        {showSave && (
          <button
            className={`${styles.navButton} ${styles.saveButton}`}
            onClick={handleSave}
            aria-label="Save progress"
          >
            <span className={styles.buttonIcon}>💾</span>
            <span className={styles.buttonText}>Save</span>
          </button>
        )}

        <button
          className={`${styles.navButton} ${styles.nextButton} ${canGoNext ? styles.primary : ''}`}
          onClick={handleNext}
          disabled={!canGoNext || currentStep === totalSteps - 1}
          aria-label="Go to next step"
        >
          <span className={styles.buttonText}>
            {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
          </span>
          <span className={styles.buttonIcon}>→</span>
        </button>
      </div>
    </nav>
  );
};

// Utility function for throttling
function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

export default MobileNav;