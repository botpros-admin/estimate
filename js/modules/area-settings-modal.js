/**
 * Area Settings Modal Module
 * Consolidated from multiple fix files into a single production module
 * Created: 2025-01-05
 * 
 * Combines functionality from:
 * - independent-modal-enhanced.js (base modal system)
 * - modal-toggle-state-fix.js (toggle state management)
 * - area-settings-icon-implementation.js (icon handling)
 * - area-settings-color-persistence.js (color persistence)
 * - modal-layout-fix.js (layout fixes)
 * - and others
 */

(function() {
    'use strict';
    
    if (window.ErrorHandler) {
        window.ErrorHandler.debug('📦 Area Settings Modal Module v1.0 loading...');
    }
    
    // Module configuration
    const config = {
        modalId: 'area-settings-modal',
        iconClass: 'area-settings-icon',
        measurementBlockSelector: '.paint-card .measurement-block',
        surfaceCardSelector: '.surface-card',
        paintCardSelector: '.paint-card',
        toggleAnimationDuration: 300
    };
    
    // State management
    const state = {
        savedScrollPosition: 0,        savedBodyPaddingRight: '',
        savedHtmlOverflow: '',
        savedBodyOverflow: '',
        currentModalId: null
    };
    
    // Core Modal Functions
    const modal = {
        /**
         * Open the area settings modal
         */
        open: function(measurementId, surfaceId, serviceType, enhancedMeasurement) {
            if (window.ErrorHandler) {
                window.ErrorHandler.debug('Opening area settings modal', { measurementId, surfaceId, serviceType });
            }
            
            // Save scroll state
            state.savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            state.savedBodyPaddingRight = document.body.style.paddingRight;
            state.savedHtmlOverflow = document.documentElement.style.overflow;
            state.savedBodyOverflow = document.body.style.overflow;
            
            // Calculate scrollbar width
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            
            // Lock scrolling
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = scrollbarWidth + 'px';
            
            // iOS scroll lock
            document.body.style.position = 'fixed';            document.body.style.top = `-${state.savedScrollPosition}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            
            // Remove existing modal
            const existingModal = document.getElementById(config.modalId);
            if (existingModal) existingModal.remove();
            
            // Get original measurement block
            const originalBlock = document.querySelector(`[data-measurement-id="${measurementId}"]`);
            if (!originalBlock) {
                if (window.ErrorHandler) {
                    window.ErrorHandler.error('Original measurement block not found', {
                        category: window.ErrorCategory.UI,
                        context: { measurementId }
                    });
                }
                return;
            }
            
            // Clone the measurement block
            const clonedBlock = originalBlock.cloneNode(true);
            const modalMeasurementId = `modal-${measurementId}-${Date.now()}`;
            
            // Create modal HTML
            const modalHTML = this.createModalHTML(modalMeasurementId, clonedBlock, enhancedMeasurement);
            
            // Insert modal into DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Initialize modal functionality
            this.initializeModal(modalMeasurementId, measurementId, surfaceId);
            
            // Store current modal ID
            state.currentModalId = modalMeasurementId;        },
        
        /**
         * Create modal HTML structure
         */
        createModalHTML: function(modalMeasurementId, clonedBlock, enhancedMeasurement) {
            // Update cloned block IDs
            clonedBlock.dataset.measurementId = modalMeasurementId;
            clonedBlock.id = modalMeasurementId;
            
            // Remove any existing settings icons from clone
            const settingsIcon = clonedBlock.querySelector('.area-settings-icon');
            if (settingsIcon) settingsIcon.remove();
            
            // Get surface name from enhanced measurement
            const surfaceName = enhancedMeasurement?.name || 'Measurement';
            
            return `
                <div class="modal fade" id="${config.modalId}" tabindex="-1" 
                     role="dialog" aria-labelledby="areaSettingsModalLabel" 
                     aria-hidden="true" style="display: block;">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="areaSettingsModalLabel">
                                    ${surfaceName} Settings
                                </h5>
                                <button type="button" class="close" data-dismiss="modal">                                        aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                ${clonedBlock.outerHTML}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" 
                                        data-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" 
                                        id="save-area-settings">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        /**
         * Initialize modal functionality
         */
        initializeModal: function(modalMeasurementId, originalMeasurementId, surfaceId) {
            const modal = document.getElementById(config.modalId);
            if (!modal) return;
            
            // Initialize toggle functionality
            this.initializeToggle(modal, modalMeasurementId);
            
            // Initialize save functionality            this.initializeSave(modal, originalMeasurementId, surfaceId);
            
            // Initialize close functionality
            this.initializeClose(modal);
            
            // Force correct initial state
            setTimeout(() => {
                this.forceCorrectToggleState(modal);
            }, 100);
        },
        
        /**
         * Initialize toggle functionality
         */
        initializeToggle: function(modal, measurementId) {
            const toggle = modal.querySelector('.toggle-switch input[type="checkbox"]');
            if (!toggle) return;
            
            const totalContainer = modal.querySelector('.total-input-container');
            const dimensionsContainer = modal.querySelector('.lxh-inputs-container');
            
            // Handle toggle change
            toggle.addEventListener('change', (e) => {
                e.preventDefault();
                this.updateToggleState(toggle.checked, totalContainer, dimensionsContainer);
                
                // Update labels
                const leftLabel = modal.querySelector('.toggle-label-left');
                const rightLabel = modal.querySelector('.toggle-label-right');
                if (leftLabel) leftLabel.classList.toggle('active', !toggle.checked);                if (rightLabel) rightLabel.classList.toggle('active', toggle.checked);
            });
        },
        
        /**
         * Update toggle state
         */
        updateToggleState: function(isTotal, totalContainer, dimensionsContainer) {
            if (isTotal) {
                totalContainer.style.cssText = 'display: block !important; visibility: visible !important;';
                dimensionsContainer.style.cssText = 'display: none !important; visibility: hidden !important;';
            } else {
                totalContainer.style.cssText = 'display: none !important; visibility: hidden !important;';
                dimensionsContainer.style.cssText = 'display: block !important; visibility: visible !important;';
            }
        },
        
        /**
         * Force correct toggle state
         */
        forceCorrectToggleState: function(modal) {
            const toggle = modal.querySelector('.toggle-switch input[type="checkbox"]');
            const totalContainer = modal.querySelector('.total-input-container');
            const dimensionsContainer = modal.querySelector('.lxh-inputs-container');
            
            if (toggle && totalContainer && dimensionsContainer) {
                this.updateToggleState(toggle.checked, totalContainer, dimensionsContainer);
            }
        },
                
        /**
         * Initialize save functionality
         */
        initializeSave: function(modal, originalMeasurementId, surfaceId) {
            const saveBtn = modal.querySelector('#save-area-settings');
            if (!saveBtn) return;
            
            saveBtn.addEventListener('click', () => {
                // Get modal measurement block
                const modalBlock = modal.querySelector(`[data-measurement-id*="modal-"]`);
                const originalBlock = document.querySelector(`[data-measurement-id="${originalMeasurementId}"]`);
                
                if (!modalBlock || !originalBlock) return;
                
                // Copy all input values from modal to original
                this.copyInputValues(modalBlock, originalBlock);
                
                // Copy toggle state
                this.copyToggleState(modalBlock, originalBlock);
                
                // Trigger recalculation
                this.triggerRecalculation(originalBlock);
                
                // Save to formState
                if (window.saveFormStateToLocalStorage) {
                    window.saveFormStateToLocalStorage();
                }
                
                // Close modal
                this.close();            });
        },
        
        /**
         * Copy input values between measurement blocks
         */
        copyInputValues: function(fromBlock, toBlock) {
            const inputs = ['length', 'height', 'total-area'];
            
            inputs.forEach(name => {
                const fromInput = fromBlock.querySelector(`input[name="${name}"]`);
                const toInput = toBlock.querySelector(`input[name="${name}"]`);
                
                if (fromInput && toInput) {
                    toInput.value = fromInput.value;
                    toInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            
            // Copy description
            const fromDesc = fromBlock.querySelector('.measurement-description');
            const toDesc = toBlock.querySelector('.measurement-description');
            if (fromDesc && toDesc) {
                toDesc.textContent = fromDesc.textContent;
            }
        },
        
        /**
         * Copy toggle state between measurement blocks
         */
        copyToggleState: function(fromBlock, toBlock) {            const fromToggle = fromBlock.querySelector('.toggle-switch input[type="checkbox"]');
            const toToggle = toBlock.querySelector('.toggle-switch input[type="checkbox"]');
            
            if (fromToggle && toToggle) {
                toToggle.checked = fromToggle.checked;
                toToggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
        },
        
        /**
         * Trigger recalculation on measurement block
         */
        triggerRecalculation: function(measurementBlock) {
            const inputs = measurementBlock.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
            
            // Trigger global recalculation if available
            if (window.recalculateAll) {
                window.recalculateAll();
            }
        },
        
        /**
         * Initialize close functionality
         */
        initializeClose: function(modal) {
            // Close button
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {                closeBtn.addEventListener('click', () => this.close());
            }
            
            // Cancel button
            const cancelBtn = modal.querySelector('[data-dismiss="modal"]');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.close());
            }
            
            // Click outside modal
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close();
                }
            });
            
            // ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && document.getElementById(config.modalId)) {
                    this.close();
                }
            }, { once: true });
        },
        
        /**
         * Close the modal
         */
        close: function() {
            const modal = document.getElementById(config.modalId);
            if (!modal) return;
            
            // Restore scroll state            document.documentElement.style.overflow = state.savedHtmlOverflow;
            document.body.style.overflow = state.savedBodyOverflow;
            document.body.style.paddingRight = state.savedBodyPaddingRight;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            
            // Restore scroll position
            window.scrollTo(0, state.savedScrollPosition);
            
            // Remove modal
            modal.remove();
            
            // Clear current modal ID
            state.currentModalId = null;
        }
    };
    
    // Icon Implementation
    const icons = {
        /**
         * Add settings icons to all measurement blocks
         */
        addToMeasurements: function() {
            const measurementBlocks = document.querySelectorAll(config.measurementBlockSelector);
            
            measurementBlocks.forEach(block => {
                if (block.querySelector(`.${config.iconClass}`)) return;
                
                const measurementId = block.dataset.measurementId;                if (!measurementId) return;
                
                const surfaceCard = block.closest(config.surfaceCardSelector);
                if (!surfaceCard) return;
                
                const surfaceId = surfaceCard.dataset.id;
                if (!surfaceId) return;
                
                this.createIcon(block, measurementId, surfaceId);
            });
        },
        
        /**
         * Create settings icon for a measurement block
         */
        createIcon: function(block, measurementId, surfaceId) {
            const paintCard = block.closest(config.paintCardSelector);
            if (!paintCard) return;
            
            const serviceType = paintCard.dataset.service || 'paint';
            
            // Create icon element
            const icon = document.createElement('span');
            icon.className = config.iconClass;
            icon.style.cssText = `
                cursor: pointer;
                font-size: 24px;
                margin-left: 10px;
                color: #6c757d;
                transition: color 0.2s;
            `;            icon.innerHTML = '⚙️';
            
            // Add hover effect
            icon.addEventListener('mouseenter', () => {
                icon.style.color = '#495057';
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.style.color = '#6c757d';
            });
            
            // Add click handler
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const enhancedMeasurement = this.getEnhancedMeasurement(block);
                modal.open(measurementId, surfaceId, serviceType, enhancedMeasurement);
            });
            
            // Insert icon after measurement description
            const description = block.querySelector('.measurement-description');
            if (description) {
                description.appendChild(icon);
            }
        },
        
        /**
         * Get enhanced measurement data
         */
        getEnhancedMeasurement: function(measurementBlock) {            const surfaceCard = measurementBlock.closest(config.surfaceCardSelector);
            const surfaceName = surfaceCard ? 
                surfaceCard.querySelector('.surface-name')?.textContent || 'Surface' : 
                'Surface';
            
            return {
                name: surfaceName,
                id: measurementBlock.dataset.measurementId,
                surfaceId: surfaceCard?.dataset.id
            };
        }
    };
    
    // Initialization
    function initialize() {
        if (window.ErrorHandler) {
            window.ErrorHandler.debug('✅ Area Settings Modal Module initialized');
        }
        
        // Add icons on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => icons.addToMeasurements());
        } else {
            icons.addToMeasurements();
        }
        
        // Observe for new measurement blocks
        const observer = new MutationObserver(() => {
            icons.addToMeasurements();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });    }
    
    // Export to global scope
    window.openAreaSettingsModal = function(measurementId, surfaceId, serviceType, enhancedMeasurement) {
        modal.open(measurementId, surfaceId, serviceType, enhancedMeasurement);
    };
    
    window.closeAreaSettingsModal = function() {
        modal.close();
    };
    
    window.addAreaSettingsIcons = function() {
        icons.addToMeasurements();
    };
    
    // Auto-initialize
    initialize();
    
})();

if (window.ErrorHandler) {
    window.ErrorHandler.debug('✅ Area Settings Modal Module v1.0 loaded successfully');
}