(function() {
  'use strict';
  
  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Wait for formState to be available
  function waitForFormState(callback, attempts = 0) {
    if (typeof window.formState !== 'undefined' && window.formState) {
      callback();
    } else if (typeof formState !== 'undefined') {
      window.formState = formState;
      callback();
    } else if (attempts < 20) { // Max 1 second wait (20 * 50ms)
      // Try again in 50ms
      setTimeout(() => waitForFormState(callback, attempts + 1), 50);
    } else {
      // Create minimal fallback after timeout
      window.formState = {
        data: {},
        init: function() { this.initialized = true; return this; },
        initialized: true,
        currentStep: 3,
        totalSteps: 3,
        getTotalSteps: function() { return 3; },
        updateTotalSteps: function() { this.totalSteps = 3; },
        saveState: function() { return this; }
      };
      callback();
    }
  }
  
  // Initialize contract state management
  let contractState = {};
  let formState = {}; // Local copy of the global formState data
  
  // DOM Elements - will be initialized after DOM is ready
  let form = null;
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    // Wait for formState to be available
    waitForFormState(function() {
      // Initialize formState if needed
      if (window.formState && typeof window.formState.init === 'function' && !window.formState.initialized) {
        window.formState.init();
      }
      
      // Initialize form reference after DOM is ready
      form = document.getElementById('contract-form');
      
      loadFormState();
      initializeContractGenerator();
      setupEventListeners();
    });
  });
  
  // Initialize contract generator
  function initializeContractGenerator() {
    // Load contract state from localStorage if available
    const savedContractState = localStorage.getItem('contractState');
    if (savedContractState) {
      try {
        contractState = JSON.parse(savedContractState);
      } catch (e) {
        contractState = {};
      }
    }
    
    // Set default values
    setDefaultValues();
    
    // Load surfaces and materials from paint selection
    // DISABLED - Using hardcoded HTML content instead
    // loadSurfacesFromFormState();
    // loadMaterialsFromFormState();();
    
    // Make existing items editable
    makeItemsEditable();
    
    // Calculate initial pricing
    calculatePricing();
  }
  
  // Load form state from localStorage
  function loadFormState() {
    try {
      // First try to get formState from the global window object
      if (typeof window.formState !== 'undefined' && window.formState && window.formState.data) {
        // Copy the entire state structure
        formState = { data: JSON.parse(JSON.stringify(window.formState.data)) };
      } else {
        // Otherwise load from localStorage
        const savedState = localStorage.getItem('paintEstimatorState');
        
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          
          // Ensure we have the proper structure
          if (parsedState.data) {
            formState = parsedState;
          } else {
            // Old format - wrap in data property
            formState = { data: parsedState };
          }
        } else {
          // No saved state, use empty object with default structure
          formState = { 
            data: {
              contacts: [],
              siteAddress: {},
              surfaces: [],
              paintSelections: []
            } 
          };
        }
      }
    } catch (error) {
      formState = { 
        data: {
          contacts: [],
          siteAddress: {},
          surfaces: [],
          paintSelections: []
        } 
      };
    }
  }
  
  // Set default values
  function setDefaultValues() {
    // Set default valid until date (30 days from now) if not already set
    const validUntilField = document.getElementById('valid-until');
    if (validUntilField) {
      if (!validUntilField.value && (!contractState.validUntil || contractState.validUntil === '')) {
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);
        validUntilField.value = validUntil.toISOString().split('T')[0];
      } else if (contractState.validUntil) {
        validUntilField.value = contractState.validUntil;
      }
    }
    
    // Set default start date (7 days from now) if not already set
    const startDateField = document.getElementById('start-date');
    if (startDateField) {
      if (!startDateField.value && (!contractState.startDate || contractState.startDate === '')) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 7);
        startDateField.value = startDate.toISOString().split('T')[0];
      } else if (contractState.startDate) {
        startDateField.value = contractState.startDate;
      }
    }
    
    // Restore other saved values from contractState
    const setFieldValue = (fieldId, value) => {
      const field = document.getElementById(fieldId);
      if (field && value) {
        field.value = value;
      }
    };
    
    setFieldValue('duration', contractState.duration);
    setFieldValue('payment-schedule', contractState.paymentSchedule);
    setFieldValue('warranty-period', contractState.warrantyPeriod);
    
    if (contractState.materialSupply) {
      const materialSupplyField = document.getElementById('material-supply');
      if (materialSupplyField) {
        materialSupplyField.value = contractState.materialSupply;
        // Trigger change event to show/hide material notes
        const event = new Event('change', { bubbles: true });
        materialSupplyField.dispatchEvent(event);
      }
    }
    
    setFieldValue('material-notes', contractState.materialNotes);
    setFieldValue('scope-notes', contractState.scopeNotes);
    setFieldValue('discount-reason', contractState.discountReason);
    setFieldValue('pricing-notes', contractState.pricingNotes);
    
    // Handle discount amount separately since it's a number
    if (contractState.pricing && contractState.pricing.discount) {
      const discountField = document.getElementById('discount-amount');
      if (discountField) {
        discountField.value = contractState.pricing.discount;
      }
    }
  }
  
  // Load surfaces from form state
  function loadSurfacesFromFormState() {
    const surfacesSummary = document.getElementById('surfaces-summary');
    if (!surfacesSummary) return;
    
    // Check if surfaces-summary already has content with materials (hardcoded HTML)
    if (surfacesSummary.innerHTML.trim() && surfacesSummary.querySelector('.font-medium.text-gray-900')) {
      // Already has content with materials, don't override it
      return;
    }
    
    surfacesSummary.innerHTML = '';
    
    const surfaces = formState.data?.surfaces || [];
    const paintSelections = formState.data?.paintSelections || [];
    
    if (surfaces.length > 0) {
      // Group surfaces by type/service
      const surfaceGroups = {};
      
      surfaces.forEach((surface) => {
        // Determine the service type for this surface
        let serviceType = null;
        
        // First check if this surface is associated with a paint selection
        let hasPaintSelection = false;
        paintSelections.forEach(selection => {
          if (selection.surfaces && selection.surfaces.includes(surface.id)) {
            hasPaintSelection = true;
            if (selection.type === 'interior') {
              serviceType = 'Interior Painting';
            } else if (selection.type === 'exterior') {
              serviceType = 'Exterior Painting';
            }
          }
        });
        
        // If no paint selection, check for other service types
        if (!serviceType) {
          // Check if surface has an abrasive method or special type
          if (surface.abrasiveMethod) {
            serviceType = surface.abrasiveMethod;
          } else if (surface.serviceType) {
            serviceType = surface.serviceType;
          } else if (surface.type) {
            // For surfaces with type but no paint selection, use the type
            serviceType = surface.type;
          } else {
            serviceType = 'General Service';
          }
        }
        
        // Map abrasive method types and other services to proper service names
        const serviceTypeMap = {
          'sandblasting': 'Sandblasting',
          'pressure': 'Pressure Cleaning',
          'chemical': 'Chemical Stripping',
          'grinding': 'Grinding',
          'interior': 'Interior Painting',
          'exterior': 'Exterior Painting',
          'wallpaper': 'Wallpaper Removal',
          'drywall': 'Drywall Repair',
          'texturing': 'Texturing',
          'staining': 'Staining',
          'sealing': 'Sealing',
          'epoxy': 'Epoxy Coating',
          'specialty': 'Specialty Coating'
        };
        
        const displayServiceType = serviceTypeMap[serviceType] || serviceType;
        
        if (!surfaceGroups[displayServiceType]) {
          surfaceGroups[displayServiceType] = [];
        }
        
        surfaceGroups[displayServiceType].push(surface);
      });
      
      // Create containers for each service type
      Object.entries(surfaceGroups).forEach(([serviceType, serviceSurfaces]) => {
        // Calculate total area for this service type
        let serviceTotalArea = 0;
        let surfacesWithArea = 0;
        serviceSurfaces.forEach(surface => {
          if (surface.measurements) {
            let surfaceArea = 0;
            surface.measurements.forEach(measurement => {
              surfaceArea += measurement.calculatedEntryArea || 0;
            });
            if (surfaceArea > 0) {
              serviceTotalArea += surfaceArea;
              surfacesWithArea++;
            }
          }
        });
        
        // Skip this service type if no surfaces have area
        if (serviceTotalArea === 0 || surfacesWithArea === 0) {
          return;
        }
        
        // Create service type container with better styling
        const serviceContainer = document.createElement('div');
        serviceContainer.className = 'service-type-container bg-gray-50 rounded-lg p-4 mb-4 shadow-sm';
        
        // Add service type header with border
        const serviceHeader = document.createElement('h4');
        serviceHeader.className = 'font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-2';
        serviceHeader.textContent = serviceType;
        serviceContainer.appendChild(serviceHeader);
        
        // Create surfaces list for this service
        const surfacesList = document.createElement('div');
        surfacesList.className = 'space-y-2';
        
        serviceSurfaces.forEach((surface, idx) => {
          // Calculate total area for this surface
          let surfaceArea = 0;
          if (surface.measurements) {
            surface.measurements.forEach(measurement => {
              surfaceArea += measurement.calculatedEntryArea || 0;
            });
          }
          
          // Skip surfaces with no area
          if (surfaceArea === 0) {
            return;
          }
          
          const surfaceDiv = document.createElement('div');
          surfaceDiv.className = 'flex flex-col sm:flex-row sm:justify-between sm:items-center py-2';
          if (idx !== serviceSurfaces.length - 1) {
            surfaceDiv.className += ' border-b border-gray-200';
          }
          
          const nameSpan = document.createElement('span');
          nameSpan.className = 'font-medium text-gray-700 mb-1 sm:mb-0';
          nameSpan.textContent = surface.name || 'Unnamed surface';
          
          const detailsSpan = document.createElement('span');
          detailsSpan.className = 'text-sm text-gray-600 sm:text-right';
          detailsSpan.textContent = `${surfaceArea.toFixed(2)} sq ft`;
          
          surfaceDiv.appendChild(nameSpan);
          surfaceDiv.appendChild(detailsSpan);
          
          surfacesList.appendChild(surfaceDiv);
        });
        
        serviceContainer.appendChild(surfacesList);
        
        // Add total at the bottom
        if (serviceTotalArea > 0) {
          const totalDiv = document.createElement('div');
          totalDiv.className = 'mt-3 pt-3 border-t border-gray-300 flex justify-between items-center';
          
          const totalLabel = document.createElement('span');
          totalLabel.className = 'font-semibold text-gray-800';
          totalLabel.textContent = 'Total:';
          
          const totalValue = document.createElement('span');
          totalValue.className = 'font-semibold text-gray-800';
          totalValue.textContent = `${serviceTotalArea.toFixed(2)} sq ft`;
          
          totalDiv.appendChild(totalLabel);
          totalDiv.appendChild(totalValue);
          serviceContainer.appendChild(totalDiv);
        }
        
        surfacesSummary.appendChild(serviceContainer);
      });
    } else {
      const emptyState = document.createElement('div');
      emptyState.className = 'bg-gray-50 rounded-lg p-6 text-center';
      emptyState.innerHTML = '<p class="text-gray-500">No surfaces selected. Please complete surface selection first.</p>';
      surfacesSummary.appendChild(emptyState);
    }
  }
  
  // Load preparation steps from form state
  function loadPreparationSteps() {
    const prepSummary = document.getElementById('preparation-summary');
    
    // If element doesn't exist (removed from HTML), just return
    if (!prepSummary) {
      return;
    }
    
    prepSummary.innerHTML = '';
    
    // Check if there are any preparation requirements from surfaces
    const prepSteps = new Set();
    const surfaces = formState.data?.surfaces || [];
    
    surfaces.forEach(surface => {
      // Check preparation from project details page
      if (formState.data?.preparation) {
        Object.entries(formState.data.preparation).forEach(([prep, value]) => {
          if (value) {
            const prepMap = {
              'scraping': 'Scraping',
              'sanding': 'Sanding',
              'priming': 'Priming',
              'pressureWashing': 'Pressure Washing',
              'caulking': 'Caulking',
              'patching': 'Patching',
              'taping': 'Taping',
              'chemicalStripping': 'Chemical Stripping'
            };
            if (prepMap[prep]) {
              prepSteps.add(prepMap[prep]);
            }
          }
        });
      }
    });
    
    if (prepSteps.size > 0) {
      const prepList = document.createElement('ul');
      prepList.className = 'list-disc list-inside space-y-1';
      
      Array.from(prepSteps).forEach(step => {
        const li = document.createElement('li');
        li.className = 'text-gray-700';
        li.textContent = step;
        prepList.appendChild(li);
      });
      
      prepSummary.appendChild(prepList);
    } else {
      prepSummary.innerHTML = '<p class="text-gray-500">Standard surface preparation will be performed as needed.</p>';
    }
  }
  
  // Load materials from form state
  function loadMaterialsFromFormState() {
    const materialsSummary = document.getElementById('materials-summary');
    if (!materialsSummary) return;
    
    // Check if materials-summary already has content (hardcoded HTML)
    if (materialsSummary.innerHTML.trim() && materialsSummary.querySelector('.border-b')) {
      // Already has content, don't override it
      return;
    }
    
    materialsSummary.innerHTML = '';
    
    const paintSelections = formState.data?.paintSelections || [];
    
    if (paintSelections.length > 0) {
      const materialsList = document.createElement('div');
      materialsList.className = 'space-y-2';
      
      paintSelections.forEach((selection) => {
        if (selection.selectedProduct || selection.brand) {
          const paintDiv = document.createElement('div');
          paintDiv.className = 'p-3 border-b border-gray-200 last:border-0';
          
          // Brand (bold) - First
          if (selection.brand) {
            const brandDiv = document.createElement('div');
            brandDiv.className = 'font-bold text-gray-900 mb-1';
            brandDiv.textContent = selection.brand;
            paintDiv.appendChild(brandDiv);
          }
          
          // Product name - Second
          const nameDiv = document.createElement('div');
          nameDiv.className = 'text-gray-900 mb-2';
          nameDiv.textContent = selection.selectedProduct?.name || selection.productName || 'Unknown product';
          paintDiv.appendChild(nameDiv);
          
          // Details in specific order
          const detailsContainer = document.createElement('div');
          detailsContainer.className = 'space-y-1 text-sm text-gray-600';
          
          // Finish - First detail
          if (selection.finish) {
            const finishDiv = document.createElement('div');
            finishDiv.textContent = selection.finish;
            detailsContainer.appendChild(finishDiv);
          }
          
          // Type - Second detail
          if (selection.projectType || selection.type) {
            const typeDiv = document.createElement('div');
            const type = selection.projectType || selection.type;
            typeDiv.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            detailsContainer.appendChild(typeDiv);
          }
          
          // Color status - Third detail
          if (selection.colorStatus) {
            const colorStatusMap = {
              'tbd': 'Colors TBD',
              'selected': 'Colors Selected',
              'client-provided': 'Client to Provide Colors'
            };
            const colorStatusText = colorStatusMap[selection.colorStatus] || selection.colorStatus;
            const colorDiv = document.createElement('div');
            colorDiv.textContent = colorStatusText;
            detailsContainer.appendChild(colorDiv);
          }
          
          paintDiv.appendChild(detailsContainer);
          materialsList.appendChild(paintDiv);
        }
      });
      
      materialsSummary.appendChild(materialsList);
    } else {
      const emptyState = document.createElement('div');
      emptyState.className = 'bg-gray-50 rounded-lg p-6 text-center';
      emptyState.innerHTML = '<p class="text-gray-500">No materials selected. Please complete paint selection first.</p>';
      materialsSummary.appendChild(emptyState);
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Prevent form submission
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      return false;
    });
    
    // Material supply change
    document.getElementById('material-supply').addEventListener('change', function() {
      const notesContainer = document.getElementById('material-notes-container');
      notesContainer.style.display = this.value === 'mixed' ? 'block' : 'none';
      updateContractState();
    });
    
    // Payment schedule change
    document.getElementById('payment-schedule').addEventListener('change', function() {
      updatePaymentDetails();
      updateContractState();
    });
    
    // Form input changes
    form.addEventListener('input', debounce(function(e) {
      // Don't update if we're deleting an item
      if (document.querySelector('.deleting')) return;
      
      if (e.target.matches('input, select, textarea')) {
        updateContractState();
        calculatePricing();
      }
    }, 300));
    
    // Checkbox changes
    form.addEventListener('change', function(e) {
      if (e.target.type === 'checkbox') {
        updateContractState();
      }
    });
    
    // Previous button functionality
    document.getElementById('prev-button').addEventListener('click', function() {
      // Always go back to combined paint & surfaces page
      window.location.href = 'surfaces.html';
    });
  }
  
  // Update payment details based on schedule
  function updatePaymentDetails() {
    const scheduleEl = document.getElementById('payment-schedule');
    const schedule = scheduleEl ? scheduleEl.value : '';
    // In a full implementation, this would show/hide additional payment fields
  }
  
  // Store pending delete action
  let pendingDeleteAction = null;
  
  // Show confirmation modal
  function showConfirmationModal(message, onConfirm) {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('confirmation-modal')) {
      const modalHTML = `
        <div id="confirmation-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style="display: none;">
          <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
            <p id="confirmation-message" class="text-gray-700 mb-6"></p>
            <div class="flex gap-3 justify-end items-center" style="align-items: center;">
              <button id="cancel-btn" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors min-w-[80px] text-center inline-flex items-center justify-center">Cancel</button>
              <button id="confirm-btn" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors min-w-[80px] text-center inline-flex items-center justify-center">Delete</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    const modal = document.getElementById('confirmation-modal');
    const messageEl = document.getElementById('confirmation-message');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    messageEl.textContent = message;
    modal.style.display = 'flex';
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Focus the cancel button by default (safer option)
    setTimeout(() => cancelBtn.focus(), 100);
    
    // Store the action to execute on confirmation
    pendingDeleteAction = onConfirm;
    
    // Handle confirm
    confirmBtn.onclick = () => {
      if (pendingDeleteAction) {
        pendingDeleteAction();
        pendingDeleteAction = null;
      }
      hideConfirmationModal();
    };
    
    // Handle cancel
    cancelBtn.onclick = () => {
      pendingDeleteAction = null;
      hideConfirmationModal();
    };
    
    // Click outside to close
    modal.onclick = (e) => {
      if (e.target === modal) {
        pendingDeleteAction = null;
        hideConfirmationModal();
      }
    };
    
    // Keyboard support
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        pendingDeleteAction = null;
        hideConfirmationModal();
      } else if (e.key === 'Enter') {
        if (pendingDeleteAction) {
          pendingDeleteAction();
          pendingDeleteAction = null;
        }
        hideConfirmationModal();
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // Store handler for cleanup
    modal.dataset.keydownHandler = 'true';
    window.confirmModalKeydownHandler = handleKeydown;
  }
  
  // Hide confirmation modal
  function hideConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
      modal.style.display = 'none';
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Remove any deleting classes
      document.querySelectorAll('.deleting').forEach(el => {
        el.classList.remove('deleting');
      });
      
      // Remove keyboard handler
      if (window.confirmModalKeydownHandler) {
        document.removeEventListener('keydown', window.confirmModalKeydownHandler);
        window.confirmModalKeydownHandler = null;
      }
    }
  }
  
  // Add inclusion
  window.addInclusion = function() {
    const list = document.getElementById('inclusions-list');
    const itemId = `inclusion-${Date.now()}`;
    const item = document.createElement('div');
    item.className = 'inclusion-item editable-item';
    item.id = itemId;
    item.innerHTML = `
      <i class="fas fa-check text-green-600"></i>
      <span class="item-text" contenteditable="true" onblur="updateInclusionText('${itemId}', this.textContent)" onfocus="selectAllText(this)">New inclusion item</span>
      <button type="button" class="delete-btn" onclick="removeItem('${itemId}', event)" title="Remove item">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    list.appendChild(item);
    
    // Focus the new item for editing
    setTimeout(() => {
      const textSpan = item.querySelector('.item-text');
      textSpan.focus();
      selectAllText(textSpan);
    }, 50);
    
    updateContractState();
  };
  
  // Add exclusion
  window.addExclusion = function() {
    const list = document.getElementById('exclusions-list');
    const itemId = `exclusion-${Date.now()}`;
    const item = document.createElement('div');
    item.className = 'exclusion-item editable-item';
    item.id = itemId;
    item.innerHTML = `
      <i class="fas fa-times text-red-600"></i>
      <span class="item-text" contenteditable="true" onblur="updateExclusionText('${itemId}', this.textContent)" onfocus="selectAllText(this)">New exclusion item</span>
      <button type="button" class="delete-btn" onclick="removeItem('${itemId}', event)" title="Remove item">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    list.appendChild(item);
    
    // Focus the new item for editing
    setTimeout(() => {
      const textSpan = item.querySelector('.item-text');
      textSpan.focus();
      selectAllText(textSpan);
    }, 50);
    
    updateContractState();
  };
  
  // Select all text in an editable element
  window.selectAllText = function(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };
  
  // Create debounced version of updateContractState
  const debouncedUpdateContractState = debounce(function() {
    updateContractState();
  }, 100);
  
  // Update inclusion text
  window.updateInclusionText = function(itemId, newText) {
    // Prevent updating if the item is being deleted
    const item = document.getElementById(itemId);
    if (!item || item.classList.contains('deleting')) return;
    
    // Use debounced update to prevent rapid state changes
    debouncedUpdateContractState();
  };

  // Update exclusion text
  window.updateExclusionText = function(itemId, newText) {
    // Prevent updating if the item is being deleted
    const item = document.getElementById(itemId);
    if (!item || item.classList.contains('deleting')) return;
    
    // Use debounced update to prevent rapid state changes
    debouncedUpdateContractState();
  };
  
  // Remove item (works for both inclusions and exclusions)
  window.removeItem = function(itemId, event) {
    // Prevent any form submission
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const item = document.getElementById(itemId);
    if (item) {
      // Mark item as being deleted to prevent blur updates
      item.classList.add('deleting');
      
      const isInclusion = itemId.includes('inclusion');
      const itemType = isInclusion ? 'inclusion' : 'exclusion';
      const itemText = item.querySelector('.item-text').textContent.trim();
      
      // Show confirmation modal
      showConfirmationModal(
        `Are you sure you want to remove "${itemText}"?`,
        () => {
          // Small delay to ensure any pending blur events have completed
          setTimeout(() => {
            item.remove();
            updateContractState();
          }, 50);
        }
      );
      
      // If cancelled, remove the deleting class
      const modal = document.getElementById('confirmation-modal');
      const cancelBtn = document.getElementById('cancel-btn');
      const originalOnclick = cancelBtn.onclick;
      cancelBtn.onclick = function() {
        item.classList.remove('deleting');
        if (originalOnclick) originalOnclick.call(this);
      };
    }
    return false; // Prevent any default behavior
  };
  
  // Make existing items editable on page load
  function makeItemsEditable() {
    // Make existing inclusions editable
    const inclusionItems = document.querySelectorAll('#inclusions-list .inclusion-item');
    inclusionItems.forEach((item, index) => {
      // Skip if already has delete button
      if (item.querySelector('.delete-btn')) {
        return;
      }
      
      const itemId = item.id || `inclusion-existing-${index}`;
      if (!item.id) item.id = itemId;
      item.classList.add('editable-item');
      const textSpan = item.querySelector('span');
      if (textSpan) {
        textSpan.classList.add('item-text');
        textSpan.contentEditable = true;
        textSpan.setAttribute('onblur', `updateInclusionText('${itemId}', this.textContent)`);
        textSpan.setAttribute('onfocus', 'selectAllText(this)');
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('onclick', `removeItem('${itemId}', event)`);
        deleteBtn.setAttribute('title', 'Remove item');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        item.appendChild(deleteBtn);
      }
    });
    
    // Make existing exclusions editable
    const exclusionItems = document.querySelectorAll('#exclusions-list .exclusion-item');
    exclusionItems.forEach((item, index) => {
      // Skip if already has delete button
      if (item.querySelector('.delete-btn')) {
        return;
      }
      
      const itemId = item.id || `exclusion-existing-${index}`;
      if (!item.id) item.id = itemId;
      item.classList.add('editable-item');
      const textSpan = item.querySelector('span');
      if (textSpan) {
        textSpan.classList.add('item-text');
        textSpan.contentEditable = true;
        textSpan.setAttribute('onblur', `updateExclusionText('${itemId}', this.textContent)`);
        textSpan.setAttribute('onfocus', 'selectAllText(this)');
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('onclick', `removeItem('${itemId}', event)`);
        deleteBtn.setAttribute('title', 'Remove item');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        item.appendChild(deleteBtn);
      }
    });
  }
  
  // Calculate pricing
  function calculatePricing() {
    let basePrice = 0;
    let materialsPrice = 0;
    let optionsPrice = 0;
    
    // Calculate base price from surfaces
    const surfaces = formState.data?.surfaces || [];
    const paintSelections = formState.data?.paintSelections || [];
    
    surfaces.forEach(surface => {
      let totalArea = 0;
      if (surface.measurements) {
        surface.measurements.forEach(measurement => {
          totalArea += measurement.calculatedEntryArea || 0;
        });
      }
      
      // Find the paint selection for this surface
      let rate = 3.5; // Default $3.50 per sq ft
      paintSelections.forEach(selection => {
        if (selection.surfaces && selection.surfaces.includes(surface.id)) {
          // Use custom price if available, otherwise use product default
          if (selection.customPrice) {
            rate = selection.customPrice;
          } else if (selection.selectedProduct) {
            const projectType = formState.data?.projectType || 'commercial';
            const priceInfo = projectType === 'residential' ? 
              selection.selectedProduct.residentialPrice : 
              selection.selectedProduct.commercialPrice;
            if (priceInfo && priceInfo.default) {
              rate = priceInfo.default;
            }
          }
        }
      });
      
      basePrice += totalArea * rate;
    });
    
    // Calculate materials price from paint selections
    paintSelections.forEach(selection => {
      if (selection.selectedProduct) {
        // Calculate quantity needed based on coverage
        const product = selection.selectedProduct;
        const coverage = product.coverage || 350; // Default 350 sq ft per gallon
        
        // Calculate total area for this paint selection
        let paintArea = 0;
        surfaces.forEach(surface => {
          if (surface.type === selection.projectType) {
            if (surface.measurements) {
              surface.measurements.forEach(measurement => {
                paintArea += measurement.calculatedEntryArea || 0;
              });
            }
          }
        });
        
        const gallonsNeeded = Math.ceil(paintArea / coverage);
        const pricePerGallon = 45; // Default price per gallon
        materialsPrice += gallonsNeeded * pricePerGallon;
      }
    });
    
    // Get discount
    const discountAmountEl = document.getElementById('discount-amount');
    const discountAmount = discountAmountEl ? parseFloat(discountAmountEl.value) || 0 : 0;
    
    // Calculate total
    const subtotal = basePrice + materialsPrice + optionsPrice;
    const total = Math.max(0, subtotal - discountAmount);
    
    // Update display
    document.getElementById('base-price').textContent = formatCurrency(basePrice);
    document.getElementById('materials-cost').textContent = formatCurrency(materialsPrice);
    document.getElementById('options-cost').textContent = formatCurrency(optionsPrice);
    document.getElementById('total-price').textContent = formatCurrency(total);
    
    // Update contract state
    contractState.pricing = {
      basePrice,
      materialsPrice,
      optionsPrice,
      discount: discountAmount,
      total
    };
  }
  
  // Update contract state from form
  function updateContractState() {
    // Basic Information
    const validUntilEl = document.getElementById('valid-until');
    contractState.validUntil = validUntilEl ? validUntilEl.value : '';
    
    // Client information from formState
    if (formState.data && formState.data.contacts && formState.data.contacts.length > 0) {
      const primaryContact = formState.data.contacts[0];
      contractState.clientName = primaryContact.name || '';
      contractState.clientEmail = primaryContact.email || '';
      contractState.clientPhone = primaryContact.phone || '';
    }
    
    // Company and address from formState
    contractState.companyName = formState.data?.companyName || formState.data?.locationName || '';
    
    // Get site address from formState
    const siteAddress = formState.data?.siteAddress || {};
    contractState.propertyAddress = siteAddress.street || '';
    contractState.city = siteAddress.city || '';
    contractState.state = siteAddress.state || '';
    contractState.zipCode = siteAddress.zip || '';
    
    // Scope of Work
    contractState.surfaces = formState.data?.surfaces || [];
    
    // Extract preparation steps from formState data
    const prepSteps = new Set();
    if (formState.data?.preparation) {
      Object.entries(formState.data.preparation).forEach(([prep, value]) => {
        if (value) {
          prepSteps.add(prep);
        }
      });
    }
    
    contractState.preparationSteps = Array.from(prepSteps);
    
    // Safe access for elements that might not exist
    const scopeNotesEl = document.getElementById('scope-notes');
    contractState.scopeNotes = scopeNotesEl ? scopeNotesEl.value : '';
    
    // Materials
    contractState.materials = formState.data?.paintSelections || [];
    
    const materialSupplyEl = document.getElementById('material-supply');
    contractState.materialSupply = materialSupplyEl ? materialSupplyEl.value : '';
    
    const materialNotesEl = document.getElementById('material-notes');
    contractState.materialNotes = materialNotesEl ? materialNotesEl.value : '';
    
    // Terms & Payment
    const startDateEl = document.getElementById('start-date');
    contractState.startDate = startDateEl ? startDateEl.value : '';
    
    const durationEl = document.getElementById('duration');
    contractState.duration = durationEl ? durationEl.value : '';
    
    const paymentScheduleEl = document.getElementById('payment-schedule');
    contractState.paymentSchedule = paymentScheduleEl ? paymentScheduleEl.value : '';
    
    const warrantyPeriodEl = document.getElementById('warranty-period');
    contractState.warrantyPeriod = warrantyPeriodEl ? warrantyPeriodEl.value : '';
    
    // Payment terms and change order policy are now constants
    contractState.paymentTerms = 'Payment is due according to the schedule above. Late payments may incur a 1.5% monthly finance charge.';
    contractState.changeOrderPolicy = 'Any changes to the scope of work must be approved in writing before implementation. Additional charges may apply.';
    
    // Inclusions/Exclusions
    contractState.inclusions = getListItems('inclusions-list');
    contractState.exclusions = getListItems('exclusions-list');
    
    // Pricing
    const discountReasonEl = document.getElementById('discount-reason');
    contractState.discountReason = discountReasonEl ? discountReasonEl.value : '';
    
    const pricingNotesEl = document.getElementById('pricing-notes');
    contractState.pricingNotes = pricingNotesEl ? pricingNotesEl.value : '';
    
    // Save to localStorage
    localStorage.setItem('contractState', JSON.stringify(contractState));
  }
  
  // Get checked checkbox values
  function getCheckedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
  }
  
  // Get list items
  function getListItems(listId) {
    const list = document.getElementById(listId);
    const items = list.querySelectorAll('.item-text');
    return Array.from(items).map(item => item.textContent.trim());
  }
  
  // Update form from state
  function updateFormFromState() {
    // This would be called when loading a saved contract
    // Implementation would populate all form fields from contractState
  }
  
  // Save form state
  function saveFormState() {
    localStorage.setItem('formState', JSON.stringify(formState));
  }
  
  // Save draft
  window.saveDraft = function() {
    updateContractState();
    
    // Save to localStorage
    const draft = {
      contractState,
      formState,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('contractDraft', JSON.stringify(draft));
    
    // Show success message
    alert('Draft saved successfully!');
  };
  
  // Preview contract
  window.previewContract = function() {
    
    try {
      // Check if form is initialized
      if (!form) {
        form = document.getElementById('contract-form');
        if (!form) {
          alert('Error: Contract form not found. Please refresh the page.');
          return;
        }
      }
      
      // Validate required fields
      if (!validateForm()) {
        alert('Please complete all required fields before previewing.');
        return;
      }
      
      updateContractState();
      
      // Save state for preview page
      const contractData = {
        ...contractState,
        formState: formState
      };
      localStorage.setItem('contractPreview', JSON.stringify(contractData));
      
      // Navigate to preview page
      window.location.href = 'contract-preview.html';
    } catch (error) {
      alert('An error occurred while preparing the preview. Please check the console for details.');
    }
  };
  
  // Validate form
  function validateForm() {
    if (!form) {
      return false;
    }
    
    const requiredFields = form.querySelectorAll('[data-validate*="required"]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
    });
    
    return isValid;
  }
  
  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }
  
})();