/**
 * Form Validator Module
 * Provides comprehensive client-side validation for all forms
 */

const FormValidator = {
    // Validation rules registry
    rules: {
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
            },
            message: 'Please enter a valid phone number'
        },
        minLength: {
            validate: (value, param) => value && value.length >= parseInt(param),
            message: (param) => `Must be at least ${param} characters`
        },
        maxLength: {
            validate: (value, param) => !value || value.length <= parseInt(param),
            message: (param) => `Must not exceed ${param} characters`
        },
        numeric: {
            validate: (value) => !isNaN(value) && !isNaN(parseFloat(value)),
            message: 'Must be a number'
        },
        positive: {
            validate: (value) => parseFloat(value) > 0,
            message: 'Must be greater than 0'
        },
        percentage: {
            validate: (value) => {
                const num = parseFloat(value);
                return !isNaN(num) && num >= 0 && num <= 100;
            },
            message: 'Must be between 0 and 100'
        },        futureDate: {
            validate: (value) => {
                const date = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date >= today;
            },
            message: 'Date must be today or in the future'
        },
        atLeastOne: {
            validate: (value, param, element) => {
                const group = document.querySelectorAll(`[data-validation-group="${param}"]`);
                return Array.from(group).some(el => el.checked || el.value);
            },
            message: 'At least one option must be selected'
        }
    },

    // Error display functions
    showError(element, message) {
        // Remove any existing error
        this.clearError(element);
        
        // Add error class to input
        element.classList.add('validation-error');
        
        // Create error message element
        const errorEl = document.createElement('div');
        errorEl.className = 'validation-error-message';
        errorEl.textContent = message;
        errorEl.setAttribute('role', 'alert');
        
        // Insert after the input
        element.parentNode.insertBefore(errorEl, element.nextSibling);
    },

    clearError(element) {
        element.classList.remove('validation-error');
        const errorEl = element.parentNode.querySelector('.validation-error-message');
        if (errorEl) {
            errorEl.remove();
        }
    },
    // Validate single field
    validateField(element) {
        const validationRules = element.dataset.validate;
        if (!validationRules) return true;

        const value = element.value;
        const rules = validationRules.split(' ');
        
        for (const rule of rules) {
            const [ruleName, param] = rule.split(':');
            const validator = this.rules[ruleName];
            
            if (!validator) {
                if (window.ErrorHandler) {
                    window.ErrorHandler.warn(`Unknown validation rule: ${ruleName}`, {
                        category: window.ErrorCategory.VALIDATION
                    });
                }
                continue;
            }

            const isValid = validator.validate(value, param, element);
            if (!isValid) {
                const message = typeof validator.message === 'function' 
                    ? validator.message(param) 
                    : validator.message;
                this.showError(element, message);
                return false;
            }
        }

        this.clearError(element);
        return true;
    },

    // Validate entire form
    validateForm(formElement) {
        const fields = formElement.querySelectorAll('[data-validate]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    },
    // Initialize validation for a form
    init(formElement) {
        // Add real-time validation
        formElement.addEventListener('input', (e) => {
            if (e.target.dataset.validate) {
                // Debounce validation for better UX
                clearTimeout(e.target.validationTimeout);
                e.target.validationTimeout = setTimeout(() => {
                    this.validateField(e.target);
                }, 300);
            }
        });

        // Validate on blur
        formElement.addEventListener('blur', (e) => {
            if (e.target.dataset.validate) {
                this.validateField(e.target);
            }
        }, true);

        // Validate on form submission
        formElement.addEventListener('submit', (e) => {
            if (!this.validateForm(formElement)) {
                e.preventDefault();
                
                // Focus on first error field
                const firstError = formElement.querySelector('.validation-error');
                if (firstError) {
                    firstError.focus();
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                // Show summary message
                this.showSummaryMessage(formElement);
            }
        });

        // Add CSS if not already present
        this.injectStyles();
    },
    // Show validation summary
    showSummaryMessage(formElement) {
        // Remove existing summary
        const existingSummary = formElement.querySelector('.validation-summary');
        if (existingSummary) {
            existingSummary.remove();
        }

        // Count errors
        const errorCount = formElement.querySelectorAll('.validation-error').length;
        if (errorCount > 0) {
            const summary = document.createElement('div');
            summary.className = 'validation-summary';
            summary.setAttribute('role', 'alert');
            summary.innerHTML = `
                <strong>Please correct the following errors:</strong>
                <p>${errorCount} field${errorCount > 1 ? 's' : ''} need${errorCount === 1 ? 's' : ''} attention</p>
            `;
            formElement.insertBefore(summary, formElement.firstChild);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (summary.parentNode) {
                    summary.remove();
                }
            }, 5000);
        }
    },

    // Inject validation styles
    injectStyles() {
        if (document.getElementById('form-validator-styles')) return;

        const styles = `
            .validation-error {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
            }

            .validation-error-message {
                color: #dc3545;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: block;
            }
            .validation-summary {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 0.75rem 1.25rem;
                margin-bottom: 1rem;
                border-radius: 0.25rem;
            }

            .validation-summary strong {
                display: block;
                margin-bottom: 0.5rem;
            }

            .validation-summary p {
                margin: 0;
            }

            /* Visual feedback for valid fields - removed green border */
            input[data-validate]:valid:not(:placeholder-shown) {
                border-color: #d1d5db; /* neutral gray instead of green */
            }

            /* Accessibility improvements */
            .validation-error-message[role="alert"] {
                position: relative;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'form-validator-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    },

    // Helper to add validation attributes programmatically
    addValidation(element, rules) {
        element.setAttribute('data-validate', rules);
    },

    // Clear all validation in a form
    clearAllValidation(formElement) {
        const fields = formElement.querySelectorAll('[data-validate]');
        fields.forEach(field => this.clearError(field));
        
        const summary = formElement.querySelector('.validation-summary');
        if (summary) {
            summary.remove();
        }
    }
};
// Auto-initialize forms with data-validate-form attribute
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('[data-validate-form]');
    forms.forEach(form => FormValidator.init(form));
});

// Export for use in other modules
window.FormValidator = FormValidator;
