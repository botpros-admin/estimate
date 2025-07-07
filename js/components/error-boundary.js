/**
 * Error Boundary Component
 * Global error catching with user-friendly messages and recovery
 */

(function() {
    'use strict';

    const ErrorBoundary = {
        // Configuration
        config: {
            showErrorDetails: false,
            autoRecoveryDelay: 5000,
            maxRecoveryAttempts: 3,
            errorContainerId: 'global-error-container'
        },

        // Recovery attempts tracker
        recoveryAttempts: {},

        // Initialize error boundary
        init() {
            // Set up global error handlers
            this._setupGlobalHandlers();
            
            // Create error container element
            this._createErrorContainer();
            
            // Initialize logger if available
            if (window.ErrorLogger) {
                window.ErrorLogger.info('Error Boundary initialized');
            }
        },
        // Set up global error handlers
        _setupGlobalHandlers() {
            // Handle uncaught errors
            window.addEventListener('error', (event) => {
                this.handleError({
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error,
                    type: 'uncaught-error'
                });
                event.preventDefault();
            });

            // Handle promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError({
                    message: 'Unhandled Promise Rejection',
                    reason: event.reason,
                    promise: event.promise,
                    type: 'unhandled-rejection'
                });
                event.preventDefault();
            });
        },

        // Create error container element
        _createErrorContainer() {
            if (!document.getElementById(this.config.errorContainerId)) {
                const container = document.createElement('div');
                container.id = this.config.errorContainerId;
                container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    z-index: 9999;
                `;
                document.body.appendChild(container);
            }
        },
        // Main error handler
        handleError(errorInfo) {
            // Log the error
            if (window.ErrorLogger) {
                window.ErrorLogger.error(errorInfo.message || 'Unknown error', {
                    ...errorInfo,
                    timestamp: new Date().toISOString(),
                    url: window.location.href
                });
            }

            // Get recovery key for this error
            const recoveryKey = this._getRecoveryKey(errorInfo);
            
            // Check if we should attempt recovery
            if (this._shouldAttemptRecovery(recoveryKey)) {
                this._attemptRecovery(errorInfo, recoveryKey);
            } else {
                // Show error to user
                this._showErrorNotification(errorInfo);
            }
        },

        // Get recovery key for tracking attempts
        _getRecoveryKey(errorInfo) {
            return `${errorInfo.type || 'error'}_${errorInfo.message || 'unknown'}`.substring(0, 50);
        },

        // Check if recovery should be attempted
        _shouldAttemptRecovery(recoveryKey) {
            const attempts = this.recoveryAttempts[recoveryKey] || 0;
            return attempts < this.config.maxRecoveryAttempts;
        },