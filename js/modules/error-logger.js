/**
 * Error Logger Module
 * Centralized logging system without console.log statements
 * Stores logs in localStorage with export capabilities
 */

(function() {
    'use strict';

    const ErrorLogger = {
        // Configuration
        config: {
            maxLogs: 1000,
            storageKey: 'paintEstimator_errorLogs',
            debugMode: false,
            enabledLevels: ['ERROR', 'WARN', 'INFO', 'DEBUG']
        },

        // Log levels
        levels: {
            ERROR: 'ERROR',
            WARN: 'WARN',
            INFO: 'INFO',
            DEBUG: 'DEBUG'
        },

        // Initialize the logger
        init() {
            // Check if logs exist in storage
            if (!localStorage.getItem(this.config.storageKey)) {
                localStorage.setItem(this.config.storageKey, JSON.stringify([]));
            }
            
            // Set debug mode from localStorage if available
            const savedDebugMode = localStorage.getItem('paintEstimator_debugMode');
            if (savedDebugMode !== null) {
                this.config.debugMode = savedDebugMode === 'true';
            }
        },

        // Main logging function
        log(level, message, context = {}) {
            if (!this.config.enabledLevels.includes(level)) {
                return;
            }

            const logEntry = {
                timestamp: new Date().toISOString(),
                level: level,
                message: message,
                context: context,
                url: window.location.href,
                userAgent: navigator.userAgent
            };

            // Add to storage
            this._addToStorage(logEntry);

            // If debug mode is enabled, also display in a custom debug panel
            if (this.config.debugMode) {
                this._updateDebugPanel(logEntry);
            }

            // For errors, also track in a separate error array
            if (level === this.levels.ERROR) {
                this._trackError(logEntry);
            }
        },
        // Helper methods
        error(message, context = {}) {
            this.log(this.levels.ERROR, message, context);
        },

        warn(message, context = {}) {
            this.log(this.levels.WARN, message, context);
        },

        info(message, context = {}) {
            this.log(this.levels.INFO, message, context);
        },

        debug(message, context = {}) {
            this.log(this.levels.DEBUG, message, context);
        },

        // Add log entry to storage
        _addToStorage(logEntry) {
            try {
                const logs = JSON.parse(localStorage.getItem(this.config.storageKey) || '[]');
                logs.push(logEntry);

                // Trim logs if exceeding max limit
                if (logs.length > this.config.maxLogs) {
                    logs.splice(0, logs.length - this.config.maxLogs);
                }

                localStorage.setItem(this.config.storageKey, JSON.stringify(logs));
            } catch (e) {
                // If localStorage is full, remove oldest logs
                this._clearOldestLogs();
            }
        },
        // Clear oldest logs when storage is full
        _clearOldestLogs() {
            try {
                const logs = JSON.parse(localStorage.getItem(this.config.storageKey) || '[]');
                // Remove first 100 logs
                logs.splice(0, 100);
                localStorage.setItem(this.config.storageKey, JSON.stringify(logs));
            } catch (e) {
                // If still failing, clear all logs
                localStorage.setItem(this.config.storageKey, JSON.stringify([]));
            }
        },

        // Track errors separately for quick access
        _trackError(logEntry) {
            const errorKey = 'paintEstimator_recentErrors';
            try {
                const errors = JSON.parse(localStorage.getItem(errorKey) || '[]');
                errors.push({
                    timestamp: logEntry.timestamp,
                    message: logEntry.message,
                    context: logEntry.context
                });
                
                // Keep only last 50 errors
                if (errors.length > 50) {
                    errors.splice(0, errors.length - 50);
                }
                
                localStorage.setItem(errorKey, JSON.stringify(errors));
            } catch (e) {
                // Silent fail for error tracking
            }
        },
        // Update debug panel if in debug mode
        _updateDebugPanel(logEntry) {
            if (!document.getElementById('error-logger-debug-panel')) {
                this._createDebugPanel();
            }

            const panel = document.getElementById('error-logger-debug-content');
            if (panel) {
                const logElement = document.createElement('div');
                logElement.className = `log-entry log-${logEntry.level.toLowerCase()}`;
                logElement.innerHTML = `
                    <span class="log-time">${new Date(logEntry.timestamp).toLocaleTimeString()}</span>
                    <span class="log-level">[${logEntry.level}]</span>
                    <span class="log-message">${this._escapeHtml(logEntry.message)}</span>
                    ${Object.keys(logEntry.context).length > 0 ? 
                        `<pre class="log-context">${this._escapeHtml(JSON.stringify(logEntry.context, null, 2))}</pre>` : 
                        ''}
                `;
                
                panel.insertBefore(logElement, panel.firstChild);
                
                // Keep only last 100 entries in panel
                while (panel.children.length > 100) {
                    panel.removeChild(panel.lastChild);
                }
            }
        },

        // Create debug panel UI
        _createDebugPanel() {
            const panel = document.createElement('div');
            panel.id = 'error-logger-debug-panel';
            panel.innerHTML = `
                <style>
                    #error-logger-debug-panel {
                        position: fixed;
                        bottom: 0;
                        right: 0;
                        width: 400px;
                        max-height: 300px;
                        background: #1e1e1e;
                        color: #fff;
                        border: 1px solid #444;
                        border-radius: 4px 4px 0 0;
                        z-index: 10000;
                        font-family: monospace;
                        font-size: 12px;
                        display: ${this.config.debugMode ? 'block' : 'none'};
                    }
                    #error-logger-debug-header {
                        background: #2d2d2d;
                        padding: 8px;
                        border-bottom: 1px solid #444;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    #error-logger-debug-content {
                        max-height: 250px;
                        overflow-y: auto;
                        padding: 8px;
                    }
                    .log-entry {
                        margin-bottom: 8px;
                        padding: 4px;
                        border-radius: 2px;
                    }
                    .log-entry.log-error {
                        background: rgba(255, 0, 0, 0.1);
                        border-left: 3px solid #ff4444;
                    }
                    .log-entry.log-warn {
                        background: rgba(255, 165, 0, 0.1);
                        border-left: 3px solid #ffa500;
                    }
                    .log-entry.log-info {
                        background: rgba(0, 123, 255, 0.1);
                        border-left: 3px solid #007bff;
                    }
                    .log-entry.log-debug {
                        background: rgba(128, 128, 128, 0.1);
                        border-left: 3px solid #808080;
                    }
                    .log-time {
                        color: #888;
                        margin-right: 8px;
                    }
                    .log-level {
                        font-weight: bold;
                        margin-right: 8px;
                    }
                    .log-context {
                        margin-top: 4px;
                        padding: 4px;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 2px;
                        font-size: 10px;
                        overflow-x: auto;
                    }
                    #error-logger-debug-controls button {
                        background: #444;
                        color: #fff;
                        border: none;
                        padding: 4px 8px;
                        margin-left: 4px;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 11px;
                    }
                    #error-logger-debug-controls button:hover {
                        background: #555;
                    }
                </style>
                <div id="error-logger-debug-header">
                    <span>Debug Logger</span>
                    <div id="error-logger-debug-controls">
                        <button onclick="window.ErrorLogger.clearLogs()">Clear</button>
                        <button onclick="window.ErrorLogger.exportLogs()">Export</button>
                        <button onclick="window.ErrorLogger.toggleDebugPanel()">Close</button>
                    </div>
                </div>
                <div id="error-logger-debug-content"></div>
            `;
            document.body.appendChild(panel);
        },

        // Escape HTML for safe display
        _escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        },

        // Clear all logs
        clearLogs() {
            localStorage.setItem(this.config.storageKey, JSON.stringify([]));
            localStorage.setItem('paintEstimator_recentErrors', JSON.stringify([]));
            const content = document.getElementById('error-logger-debug-content');
            if (content) {
                content.innerHTML = '';
            }
            this.info('Logs cleared');
        },

        // Export logs
        exportLogs() {
            const logs = JSON.parse(localStorage.getItem(this.config.storageKey) || '[]');
            const errors = JSON.parse(localStorage.getItem('paintEstimator_recentErrors') || '[]');
            
            const exportData = {
                exportDate: new Date().toISOString(),
                appVersion: window.APP_VERSION || 'unknown',
                logs: logs,
                recentErrors: errors,
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `paint-estimator-logs-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.info('Logs exported');
        },

        // Toggle debug panel visibility
        toggleDebugPanel() {
            const panel = document.getElementById('error-logger-debug-panel');
            if (panel) {
                const isVisible = panel.style.display !== 'none';
                panel.style.display = isVisible ? 'none' : 'block';
                this.config.debugMode = !isVisible;
                localStorage.setItem('paintEstimator_debugMode', String(this.config.debugMode));
            }
        },

        // Enable debug mode
        enableDebugMode() {
            this.config.debugMode = true;
            localStorage.setItem('paintEstimator_debugMode', 'true');
            if (!document.getElementById('error-logger-debug-panel')) {
                this._createDebugPanel();
            }
            document.getElementById('error-logger-debug-panel').style.display = 'block';
        },

        // Disable debug mode
        disableDebugMode() {
            this.config.debugMode = false;
            localStorage.setItem('paintEstimator_debugMode', 'false');
            const panel = document.getElementById('error-logger-debug-panel');
            if (panel) {
                panel.style.display = 'none';
            }
        },

        // Get recent errors
        getRecentErrors() {
            return JSON.parse(localStorage.getItem('paintEstimator_recentErrors') || '[]');
        },

        // Get all logs
        getAllLogs() {
            return JSON.parse(localStorage.getItem(this.config.storageKey) || '[]');
        },

        // Get logs by level
        getLogsByLevel(level) {
            const logs = this.getAllLogs();
            return logs.filter(log => log.level === level);
        }
    };

    // Initialize on load
    ErrorLogger.init();

    // Expose globally
    window.ErrorLogger = ErrorLogger;

    // Also expose a shorthand
    window.Logger = ErrorLogger;

})();