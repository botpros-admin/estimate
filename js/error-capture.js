// Enhanced error capture script
(function() {
    'use strict';
    
    console.log('🔍 Enhanced error capture started...');
    
    // Capture all errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
        console.log('❌ CONSOLE ERROR:', ...args);
        console.trace();
        return originalConsoleError.apply(console, args);
    };
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.log('🚨 UNHANDLED PROMISE REJECTION:');
        console.log('Reason:', event.reason);
        console.log('Promise:', event.promise);
        console.trace();
    });
    
    // Capture all errors
    window.addEventListener('error', (event) => {
        console.log('🚨 WINDOW ERROR EVENT:');
        console.log('Message:', event.message);
        console.log('Source:', event.filename);
        console.log('Line:', event.lineno);
        console.log('Column:', event.colno);
        console.log('Error object:', event.error);
        console.trace();
    });
    
    console.log('✅ Error capture ready');
})();
