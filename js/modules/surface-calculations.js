// Surface Calculations Module - Consolidated Production Version
// Handles all surface area calculations, display updates, and default values
// Consolidated from: total-area-calculation-fix.js, total-area-display-fix.js,
// remove-calculated-total-waffles.js, fix-new-section-defaults.js, fix-default-lxh-inputs.js

(function() {
  'use strict';
  
  // Configuration
  const config = {
    defaultLength: 10,
    defaultHeight: 10,
    defaultArea: 100,
    debugMode: false
  };
  
  // 1. Recalculate all surface areas
  function recalculateAllAreas() {
    if (!window.formState || !window.formState.data || !window.formState.data.surfaces) return;
    
    window.formState.data.surfaces.forEach(surface => {
      if (surface.id && typeof calculateAndUpdateStateAreas === 'function') {
        calculateAndUpdateStateAreas(surface.id);
        
        // Update the display
        if (typeof updateDisplayedCalculations === 'function') {
          updateDisplayedCalculations(surface.id);
        }
      }
    });
    
    if (config.debugMode && window.ErrorHandler) {
      window.ErrorHandler.debug('[Surface Calculations] All areas recalculated');
    }
  }
  
  // 2. Update all total area displays
  function updateAllTotalDisplays() {
    const allSurfaceCards = document.querySelectorAll('.surface-card');
    
    allSurfaceCards.forEach(card => {
      const surfaceId = card.dataset.id;
      if (!surfaceId) return;
      
      const surface = window.formState?.data?.surfaces?.find(s => s.id === surfaceId);
      if (!surface) return;      
      // Calculate total if not already calculated
      let totalArea = surface.calculatedTotalArea;
      if (totalArea === undefined || totalArea === null) {
        totalArea = 0;
        (surface.measurements || []).forEach(measurement => {
          const area = measurement.calculatedEntryArea || 0;
          if (measurement.isDeduction) {
            totalArea -= area;
          } else {
            totalArea += area;
          }
        });
        surface.calculatedTotalArea = totalArea;
      }
      
      // Update display
      const totalElement = card.querySelector('.calculated-total-value');
      if (totalElement) {
        totalElement.textContent = totalArea.toFixed(2);
      }
    });
  }
  
  // 3. Fix total area display in modals
  function fixTotalAreaDisplay() {
    const modals = document.querySelectorAll('#area-settings-modal');
    
    modals.forEach(modal => {
      const toggle = modal.querySelector('.toggle-switch input[type="checkbox"]');
      const totalContainer = modal.querySelector('.total-input-container');
      const dimensionsContainer = modal.querySelector('.lxh-inputs-container');
      
      if (toggle && totalContainer && dimensionsContainer) {
        // Force the correct display state
        if (toggle.checked) {
          // Total Area mode
          totalContainer.style.display = 'block';
          totalContainer.style.visibility = 'visible';
          totalContainer.style.position = 'relative';
          totalContainer.style.opacity = '1';
          dimensionsContainer.style.display = 'none';
        } else {
          // L×H mode
          dimensionsContainer.style.display = 'block';
          dimensionsContainer.style.visibility = 'visible';
          dimensionsContainer.style.position = 'relative';
          dimensionsContainer.style.opacity = '1';
          totalContainer.style.display = 'none';
        }
      }
    });
  }