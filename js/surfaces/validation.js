/**
 * Unified Validation Module for Paint Surfaces
 * Consolidates validation logic from multiple files:
 * - paint-surfaces-validation.js
 * - form-validator.js
 * - FormValidationEnhancement from loading-states.js
 * - validation parts of enhanced-validation.js
 * Task 006: Consolidate overlapping JavaScript files
 */

(function(window) {
    'use strict';

    // ========================================
    // Validation Rules Registry
    // ========================================
    const ValidationRules = {
        required: {
            validate: (value) => value && value.toString().trim().length > 0,
            message: 'This field is required'
        },
        email: {
            validate: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            message: 'Please enter a valid email address'
        },
        phone: {
            validate: (value) => {
                const phoneRegex = /^[\d\s\-\(\)\+]+$/;
                const digits = value.replace(/\D/g, '');
                return phoneRegex.test(value) && digits.length >= 10;
            },            message: 'Please enter a valid phone number'
        },
        numeric: {
            validate: (value) => !isNaN(value) && !isNaN(parseFloat(value)),
            message: 'Must be a number'
        },
        positive: {
            validate: (value) => parseFloat(value) > 0,
            message: 'Must be greater than 0'
        }
    };

    // ========================================
    // Field Validator
    // ========================================
    const FieldValidator = {
        // Validate single field
        validateField: function(field) {
            const rules = field.dataset.validate?.split(' ') || [];
            const value = field.value;
            let isValid = true;
            let errorMessage = '';
            
            for (const rule of rules) {
                const ruleConfig = ValidationRules[rule];
                if (ruleConfig && !ruleConfig.validate(value)) {
                    isValid = false;
                    errorMessage = ruleConfig.message;
                    break;
                }
            }
            
            if (!isValid) {
                this.showFieldError(field, errorMessage);
            } else {                this.clearFieldError(field);
            }
            
            return isValid;
        },

        // Show field error
        showFieldError: function(field, message) {
            this.clearFieldError(field);
            
            field.classList.add('field-error');
            
            const errorEl = document.createElement('div');
            errorEl.className = 'field-error-message';
            errorEl.textContent = message;
            errorEl.setAttribute('role', 'alert');
            errorEl.setAttribute('aria-live', 'polite');
            
            field.parentNode.insertBefore(errorEl, field.nextSibling);
        },

        // Clear field error
        clearFieldError: function(field) {
            field.classList.remove('field-error');
            const errorEl = field.parentNode.querySelector('.field-error-message');
            if (errorEl) {
                errorEl.remove();
            }
        }
    };

    // ========================================
    // Paint Surfaces Specific Validation
    // ========================================
    
    const PaintSurfacesValidator = {
        // Validation state
        errors: [],
        warnings: [],

        // Validate paint card
        validatePaintCard: function(paintCard) {
            const errors = [];
            
            // Check paint brand
            const brandSelect = paintCard.querySelector('.paint-brand-select');
            if (!brandSelect || !brandSelect.value) {
                errors.push({
                    element: brandSelect,
                    message: 'Please select a paint brand'
                });
            }
            
            // Check paint products
            const selectedProducts = paintCard.querySelectorAll('.paint-product-card.selected');
            if (selectedProducts.length === 0) {
                errors.push({
                    element: paintCard,
                    message: 'Please select at least one paint product'
                });
            }
            
            return errors;
        },

        // Validate surface measurements
        validateSurfaces: function(surfacesContainer) {
            const errors = [];
            const surfaces = surfacesContainer.querySelectorAll('.surface-card');
            
            if (surfaces.length === 0) {                errors.push({
                    element: surfacesContainer,
                    message: 'Please add at least one surface'
                });
            }
            
            surfaces.forEach(surface => {
                const measurements = surface.querySelectorAll('.measurement-block');
                if (measurements.length === 0) {
                    errors.push({
                        element: surface,
                        message: 'Please add at least one measurement to this surface'
                    });
                }
                
                // Validate each measurement has dimensions
                measurements.forEach(measurement => {
                    const hasLxH = measurement.querySelector('.lxh-pair input[value]');
                    const hasTotal = measurement.querySelector('.total-area-input[value]');
                    
                    if (!hasLxH && !hasTotal) {
                        errors.push({
                            element: measurement,
                            message: 'Please enter dimensions for this measurement'
                        });
                    }
                });
            });
            
            return errors;
        },

        // Main validation function
        validate: function() {
            this.errors = [];
            this.warnings = [];
            
            // Validate all paint cards
            const paintCards = document.querySelectorAll('.paint-card');
            paintCards.forEach(card => {
                const errors = this.validatePaintCard(card);
                this.errors.push(...errors);
                
                // Validate surfaces within paint card
                const surfaceErrors = this.validateSurfaces(card);
                this.errors.push(...surfaceErrors);
            });
            
            // Validate abrasive services if present
            const abrasiveCards = document.querySelectorAll('.abrasive-card');
            abrasiveCards.forEach(card => {
                const selectedService = card.querySelector('.abrasive-service-card.selected');
                if (!selectedService) {
                    this.errors.push({
                        element: card,
                        message: 'Please select an abrasive service'
                    });
                }
            });
            
            return this.errors.length === 0;
        },

        // Show validation summary
        showSummary: function() {
            if (this.errors.length === 0) return;
            
            const summaryHtml = `
                <div class="validation-summary validation-error">
                    <h3>Please fix the following errors:</h3>
                    <ul>
                        ${this.errors.map(err => `<li>${err.message}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            // Insert at top of form
            const form = document.querySelector('form');
            if (form) {
                form.insertAdjacentHTML('afterbegin', summaryHtml);
                
                // Auto-hide after 10 seconds
                setTimeout(() => {
                    const summary = form.querySelector('.validation-summary');
                    if (summary) summary.remove();
                }, 10000);
            }
            
            // Highlight error fields
            this.errors.forEach(error => {
                if (error.element) {
                    error.element.classList.add('validation-error');
                }
            });
        }
    };

    // ========================================
    // Form Enhancement
    // ========================================
    const FormEnhancement = {
        // Initialize form with validation
        init: function(form) {
            if (!form) return;
            
            // Add submit handler
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validate all fields
                const fields = form.querySelectorAll('[data-validate]');
                let isValid = true;
                
                fields.forEach(field => {
                    if (!FieldValidator.validateField(field)) {
                        isValid = false;
                    }
                });
                
                // Run paint surfaces validation if applicable
                if (window.location.pathname.includes('surfaces')) {
                    if (!PaintSurfacesValidator.validate()) {
                        isValid = false;
                        PaintSurfacesValidator.showSummary();
                    }
                }
                
                if (isValid && form.onsubmit) {
                    form.onsubmit();
                }
            });
            
            // Add real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => FieldValidator.validateField(input));
                input.addEventListener('input', () => FieldValidator.clearFieldError(input));
            });
        }
    };

    // ========================================
    // Export API
    // ========================================
    window.SurfacesValidation = {
        rules: ValidationRules,
        field: FieldValidator,
        surfaces: PaintSurfacesValidator,
        form: FormEnhancement
    };

    // Auto-initialize forms
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form[data-validate="true"]');
            forms.forEach(form => FormEnhancement.init(form));
        });
    } else {
        const forms = document.querySelectorAll('form[data-validate="true"]');
        forms.forEach(form => FormEnhancement.init(form));
    }

})(window);