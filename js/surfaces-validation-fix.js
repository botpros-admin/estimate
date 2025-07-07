/**
 * Fixed Surfaces Validation
 * Less strict validation that properly recognizes filled fields
 */

(function() {
    'use strict';
    
    console.log('✅ Fixed Surfaces Validation Loaded');
    
    // Override the validation function
    if (window.SurfacesValidation && window.SurfacesValidation.surfaces) {
        const originalValidate = window.SurfacesValidation.surfaces.validate;
        
        window.SurfacesValidation.surfaces.validate = function() {
            console.log('🔍 Running fixed validation...');
            
            this.errors = [];
            this.warnings = [];
            
            // Get all paint cards
            const paintCards = document.querySelectorAll('.paint-card');
            let hasAtLeastOneValidCard = false;
            
            paintCards.forEach((card, index) => {
                console.group(`Validating Paint Card ${index + 1}`);
                
                // Check if card has any content
                const brandSelect = card.querySelector('.paint-brand-select');
                const hasSelectedProducts = card.querySelectorAll('.paint-product-card.selected').length > 0;
                const hasSurfaces = card.querySelectorAll('.surface-card').length > 0;
                
                console.log('Brand:', brandSelect?.value || 'NONE');
                console.log('Has selected products:', hasSelectedProducts);
                console.log('Has surfaces:', hasSurfaces);
                
                // Only validate if user has started filling out this card
                if (brandSelect?.value || hasSelectedProducts || hasSurfaces) {
                    // Brand is required if card is being used
                    if (!brandSelect?.value) {
                        this.errors.push({
                            element: brandSelect,
                            message: 'Please select a paint brand'
                        });
                    }
                    
                    // Products are required if brand is selected
                    if (brandSelect?.value && !hasSelectedProducts) {
                        this.errors.push({
                            element: card,
                            message: 'Please select at least one paint product'
                        });
                    }
                    
                    // If products are selected, check surfaces
                    if (hasSelectedProducts) {
                        const surfaces = card.querySelectorAll('.surface-card');
                        
                        if (surfaces.length === 0) {
                            this.errors.push({
                                element: card,
                                message: 'Please add at least one surface'
                            });
                        } else {
                            // Check each surface has at least one measurement with data
                            let allSurfacesValid = true;
                            
                            surfaces.forEach((surface, surfaceIndex) => {
                                const measurements = surface.querySelectorAll('.measurement-block');
                                let surfaceHasValidMeasurement = false;
                                
                                measurements.forEach(measurement => {
                                    // Check for L x H inputs
                                    const lxhInputs = measurement.querySelectorAll('.lxh-pair input[type="number"]');
                                    const hasLxHData = Array.from(lxhInputs).some(input => {
                                        const val = parseFloat(input.value);
                                        return !isNaN(val) && val > 0;
                                    });
                                    
                                    // Check for total area input
                                    const totalInput = measurement.querySelector('.total-area-input');
                                    const hasTotalData = totalInput && parseFloat(totalInput.value) > 0;
                                    
                                    if (hasLxHData || hasTotalData) {
                                        surfaceHasValidMeasurement = true;
                                    }
                                });
                                
                                if (!surfaceHasValidMeasurement && measurements.length > 0) {
                                    allSurfacesValid = false;
                                    this.errors.push({
                                        element: surface,
                                        message: 'Please enter dimensions for at least one measurement'
                                    });
                                }
                            });
                            
                            if (allSurfacesValid && surfaces.length > 0) {
                                hasAtLeastOneValidCard = true;
                            }
                        }
                    }
                }
                
                console.groupEnd();
            });
            
            // Ensure at least one paint card is properly filled
            if (paintCards.length > 0 && !hasAtLeastOneValidCard) {
                // Only add this error if no specific errors were found
                if (this.errors.length === 0) {
                    this.errors.push({
                        element: document.querySelector('.paint-selections-container'),
                        message: 'Please complete at least one paint selection with surfaces'
                    });
                }
            }
            
            console.log(`Validation complete: ${this.errors.length} errors found`);
            return this.errors.length === 0;
        };
        
        // Also override showSummary to be less intrusive
        const originalShowSummary = window.SurfacesValidation.surfaces.showSummary;
        
        window.SurfacesValidation.surfaces.showSummary = function() {
            if (this.errors.length === 0) return;
            
            // Remove any existing summary
            const existingSummary = document.querySelector('.validation-summary');
            if (existingSummary) {
                existingSummary.remove();
            }
            
            // Create a more user-friendly summary
            const summaryHtml = `
                <div class="validation-summary validation-warning" style="
                    background-color: #fef3c7;
                    border: 1px solid #f59e0b;
                    color: #92400e;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border-radius: 0.5rem;
                ">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">Please complete the following:</h3>
                    <ul style="margin: 0; padding-left: 1.5rem;">
                        ${this.errors.map(err => `<li>${err.message}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            // Insert at top of main content area
            const mainContent = document.querySelector('.container-fluid') || document.querySelector('main');
            if (mainContent) {
                mainContent.insertAdjacentHTML('afterbegin', summaryHtml);
                
                // Auto-hide after 15 seconds
                setTimeout(() => {
                    const summary = document.querySelector('.validation-summary');
                    if (summary) summary.remove();
                }, 15000);
            }
            
            // Add gentle highlighting to error fields
            this.errors.forEach(error => {
                if (error.element) {
                    error.element.classList.add('validation-error');
                    // Auto-remove error class after 10 seconds
                    setTimeout(() => {
                        error.element.classList.remove('validation-error');
                    }, 10000);
                }
            });
        };
    }
    
    console.log('✅ Validation fixes applied successfully');
    
})();