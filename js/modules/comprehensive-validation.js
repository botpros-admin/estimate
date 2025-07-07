/**
 * Comprehensive Form Validation Module
 * Validates all required fields and shows detailed error modal
 */

window.ComprehensiveValidation = {
    // Track all validation errors
    validationErrors: [],
    
    // Check if field has asterisk (required indicator)
    isRequiredField(element) {
        const label = element.closest('.form-group')?.querySelector('.form-label');
        if (!label) return false;
        
        const requiredIndicator = label.querySelector('.required-indicator');
        return requiredIndicator && requiredIndicator.textContent === '*';
    },
    
    // Get field label text (without asterisk)
    getFieldLabel(element) {
        const label = element.closest('.form-group')?.querySelector('.form-label');
        if (!label) return 'Field';
        
        // Get text content and remove asterisk
        return label.textContent.replace('*', '').trim();
    },
    
    // Validate single input/select field
    validateField(element) {
        const value = element.value?.trim() || '';
        
        if (!value) {
            const fieldLabel = this.getFieldLabel(element);
            this.validationErrors.push({
                field: fieldLabel,
                element: element,
                message: fieldLabel + ' is required'
            });
            return false;
        }
        
        return true;
    },
    
    // Validate multi-select fields
    validateMultiSelect(container) {
        // Look for selected items using the correct class name
        const selectedItems = container.parentElement?.querySelectorAll('.main-ui-square') || 
                            container.querySelectorAll('.main-ui-square');
        const label = container.closest('.form-group')?.querySelector('.form-label');
        
        if (!label || !label.querySelector('.required-indicator')) {
            return true; // Not required
        }
        
        if (!selectedItems || selectedItems.length === 0) {
            const fieldLabel = label.textContent.replace('*', '').trim();
            this.validationErrors.push({
                field: fieldLabel,
                element: container,
                message: 'Please select at least one ' + fieldLabel.toLowerCase()
            });
            return false;
        }
        
        return true;
    },
    
    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate phone number format
    validatePhoneNumber(phone) {
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        const digits = phone.replace(/\D/g, '');
        return phoneRegex.test(phone) && digits.length >= 10;
    },
    
    // Validate contact information
    validateContacts() {
        // Get contacts from formState data to know how many contacts exist
        const contacts = window.formState?.data?.contacts || [];
        
        if (!contacts || contacts.length === 0) {
            this.validationErrors.push({
                field: 'Contact Information',
                element: document.querySelector('#contacts-container'),
                message: 'At least one contact is required'
            });
            return false;
        }
        
        let hasValidContact = false;
        let contactErrors = false;
        
        // Get all visible contact rows from DOM for element references
        const contactRows = document.querySelectorAll('.crm-entity-widget-content-inner-row');
        
        // Only validate contacts that exist in formState data
        contacts.forEach((contact, index) => {
            // Get the corresponding DOM row if it exists
            const row = contactRows[index];
            if (!row) return; // Skip if no corresponding DOM element
            
            const nameInput = row.querySelector('.crm-entity-widget-content-search-input');
            const phoneInput = row.querySelector('.crm-entity-phone-field input');
            const emailInput = row.querySelector('.crm-entity-email-field input');
            
            // Read values directly from inputs (not from formState)
            const name = nameInput?.value?.trim() || '';
            const phone = phoneInput?.value?.trim() || '';
            const email = emailInput?.value?.trim() || '';            
            // For additional contacts (index > 0), they are ALL mandatory
            if (index > 0) {
                // Additional contacts must have a name
                if (!name) {
                    this.validationErrors.push({
                        field: 'Contact ' + (index + 1) + ' Name',
                        element: nameInput,
                        message: 'Contact ' + (index + 1) + ' name is required'
                    });
                    contactErrors = true;
                }
                
                // Must have either phone or email
                if (!phone && !email) {
                    this.validationErrors.push({
                        field: 'Contact ' + (index + 1) + ' Phone/Email',
                        element: phoneInput || emailInput,
                        message: 'Either phone number or email is required for Contact ' + (index + 1)
                    });
                    contactErrors = true;
                } else {
                    // Validate phone format if provided
                    if (phone && !this.validatePhoneNumber(phone)) {
                        this.validationErrors.push({
                            field: 'Contact ' + (index + 1) + ' Phone',
                            element: phoneInput,
                            message: 'Please enter a valid phone number for Contact ' + (index + 1)
                        });
                        contactErrors = true;
                    }
                    
                    // Validate email format if provided
                    if (email && !this.validateEmail(email)) {
                        this.validationErrors.push({
                            field: 'Contact ' + (index + 1) + ' Email',
                            element: emailInput,
                            message: 'Please enter a valid email address for Contact ' + (index + 1)
                        });
                        contactErrors = true;
                    }
                }
                
                // If this additional contact is valid, mark that we have at least one valid contact
                if (name && (phone || email) && !contactErrors) {
                    hasValidContact = true;
                }
            } else {                // For the first contact (index 0), validate if any field has content
                if (name || phone || email) {
                    // If any field has content, validate properly
                    if (!name) {
                        this.validationErrors.push({
                            field: 'Contact ' + (index + 1) + ' Name',
                            element: nameInput,
                            message: 'Contact name is required when adding contact information'
                        });
                        contactErrors = true;
                    }
                    
                    if (!phone && !email) {
                        this.validationErrors.push({
                            field: 'Contact ' + (index + 1) + ' Phone/Email',
                            element: phoneInput || emailInput,
                            message: 'Either phone number or email is required for Contact ' + (index + 1)
                        });
                        contactErrors = true;
                    } else {
                        // Validate phone format if provided
                        if (phone && !this.validatePhoneNumber(phone)) {
                            this.validationErrors.push({
                                field: 'Contact ' + (index + 1) + ' Phone',
                                element: phoneInput,
                                message: 'Please enter a valid phone number'
                            });
                            contactErrors = true;
                        }
                        
                        // Validate email format if provided
                        if (email && !this.validateEmail(email)) {
                            this.validationErrors.push({
                                field: 'Contact ' + (index + 1) + ' Email',
                                element: emailInput,
                                message: 'Please enter a valid email address'
                            });
                            contactErrors = true;
                        } else if (name && (phone || email)) {
                            hasValidContact = true;
                        }
                    }
                }
            }
        });
        
        if (!hasValidContact) {
            this.validationErrors.push({
                field: 'Contact Information',
                element: document.querySelector('#contacts-container'),
                message: 'At least one complete contact with name and phone/email is required'
            });
        }
        
        return hasValidContact && this.validationErrors.filter(e => e.field.includes('Contact')).length === 0;
    },
    
    // Validate painting scope (interior/exterior)
    validatePaintingScope() {
        const serviceTypes = window.formState?.data?.serviceTypes || [];
        
        // Check if painting is selected and in the appropriate methods
        const surfaceCoatingMethods = window.formState?.data?.surfaceCoatingMethods || [];
        const includesPainting = serviceTypes.includes('surface_coating') && 
                                surfaceCoatingMethods.includes('painting');
        
        if (includesPainting) {
            const interiorChecked = document.getElementById('scope-interior')?.checked;
            const exteriorChecked = document.getElementById('scope-exterior')?.checked;
            
            if (!interiorChecked && !exteriorChecked) {
                this.validationErrors.push({
                    field: 'Painting Scope',
                    element: document.getElementById('painting-scope-section'),
                    message: 'Please select at least one painting scope (Interior or Exterior)'
                });
                return false;
            }
        }
        
        return true;
    },    
    // Validate conditional fields based on selections
    validateConditionalFields() {
        const serviceTypes = window.formState?.data?.serviceTypes || [];
        
        // Validate Surface Coating Method if surface_coating is selected
        if (serviceTypes.includes('surface_coating')) {
            const methodContainer = document.querySelector('#surface-coating-method-multiselect');
            if (methodContainer && methodContainer.parentElement.parentElement.style.display !== 'none') {
                if (!this.validateMultiSelect(methodContainer)) {
                    // Add visual error indicator
                    methodContainer.classList.add('validation-field-error');
                }
            }
            
            // Check for sub-method selections
            const surfaceCoatingMethods = window.formState?.data?.surfaceCoatingMethods || [];
            
            // Validate Concrete Coating options if concrete is selected
            if (surfaceCoatingMethods.includes('concrete')) {
                const concreteContainer = document.querySelector('#concrete-coating-multiselect');
                if (concreteContainer && concreteContainer.parentElement.parentElement.style.display !== 'none') {
                    if (!this.validateMultiSelect(concreteContainer)) {
                        // Add visual error indicator
                        concreteContainer.classList.add('validation-field-error');
                    }
                }
            }
            
            // Validate Wood Treatment options if wood is selected
            if (surfaceCoatingMethods.includes('wood')) {
                const woodContainer = document.querySelector('#wood-coating-multiselect');
                if (woodContainer && woodContainer.parentElement.parentElement.style.display !== 'none') {
                    if (!this.validateMultiSelect(woodContainer)) {
                        // Add visual error indicator
                        woodContainer.classList.add('validation-field-error');
                    }
                }
            }
        }
        
        // Validate Abrasive Method if abrasive is selected
        if (serviceTypes.includes('abrasive')) {
            const abrasiveContainer = document.querySelector('#abrasive-method-multiselect');
            if (abrasiveContainer && abrasiveContainer.parentElement.parentElement.style.display !== 'none') {
                if (!this.validateMultiSelect(abrasiveContainer)) {
                    // Add visual error indicator
                    abrasiveContainer.classList.add('validation-field-error');
                }
            }
        }
    },    
    // Main validation function
    validateAll() {
        // Reset errors
        this.validationErrors = [];
        
        // Clear previous visual error indicators
        document.querySelectorAll('.validation-field-error').forEach(el => {
            el.classList.remove('validation-field-error');
        });
        
        // Validate all required fields with asterisks (except those in conditional sections and multi-selects)
        const allInputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
        allInputs.forEach(element => {
            // Skip fields inside conditional sections - they'll be validated by validateConditionalFields
            const isInConditionalSection = element.closest('#surface-coating-options, #concrete-coating-options, #wood-coating-options, #abrasive-options');
            
            // Skip inputs that are part of multi-select components
            const isPartOfMultiSelect = element.closest('[data-multi-select="true"]') || 
                                       element.classList.contains('main-ui-square-search-item');
            
            if (!isInConditionalSection && !isPartOfMultiSelect && this.isRequiredField(element) && element.parentElement.parentElement.style.display !== 'none') {
                if (!this.validateField(element)) {
                    // Add visual error indicator
                    element.classList.add('validation-field-error');
                }
            }
        });
        
        // Validate main service type selection
        const serviceTypeContainer = document.querySelector('#service-type-multiselect');
        if (serviceTypeContainer) {
            if (!this.validateMultiSelect(serviceTypeContainer)) {
                // Add visual error indicator
                serviceTypeContainer.classList.add('validation-field-error');
            }
        }        
        // Validate contacts
        if (!this.validateContacts()) {
            // Add visual error indicator to contact rows
            const contactRows = document.querySelectorAll('.crm-entity-widget-content-inner-row');
            contactRows.forEach(row => {
                row.classList.add('validation-field-error');
            });
        }
        
        // Validate painting scope if applicable
        if (!this.validatePaintingScope()) {
            const scopeSection = document.getElementById('painting-scope-section');
            if (scopeSection) {
                scopeSection.classList.add('validation-field-error');
            }
        }
        
        // Validate conditional fields based on what's actually selected
        this.validateConditionalFields();
        
        return this.validationErrors.length === 0;
    },    
    // Create validation error modal
    createValidationModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('validation-error-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modal = document.createElement('div');
        modal.id = 'validation-error-modal';
        modal.className = 'validation-modal-overlay';
        
        const errorList = this.validationErrors.map(error => {
            return '<li class="validation-error-item">' +
                '<span class="error-icon">⚠️</span>' +
                '<span class="error-text">' + error.message + '</span>' +
            '</li>';
        }).join('');
        
        modal.innerHTML = '<div class="validation-modal">' +
            '<div class="validation-modal-header">' +
                '<h3 class="validation-modal-title">Please Complete Required Fields</h3>' +
                '<button class="validation-modal-close" onclick="ComprehensiveValidation.closeModal()">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                        '<path d="M18 6L6 18M6 6l12 12"></path>' +
                    '</svg>' +
                '</button>' +
            '</div>' +
            '<div class="validation-modal-body">' +
                '<p class="validation-modal-intro">The following fields need to be completed before proceeding:</p>' +
                '<ul class="validation-error-list">' +
                    errorList +
                '</ul>' +
            '</div>' +
            '<div class="validation-modal-footer">' +
                '<button class="validation-modal-button" onclick="ComprehensiveValidation.closeModal()">' +
                    'OK, I\'ll Complete These Fields' +
                '</button>' +
            '</div>' +
        '</div>';
        
        document.body.appendChild(modal);
        
        // Add modal styles if not already present
        this.injectModalStyles();
        
        // Focus on close button for accessibility
        setTimeout(() => {
            modal.querySelector('.validation-modal-close').focus();
        }, 100);
    },    
    // Show validation modal
    showValidationModal() {
        this.createValidationModal();
        const modal = document.getElementById('validation-error-modal');
        if (modal) {
            // Trigger animation
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    },
    
    // Close validation modal
    closeModal() {
        const modal = document.getElementById('validation-error-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                // Focus on first error field
                if (this.validationErrors.length > 0) {
                    const firstError = this.validationErrors[0].element;
                    if (firstError) {
                        firstError.focus();
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 300);
        }
    },    
    // Inject modal styles
    injectModalStyles() {
        if (document.getElementById('validation-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'validation-modal-styles';
        styles.textContent = '.validation-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0); display: flex; align-items: center; justify-content: center; z-index: 10000; transition: background-color 0.3s ease; padding: 1rem; } .validation-modal-overlay.show { background-color: rgba(0, 0, 0, 0.5); } .validation-modal { background: white; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); max-width: 500px; width: 100%; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column; transform: scale(0.9); opacity: 0; transition: all 0.3s ease; } .validation-modal-overlay.show .validation-modal { transform: scale(1); opacity: 1; } .validation-modal-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; } .validation-modal-title { font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0; } .validation-modal-close { background: none; border: none; color: #6b7280; cursor: pointer; padding: 0.5rem; border-radius: 6px; transition: all 0.2s ease; } .validation-modal-close:hover { background-color: #f3f4f6; color: #374151; } .validation-modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; } .validation-modal-intro { color: #6b7280; margin-bottom: 1rem; font-size: 0.875rem; } .validation-error-list { list-style: none; padding: 0; margin: 0; } .validation-error-item { display: flex; align-items: flex-start; padding: 0.75rem; margin-bottom: 0.5rem; background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; } .error-icon { margin-right: 0.75rem; font-size: 1.125rem; flex-shrink: 0; } .error-text { color: #991b1b; font-size: 0.875rem; line-height: 1.5; } .validation-modal-footer { padding: 1.5rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: center; } .validation-modal-button { background-color: #3b82f6; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; font-size: 1rem; } .validation-modal-button:hover { background-color: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); } .validation-modal-button:active { transform: translateY(0); } @media (max-width: 640px) { .validation-modal { max-width: 100%; margin: 0 1rem; } .validation-modal-header, .validation-modal-body, .validation-modal-footer { padding: 1rem; } }';
        
        document.head.appendChild(styles);
    }
};