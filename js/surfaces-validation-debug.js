/**
 * Surfaces Validation Debug Script
 * Helps identify validation issues and provides temporary bypass
 */

(function() {
    'use strict';
    
    console.log('🔍 Surfaces Validation Debug Script Loaded');
    
    // Add debug function to window for easy access
    window.debugValidation = function() {
        console.group('🔍 Validation Debug Report');
        
        // Check paint cards
        const paintCards = document.querySelectorAll('.paint-card');
        console.log(`Found ${paintCards.length} paint cards`);
        
        paintCards.forEach((card, index) => {
            console.group(`Paint Card ${index + 1}`);
            
            // Check brand selection
            const brandSelect = card.querySelector('.paint-brand-select');
            console.log('Brand select element:', brandSelect);
            console.log('Brand value:', brandSelect?.value || 'NOT FOUND');
            
            // Check product selection
            const allProducts = card.querySelectorAll('.paint-product-card');
            const selectedProducts = card.querySelectorAll('.paint-product-card.selected');
            console.log(`Products: ${selectedProducts.length}/${allProducts.length} selected`);
            
            // Check surfaces
            const surfaces = card.querySelectorAll('.surface-card');
            console.log(`Surfaces: ${surfaces.length} found`);
            
            surfaces.forEach((surface, surfaceIndex) => {
                console.group(`Surface ${surfaceIndex + 1}`);
                
                const measurements = surface.querySelectorAll('.measurement-block');
                console.log(`Measurements: ${measurements.length} found`);
                
                measurements.forEach((measurement, measIndex) => {
                    const lxhInputs = measurement.querySelectorAll('.lxh-pair input');
                    const totalInput = measurement.querySelector('.total-area-input');
                    const hasLxHValues = Array.from(lxhInputs).some(input => input.value);
                    const hasTotalValue = totalInput?.value;
                    
                    console.log(`Measurement ${measIndex + 1}:`, {
                        lxhInputs: lxhInputs.length,
                        hasLxHValues,
                        totalValue: totalInput?.value || 'NONE',
                        hasTotalValue
                    });
                });
                
                console.groupEnd();
            });
            
            console.groupEnd();
        });
        
        console.groupEnd();
    };
    
    // Add bypass function
    window.bypassValidation = function() {
        console.warn('⚠️ Bypassing validation - use for testing only!');
        
        // Save current state
        if (window.formState) {
            window.formState.currentStep = 3;
            window.formState.saveState();
        }
        
        // Navigate to next page
        window.location.href = 'contract.html';
    };
    
    // Add temporary button for bypass
    window.addBypassButton = function() {
        const nav = document.querySelector('.form-navigation');
        if (nav) {
            const bypassBtn = document.createElement('button');
            bypassBtn.textContent = 'Bypass Validation (Debug)';
            bypassBtn.className = 'btn btn-warning';
            bypassBtn.style.cssText = 'background-color: #f59e0b; color: white; margin-left: 10px;';
            bypassBtn.onclick = function(e) {
                e.preventDefault();
                window.bypassValidation();
            };
            nav.appendChild(bypassBtn);
            console.log('✅ Bypass button added to navigation');
        }
    };
    
    // Auto-run debug on page load
    setTimeout(() => {
        console.log('Running initial validation debug...');
        window.debugValidation();
        
        // Add helper message
        console.log(`
🛠️ Debug Commands Available:
- debugValidation() - Run validation debug report
- bypassValidation() - Skip validation and proceed to next step
- addBypassButton() - Add a bypass button to the page
        `);
    }, 1000);
    
})();