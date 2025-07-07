// Centralized Error Handling and Logging System
(function() {
  'use strict';

  // Error severity levels
  const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4
  };

  // Error categories
  const ErrorCategory = {
    VALIDATION: 'validation',
    NETWORK: 'network',
    STORAGE: 'storage',
    CALCULATION: 'calculation',
    UI: 'ui',
    SYSTEM: 'system',
    BITRIX: 'bitrix',
    PDF: 'pdf'
  };

  class ErrorHandler {
    constructor() {
      this.errorLog = [];
      this.maxLogSize = 100;
      this.logLevel = LogLevel.WARN; // Production default
      this.errorCallbacks = new Map();
      this.isInitialized = false;
      
      // User-friendly error messages
      this.userMessages = {
        [ErrorCategory.NETWORK]: 'Connection error. Please check your internet connection.',
        [ErrorCategory.STORAGE]: 'Unable to save data. Please check browser storage settings.',
        [ErrorCategory.VALIDATION]: 'Please check the highlighted fields and try again.',
        [ErrorCategory.CALCULATION]: 'Calculation error. Please verify your input values.',
        [ErrorCategory.UI]: 'Display error. Please refresh the page.',
        [ErrorCategory.SYSTEM]: 'System error. Please try again or contact support.',
        [ErrorCategory.BITRIX]: 'Unable to load catalog data. Please try again later.',
        [ErrorCategory.PDF]: 'PDF generation failed. Please try again.'
      };
    }

    init() {
      if (this.isInitialized) return;
      
      // Set up global error handlers
      window.addEventListener('error', (event) => {
        console.log('🚨 Window error event caught:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        });
        this.handleError(new Error(event.message), {
          category: ErrorCategory.SYSTEM,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(new Error(event.reason), {
          category: ErrorCategory.SYSTEM,
          context: { promise: true }
        });
      });

      this.isInitialized = true;
    }

    // Main error handling method
    handleError(error, options = {}) {
      const {
        category = ErrorCategory.SYSTEM,
        level = LogLevel.ERROR,
        context = {},
        silent = false,
        recoverable = true
      } = options;

      // Log the actual error for debugging
      console.log('🚨 ErrorHandler.handleError called with:', {
        errorMessage: error.message,
        errorStack: error.stack,
        category: category,
        context: context
      });

      const errorEntry = {
        timestamp: new Date().toISOString(),
        message: error.message || 'Unknown error',
        stack: error.stack,
        category,
        level,
        context,
        recoverable
      };

      // Add to log
      this.addToLog(errorEntry);

      // Execute callbacks
      this.executeCallbacks(errorEntry);

      // Show user message if not silent
      if (!silent && level >= LogLevel.ERROR) {
        this.showUserMessage(category, error.message);
      }

      // Return error ID for tracking
      return errorEntry.timestamp;
    }

    // Log management
    addToLog(entry) {
      this.errorLog.push(entry);
      
      // Maintain log size limit
      if (this.errorLog.length > this.maxLogSize) {
        this.errorLog.shift();
      }

      // Store critical errors in localStorage for debugging
      if (entry.level >= LogLevel.ERROR) {
        try {
          const criticalErrors = this.getCriticalErrors();
          criticalErrors.push(entry);
          
          // Keep only last 10 critical errors
          if (criticalErrors.length > 10) {
            criticalErrors.shift();
          }
          
          localStorage.setItem('paintEstimator_criticalErrors', JSON.stringify(criticalErrors));
        } catch (e) {
          // Fail silently if localStorage is not available
        }
      }
    }

    getCriticalErrors() {
      try {
        const stored = localStorage.getItem('paintEstimator_criticalErrors');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }

    clearCriticalErrors() {
      try {
        localStorage.removeItem('paintEstimator_criticalErrors');
      } catch {
        // Fail silently
      }
    }

    // User messaging
    showUserMessage(category, technicalMessage) {
      const userMessage = this.userMessages[category] || 'An unexpected error occurred.';
      
      // Check if we have a toast/notification system
      if (window.showNotification) {
        window.showNotification(userMessage, 'error');
      } else {
        // Fallback to simple alert replacement
        this.showFallbackMessage(userMessage);
      }
    }

    showFallbackMessage(message) {
      // Create a temporary message element
      const messageEl = document.createElement('div');
      messageEl.className = 'error-message-overlay';
      messageEl.innerHTML = `
        <div class="error-message-content">
          <span class="error-icon">⚠️</span>
          <span class="error-text">${message}</span>
          <button class="error-dismiss" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
      `;
      
      // Add styles if not already present
      if (!document.getElementById('error-handler-styles')) {
        const style = document.createElement('style');
        style.id = 'error-handler-styles';
        style.textContent = `
          .error-message-overlay {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
          }
          .error-message-content {
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          .error-icon { font-size: 20px; }
          .error-text { flex: 1; color: #c33; }
          .error-dismiss {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #c33;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(messageEl);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (messageEl.parentElement) {
          messageEl.remove();
        }
      }, 5000);
    }

    // Callback system for error monitoring
    onError(callback, category = null) {
      const id = Date.now().toString();
      this.errorCallbacks.set(id, { callback, category });
      return () => this.errorCallbacks.delete(id);
    }

    executeCallbacks(errorEntry) {
      this.errorCallbacks.forEach(({ callback, category }) => {
        if (!category || category === errorEntry.category) {
          try {
            callback(errorEntry);
          } catch (e) {
            // Prevent callback errors from causing infinite loops
          }
        }
      });
    }

    // Logging methods for different levels
    debug(message, context = {}) {
      if (this.logLevel <= LogLevel.DEBUG) {
        this.log(LogLevel.DEBUG, message, context);
      }
    }

    info(message, context = {}) {
      if (this.logLevel <= LogLevel.INFO) {
        this.log(LogLevel.INFO, message, context);
      }
    }

    warn(message, context = {}) {
      if (this.logLevel <= LogLevel.WARN) {
        this.log(LogLevel.WARN, message, context);
      }
    }

    error(message, context = {}) {
      this.log(LogLevel.ERROR, message, context);
    }

    critical(message, context = {}) {
      this.log(LogLevel.CRITICAL, message, context);
    }

    log(level, message, context) {
      const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context
      };
      
      this.addToLog(entry);
      
      // In development, output to console
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
        const prefix = `[${levelNames[level]}]`;
        
        switch (level) {
          case LogLevel.ERROR:
          case LogLevel.CRITICAL:
            console.error(prefix, message, context);
            break;
          case LogLevel.WARN:
            console.warn(prefix, message, context);
            break;
          default:
            console.log(prefix, message, context);
        }
      }
    }

    // Error recovery helpers
    async tryWithFallback(operation, fallback, options = {}) {
      try {
        return await operation();
      } catch (error) {
        this.handleError(error, options);
        if (fallback) {
          return await fallback(error);
        }
        throw error;
      }
    }

    // Get error report for debugging
    getErrorReport() {
      return {
        errors: this.errorLog,
        criticalErrors: this.getCriticalErrors(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
    }

    // Clear all logs
    clearLogs() {
      this.errorLog = [];
      this.clearCriticalErrors();
    }
  }

  // Create singleton instance
  const errorHandler = new ErrorHandler();
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => errorHandler.init());
  } else {
    errorHandler.init();
  }

  // Expose globally
  window.ErrorHandler = errorHandler;
  window.LogLevel = LogLevel;
  window.ErrorCategory = ErrorCategory;

})();