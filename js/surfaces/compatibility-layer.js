/**
 * Emergency Compatibility Layer
 * Task 009: Maps old PaintSurfacesValidation API to new SurfacesValidation API
 * This ensures the app loads while we complete the migration
 */

(function() {
    'use strict';
    
    // Wait for new API to be available
    function createCompatibilityLayer() {
        if (window.SurfacesValidation && window.SurfacesValidation.surfaces) {
            // Create compatibility mapping
            window.PaintSurfacesValidation = {
                validate: function() {
                    return window.SurfacesValidation.surfaces.validate();
                },
                showSummary: function() {
                    return window.SurfacesValidation.surfaces.showSummary();
                },
                showError: function(element, message) {
                    return window.SurfacesValidation.field.showFieldError(element, message);
                },
                clearError: function(element) {
                    return window.SurfacesValidation.field.clearFieldError(element);
                },
                // Legacy properties
                errors: [],
                warnings: []
            };
            
            console.log('Compatibility layer created: PaintSurfacesValidation → SurfacesValidation');
        } else {
            // Retry if API not ready
            setTimeout(createCompatibilityLayer, 100);
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createCompatibilityLayer);
    } else {
        createCompatibilityLayer();
    }
})();