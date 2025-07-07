/**
 * Unified UI Helpers Module for Paint Surfaces
 * Consolidates loading states, dialogs, and notifications from multiple files
 * Eliminates duplication between loading-states.js and enhanced-validation.js
 * Task 006: Consolidate overlapping JavaScript files
 */

(function(window) {
    'use strict';

    // ========================================
    // Loading States Manager
    // ========================================
    const LoadingStates = {
        activeOperations: 0,

        // Show loading overlay
        show: function(message = 'Loading...', subtext = '') {
            const overlay = this._createOverlay(message, subtext);
            document.body.appendChild(overlay);
            document.body.classList.add('loading-active');
            this.activeOperations++;
            
            // Fade in
            requestAnimationFrame(() => overlay.classList.add('active'));
            
            // Return hide function
            return () => this.hide();
        },

        // Hide loading overlay
        hide: function() {            this.activeOperations = Math.max(0, this.activeOperations - 1);
            
            if (this.activeOperations === 0) {
                const overlays = document.querySelectorAll('.loading-overlay');
                overlays.forEach(overlay => {
                    overlay.classList.remove('active');
                    setTimeout(() => overlay.remove(), 300);
                });
                document.body.classList.remove('loading-active');
            }
        },

        // Add loading state to button
        addButtonLoading: function(button) {
            if (!button.classList.contains('btn-loading')) {
                button.classList.add('btn-loading');
                button.disabled = true;
                button.dataset.originalText = button.textContent;
            }
            return () => this.removeButtonLoading(button);
        },

        // Remove button loading state
        removeButtonLoading: function(button) {
            button.classList.remove('btn-loading');
            button.disabled = false;
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            }
        },
        // Private: Create overlay element
        _createOverlay: function(message, subtext) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">${this._escapeHtml(message)}</p>
                    ${subtext ? `<p class="loading-subtext">${this._escapeHtml(subtext)}</p>` : ''}
                </div>
            `;
            return overlay;
        },

        // Private: Escape HTML
        _escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };

    // ========================================
    // Confirmation Dialog Manager
    // ========================================
    const ConfirmationDialog = {
        // Show confirmation dialog
        show: function(options = {}) {
            return new Promise((resolve) => {
                const config = Object.assign({                    title: 'Confirm Action',
                    message: 'Are you sure you want to proceed?',
                    confirmText: 'Confirm',
                    cancelText: 'Cancel',
                    type: 'default' // 'default', 'delete', 'warning'
                }, options);
                
                const dialog = this._createDialog(config);
                document.body.appendChild(dialog);
                
                // Fade in
                requestAnimationFrame(() => dialog.classList.add('active'));
                
                // Setup event handlers
                const backdrop = dialog.querySelector('.confirmation-backdrop');
                const cancelBtn = dialog.querySelector('.cancel-btn');
                const confirmBtn = dialog.querySelector('.confirm-btn');
                
                const closeDialog = () => {
                    dialog.classList.remove('active');
                    setTimeout(() => dialog.remove(), 200);
                };
                
                backdrop.addEventListener('click', () => {
                    resolve(false);
                    closeDialog();
                });
                
                cancelBtn.addEventListener('click', () => {
                    resolve(false);
                    closeDialog();
                });
                confirmBtn.addEventListener('click', () => {
                    resolve(true);
                    closeDialog();
                });
            });
        },

        // Private: Create dialog element
        _createDialog: function(config) {
            const dialog = document.createElement('div');
            dialog.className = `confirmation-dialog ${config.type}-confirmation`;
            
            const iconHtml = config.type === 'delete' ? `
                <div class="confirmation-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            ` : '';
            
            dialog.innerHTML = `
                <div class="confirmation-backdrop"></div>
                <div class="confirmation-content">
                    ${iconHtml}
                    <h3 class="confirmation-title">${LoadingStates._escapeHtml(config.title)}</h3>
                    <p class="confirmation-message">${LoadingStates._escapeHtml(config.message)}</p>
                    <div class="confirmation-actions">
                        <button class="btn-secondary cancel-btn">${LoadingStates._escapeHtml(config.cancelText)}</button>
                        <button class="btn-primary confirm-btn ${config.type === 'delete' ? 'btn-danger' : ''}">${LoadingStates._escapeHtml(config.confirmText)}</button>
                    </div>
                </div>
            `;
            
            return dialog;
        }
    };
    // ========================================
    // Notifications Manager
    // ========================================
    const Notifications = {
        // Show success notification
        success: function(message, duration = 3000) {
            this._show('success', message, duration);
        },

        // Show error notification
        error: function(message, duration = 5000) {
            this._show('error', message, duration);
        },

        // Private: Show notification
        _show: function(type, message, duration) {
            const notification = document.createElement('div');
            notification.className = `operation-${type}`;
            
            const icon = type === 'success' 
                ? '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>'
                : '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>';
            
            notification.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    ${icon}
                </svg>
                <span>${LoadingStates._escapeHtml(message)}</span>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slide-out 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    };

    // ========================================
    // Delete Button Confirmation Handler
    // ========================================
    const DeleteConfirmationHandler = {
        init: function() {
            document.addEventListener('click', async (e) => {
                const deleteBtn = e.target.closest('.delete-btn, .btn-delete, [data-action="delete"]');
                if (!deleteBtn || deleteBtn.dataset.skipConfirmation) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                const itemName = deleteBtn.dataset.itemName || this._getItemName(deleteBtn);
                
                const confirmed = await ConfirmationDialog.show({
                    title: 'Confirm Deletion',
                    message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
                    confirmText: 'Delete',
                    cancelText: 'Cancel',
                    type: 'delete'
                });
                
                if (confirmed) {
                    // Re-trigger click with skip flag
                    deleteBtn.dataset.skipConfirmation = 'true';
                    deleteBtn.click();
                    delete deleteBtn.dataset.skipConfirmation;
                }
            }, true);
        },
        
        _getItemName: function(button) {
            const parent = button.closest('.measurement-block, .surface-card, .lxh-pair, .photo-thumbnail');
            if (!parent) return 'this item';
            
            if (parent.classList.contains('measurement-block')) {
                const desc = parent.querySelector('.measurement-description-input');
                return desc?.value || 'measurement area';
            } else if (parent.classList.contains('surface-card')) {
                const name = parent.querySelector('.surface-name');
                return name?.textContent || 'surface';
            } else if (parent.classList.contains('lxh-pair')) {
                return 'dimension';
            } else if (parent.classList.contains('photo-thumbnail')) {
                return 'photo';
            }
            
            return 'this item';
        }
    };

    // ========================================
    // Export API
    // ========================================
    window.SurfacesUI = {
        loading: LoadingStates,
        dialog: ConfirmationDialog,
        notify: Notifications,
        deleteHandler: DeleteConfirmationHandler
    };

    // Auto-initialize delete confirmations
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DeleteConfirmationHandler.init());
    } else {
        DeleteConfirmationHandler.init();
    }

})(window);