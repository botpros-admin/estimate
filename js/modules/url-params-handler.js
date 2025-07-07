// URL Parameter Handler for Project Info Page
(function() {
  'use strict';
  
  // Function to parse URL parameters and populate form
  function populateFromURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Only proceed if there are parameters
    if (urlParams.toString() === '') return;
    
    console.log('Processing URL parameters:', Object.fromEntries(urlParams.entries()));
    
    // Wait for formState to be initialized
    if (typeof formState === 'undefined' || !formState.data) {
      setTimeout(populateFromURLParams, 100);
      return;
    }
    
    // Project Type
    const projectType = urlParams.get('projectType');
    if (projectType) {
      const select = document.querySelector('select');
      if (select) {
        select.value = projectType;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      formState.data.projectType = projectType;
    }
    
    // Community Name
    const communityName = urlParams.get('communityName');
    if (communityName) {
      const communityInput = document.querySelector('input[type="text"]');
      if (communityInput) {
        communityInput.value = decodeURIComponent(communityName);
        communityInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      formState.data.communityName = decodeURIComponent(communityName);
    }
    
    // Service Types (multi-select)
    const serviceTypes = urlParams.get('serviceTypes');
    if (serviceTypes) {
      const types = serviceTypes.split(',');
      formState.data.serviceTypes = types;
      
      // Wait for multi-select to be initialized
      setTimeout(() => {
        const multiSelectEl = document.querySelector('[data-name="serviceTypes"]');
        if (multiSelectEl) {
          // Trigger the multi-select update
          const event = new CustomEvent('update-multi-select', {
            detail: { values: types }
          });
          multiSelectEl.dispatchEvent(event);
          
          // If multi-select instance exists, use it
          if (window.multiSelectInstances && window.multiSelectInstances.serviceTypes) {
            window.multiSelectInstances.serviceTypes.setSelectedItems(types);
          }
        }
      }, 500);
    }
    
    // Painting Scope
    const paintingScope = urlParams.get('paintingScope');
    if (paintingScope) {
      const scopes = paintingScope.split(',');
      formState.data.projectScope = {
        interior: scopes.includes('interior'),
        exterior: scopes.includes('exterior')
      };
      
      // Update checkboxes after a delay to ensure they're rendered
      setTimeout(() => {
        const interiorCheckbox = document.querySelector('input[value="interior"]');
        const exteriorCheckbox = document.querySelector('input[value="exterior"]');
        
        if (interiorCheckbox) {
          interiorCheckbox.checked = scopes.includes('interior');
          interiorCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (exteriorCheckbox) {
          exteriorCheckbox.checked = scopes.includes('exterior');
          exteriorCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 500);
    }
    
    // Save state after all updates
    formState.saveState();
    
    // Trigger any UI updates
    if (typeof updateFormDisplay === 'function') {
      setTimeout(updateFormDisplay, 600);
    }
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateFromURLParams);
  } else {
    populateFromURLParams();
  }
  
  // Expose function globally for debugging
  window.populateFromURLParams = populateFromURLParams;
})();
