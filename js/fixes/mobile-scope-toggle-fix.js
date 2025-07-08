/**
 * Improved fix for Interior/Exterior toggle buttons on mobile devices
 * Solves the issue where buttons require clicking elsewhere before toggling off
 */

(function() {
    'use strict';

    /**
     * Detect if the device supports touch
     */
    function isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }

    /**
     * Initialize mobile-friendly scope toggles
     */
    function initializeMobileScopeToggles() {
        const scopeOptions = document.querySelectorAll('.scope-option');
        
        if (!scopeOptions.length) {
            console.log('No scope options found');
            return;
        }

        scopeOptions.forEach(option => {
            const checkbox = option.querySelector('.scope-checkbox');
            const label = option.querySelector('.scope-label');
            
            if (!checkbox || !label) return;

            // Remove any existing event listeners by cloning
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            const newCheckbox = newOption.querySelector('.scope-checkbox');
            const newLabel = newOption.querySelector('.scope-label');

            if (isTouchDevice()) {
                // Add touch-specific handling
                let touchHandled = false;

                // Handle touchend for immediate response
                newOption.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Prevent the click event from firing twice
                    touchHandled = true;
                    
                    // Toggle the checkbox
                    newCheckbox.checked = !newCheckbox.checked;
                    
                    // Manually trigger the change event
                    const changeEvent = new Event('change', { bubbles: true });
                    newCheckbox.dispatchEvent(changeEvent);
                    
                    // Force immediate visual update
                    if (newCheckbox.checked) {
                        newLabel.classList.add('checked');
                    } else {
                        newLabel.classList.remove('checked');
                    }
                    
                    // Force style recalculation
                    newLabel.style.display = 'none';
                    newLabel.offsetHeight; // Trigger reflow
                    newLabel.style.display = '';
                    
                    // Blur any focused element to prevent focus issues
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                    
                    // Reset flag after a short delay
                    setTimeout(() => { touchHandled = false; }, 300);
                    
                    console.log(`Touch toggle ${newCheckbox.value} to ${newCheckbox.checked}`);
                });

                // Prevent default click if touch was handled
                newOption.addEventListener('click', function(e) {
                    if (touchHandled) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });

                // Prevent checkbox from handling events directly on mobile
                newCheckbox.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                newCheckbox.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                newCheckbox.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }

            // Ensure visual state matches checkbox state on initialization
            if (newCheckbox.checked) {
                newLabel.classList.add('checked');
            } else {
                newLabel.classList.remove('checked');
            }
        });

        console.log('Mobile scope toggles initialized');
    }

    /**
     * Add/update CSS rules for the checked class
     */
    function injectMobileStyles() {
        const styleId = 'mobile-scope-toggle-styles';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = `
            /* Mobile-specific styles for scope toggles */
            @media (hover: none) and (pointer: coarse), (max-width: 768px) {
                .scope-option {
                    -webkit-tap-highlight-color: transparent;
                    user-select: none;
                    -webkit-user-select: none;
                    touch-action: manipulation;
                }
                
                .scope-label {
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    z-index: 1;
                }
                
                /* Ensure checked state is visible even without :checked pseudo-class */
                .scope-label.checked {
                    background-color: #eff6ff !important;
                    border-color: #3b82f6 !important;
                    color: #1e40af !important;
                }
                
                .scope-label.checked .scope-icon {
                    color: #3b82f6 !important;
                }
                
                /* Prevent sticky hover states on touch devices */
                .scope-label:hover {
                    background-color: inherit;
                }
                
                .scope-label.checked:hover {
                    background-color: #eff6ff !important;
                }
                
                /* Make touch target larger */
                .scope-option {
                    padding: 0;
                    margin: -8px;
                    padding: 8px;
                }
            }
            
            /* Ensure the checkbox + label selector still works on desktop */
            @media (hover: hover) and (pointer: fine) {
                .scope-checkbox:checked + .scope-label {
                    background-color: #eff6ff;
                    border-color: #3b82f6;
                    color: #1e40af;
                }
                
                .scope-checkbox:checked + .scope-label .scope-icon {
                    color: #3b82f6;
                }
            }
            
            /* Always apply checked styles when class is present */
            .scope-label.checked {
                background-color: #eff6ff !important;
                border-color: #3b82f6 !important;
                color: #1e40af !important;
            }
            
            .scope-label.checked .scope-icon {
                color: #3b82f6 !important;
            }
        `;
    }

    /**
     * Monitor for dynamic content changes
     */
    function setupMutationObserver() {
        const targetNode = document.getElementById('painting-scope-section');
        if (!targetNode) return;

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Re-initialize when the section becomes visible
                    if (targetNode.style.display !== 'none') {
                        setTimeout(initializeMobileScopeToggles, 100);
                    }
                }
            });
        });

        observer.observe(targetNode, { attributes: true });
    }

    /**
     * Setup listeners for dynamic content
     */
    function setupDynamicListeners() {
        // Listen for service type changes
        const checkServiceInterval = setInterval(function() {
            if (window.serviceTypeMultiSelect && window.serviceTypeMultiSelect.config) {
                clearInterval(checkServiceInterval);
                
                // Wrap original onChange handler
                const originalServiceChange = window.serviceTypeMultiSelect.config.onChange;
                window.serviceTypeMultiSelect.config.onChange = function(values) {
                    if (originalServiceChange) {
                        originalServiceChange(values);
                    }
                    setTimeout(initializeMobileScopeToggles, 300);
                };
            }
        }, 500);
        
        // Listen for surface coating method changes separately
        const checkCoatingInterval = setInterval(function() {
            if (window.surfaceCoatingMethodMultiSelect && window.surfaceCoatingMethodMultiSelect.config) {
                clearInterval(checkCoatingInterval);
                
                const originalCoatingChange = window.surfaceCoatingMethodMultiSelect.config.onChange;
                window.surfaceCoatingMethodMultiSelect.config.onChange = function(values) {
                    if (originalCoatingChange) {
                        originalCoatingChange(values);
                    }
                    setTimeout(initializeMobileScopeToggles, 300);
                };
            }
        }, 500);
        
        // Stop checking after 10 seconds
        setTimeout(() => {
            clearInterval(checkServiceInterval);
            clearInterval(checkCoatingInterval);
        }, 10000);
    }

    /**
     * Initialize everything when DOM is ready
     */
    function initialize() {
        // Inject mobile-specific styles
        injectMobileStyles();
        
        // Initial setup with delay to ensure everything is loaded
        setTimeout(initializeMobileScopeToggles, 100);
        
        // Setup mutation observer for dynamic changes
        setupMutationObserver();
        
        // Setup listeners for multi-select changes
        setupDynamicListeners();
        
        // Re-initialize when project type changes
        const projectTypeSelect = document.getElementById('project-type');
        if (projectTypeSelect) {
            projectTypeSelect.addEventListener('change', function() {
                setTimeout(initializeMobileScopeToggles, 300);
            });
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Expose functions globally for debugging
    window.initializeMobileScopeToggles = initializeMobileScopeToggles;
    window.debugScopeToggle = function() {
        const checkboxes = document.querySelectorAll('.scope-checkbox');
        checkboxes.forEach(cb => {
            console.log(`${cb.value}: checked=${cb.checked}, display=${cb.style.display}`);
            const label = cb.nextElementSibling;
            if (label) {
                console.log(`Label classes: ${label.className}`);
                console.log(`Label computed styles:`, window.getComputedStyle(label).backgroundColor);
            }
        });
    };

})();