// More comprehensive error debugging
(function() {
    'use strict';
    
    console.log('🔍 Enhanced error debugging started...');
    
    // Override the error handler's showFallbackMessage to see what's triggering it
    if (window.ErrorHandler && window.ErrorHandler.showFallbackMessage) {
        const originalShowFallback = window.ErrorHandler.showFallbackMessage.bind(window.ErrorHandler);
        window.ErrorHandler.showFallbackMessage = function(message) {
            console.error('🚨 showFallbackMessage called with:', message);
            console.trace('Stack trace:');
            return originalShowFallback(message);
        };
    }
    
    // Monitor Google Maps callbacks
    if (window.google && window.google.maps && window.google.maps.event) {
        const originalTrigger = window.google.maps.event.trigger;
        window.google.maps.event.trigger = function(...args) {
            console.log('📍 Google Maps event triggered:', args[1]); // args[1] is the event name
            try {
                return originalTrigger.apply(this, args);
            } catch (error) {
                console.error('❌ Error in Google Maps event:', error);
                throw error;
            }
        };
    }
    
    // Wrap setTimeout to catch async errors
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(fn, delay, ...args) {
        const wrappedFn = function() {
            try {
                if (typeof fn === 'string') {
                    eval(fn);
                } else {
                    fn.apply(this, args);
                }
            } catch (error) {
                console.error('❌ Error in setTimeout callback:', error);
                throw error;
            }
        };
        return originalSetTimeout.call(this, wrappedFn, delay);
    };
    
    console.log('✅ Enhanced error debugging ready');
})();
