/**
 * Fix for Interior/Exterior toggle buttons on mobile devices
 * Addresses the issue where buttons require clicking elsewhere before toggling off
 */

(function() {
    'use strict';

    /**
     * Detect if the device is a touch device
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

            // Remove existing event listeners to prevent duplicates
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            const newCheckbox = newOption.querySelector('.scope-checkbox');
            const newLabel = newOption.querySelector('.scope-label');

            // Add click handler to the label for mobile devices
            if (isTouchDevice()) {
                newLabel.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Toggle the checkbox state
                    newCheckbox.checked = !newCheckbox.checked;
                    
                    // Trigger the change event
                    const changeEvent = new Event('change', { bubbles: true });
                    newCheckbox.dispatchEvent(changeEvent);
                    
                    // Remove focus from the element
                    newCheckbox.blur();
                    newLabel.blur();
                    
                    console.log(`Toggled ${newCheckbox.value} to ${newCheckbox.checked}`);
                });

                // Prevent default checkbox behavior on touch
                newCheckbox.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                });
            }
        });

        console.log('Mobile scope toggles initialized');
    }

    /**
     * Wait for DOM and formState to be ready
     */
    function waitForReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    // Initialize when ready
    waitForReady(function() {
        // Initial setup
        setTimeout(initializeMobileScopeToggles, 100);
        
        // Re-initialize if project type changes (which may show/hide the scope section)
        const projectTypeSelect = document.getElementById('project-type');
        if (projectTypeSelect) {
            projectTypeSelect.addEventListener('change', function() {
                setTimeout(initializeMobileScopeToggles, 300);
            });
        }

        // Re-initialize if service type changes
        if (window.serviceTypeMultiSelect) {
            const originalOnChange = window.serviceTypeMultiSelect.config.onChange;
            window.serviceTypeMultiSelect.config.onChange = function(values) {
                if (originalOnChange) {
                    originalOnChange(values);
                }
                setTimeout(initializeMobileScopeToggles, 300);
            };
        }
    });

    // Expose function globally for debugging
    window.initializeMobileScopeToggles = initializeMobileScopeToggles;
})();
