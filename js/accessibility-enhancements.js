// Accessibility Enhancements for Paint Estimator
// Comprehensive ARIA support, keyboard navigation, and screen reader announcements
(function() {
  'use strict';

  // Accessibility configuration
  const A11Y_CONFIG = {
    announceDelay: 100,
    focusTrapSelector: '.modal-content',
    accordionSelector: '.paint-card, .surface-card',
    formControlSelectors: 'input, select, textarea, button, [role="button"]',
    skipLinkTarget: '#paint-selections-container'
  };

  // Screen reader announcements
  let liveRegion = null;

  // Initialize accessibility features
  function initializeAccessibility() {
    console.log('Initializing accessibility enhancements...');
    
    // Create screen reader live region
    createLiveRegion();
    
    // Add skip navigation link
    addSkipNavigation();
    
    // Initialize keyboard navigation detection
    initKeyboardNavigationDetection();
    
    // Apply ARIA attributes to existing elements
    applyInitialAriaAttributes();
    
    // Set up mutation observer for dynamic content
    observeDynamicContent();
    
    // Initialize focus management
    initializeFocusManagement();
    
    // Set up form validation announcements
    initializeValidationAnnouncements();
    
    console.log('Accessibility enhancements initialized successfully');
  }

  // Create screen reader live region for announcements
  function createLiveRegion() {
    liveRegion = document.createElement('div');
    liveRegion.className = 'aria-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    document.body.appendChild(liveRegion);
  }

  // Announce message to screen readers
  function announceToScreenReader(message, priority = 'polite') {
    if (!liveRegion) createLiveRegion();
    
    // Clear previous announcement
    liveRegion.textContent = '';
    
    // Update priority if needed
    liveRegion.setAttribute('aria-live', priority);
    
    // Announce after a brief delay
    setTimeout(() => {
      liveRegion.textContent = message;
    }, A11Y_CONFIG.announceDelay);
  }

  // Add skip navigation link
  function addSkipNavigation() {
    const skipNav = document.createElement('a');
    skipNav.href = '#paint-selections-container';
    skipNav.className = 'skip-nav';
    skipNav.textContent = 'Skip to main content';
    skipNav.setAttribute('aria-label', 'Skip to main content');
    
    skipNav.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(A11Y_CONFIG.skipLinkTarget);
      if (target) {
        target.tabIndex = -1;
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    document.body.insertBefore(skipNav, document.body.firstChild);
  }

  // Initialize keyboard navigation detection
  function initKeyboardNavigationDetection() {
    let isKeyboardNav = false;
    
    // Detect keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        isKeyboardNav = true;
        document.body.classList.add('keyboard-nav');
      }
    });
    
    // Detect mouse navigation
    document.addEventListener('mousedown', () => {
      isKeyboardNav = false;
      document.body.classList.remove('keyboard-nav');
    });
  }

  // Apply ARIA attributes to existing elements
  function applyInitialAriaAttributes() {
    // Main landmarks
    const header = document.querySelector('.app-header');
    if (header) header.setAttribute('role', 'banner');
    
    const main = document.querySelector('.main-container');
    if (main) main.setAttribute('role', 'main');
    
    // Progress bar
    const progressBar = document.querySelector('.progress-container');
    if (progressBar) {
      progressBar.setAttribute('role', 'progressbar');
      const progressFill = document.getElementById('progress-fill');
      if (progressFill) {
        const width = parseInt(progressFill.style.width) || 0;
        progressBar.setAttribute('aria-valuenow', width);
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        progressBar.setAttribute('aria-label', `Progress: ${width} percent complete`);
      }
    }
    
    // Navigation buttons
    const prevButton = document.getElementById('prev-button');
    if (prevButton) {
      prevButton.setAttribute('aria-label', 'Go to previous step');
    }
    
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
      nextButton.setAttribute('aria-label', 'Go to next step');
    }
    
    // Form description
    const formDesc = document.querySelector('.form-description');
    if (formDesc) {
      formDesc.id = 'form-description';
      const formContent = document.getElementById('form-content');
      if (formContent) {
        formContent.setAttribute('aria-describedby', 'form-description');
      }
    }
  }

  // Apply ARIA to dynamically created accordion
  function applyAccordionAria(accordionElement) {
    const header = accordionElement.querySelector('.mb-4.p-3.bg-gray-50.rounded-lg[style*="cursor: pointer"]');
    const content = accordionElement.querySelector('.service-content');
    
    if (header && content) {
      // Generate unique IDs
      const accordionId = accordionElement.dataset.paintId || accordionElement.dataset.serviceId || accordionElement.dataset.id;
      const headerId = `accordion-header-${accordionId}`;
      const contentId = `accordion-content-${accordionId}`;
      
      // Set IDs
      header.id = headerId;
      content.id = contentId;
      
      // Convert header to button semantics
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', content.style.display !== 'none' ? 'true' : 'false');
      header.setAttribute('aria-controls', contentId);
      
      // Add content attributes
      content.setAttribute('role', 'region');
      content.setAttribute('aria-labelledby', headerId);
      content.setAttribute('aria-hidden', content.style.display === 'none' ? 'true' : 'false');
      
      // Add expand/collapse indicator
      if (!header.querySelector('.accordion-indicator')) {
        const indicator = document.createElement('span');
        indicator.className = 'accordion-indicator';
        indicator.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        indicator.setAttribute('aria-hidden', 'true');
        header.appendChild(indicator);
      }
      
      // Keyboard support
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    }
  }

  // Apply ARIA to form controls
  function applyFormControlAria(element) {
    // Skip if already processed
    if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) {
      return;
    }
    
    const elementId = element.id;
    let label = null;
    
    // Paint finish select
    if (element.classList.contains('paint-finish-select')) {
      element.setAttribute('aria-label', 'Select paint finish');
      element.setAttribute('aria-required', 'true');
    }
    // Paint brand select
    else if (element.classList.contains('paint-brand-select')) {
      element.setAttribute('aria-label', 'Select paint brand');
      element.setAttribute('aria-required', 'true');
    }
    // Color status select
    else if (elementId && elementId.startsWith('color-status-')) {
      element.setAttribute('aria-label', 'Color selection status');
      element.setAttribute('aria-required', 'true');
    }
    // Surface title input
    else if (element.classList.contains('surface-title-input')) {
      element.setAttribute('aria-label', 'Surface section name');
      element.setAttribute('aria-required', 'true');
    }
    // Measurement description input
    else if (element.classList.contains('measurement-description-input')) {
      element.setAttribute('aria-label', 'Measurement area description');
    }
    // Color input
    else if (element.classList.contains('measurement-color-input')) {
      element.setAttribute('aria-label', 'Color name or ID');
      element.setAttribute('aria-autocomplete', 'list');
      element.setAttribute('aria-controls', 'color-suggestions');
    }
    // L x H inputs
    else if (element.classList.contains('lxh-input')) {
      if (element.placeholder === 'L') {
        element.setAttribute('aria-label', 'Length in feet');
      } else if (element.placeholder === 'H') {
        element.setAttribute('aria-label', 'Height in feet');
      }
    }
    // Total area input
    else if (element.classList.contains('total-area-input')) {
      element.setAttribute('aria-label', 'Total area in square feet');
    }
    // Toggle switches
    else if (element.type === 'checkbox' && element.id && element.id.startsWith('toggle-')) {
      const measurementId = element.id.replace('toggle-', '');
      element.setAttribute('aria-label', 'Toggle between dimensions and total area input');
      element.setAttribute('role', 'switch');
      element.setAttribute('aria-checked', element.checked ? 'true' : 'false');
      
      // Update aria-checked on change
      element.addEventListener('change', () => {
        element.setAttribute('aria-checked', element.checked ? 'true' : 'false');
        announceToScreenReader(element.checked ? 'Switched to total area input' : 'Switched to dimensions input');
      });
    }
    // File inputs
    else if (element.type === 'file') {
      element.setAttribute('aria-label', 'Upload photo for this measurement');
    }
    
    // Add required attribute for screen readers
    if (element.hasAttribute('required')) {
      element.setAttribute('aria-required', 'true');
    }
  }

  // Apply ARIA to buttons
  function applyButtonAria(button) {
    // Skip if already processed
    if (button.hasAttribute('aria-label')) return;
    
    // Add measurement button
    if (button.classList.contains('add-measurement-btn')) {
      button.setAttribute('aria-label', 'Add new measurement area');
    }
    // Add L x H button
    else if (button.classList.contains('add-lxh-btn')) {
      button.setAttribute('aria-label', 'Add new length by height dimension');
    }
    // Add photo button
    else if (button.classList.contains('add-photo-btn')) {
      button.setAttribute('aria-label', 'Add photo to this measurement');
    }
    // Remove buttons
    else if (button.classList.contains('measurement-remove-btn')) {
      button.setAttribute('aria-label', 'Remove this measurement area');
      button.setAttribute('role', 'button');
    }
    else if (button.classList.contains('surface-remove-btn')) {
      button.setAttribute('aria-label', 'Remove this surface section');
      button.setAttribute('role', 'button');
    }
    else if (button.classList.contains('remove-lxh-btn')) {
      button.setAttribute('aria-label', 'Remove this dimension');
      button.setAttribute('role', 'button');
    }
    else if (button.classList.contains('photo-remove-btn')) {
      button.setAttribute('aria-label', 'Remove this photo');
      button.setAttribute('role', 'button');
    }
    // Area settings icon
    else if (button.classList.contains('area-settings-icon')) {
      button.setAttribute('aria-label', 'Open area calculation settings');
      button.setAttribute('role', 'button');
      button.setAttribute('tabindex', '0');
      
      // Add keyboard support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
    }
  }

  // Observe DOM changes and apply ARIA
  function observeDynamicContent() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Process added nodes
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Apply accordion ARIA
            if (node.classList && (node.classList.contains('paint-card') || 
                node.classList.contains('surface-card'))) {
              setTimeout(() => applyAccordionAria(node), 100);
            }
            
            // Apply ARIA to form controls within the node
            const formControls = node.querySelectorAll(A11Y_CONFIG.formControlSelectors);
            formControls.forEach(applyFormControlAria);
            
            // Apply ARIA to buttons
            const buttons = node.querySelectorAll('button, [role="button"], .btn');
            buttons.forEach(applyButtonAria);
            
            // Check if node itself is a form control or button
            if (node.matches && node.matches(A11Y_CONFIG.formControlSelectors)) {
              applyFormControlAria(node);
            }
            if (node.matches && node.matches('button, [role="button"], .btn')) {
              applyButtonAria(node);
            }
          }
        });
      });
    });
    
    // Observe the paint selections container
    const container = document.getElementById('paint-selections-container');
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true
      });
    }
  }

  // Focus management
  function initializeFocusManagement() {
    // Track focus for better UX
    let lastFocusedElement = null;
    
    document.addEventListener('focusin', (e) => {
      lastFocusedElement = e.target;
    });
    
    // Manage focus when elements are removed
    document.addEventListener('click', (e) => {
      // Handle delete button clicks
      if (e.target.closest('.measurement-remove-btn, .surface-remove-btn, .remove-lxh-btn, .photo-remove-btn')) {
        const container = e.target.closest('.measurement-block, .surface-card, .lxh-pair, .photo-thumbnail');
        if (container) {
          // Find next focusable element
          const parent = container.parentElement;
          const nextSibling = container.nextElementSibling;
          const prevSibling = container.previousElementSibling;
          
          // Set focus target
          setTimeout(() => {
            if (nextSibling && nextSibling.querySelector(A11Y_CONFIG.formControlSelectors)) {
              nextSibling.querySelector(A11Y_CONFIG.formControlSelectors).focus();
            } else if (prevSibling && prevSibling.querySelector(A11Y_CONFIG.formControlSelectors)) {
              prevSibling.querySelector(A11Y_CONFIG.formControlSelectors).focus();
            } else if (parent.querySelector('.btn')) {
              parent.querySelector('.btn').focus();
            }
            
            // Announce deletion
            announceToScreenReader('Item removed successfully');
          }, 100);
        }
      }
    });
  }

  // Modal focus trap
  function trapFocus(modalElement) {
    const focusableElements = modalElement.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    // Focus first element
    firstFocusable.focus();
    
    // Trap focus
    modalElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
      
      // Close on Escape
      if (e.key === 'Escape') {
        const closeButton = modalElement.querySelector('.modal-close, [aria-label*="Close"]');
        if (closeButton) {
          closeButton.click();
        }
      }
    });
  }

  // Validation announcements
  function initializeValidationAnnouncements() {
    // Override validation methods if they exist
    if (window.SurfacesValidation && window.SurfacesValidation.field) {
      const originalShowError = window.SurfacesValidation.field.showFieldError;
      window.SurfacesValidation.field.showFieldError = function(element, message) {
        originalShowError.call(this, element, message);
        
        // Add ARIA attributes
        element.setAttribute('aria-invalid', 'true');
        element.setAttribute('aria-describedby', `${element.id}-error`);
        
        // Create error message element with ID
        const errorElement = element.parentElement.querySelector('.error-message');
        if (errorElement) {
          errorElement.id = `${element.id}-error`;
        }
        
        // Announce error
        announceToScreenReader(`Validation error: ${message}`, 'assertive');
      };
      
      const originalClearError = window.SurfacesValidation.field.clearFieldError;
      window.SurfacesValidation.field.clearFieldError = function(element) {
        originalClearError.call(this, element);
        
        // Remove ARIA attributes
        element.removeAttribute('aria-invalid');
        element.removeAttribute('aria-describedby');
      };
      
      const originalShowSummary = window.SurfacesValidation.surfaces.showSummary;
      window.SurfacesValidation.surfaces.showSummary = function() {
        originalShowSummary.call(this);
        
        // Focus and announce summary
        const summary = document.querySelector('.validation-summary');
        if (summary) {
          summary.setAttribute('role', 'alert');
          summary.setAttribute('aria-live', 'assertive');
          summary.tabIndex = -1;
          summary.focus();
          
          const errorCount = summary.querySelectorAll('li').length;
          announceToScreenReader(`${errorCount} validation errors found. Please review and correct them.`, 'assertive');
        }
      };
    }
  }

  // Enhanced color suggestions accessibility
  function enhanceColorSuggestionsAccessibility() {
    // Monitor for color suggestion dropdowns
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.classList && 
              node.classList.contains('color-suggestions-dropdown')) {
            // Add ARIA attributes
            node.setAttribute('role', 'listbox');
            node.id = 'color-suggestions';
            
            // Make suggestion items accessible
            const items = node.querySelectorAll('.color-suggestion-item');
            items.forEach((item, index) => {
              item.setAttribute('role', 'option');
              item.setAttribute('tabindex', '-1');
              item.id = `color-suggestion-${index}`;
            });
            
            // Keyboard navigation
            const input = node.previousElementSibling;
            if (input) {
              let selectedIndex = -1;
              
              input.addEventListener('keydown', (e) => {
                const items = node.querySelectorAll('.color-suggestion-item');
                
                switch(e.key) {
                  case 'ArrowDown':
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                    updateSelection();
                    break;
                    
                  case 'ArrowUp':
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, -1);
                    updateSelection();
                    break;
                    
                  case 'Enter':
                    if (selectedIndex >= 0 && items[selectedIndex]) {
                      e.preventDefault();
                      items[selectedIndex].click();
                    }
                    break;
                    
                  case 'Escape':
                    e.preventDefault();
                    node.style.display = 'none';
                    selectedIndex = -1;
                    break;
                }
                
                function updateSelection() {
                  items.forEach((item, index) => {
                    if (index === selectedIndex) {
                      item.classList.add('selected');
                      item.setAttribute('aria-selected', 'true');
                      input.setAttribute('aria-activedescendant', item.id);
                      item.scrollIntoView({ block: 'nearest' });
                    } else {
                      item.classList.remove('selected');
                      item.setAttribute('aria-selected', 'false');
                    }
                  });
                }
              });
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Loading states
  function showLoadingState(message = 'Loading...') {
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', message);
    
    const content = document.createElement('div');
    content.className = 'loading-content';
    content.innerHTML = `
      <div class="loading-spinner" aria-hidden="true"></div>
      <p class="mt-4 text-lg font-medium">${message}</p>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Announce loading
    announceToScreenReader(message, 'polite');
    
    // Return function to hide loading
    return () => {
      overlay.remove();
      announceToScreenReader('Loading complete');
    };
  }

  // Expose functions globally
  window.PaintEstimatorA11y = {
    announce: announceToScreenReader,
    showLoading: showLoadingState,
    trapFocus: trapFocus,
    enhanceModal: (modal) => {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      trapFocus(modal);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAccessibility);
  } else {
    initializeAccessibility();
  }
  
  // Initialize color suggestions enhancement
  enhanceColorSuggestionsAccessibility();

})();