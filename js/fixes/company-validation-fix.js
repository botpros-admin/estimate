/**
 * Company Field Validation Fix
 * Ensures the company field never gets highlighted with validation errors
 */

(function() {
    'use strict';
    
    // Function to identify and mark company field
    function markCompanyField() {
        const rows = document.querySelectorAll('.crm-entity-widget-content-inner-row');
        rows.forEach((row, index) => {
            const titleText = row.querySelector('.crm-entity-widget-content-block-title-text');
            if (titleText && titleText.textContent === 'Company') {
                row.setAttribute('data-field', 'company');
                row.classList.add('company-row');
                // Mark all inputs within company row
                row.querySelectorAll('input').forEach(input => {
                    input.setAttribute('data-field', 'company');
                });
            }
        });
    }
    
    // Function to remove validation error from company field
    function removeCompanyValidationError() {
        // Remove by company title
        const companyRows = document.querySelectorAll('.crm-entity-widget-content-inner-row');
        companyRows.forEach(row => {
            const titleText = row.querySelector('.crm-entity-widget-content-block-title-text');
            if (titleText && titleText.textContent === 'Company') {
                row.classList.remove('validation-field-error');
                // Remove from all child elements
                row.querySelectorAll('.validation-field-error').forEach(el => {
                    el.classList.remove('validation-field-error');
                });
            }
        });
        
        // Remove by data attribute
        document.querySelectorAll('[data-field="company"]').forEach(el => {
            el.classList.remove('validation-field-error');
        });
        
        // Remove by class
        document.querySelectorAll('.company-row').forEach(el => {
            el.classList.remove('validation-field-error');
        });
    }
    
    // Intercept classList modifications
    const originalAdd = Element.prototype.classList.add;
    const originalToggle = Element.prototype.classList.toggle;
    
    Element.prototype.classList.add = function(...tokens) {
        if (tokens.includes('validation-field-error')) {
            // Check if this element or its parent is a company field
            const row = this.closest('.crm-entity-widget-content-inner-row');
            if (row) {
                const titleText = row.querySelector('.crm-entity-widget-content-block-title-text');
                if (titleText && titleText.textContent === 'Company') {
                    return; // Don't add the class
                }
            }
            if (this.getAttribute('data-field') === 'company' || 
                this.classList.contains('company-row') ||
                this.closest('[data-field="company"]') ||
                this.closest('.company-row')) {
                return; // Don't add the class
            }
        }
        return originalAdd.apply(this.classList, tokens);
    };
    
    Element.prototype.classList.toggle = function(token, force) {
        if (token === 'validation-field-error' && force !== false) {
            const row = this.closest('.crm-entity-widget-content-inner-row');
            if (row) {
                const titleText = row.querySelector('.crm-entity-widget-content-block-title-text');
                if (titleText && titleText.textContent === 'Company') {
                    return false;
                }
            }
            if (this.getAttribute('data-field') === 'company' || 
                this.classList.contains('company-row')) {
                return false;
            }
        }
        return originalToggle.apply(this.classList, [token, force]);
    };
    
    // Initialize when DOM is ready
    function init() {
        markCompanyField();
        removeCompanyValidationError();
        
        // Set up mutation observer
        const observer = new MutationObserver((mutations) => {
            let needsCleanup = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('validation-field-error')) {
                        const row = target.closest('.crm-entity-widget-content-inner-row');
                        if (row) {
                            const titleText = row.querySelector('.crm-entity-widget-content-block-title-text');
                            if (titleText && titleText.textContent === 'Company') {
                                needsCleanup = true;
                            }
                        }
                    }
                } else if (mutation.type === 'childList') {
                    // Re-mark company fields if new ones are added
                    markCompanyField();
                }
            });
            if (needsCleanup) {
                removeCompanyValidationError();
            }
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            childList: true,
            subtree: true
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also handle dynamic content
    document.addEventListener('contacts:rendered', () => {
        markCompanyField();
        removeCompanyValidationError();
    });
    
    // Periodic cleanup as failsafe
    setInterval(removeCompanyValidationError, 1000);
})();
