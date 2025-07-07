// hooks/useMobileDetection.js
// Detect mobile devices and touch capabilities for optimized UI/UX

/**
 * Mobile detection hook for responsive behavior
 * Detects touch capability, device type, and screen size
 * Provides utilities for mobile-specific features
 */

function useMobileDetection() {
  // Check if running in browser
  const isBrowser = typeof window !== 'undefined';
  
  // Detect touch capability
  const hasTouch = isBrowser && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
  
  // Detect mobile user agent
  const isMobileUserAgent = isBrowser && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Detect screen size (mobile if less than 768px)
  const isMobileScreen = isBrowser && window.innerWidth < 768;
  
  // Detect iOS specifically for special handling
  const isIOS = isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // Detect Android specifically
  const isAndroid = isBrowser && /Android/.test(navigator.userAgent);
  
  // Combined mobile detection
  const isMobile = hasTouch && (isMobileUserAgent || isMobileScreen);
  
  // Detect tablet (has touch but larger screen)
  const isTablet = hasTouch && !isMobileScreen && isBrowser && window.innerWidth < 1024;
  
  // Get viewport dimensions
  const getViewport = () => {
    if (!isBrowser) return { width: 0, height: 0 };
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };
  
  // Check if device supports haptic feedback
  const supportsHaptics = isBrowser && 'vibrate' in navigator;
  
  // Trigger haptic feedback
  const triggerHaptic = (pattern = 10) => {
    if (supportsHaptics) {
      navigator.vibrate(pattern);
    }
  };
  
  // Lock/unlock scroll (useful for modals on mobile)
  const lockScroll = () => {
    if (!isBrowser) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
  };
  
  const unlockScroll = () => {
    if (!isBrowser) return;
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  };
  
  // Handle safe area insets (notch, home indicator)
  const getSafeAreaInsets = () => {
    if (!isBrowser) return { top: 0, right: 0, bottom: 0, left: 0 };
    
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0')
    };
  };
  
  // Detect orientation
  const getOrientation = () => {
    if (!isBrowser) return 'portrait';
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  };
  
  // Listen for orientation changes
  const onOrientationChange = (callback) => {
    if (!isBrowser) return () => {};
    
    const handleChange = () => {
      callback(getOrientation());
    };
    
    window.addEventListener('orientationchange', handleChange);
    window.addEventListener('resize', handleChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleChange);
      window.removeEventListener('resize', handleChange);
    };
  };
  
  // Detect if keyboard is visible (approximate)
  const isKeyboardVisible = () => {
    if (!isBrowser || !isMobile) return false;
    
    // On mobile, viewport height shrinks when keyboard appears
    const threshold = 100;
    const windowHeight = window.innerHeight;
    const screenHeight = screen.height;
    
    return (screenHeight - windowHeight) > threshold;
  };
  
  // Get appropriate input mode for mobile
  const getInputMode = (type) => {
    const inputModes = {
      number: 'numeric',
      tel: 'tel',
      email: 'email',
      url: 'url',
      search: 'search',
      decimal: 'decimal'
    };
    return inputModes[type] || 'text';
  };
  
  // Disable bounce scrolling on iOS
  const disableBounceScroll = (element) => {
    if (!isIOS || !element) return;
    
    let startY = 0;
    
    const handleTouchStart = (e) => {
      startY = e.touches[0].pageY;
    };
    
    const handleTouchMove = (e) => {
      const el = e.currentTarget;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const height = el.clientHeight;
      const deltaY = startY - e.touches[0].pageY;
      
      if ((deltaY < 0 && scrollTop === 0) || 
          (deltaY > 0 && scrollTop + height >= scrollHeight)) {
        e.preventDefault();
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  };
  
  return {
    // Detection flags
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    hasTouch,
    isIOS,
    isAndroid,
    
    // Capabilities
    supportsHaptics,
    
    // Methods
    triggerHaptic,
    lockScroll,
    unlockScroll,
    getSafeAreaInsets,
    getOrientation,
    onOrientationChange,
    isKeyboardVisible,
    getInputMode,
    disableBounceScroll,
    getViewport
  };
}

// Make hook available globally
if (typeof window !== 'undefined') {
  window.useMobileDetection = useMobileDetection;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = useMobileDetection;
}