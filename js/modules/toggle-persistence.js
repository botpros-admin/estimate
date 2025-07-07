// Toggle Persistence Module - Consolidated Production Version
// Handles all aspects of "Same Color" vs "Different Colors" toggle state persistence
// Consolidated from: toggle-persistence-production.js, complete-toggle-persistence-fix.js,
// color-toggle-persistence-fix.js, direct-toggle-html-fix.js, realtime-toggle-save-fix.js,
// fix-different-colors-visibility.js, fix-color-status-override.js

(function() {
  'use strict';
  
  // Override updateColorStatus to respect saved sameColor state
  const originalUpdateColorStatus = window.updateColorStatus;
  
  window.updateColorStatus = function(paintId, colorStatus) {
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) return;
    
    // Update color status
    paintSelection.colorStatus = colorStatus;
    formState.saveState();
    
    // Handle UI updates
    const colorInputSection = document.getElementById(`color-input-section-${paintId}`);
    if (colorInputSection) {
      if (colorStatus === 'selected') {
        colorInputSection.style.display = 'block';
        
        const sameColorToggle = document.getElementById(`toggle-same-color-${paintId}`);
        if (sameColorToggle) {
          // Only set default if sameColor is truly undefined
          if (paintSelection.sameColor === undefined) {
            sameColorToggle.checked = true;
            toggleSameColor(paintId, true);
          } else {
            // Respect the saved state
            sameColorToggle.checked = paintSelection.sameColor;
            
            // Update UI based on saved state
            updateToggleUI(paintId, paintSelection.sameColor);
          }
        }
      } else {
        colorInputSection.style.display = 'none';
      }    }
    
    if (originalUpdateColorStatus) {
      originalUpdateColorStatus.apply(this, arguments);
    }
  };
  
  // Function to update toggle UI
  function updateToggleUI(paintId, isSameColor) {
    const leftLabel = document.getElementById(`toggle-label-left-${paintId}`);
    const rightLabel = document.getElementById(`toggle-label-right-${paintId}`);
    const singleColorInput = document.getElementById(`single-color-input-${paintId}`);
    const paintCard = document.querySelector(`[data-paint-id="${paintId}"]`);
    
    if (isSameColor === false) {
      // Different Colors
      leftLabel?.classList.add('active');
      rightLabel?.classList.remove('active');
      if (singleColorInput) singleColorInput.style.display = 'none';
      
      // Show measurement color inputs
      if (paintCard) {
        paintCard.querySelectorAll('.measurement-color-input-container').forEach(container => {
          container.style.display = 'block';
        });
      }
    } else {
      // Same Color
      leftLabel?.classList.remove('active');
      rightLabel?.classList.add('active');
      if (singleColorInput) singleColorInput.style.display = 'block';
      
      // Hide measurement color inputs
      if (paintCard) {
        paintCard.querySelectorAll('.measurement-color-input-container').forEach(container => {
          container.style.display = 'none';
        });
      }
    }
  }
  
  // Override toggleSameColor to save state immediately
  const originalToggleSameColor = window.toggleSameColor;
  
  window.toggleSameColor = function(paintId, isSameColor) {    // Save the state immediately
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (paintSelection) {
      paintSelection.sameColor = isSameColor;
      formState.saveState();
    }
    
    // Update UI
    updateToggleUI(paintId, isSameColor);
    
    // Call original if exists
    if (originalToggleSameColor) {
      originalToggleSameColor.apply(this, arguments);
    }
  };
  
  // Fix HTML generation to include saved state
  const originalRenderPaintCard = window.renderPaintCardEnhanced;
  
  if (originalRenderPaintCard) {
    window.renderPaintCardEnhanced = function(paintSelection) {
      const card = originalRenderPaintCard.apply(this, arguments);
      
      // Only process if color is selected
      if (paintSelection.colorStatus !== 'selected') {
        return card;
      }
      
      // Determine the actual state (default to true if undefined)
      const isSameColor = paintSelection.sameColor !== false;
      const paintId = paintSelection.id;
      
      // Clone the card to modify it
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(card.cloneNode(true));
      const modifiedCard = tempDiv.firstChild;
      
      // Find the toggle and update its state
      const toggle = modifiedCard.querySelector(`#toggle-same-color-${paintId}`);
      if (toggle) {
        toggle.checked = isSameColor;
        
        // Update label states
        const leftLabel = modifiedCard.querySelector(`#toggle-label-left-${paintId}`);
        const rightLabel = modifiedCard.querySelector(`#toggle-label-right-${paintId}`);        
        if (isSameColor) {
          leftLabel?.classList.remove('active');
          rightLabel?.classList.add('active');
        } else {
          leftLabel?.classList.add('active');
          rightLabel?.classList.remove('active');
        }
        
        // Handle visibility
        const singleColorInput = modifiedCard.querySelector(`#single-color-input-${paintId}`);
        const measurementColorInputs = modifiedCard.querySelectorAll('.measurement-color-input-container');
        
        if (isSameColor) {
          if (singleColorInput) singleColorInput.style.display = 'block';
          measurementColorInputs.forEach(container => {
            container.style.display = 'none';
          });
        } else {
          if (singleColorInput) singleColorInput.style.display = 'none';
          measurementColorInputs.forEach(container => {
            container.style.display = 'block';
          });
        }
      }
      
      return modifiedCard;
    };
  }
  
  // Listen for changes and save in real-time
  document.addEventListener('change', function(e) {
    if (e.target.id && e.target.id.startsWith('toggle-same-color-')) {
      const paintId = e.target.id.replace('toggle-same-color-', '');
      const isSameColor = e.target.checked;
      
      // Call our overridden function to handle the change
      toggleSameColor(paintId, isSameColor);
    }
  });
  
  // Monitor for dynamically added toggles
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Element node
          const toggles = node.querySelectorAll ? node.querySelectorAll('[id^="toggle-same-color-"]') : [];          toggles.forEach(toggle => {
            const paintId = toggle.id.replace('toggle-same-color-', '');
            const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
            
            if (paintSelection && paintSelection.colorStatus === 'selected') {
              // Apply saved state or default
              const isSameColor = paintSelection.sameColor !== false;
              toggle.checked = isSameColor;
              
              // Apply UI state immediately
              updateToggleUI(paintId, isSameColor);
            }
          });
        }
      });
    });
  });
  
  // Start observing if paint selections container exists
  const paintSelectionsContainer = document.getElementById('paint-selections');
  if (paintSelectionsContainer && observer) {
    observer.observe(paintSelectionsContainer, {
      childList: true,
      subtree: true
    });
  }
  
  // Apply saved states on page load
  if (formState && formState.data && formState.data.paintSelections) {
    formState.data.paintSelections.forEach(paintSelection => {
      if (paintSelection.colorStatus === 'selected') {
        const toggle = document.getElementById(`toggle-same-color-${paintSelection.id}`);
        if (toggle) {
          const isSameColor = paintSelection.sameColor !== false;
          toggle.checked = isSameColor;
          updateToggleUI(paintSelection.id, isSameColor);
        }
      }
    });
  }
  
})();