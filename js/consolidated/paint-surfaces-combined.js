// Combined Paint Selection and Surfaces Functionality
// Performance optimizations:
// 1. Debounced mutation observer to prevent excessive function calls
// 2. Throttled focus event handler to limit calculations
// 3. Data attributes to track fixed elements and avoid redundant fixes
// 4. Limited observer scope to paint selections container only
(function() {
  'use strict';
  
  // Constants
  const FIXED_UNIT = 'Sq Ft';
  
  // State variables
  window.bitrixProducts = window.bitrixProducts || [];
  let abrasiveServices = [];
  let allServices = {};
  let isLoading = false;
  let pendingDeleteAction = null;
  
  // Initialize color suggestions array
  window.colorSuggestions = window.colorSuggestions || [];
  
  // Utility function to fix all "Low Sheen/Lustre" instances
  let fixLowSheenLustreRunning = false;
  let fixLowSheenLustreCallCount = 0;
  const MAX_FIX_CALLS = 20; // Prevent runaway execution
  
  function fixLowSheenLustre() {
    // Prevent multiple simultaneous executions
    if (fixLowSheenLustreRunning) return;
    
    // Prevent excessive calls
    fixLowSheenLustreCallCount++;
    if (fixLowSheenLustreCallCount > MAX_FIX_CALLS) {
      return;
    }
    
    fixLowSheenLustreRunning = true;
    
    try {
      // Only process selects that haven't been fixed
      const finishSelects = document.querySelectorAll('.paint-finish-select:not([data-low-sheen-fixed="true"])');
      
      finishSelects.forEach(select => {
        // Fix the current value if needed
        if (select.value === 'Low Sheen/Lustre') {
          select.value = 'Low Sheen';
        }
        
        // Fix all options
        let hasChanges = false;
        Array.from(select.options).forEach(option => {
          if (option.textContent.includes('Low Sheen/Lustre') || option.textContent === 'Low Sheen/Lustre') {
            option.textContent = 'Low Sheen';
            hasChanges = true;
          }
          if (option.value === 'Low Sheen/Lustre') {
            option.value = 'Low Sheen';
            hasChanges = true;
          }
        });
        
        // Mark as fixed
        select.dataset.lowSheenFixed = 'true';
      });
    } catch (error) {
      } finally {
      fixLowSheenLustreRunning = false;
    }
  }
  
  // Utility Functions
  function formatForDisplay(value) {
    return parseFloat(value).toFixed(2);
  }
  
  // Update delete button visibility functions
  function updateMeasurementDeleteButtons(surfaceId) {
    const surface = formState.data.surfaces.find(s => s.id === surfaceId);
    if (!surface) return;
    
    const measurements = surface.measurements || [];
    const measurementBlocks = document.querySelectorAll(`[data-measurement-id]`);
    
    measurementBlocks.forEach(block => {
      const measurementId = block.dataset.measurementId;
      const measurement = measurements.find(m => m.id === measurementId);
      if (!measurement) return;
      
      const removeBtn = block.querySelector('.measurement-remove-btn');
      if (removeBtn) {
        removeBtn.style.display = measurements.length > 1 ? 'flex' : 'none';
      }
    });
  }
  
  function updateLxHDeleteButtons(measurementId) {
    const measurementBlock = document.querySelector(`[data-measurement-id="${measurementId}"]`);
    if (!measurementBlock) return;
    
    const lxhPairs = measurementBlock.querySelectorAll('.lxh-pair');
    const measurement = formState.data.surfaces
      .flatMap(s => s.measurements || [])
      .find(m => m.id === measurementId);
    
    if (!measurement) return;
    
    const dimensions = measurement.dimensions || [];
    
    lxhPairs.forEach(pair => {
      const removeBtn = pair.querySelector('.remove-lxh-btn');
      if (removeBtn) {
        removeBtn.style.visibility = dimensions.length > 1 ? 'visible' : 'hidden';
      }
    });
  }
  
  function updatePhotoDeleteButtons(measurementId) {
    const measurementBlock = document.querySelector(`[data-measurement-id="${measurementId}"]`);
    if (!measurementBlock) return;
    
    const photoThumbnails = measurementBlock.querySelectorAll('.photo-thumbnail');
    
    // Photos should always be deletable since they're optional
    photoThumbnails.forEach(thumbnail => {
      const removeBtn = thumbnail.querySelector('.photo-remove-btn');
      if (removeBtn) {
        removeBtn.style.display = 'flex'; // Always show photo delete buttons
      }
    });
  }
  
  function updateMeasurementIcons(measurementId) {
    const measurementBlock = document.querySelector(`[data-measurement-id="${measurementId}"]`);
    if (!measurementBlock) return;
    
    const measurement = getMeasurementById(measurementId);
    if (!measurement) return;
    
    // Update note icon
    const noteIcon = measurementBlock.querySelector('.note-icon');
    if (noteIcon) {
      const hasNote = window.formState?.data?.measurementNotes?.[measurementId]?.note;
      const noteImg = noteIcon.querySelector('img');
      
      if (hasNote) {
        noteIcon.style.backgroundColor = 'rgba(53, 130, 236, 0.1)';
        if (noteImg) {
          noteImg.style.filter = 'brightness(0) saturate(100%) invert(46%) sepia(99%) saturate(1449%) hue-rotate(196deg) brightness(95%) contrast(91%)';
        }
        noteIcon.title = 'Edit Note';
      } else {
        noteIcon.style.backgroundColor = 'transparent';
        if (noteImg) {
          noteImg.style.filter = 'none';
        }
        noteIcon.title = 'Add Note';
      }
    }
    
    // Update camera icon
    const cameraIcon = measurementBlock.querySelector('.camera-icon');
    if (cameraIcon) {
      const photoCount = measurement.photos ? measurement.photos.length : 0;
      const cameraImg = cameraIcon.querySelector('img');
      
      if (photoCount > 0) {
        cameraIcon.style.backgroundColor = 'rgba(53, 130, 236, 0.1)';
        if (cameraImg) {
          cameraImg.style.filter = 'brightness(0) saturate(100%) invert(46%) sepia(99%) saturate(1449%) hue-rotate(196deg) brightness(95%) contrast(91%)';
        }
        cameraIcon.title = `${photoCount} Photo${photoCount > 1 ? 's' : ''}`;
      } else {
        cameraIcon.style.backgroundColor = 'transparent';
        if (cameraImg) {
          cameraImg.style.filter = 'none';
        }
        cameraIcon.title = 'Add Photos';
      }
    }
  }
  
  function getMeasurementById(measurementId) {
    for (const surface of formState.data.surfaces) {
      const measurement = surface.measurements.find(m => m.id === measurementId);
      if (measurement) return measurement;
    }
    return null;
  }
  
  function updateSurfaceDeleteButtons(surfaceType) {
    const surfacesOfType = formState.data.surfaces.filter(s => s.type === surfaceType);
    const surfaceCards = document.querySelectorAll('.surface-card');
    
    surfaceCards.forEach(card => {
      const surfaceId = card.dataset.id;
      const surface = formState.data.surfaces.find(s => s.id === surfaceId);
      
      // Only update if this card is of the specified type
      if (surface && surface.type === surfaceType) {
        const removeBtn = card.querySelector('.surface-remove-btn');
        if (removeBtn) {
          removeBtn.style.display = surfacesOfType.length > 1 ? 'flex' : 'none';
        }
      }
    });
  }
  
  function showConfirmationModal(message, onConfirm) {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('confirmation-modal')) {
      const modalHTML = `
        <div id="confirmation-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style="display: none;">
          <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
            <p id="confirmation-message" class="text-gray-700 mb-4"></p>
            <div class="flex gap-4 justify-end items-center" style="align-items: center;">
              <button id="cancel-btn" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md min-w-[80px] text-center inline-flex items-center justify-center">Cancel</button>
              <button id="confirm-btn" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md min-w-[80px] text-center inline-flex items-center justify-center">Delete</button>
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
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
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
  }
  
  function hideConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    // Restore background scrolling
    document.body.style.overflow = '';
  }
  
  // Function to handle accordion behavior - only one section open at a time
  function handleAccordionToggle(clickedHeader, clickedContent, clickedChevron) {
    const isCurrentlyCollapsed = clickedContent.style.display === 'none';
    
    // Find all collapsible sections
    const allServiceContents = document.querySelectorAll('.service-content');
    const allHeaders = document.querySelectorAll('.mb-4.p-3.bg-gray-50.rounded-lg[style*="cursor: pointer"]');
    
    // Collapse all sections
    allServiceContents.forEach(content => {
      content.style.display = 'none';
    });
    
    // Reset all chevron icons
    allHeaders.forEach(header => {
      const chevron = header.querySelector('.chevron-icon');
      if (chevron) {
        chevron.style.transform = 'rotate(-90deg)';
      }
    });
    
    // If the clicked section was collapsed, expand it
    if (isCurrentlyCollapsed) {
      clickedContent.style.display = 'block';
      if (clickedChevron) {
        clickedChevron.style.transform = '';
      }
    }
    // If it was already expanded, it stays collapsed (all sections are now collapsed)
  }
  
  // Initialize Paint Selection functionality
  async function initializePaintSelection() {
    // Ensure formState is properly initialized
    if (!formState.data) {
      formState.loadState();
    }
    
    // Ensure default values are set
    if (!formState.data.serviceTypes && !formState.data.serviceType) {
      formState.data.serviceTypes = ['painting'];
      formState.data.serviceType = 'painting';
    }
    
    // Ensure project scope is set
    if (!formState.data.projectScope) {
      formState.data.projectScope = { interior: true, exterior: false };
    }
    
    // Show loading indicator briefly
    const container = document.getElementById('paint-selections-container');
    if (container) {
      container.innerHTML = '<div class="text-center p-6"><p class="text-gray-600">Initializing paint selections...</p></div>';
    }
    
    // Determine what services to load based on selected service types
    const serviceTypes = formState.data.serviceTypes || [];
    const needsPaint = serviceTypes.includes('painting');
    const needsAbrasive = serviceTypes.includes('abrasive');
    
    try {
      // Load all services
      allServices = await BitrixService.getAllServices();
      window.bitrixProducts = allServices.paint || [];
      abrasiveServices = allServices.abrasive || [];
      
      if ((!needsPaint || window.bitrixProducts.length === 0) && (!needsAbrasive || abrasiveServices.length === 0)) {
        if (container) {
          container.innerHTML = `
            <div class="text-center p-6">
              <p class="text-red-600 mb-4">No services available in catalog. Please contact support.</p>
              <button onclick="location.reload()" class="btn btn-secondary">Refresh Page</button>
            </div>
          `;
        }
      }
      
      // Now render the paint selections UI
      renderPaintSelectionsEnhanced();
    } catch (error) {
      window.bitrixProducts = [];
      abrasiveServices = [];
      allServices = {};
      if (container) {
        container.innerHTML = `
          <div class="text-center p-6">
            <p class="text-red-600 mb-4">Error connecting to Bitrix catalog. Please refresh the page or contact support.</p>
            <button onclick="location.reload()" class="btn btn-secondary">Refresh Page</button>
          </div>
        `;
      }
    }
  }
  
  // Surfaces functionality - updated to auto-populate from project scope
  function getDefaultSurfaces() {
    const mapSurface = s => {
      const { condition, calculatedTotalArea: s_cta, measurements: s_meas, ...restOfS } = s;
      
      return {
        unit: FIXED_UNIT,
        ...restOfS,
        measurements: (s_meas || []).map(m => {
          const { calculatedEntryArea: m_cea, dimensions: m_dims, photos: m_photos, entryType: m_entryType, isDeduction: m_isDeduction, totalValue: m_totalValue, ...restOfM } = m;
          return {
            photos: m_photos || [],
            dimensions: (m_dims && m_dims.length > 0) ? m_dims : [{ id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, l: '', h: '' }],
            entryType: m_entryType || 'lxh',
            isDeduction: m_isDeduction || false,
            totalValue: m_totalValue || '',
            ...restOfM,
          };
        })
      };
    };

    let surfacesToProcess = formState.data.surfaces;
    if (!surfacesToProcess || !Array.isArray(surfacesToProcess) || surfacesToProcess.length === 0) {
      let defaultSurfacesConfig = [];
      
      // Auto-populate based on project scope from page 1
      const projectScope = formState.data.projectScope || {};
      
      if (projectScope.exterior) {
        defaultSurfacesConfig.push(
          { id: `surface-${Date.now()}-ext`, type: 'exterior', name: 'Exterior Walls', measurements: [] }
        );
      }
      if (projectScope.interior) {
        defaultSurfacesConfig.push(
          { id: `surface-${Date.now()}-int`, type: 'interior', name: 'Interior Walls', measurements: [] }
        );
      }
      
      // Fallback: If no project scope is set, check legacy project_location
      if (defaultSurfacesConfig.length === 0) {
        if (formState.data.project_location === 'Exterior Only' || 
            formState.data.project_location === 'Interior & Exterior') {
          defaultSurfacesConfig.push(
            { id: `surface-${Date.now()}-ext`, type: 'exterior', name: 'Exterior Walls', measurements: [] }
          );
        }
        if (formState.data.project_location === 'Interior Only' || 
            formState.data.project_location === 'Interior & Exterior') {
          defaultSurfacesConfig.push(
            { id: `surface-${Date.now()}-int`, type: 'interior', name: 'Interior Walls', measurements: [] }
          );
        }
      }
      
      // If still no surfaces were added, add a default surface
      if (defaultSurfacesConfig.length === 0) {
        defaultSurfacesConfig.push(
          { id: `surface-${Date.now()}-default`, type: 'interior', name: 'New Custom Section', measurements: [] }
        );
      }
      
      surfacesToProcess = defaultSurfacesConfig;
    }
    
    const processedSurfaces = surfacesToProcess.map(mapSurface);

    processedSurfaces.forEach(sfc => {
      if (!sfc.measurements || sfc.measurements.length === 0) {
        sfc.measurements.push({
          id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          description: 'Main Area',
          entryType: 'lxh',
          isDeduction: false,
          dimensions: [{ id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, l: '', h: '' }],
          totalValue: '',
          photos: []
        });
      }
      // Ensure each measurement has a dimensions array if it's lxh type
      sfc.measurements.forEach(m => {
        if (m.entryType === 'lxh' && (!m.dimensions || m.dimensions.length === 0)) {
          m.dimensions = [{ id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, l: '', h: '' }];
        }
      });
    });
    return processedSurfaces;
  }
  // Calculates and updates formState.data for areas
  function calculateAndUpdateStateAreas(surfaceId) {
    const surface = formState.data.surfaces.find(s => s.id === surfaceId);
    if (!surface) return;

    let totalSurfaceArea = 0;
    surface.measurements.forEach(measurement => {
      let entryArea = 0;
      if (measurement.entryType === 'lxh') {
        (measurement.dimensions || []).forEach(dim => {
          const l = parseFloat(dim.l) || 0;
          const h = parseFloat(dim.h) || 0;
          entryArea += l * h;
        });
      } else if (measurement.entryType === 'total') {
        entryArea = parseFloat(measurement.totalValue) || 0;
      }
      measurement.calculatedEntryArea = entryArea;

      if (measurement.isDeduction) {
        totalSurfaceArea -= entryArea;
      } else {
        totalSurfaceArea += entryArea;
      }
    });
    surface.calculatedTotalArea = totalSurfaceArea;
    formState.saveState();
  }

  // Updates only the displayed calculation text in the DOM
  function updateDisplayedCalculations(surfaceId, measurementIdToUpdate = null) {
    const surface = formState.data.surfaces.find(s => s.id === surfaceId);
    if (!surface) return;

    if (measurementIdToUpdate) {
      const measurement = surface.measurements.find(m => m.id === measurementIdToUpdate);
      if (measurement) {
        const measurementBlockDOM = document.querySelector(`.measurement-block[data-measurement-id="${measurement.id}"]`);
        if (measurementBlockDOM) {
          const subtotalDisplaySpan = measurementBlockDOM.querySelector('.measurement-subtotal span.font-bold');
          if (subtotalDisplaySpan) {
            const subtotalPrefix = measurement.isDeduction ? '-' : '';
            subtotalDisplaySpan.textContent = `${subtotalPrefix}${formatForDisplay(measurement.calculatedEntryArea || 0)}`;
          }
        }
      }
    }

    const surfaceCardDOM = document.querySelector(`.surface-card[data-id="${surface.id}"]`);
    if (surfaceCardDOM) {
      const totalAreaDisplaySpan = surfaceCardDOM.querySelector('.surface-total-area-value');
      if (totalAreaDisplaySpan) {
        totalAreaDisplaySpan.textContent = formatForDisplay(surface.calculatedTotalArea || 0);
      }
    }
  }
  // Create measurement block HTML
  function createMeasurementBlock(measurement, surfaceId) {
    // Ensure measurement has proper default values
    if (!measurement.entryType) {
      measurement.entryType = 'lxh';
    }
    if (!measurement.dimensions) {
      measurement.dimensions = [];
    }
    // Ensure at least one dimension pair exists for L x H mode
    if (measurement.entryType === 'lxh' && measurement.dimensions.length === 0) {
      measurement.dimensions.push({
        id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
        l: '',
        h: ''
      });
    }
    
    const measurementBlock = document.createElement('div');
    measurementBlock.className = 'measurement-block';
    measurementBlock.dataset.measurementId = measurement.id;

    // Header
    const header = document.createElement('div');
    header.className = 'measurement-header';
    
    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.className = 'measurement-description-input measurement-input';
    descInput.placeholder = 'Area Description (e.g., Main Wall)';
    descInput.value = measurement.description || '';
    descInput.addEventListener('change', () => {
      measurement.description = descInput.value;
      formState.saveState();
    });
    header.appendChild(descInput);

    // Remove measurement button
    const actions = document.createElement('div');
    actions.className = 'measurement-actions';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'measurement-remove-btn';
    removeBtn.innerHTML = `<img src="../img/trash-alt.svg" alt="Remove" style="width: 16px; height: 16px;">`;
    
    // Force remove any border/circular styling with inline styles
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '0';
    removeBtn.style.outline = 'none';
    removeBtn.style.background = 'transparent';
    
    // Set initial visibility based on measurement count
    const surface = formState.data.surfaces.find(s => s.id === surfaceId);
    const measurementCount = surface ? (surface.measurements || []).length : 0;
    removeBtn.style.display = measurementCount > 1 ? 'flex' : 'none';
    
    removeBtn.addEventListener('click', () => {
      const surface = formState.data.surfaces.find(s => s.id === surfaceId);
      if (!surface) return;
      
      const message = measurement.description 
        ? `Are you sure you want to remove the measurement area "${measurement.description}"?`
        : 'Are you sure you want to remove this measurement area?';
      
      showConfirmationModal(message, () => {
        surface.measurements = surface.measurements.filter(m => m.id !== measurement.id);
        calculateAndUpdateStateAreas(surfaceId);
        updateDisplayedCalculations(surfaceId); // Update total area display
        formState.saveState();
        measurementBlock.remove();
        // Update delete button visibility for remaining measurements
        updateMeasurementDeleteButtons(surfaceId);
      });
    });
    actions.appendChild(removeBtn);
    header.appendChild(actions);
    measurementBlock.appendChild(header);
    
    // Color input for measurement (only shows when Different Colors is selected)
    const colorInputContainer = document.createElement('div');
    colorInputContainer.className = 'measurement-color-input-container';
    colorInputContainer.style.cssText = 'display: none; margin-bottom: 0.75rem; position: relative;';
    
    const colorInput = document.createElement('input');
    colorInput.type = 'text';
    colorInput.className = 'measurement-input measurement-color-input';
    colorInput.placeholder = 'Color Name/ID (e.g., SW 6244 Naval)';
    colorInput.value = measurement.color || '';
    colorInput.autocomplete = 'off'; // Disable browser autocomplete
    
    // Create custom dropdown for suggestions
    const suggestionsDropdown = document.createElement('div');
    suggestionsDropdown.className = 'color-suggestions-dropdown';
    suggestionsDropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      max-height: 132px;
      overflow-y: auto;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      margin-top: 0.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      display: none;
      z-index: 50;
    `;
    
    // Function to show/hide suggestions
    function showSuggestions() {
      const inputValue = colorInput.value.toLowerCase();
      let suggestionsToShow;
      
      if (inputValue.length === 0) {
        // Show up to 3 suggestions when input is empty
        suggestionsToShow = window.colorSuggestions.slice(0, 3);
      } else {
        // Filter suggestions based on input
        const filteredSuggestions = window.colorSuggestions.filter(color => 
          color.toLowerCase().includes(inputValue)
        );
        // Limit to 3 suggestions
        suggestionsToShow = filteredSuggestions.slice(0, 3);
      }
      
      if (suggestionsToShow.length > 0) {
        suggestionsDropdown.innerHTML = '';
        suggestionsToShow.forEach(suggestion => {
          const suggestionItem = document.createElement('div');
          suggestionItem.className = 'color-suggestion-item';
          suggestionItem.textContent = suggestion;
          suggestionItem.style.cssText = `
            padding: 0.5rem 0.75rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: background-color 0.15s;
          `;
          
          suggestionItem.addEventListener('mouseenter', () => {
            suggestionItem.style.backgroundColor = '#f3f4f6';
          });
          
          suggestionItem.addEventListener('mouseleave', () => {
            suggestionItem.style.backgroundColor = 'transparent';
          });
          
          suggestionItem.addEventListener('click', () => {
            colorInput.value = suggestion;
            measurement.color = suggestion;
            formState.saveState();
            suggestionsDropdown.style.display = 'none';
          });
          
          suggestionsDropdown.appendChild(suggestionItem);
        });
        suggestionsDropdown.style.display = 'block';
      } else if (inputValue.length === 0 && window.colorSuggestions.length === 0) {
        // Show empty state message when no suggestions exist
        suggestionsDropdown.innerHTML = '';
        const emptyMessage = document.createElement('div');
        emptyMessage.style.cssText = `
          padding: 0.75rem;
          color: #6b7280;
          font-size: 0.875rem;
          font-style: italic;
          text-align: center;
        `;
        emptyMessage.textContent = 'No recent colors';
        suggestionsDropdown.appendChild(emptyMessage);
        suggestionsDropdown.style.display = 'block';
      } else {
        suggestionsDropdown.style.display = 'none';
      }
    }
    
    // Event listeners for color input
    colorInput.addEventListener('input', () => {
      showSuggestions();
    });
    
    colorInput.addEventListener('focus', () => {
      showSuggestions();
    });
    
    colorInput.addEventListener('blur', (e) => {
      // Delay hiding to allow click on suggestion
      setTimeout(() => {
        suggestionsDropdown.style.display = 'none';
      }, 200);
    });
    
    colorInput.addEventListener('change', () => {
      measurement.color = colorInput.value;
      
      // Add to color suggestions
      if (colorInput.value && !window.colorSuggestions.includes(colorInput.value)) {
        window.colorSuggestions.push(colorInput.value);
      }
      
      formState.saveState();
    });
    
    colorInputContainer.appendChild(colorInput);
    colorInputContainer.appendChild(suggestionsDropdown);
    measurementBlock.appendChild(colorInputContainer);
    // Input type selector
    const typeSelector = document.createElement('div');
    typeSelector.className = 'measurement-input-type-selector';
    
    const leftLabel = document.createElement('span');
    leftLabel.className = `toggle-label-left ${measurement.entryType === 'lxh' ? 'active' : ''}`;
    leftLabel.textContent = 'Dimensions';
    
    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'toggle-switch';
    toggleLabel.setAttribute('for', `toggle-${measurement.id}`);
    
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = `toggle-${measurement.id}`;
    toggleInput.checked = measurement.entryType === 'total';
    
    const toggleSlider = document.createElement('span');
    toggleSlider.className = 'toggle-slider';
    
    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(toggleSlider);
    
    const rightLabel = document.createElement('span');
    rightLabel.className = `toggle-label-right ${measurement.entryType === 'total' ? 'active' : ''}`;
    rightLabel.textContent = 'Total Area';
    
    typeSelector.appendChild(leftLabel);
    typeSelector.appendChild(toggleLabel);
    typeSelector.appendChild(rightLabel);
    measurementBlock.appendChild(typeSelector);
    // Measurement details
    const details = document.createElement('div');
    details.className = 'measurement-details';
    
    // LxH inputs container
    const lxhContainer = document.createElement('div');
    lxhContainer.className = 'lxh-inputs-container';
    lxhContainer.style.display = measurement.entryType === 'lxh' ? 'block' : 'none';
    
    // Render existing dimensions
    if (measurement.dimensions && measurement.dimensions.length > 0) {
      measurement.dimensions.forEach(dim => {
        lxhContainer.appendChild(createDimensionPair(dim, measurement, surfaceId));
      });
    }
    
    // Update initial delete button visibility for dimensions
    setTimeout(() => updateLxHDeleteButtons(measurement.id), 0);
    
    // Add L x H button
    const addLxHBtn = document.createElement('button');
    addLxHBtn.className = 'btn add-lxh-btn';
    addLxHBtn.innerHTML = '<i class="fas fa-plus"></i> Add L x H Pair';
    addLxHBtn.addEventListener('click', () => {
      const newDim = {
        id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
        l: '',
        h: ''
      };
      // Ensure dimensions array exists
      if (!measurement.dimensions) {
        measurement.dimensions = [];
      }
      measurement.dimensions.push(newDim);
      const newPair = createDimensionPair(newDim, measurement, surfaceId);
      lxhContainer.insertBefore(newPair, addLxHBtn);
      calculateAndUpdateStateAreas(surfaceId);
      updateDisplayedCalculations(surfaceId, measurement.id);
      updateDisplayedCalculations(surfaceId); // Update total area display
      formState.saveState();
      // Update delete button visibility for all dimensions
      updateLxHDeleteButtons(measurement.id);
    });
    lxhContainer.appendChild(addLxHBtn);
    // Total input container
    const totalContainer = document.createElement('div');
    totalContainer.className = 'total-input-container';
    totalContainer.style.display = measurement.entryType === 'total' ? 'block' : 'none';
    
    const totalInput = document.createElement('input');
    totalInput.type = 'number';
    totalInput.className = 'measurement-input total-area-input';
    totalInput.placeholder = 'Enter total area';
    totalInput.value = measurement.totalValue || '';
    totalInput.step = '0.01';
    totalInput.addEventListener('input', () => {
      measurement.totalValue = totalInput.value;
      calculateAndUpdateStateAreas(surfaceId);
      updateDisplayedCalculations(surfaceId, measurement.id);
      updateDisplayedCalculations(surfaceId); // Update total area display
      updateDisplayedCalculations(surfaceId); // Update total area display
    });
    totalContainer.appendChild(totalInput);
    
    details.appendChild(lxhContainer);
    details.appendChild(totalContainer);
    measurementBlock.appendChild(details);
    
    // Toggle handler
    toggleInput.addEventListener('change', () => {
      measurement.entryType = toggleInput.checked ? 'total' : 'lxh';
      lxhContainer.style.display = measurement.entryType === 'lxh' ? 'block' : 'none';
      totalContainer.style.display = measurement.entryType === 'total' ? 'block' : 'none';
      leftLabel.classList.toggle('active', measurement.entryType === 'lxh');
      rightLabel.classList.toggle('active', measurement.entryType === 'total');
      calculateAndUpdateStateAreas(surfaceId);
      updateDisplayedCalculations(surfaceId, measurement.id);
      updateDisplayedCalculations(surfaceId); // Update total area display
      formState.saveState();
    });
    // Measurement subtotal with icons grid
    const subtotalContainer = document.createElement('div');
    subtotalContainer.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem;';
    
    // Create a grid container for all icons
    const iconsGrid = document.createElement('div');
    iconsGrid.style.cssText = 'display: grid; grid-template-columns: 34px 34px; gap: 4px; margin-right: 10px;';
    
    // Note icon
    const noteIcon = document.createElement('button');
    noteIcon.className = 'note-icon';
    noteIcon.title = 'Add Note';
    noteIcon.style.cssText = 'background: none; border: none; cursor: pointer; padding: 0px; margin: 0px; display: flex; align-items: center; justify-content: center; height: 34px; width: 34px; pointer-events: auto; position: relative; z-index: 10; border-radius: 6px; transition: all 0.2s ease;';
    noteIcon.innerHTML = `<img src="../img/add-note.svg" width="29" height="29" alt="Add Note" style="display: block; width: 29px; height: 29px; object-fit: contain; pointer-events: none; filter: none; transition: filter 0.2s ease;">`;
    noteIcon.dataset.measurementId = measurement.id;
    
    // Check if there's an existing note and apply blue styling
    if (window.formState?.data?.measurementNotes?.[measurement.id]?.note) {
      noteIcon.style.backgroundColor = 'rgba(53, 130, 236, 0.1)'; // Light blue background
      const noteImg = noteIcon.querySelector('img');
      if (noteImg) {
        noteImg.style.filter = 'brightness(0) saturate(100%) invert(46%) sepia(99%) saturate(1449%) hue-rotate(196deg) brightness(95%) contrast(91%)'; // Makes SVG #3582ec
      }
      noteIcon.title = 'Edit Note';
    }
    
    // Note icon click handler
    noteIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.MeasurementNotes && window.MeasurementNotes.open) {
        window.MeasurementNotes.open(measurement.id);
      }
    });
    
    // Camera icon
    const cameraIcon = document.createElement('button');
    cameraIcon.className = 'camera-icon';
    cameraIcon.title = 'Add Photos';
    cameraIcon.style.cssText = 'background: none; border: none; cursor: pointer; padding: 0px; margin: 0px; display: flex; align-items: center; justify-content: center; height: 34px; width: 34px; pointer-events: auto; position: relative; z-index: 10; border-radius: 6px; transition: all 0.2s ease;';
    cameraIcon.innerHTML = `<img src="../img/camera.svg" width="29" height="29" alt="Add Photos" style="display: block; width: 29px; height: 29px; object-fit: contain; pointer-events: none; filter: none; transition: filter 0.2s ease;">`;
    
    // Check if there are existing photos and apply blue styling
    if (measurement.photos && measurement.photos.length > 0) {
      cameraIcon.style.backgroundColor = 'rgba(53, 130, 236, 0.1)'; // Light blue background
      const cameraImg = cameraIcon.querySelector('img');
      if (cameraImg) {
        cameraImg.style.filter = 'brightness(0) saturate(100%) invert(46%) sepia(99%) saturate(1449%) hue-rotate(196deg) brightness(95%) contrast(91%)'; // Makes SVG #3582ec
      }
      cameraIcon.title = `${measurement.photos.length} Photo${measurement.photos.length > 1 ? 's' : ''}`;
    }
    
    // Camera icon click handler
    cameraIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      const fileInput = measurementBlock.querySelector(`#photo-upload-${measurement.id}`);
      if (fileInput) {
        fileInput.click();
      }
    });
    
    // Settings icon (waffle icon) - now part of the grid with increased size
    const settingsIcon = document.createElement('button');
    settingsIcon.className = 'area-settings-icon';
    settingsIcon.style.cssText = 'background: none; border: none; cursor: pointer; padding: 0px; margin: 0px; display: flex; align-items: center; justify-content: center; height: 34px; width: 34px; pointer-events: auto; position: relative; z-index: 10; grid-column: 1;';
    settingsIcon.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 26px; height: 26px; object-fit: contain;">
        <circle cx="5" cy="5" r="2.3" fill="#000000"/>
        <circle cx="13" cy="5" r="2.3" fill="#000000"/>
        <circle cx="21" cy="5" r="2.3" fill="#000000"/>
        <circle cx="5" cy="13" r="2.3" fill="#000000"/>
        <circle cx="13" cy="13" r="2.3" fill="#000000"/>
        <circle cx="21" cy="13" r="2.3" fill="#000000"/>
        <circle cx="5" cy="21" r="2.3" fill="#000000"/>
        <circle cx="13" cy="21" r="2.3" fill="#000000"/>
        <circle cx="21" cy="21" r="2.3" fill="#000000"/>
      </svg>
    `;
    settingsIcon.title = 'Area Settings';
    settingsIcon.dataset.measurementId = measurement.id;
    settingsIcon.dataset.surfaceId = surfaceId;
    settingsIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      // Open the area settings modal with retry logic
      
      // Function to attempt opening the modal
      function attemptOpenModal(retries = 0) {
        if (window.openAreaSettingsModal) {
          // Get the surface name from the surface card
          const surfaceCard = measurementBlock.closest('.surface-card');
          let surfaceName = 'Section';
          if (surfaceCard) {
            const surfaceInput = surfaceCard.querySelector('.surface-title-input');
            if (surfaceInput && surfaceInput.value) {
              surfaceName = surfaceInput.value;
            }
          }
          
          // Pass the measurement object with surface name
          const enhancedMeasurement = {
            ...measurement,
            surfaceName: surfaceName
          };
          window.openAreaSettingsModal(measurement.id, surfaceId, null, enhancedMeasurement);
        } else {
          // Retry up to 10 times with 100ms delay
          if (retries < 10) {
            setTimeout(() => attemptOpenModal(retries + 1), 100);
          } else {
            alert('Settings are still loading. Please try again in a moment.');
          }
        }
      }
      
      // Start the attempt
      attemptOpenModal();
    });
    
    // Add icons to grid
    iconsGrid.appendChild(noteIcon);
    iconsGrid.appendChild(cameraIcon);
    iconsGrid.appendChild(settingsIcon);
    
    const subtotal = document.createElement('div');
    subtotal.className = 'measurement-subtotal';
    const subtotalPrefix = measurement.isDeduction ? '-' : '';
    subtotal.innerHTML = `Area: <span class="font-bold">${subtotalPrefix}${formatForDisplay(measurement.calculatedEntryArea || 0)}</span> Sq Ft`;
    
    subtotalContainer.appendChild(iconsGrid);
    subtotalContainer.appendChild(subtotal);
    measurementBlock.appendChild(subtotalContainer);
    
    // Hidden photo input for camera icon functionality
    const photoInput = document.createElement('input');
    photoInput.type = 'file';
    photoInput.id = `photo-upload-${measurement.id}`;
    photoInput.className = 'hidden-file-input';
    photoInput.accept = 'image/*';
    photoInput.multiple = true;
    photoInput.style.display = 'none';
    photoInput.addEventListener('change', (e) => {
      handlePhotoUpload(e, measurement, measurementBlock);
    });
    measurementBlock.appendChild(photoInput);
    
    // Photo thumbnails container (shows uploaded photos at bottom)
    const thumbnailsContainer = document.createElement('div');
    thumbnailsContainer.className = 'photo-thumbnails';
    // Remove display: none to show photos at bottom of container
    
    // Render existing photos
    if (measurement.photos && measurement.photos.length > 0) {
      // Ensure container is visible when photos exist
      thumbnailsContainer.style.display = 'grid';
      measurement.photos.forEach(photo => {
        const thumbnail = createPhotoThumbnail(photo, measurement);
        thumbnailsContainer.appendChild(thumbnail);
      });
      // Update initial delete button visibility for photos
      setTimeout(() => updatePhotoDeleteButtons(measurement.id), 0);
    }
    
    measurementBlock.appendChild(thumbnailsContainer);
    
    return measurementBlock;
  }
  
  // Create dimension pair (L x H)
  function createDimensionPair(dim, measurement, surfaceId) {
    const pair = document.createElement('div');
    pair.className = 'lxh-pair';
    pair.dataset.dimensionId = dim.id;
    
    const lInput = document.createElement('input');
    lInput.type = 'number';
    lInput.className = 'lxh-input';
    lInput.placeholder = 'L';
    lInput.step = '0.01';
    lInput.value = dim.l || '';
    
    const span = document.createElement('span');
    span.textContent = 'x';
    
    const hInput = document.createElement('input');
    hInput.type = 'number';
    hInput.className = 'lxh-input';
    hInput.placeholder = 'H';
    hInput.step = '0.01';
    hInput.value = dim.h || '';
    // Input handlers
    lInput.addEventListener('input', () => {
      dim.l = lInput.value;
      calculateAndUpdateStateAreas(surfaceId);
      updateDisplayedCalculations(surfaceId, measurement.id);
      updateDisplayedCalculations(surfaceId); // Update total area display
    });
    
    hInput.addEventListener('input', () => {
      dim.h = hInput.value;
      calculateAndUpdateStateAreas(surfaceId);
      updateDisplayedCalculations(surfaceId, measurement.id);
      updateDisplayedCalculations(surfaceId); // Update total area display
    });
    
    // Remove button (only if more than one dimension)
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-lxh-btn';
    removeBtn.innerHTML = `<img src="../img/trash-alt.svg" alt="Remove" style="width: 14px; height: 14px;">`;
    removeBtn.title = 'Remove this dimension';
    
    removeBtn.addEventListener('click', () => {
      showConfirmationModal('Are you sure you want to remove this dimension?', () => {
        measurement.dimensions = measurement.dimensions.filter(d => d.id !== dim.id);
        pair.remove();
        calculateAndUpdateStateAreas(surfaceId);
        updateDisplayedCalculations(surfaceId, measurement.id);
        updateDisplayedCalculations(surfaceId); // Update total area display
        formState.saveState();
        // Update delete button visibility for remaining dimensions
        updateLxHDeleteButtons(measurement.id);
      });
    });
    
    // Set initial visibility
    removeBtn.style.visibility = measurement.dimensions.length > 1 ? 'visible' : 'hidden';
    
    pair.appendChild(lInput);
    pair.appendChild(span);
    pair.appendChild(hInput);
    pair.appendChild(removeBtn);
    
    return pair;
  }
  // Handle photo upload
  function handlePhotoUpload(event, measurement, container) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const thumbnailsContainer = container.querySelector('.photo-thumbnails');
    
    // Ensure the thumbnails container is visible
    if (thumbnailsContainer) {
      thumbnailsContainer.style.display = 'grid';
    }
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const photo = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
          name: file.name,
          dataUrl: e.target.result
        };
        
        if (!measurement.photos) measurement.photos = [];
        measurement.photos.push(photo);
        
        const thumbnail = createPhotoThumbnail(photo, measurement);
        thumbnailsContainer.appendChild(thumbnail);
        
        formState.saveState();
        // Update delete button visibility for all photos
        updatePhotoDeleteButtons(measurement.id);
        
        // Update camera icon to show it has photos
        updateMeasurementIcons(measurement.id);
      };
      reader.readAsDataURL(file);
    });
  }
  
  // Create photo thumbnail
  function createPhotoThumbnail(photo, measurement) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'photo-thumbnail';
    thumbnail.style.cursor = 'pointer';
    
    const img = document.createElement('img');
    img.src = photo.dataUrl;
    img.alt = photo.name;
    
    // Click handler to open photo editor
    thumbnail.addEventListener('click', () => {
      if (window.PhotoEditor) {
        window.PhotoEditor.open(photo, measurement);
      }
    });
    
    thumbnail.appendChild(img);
    
    return thumbnail;
  }
  // Render surfaces directly into paint card - no container wrapper
  function renderSurfacesInPaintCard(paintCardId, surfaceType) {
    // First ensure surfaces are initialized
    if (!formState.data.surfaces) {
      formState.data.surfaces = getDefaultSurfaces();
      formState.saveState();
    }
    
    // Create document fragment to hold all surface elements
    const fragment = document.createDocumentFragment();
    
    // Filter surfaces by type
    const relevantSurfaces = formState.data.surfaces.filter(s => s.type === surfaceType);
    
    relevantSurfaces.forEach(surface => {
      // Ensure surface has paintId set
      if (!surface.paintId) {
        surface.paintId = paintCardId;
        formState.saveState();
      }
      const surfaceCard = createSurfaceCard(surface);
      fragment.appendChild(surfaceCard);
    });
    
    // Update initial delete button visibility for surfaces
    updateSurfaceDeleteButtons(surfaceType);
    
    // Add new surface button
    const addSurfaceBtn = document.createElement('button');
    addSurfaceBtn.className = 'btn btn-primary w-full mt-4';
    addSurfaceBtn.innerHTML = '<i class="fas fa-plus"></i> Add New Section';
    addSurfaceBtn.addEventListener('click', () => {
      const newSurface = {
        id: `surface-${Date.now()}`,
        type: surfaceType,
        name: `New ${surfaceType.charAt(0).toUpperCase() + surfaceType.slice(1)} Section`,
        unit: FIXED_UNIT,
        paintId: paintCardId, // Add paint ID reference
        color: '', // Initialize color field
        measurements: [{
          id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          description: 'Main Area',
          entryType: 'lxh',
          isDeduction: false,
          dimensions: [{ id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, l: '', h: '' }],
          totalValue: '',
          photos: [],
          color: '' // Initialize color field
        }]
      };
      
      formState.data.surfaces.push(newSurface);
      calculateAndUpdateStateAreas(newSurface.id);
      formState.saveState();
      
      // Re-render: find the parent paint card and refresh its surfaces
      const paintCard = document.querySelector(`[data-paint-id="${paintCardId}"], [data-service-id*="${paintCardId}"]`);
      if (paintCard) {
        // Remove existing surface cards and button
        const existingSurfaces = paintCard.querySelectorAll('.surface-card, .btn.btn-primary');
        existingSurfaces.forEach(el => el.remove());
        
        // Re-render surfaces
        const newFragment = renderSurfacesInPaintCard(paintCardId, surfaceType);
        paintCard.appendChild(newFragment);
      }
    });
    
    fragment.appendChild(addSurfaceBtn);
    return fragment;
  }
  // Create surface card
  function createSurfaceCard(surface) {
    const surfaceCard = document.createElement('div');
    surfaceCard.className = 'surface-card';
    surfaceCard.dataset.id = surface.id;

    // Card header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'surface-card-header';
    
    const titleArea = document.createElement('div');
    titleArea.className = 'surface-title-area';
    
    // Editable title input
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'surface-title-input measurement-input';
    titleInput.placeholder = 'Edit Section Name...';
    titleInput.value = surface.name;
    titleInput.addEventListener('change', () => {
      surface.name = titleInput.value;
      formState.saveState();
    });
    
    titleArea.appendChild(titleInput);
    cardHeader.appendChild(titleArea);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'surface-actions';
    
    // Add delete button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'surface-remove-btn';
    removeBtn.style.cssText = 'border: none; border-radius: 0px; outline: none; background: transparent;';
    removeBtn.innerHTML = `<img src="../img/trash-alt.svg" alt="Remove" style="width: 16px; height: 16px;">`;
    removeBtn.title = 'Remove this section';
    removeBtn.addEventListener('click', () => {
      const message = surface.name
        ? `Are you sure you want to remove the section "${surface.name}"?`
        : 'Are you sure you want to remove this section?';
      
      showConfirmationModal(message, () => {
        formState.data.surfaces = formState.data.surfaces.filter(s => s.id !== surface.id);
        formState.saveState();
        
        // Re-render the entire paint card surfaces
        const paintCardId = surfaceCard.closest('[data-paint-id]')?.dataset.paintId ||
                           surfaceCard.closest('[data-service-id]')?.dataset.serviceId;
        if (paintCardId) {
          const surfaceType = surface.type;
          const paintCard = surfaceCard.closest('.paint-card');
          if (paintCard) {
            // Remove existing surface cards and button from this paint card
            const existingSurfaces = paintCard.querySelectorAll('.surface-card, .btn.btn-primary');
            existingSurfaces.forEach(el => el.remove());
            
            // Re-render surfaces
            const newFragment = renderSurfacesInPaintCard(paintCardId, surfaceType);
            paintCard.appendChild(newFragment);
          }
        }
      });
    });
    
    // Set initial visibility - only show if more than one surface of the same type
    const surfacesOfSameType = formState.data.surfaces.filter(s => s.type === surface.type);
    removeBtn.style.display = surfacesOfSameType.length > 1 ? 'flex' : 'none';
    
    actions.appendChild(removeBtn);
    
    cardHeader.appendChild(actions);
    
    surfaceCard.appendChild(cardHeader);
    
    // Card content
    const cardContent = document.createElement('div');
    cardContent.className = 'surface-card-content';
    // Measurements container
    const measurementsContainer = document.createElement('div');
    measurementsContainer.className = 'measurements-container';
    
    // Render existing measurements
    surface.measurements.forEach(measurement => {
      const measurementBlock = createMeasurementBlock(measurement, surface.id);
      measurementsContainer.appendChild(measurementBlock);
    });
    
    // Check if "Different Colors" is selected and show color inputs if needed
    let shouldShowColorInputs = false;
    
    if (surface.paintId) {
      const paintSelection = formState.data.paintSelections.find(p => p.id === surface.paintId);
      if (paintSelection && paintSelection.colorStatus === 'selected' && paintSelection.sameColor === false) {
        shouldShowColorInputs = true;
      }
    } else {
      // Fallback: Try to find the paint card in the DOM (will work after DOM is rendered)
      setTimeout(() => {
        const currentSurfaceCard = measurementsContainer.closest('.surface-card');
        const paintCard = currentSurfaceCard ? currentSurfaceCard.closest('[data-paint-id]') : null;
        
        if (paintCard) {
          const paintId = paintCard.dataset.paintId;
          const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
          
          if (paintSelection && paintSelection.colorStatus === 'selected' && paintSelection.sameColor === false) {
            // Show color inputs for all measurements
            const colorInputContainers = measurementsContainer.querySelectorAll('.measurement-color-input-container');
            colorInputContainers.forEach(container => {
              container.style.display = 'block';
            });
            
            // Also update the surface.paintId for future reference
            surface.paintId = paintId;
            formState.saveState();
          }
        }
      }, 50);
    }
    
    if (shouldShowColorInputs) {
      // Show color inputs for all measurements immediately
      const colorInputContainers = measurementsContainer.querySelectorAll('.measurement-color-input-container');
      colorInputContainers.forEach(container => {
        container.style.display = 'block';
      });
    }
    
    // Update initial delete button visibility (ensure correct state after all measurements are rendered)
    setTimeout(() => {
      updateMeasurementDeleteButtons(surface.id);
    }, 10);
    
    cardContent.appendChild(measurementsContainer);
    
    // Add measurement button
    const addMeasurementBtn = document.createElement('button');
    addMeasurementBtn.className = 'btn add-measurement-btn mt-2';
    addMeasurementBtn.innerHTML = '+ Add Measurement Area';
    addMeasurementBtn.addEventListener('click', () => {
      const newMeasurement = {
        id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        description: '',
        entryType: 'lxh',
        isDeduction: false,
        dimensions: [{ 
          id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, 
          l: '', 
          h: '' 
        }],
        totalValue: '',
        photos: [],
        color: '' // Initialize color field
      };
      surface.measurements.push(newMeasurement);
      calculateAndUpdateStateAreas(surface.id);
      updateDisplayedCalculations(surface.id); // Update total area display
      formState.saveState();
      
      const newBlock = createMeasurementBlock(newMeasurement, surface.id);
      measurementsContainer.appendChild(newBlock);
      
      // Check if "Different Colors" is selected and show color input if needed
      // First try using surface.paintId
      let shouldShowColorInput = false;
      
      if (surface.paintId) {
        const paintSelection = formState.data.paintSelections.find(p => p.id === surface.paintId);
        if (paintSelection && paintSelection.colorStatus === 'selected' && paintSelection.sameColor === false) {
          shouldShowColorInput = true;
        }
      } else {
        // Fallback: Try to find the paint card in the DOM
        const currentSurfaceCard = measurementsContainer.closest('.surface-card');
        const paintCard = currentSurfaceCard ? currentSurfaceCard.closest('[data-paint-id]') : null;
        
        if (paintCard) {
          const paintId = paintCard.dataset.paintId;
          const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
          
          if (paintSelection && paintSelection.colorStatus === 'selected' && paintSelection.sameColor === false) {
            shouldShowColorInput = true;
            // Also update the surface.paintId for future reference
            surface.paintId = paintId;
            formState.saveState();
          }
        }
      }
      
      if (shouldShowColorInput) {
        // Show the color input for this new measurement
        const colorInputContainer = newBlock.querySelector('.measurement-color-input-container');
        if (colorInputContainer) {
          colorInputContainer.style.display = 'block';
        }
      }
      
      // Update delete button visibility for all measurements
      updateMeasurementDeleteButtons(surface.id);
    });
    
    cardContent.appendChild(addMeasurementBtn);
    
    // Section total area display with settings icon
    const totalAreaGroup = document.createElement('div');
    totalAreaGroup.className = 'surface-input-group mt-6 pt-4 border-t border-gray-200';
    
    const totalAreaContent = document.createElement('div');
    totalAreaContent.innerHTML = `
      <label class="surface-label text-base">Calculated Total Section Area (Sq Ft)</label>
      <div class="surface-input-container" style="display: flex; align-items: center; justify-content: flex-end;">
        <span class="surface-total-area-value" style="text-align: right; width: 100%;">${formatForDisplay(surface.calculatedTotalArea || 0)}</span>
      </div>
    `;
    totalAreaGroup.appendChild(totalAreaContent);
    
    cardContent.appendChild(totalAreaGroup);
    
    // Store paint ID on surface card for later reference
    surfaceCard.dataset.paintId = surface.paintId || '';
    
    surfaceCard.appendChild(cardContent);
    
    // Calculate initial area
    calculateAndUpdateStateAreas(surface.id);
    updateDisplayedCalculations(surface.id); // Update total area display
    
    return surfaceCard;
  }
  
  // Function to display paint products in the grid
  function displayPaintProducts(paintId) {
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) return;
    
    const productsGrid = document.getElementById(`products-grid-${paintId}`);
    if (!productsGrid) return;
    
    const brand = paintSelection.brand;
    const selectedFinish = paintSelection.finish;
    const projectType = paintSelection.projectType;
    
    if (!brand && !selectedFinish) {
      productsGrid.innerHTML = '<p class="text-gray-500">Please select a finish and brand first.</p>';
      return;
    }
    
    if (brand && !selectedFinish) {
      productsGrid.innerHTML = '<p class="text-gray-500">Please select a paint finish</p>';
      return;
    }
    
    if (!brand) {
      productsGrid.innerHTML = '<p class="text-gray-500">Please select a paint brand</p>';
      return;
    }
    
    // Show loading state
    productsGrid.innerHTML = '<p class="text-gray-500">Loading products...</p>';
    
    // Check if Bitrix products are available
    if (!window.bitrixProducts || window.bitrixProducts.length === 0) {
      productsGrid.innerHTML = '<p class="text-red-500">Unable to load products from catalog. Please try refreshing the page.</p>';
      return;
    }
    
    // Filter products by brand, scope, and finish (if selected)
    let filteredProducts = window.bitrixProducts.filter(product => {
      if (!brand) return false;
      
      const brandMatch = product.brand === brand;
      // Additional check: UCI products should never be shown for interior
      if (projectType === 'interior' && product.brand === 'UCI') {
        return false;
      }
      const scopeMatch = (projectType === 'interior' && product.interior) ||
                        (projectType === 'exterior' && product.exterior);
      
      // Handle finish matching with compatibility for old finish names
      let finishMatch = !selectedFinish;
      if (selectedFinish && product.finishes) {
        finishMatch = product.finishes.includes(selectedFinish) ||
                     (selectedFinish === 'Low Sheen' && product.finishes.includes('Low Sheen/Lustre'));
      }
      
      return brandMatch && scopeMatch && finishMatch;
    });
    
    if (filteredProducts.length === 0) {
      const finishText = selectedFinish ? ` and finish "${selectedFinish}"` : '';
      productsGrid.innerHTML = `<p class="text-gray-500">No products available for ${brand}${finishText} in ${projectType} scope.</p>`;
      return;
    }
    
    // Clear the grid
    productsGrid.innerHTML = '';
    
    // Render product cards
    filteredProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'paint-product-card relative';
      productCard.style.cursor = 'pointer';
      productCard.dataset.productId = product.id;
      
      const priceInfo = projectType === 'residential' ? product.residentialPrice : product.commercialPrice;
      const price = priceInfo && priceInfo.default ? `$${priceInfo.default}/sq ft` : 'Price TBD';
      
      productCard.innerHTML = `
        <div class="paint-product-name">${product.name}</div>
        <div class="paint-product-info">Coverage: ${product.coverage} sq ft/gal</div>
        ${product.finishes.length > 0 ? `<div class="paint-product-info">Finishes: ${product.finishes.map(f => f === 'Low Sheen/Lustre' ? 'Low Sheen' : f).join(', ')}</div>` : ''}
      `;

      // Long press handler for price editing
      let longPressTimer = null;
      let isLongPress = false;
      
      // Prevent context menu on long press
      productCard.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
      
      // Handle touch/mouse down
      const startLongPress = (e) => {
        isLongPress = false;
        // Add visual feedback for long press start
        productCard.style.transition = 'opacity 5s ease-out';
        productCard.style.opacity = '0.8';
        
        longPressTimer = setTimeout(() => {
          isLongPress = true;
          // Show visual feedback
          productCard.style.transition = 'opacity 0.2s';
          productCard.style.opacity = '0.6';
          showPriceEditingPopup(product, paintSelection, projectType);
        }, 5000); // 5 seconds
      };
      
      // Handle touch/mouse up
      const endLongPress = () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        // Reset visual feedback
        productCard.style.transition = 'opacity 0.2s';
        productCard.style.opacity = '1';
        isLongPress = false;
      };
      
      // Add event listeners for both touch and mouse
      productCard.addEventListener('mousedown', startLongPress);
      productCard.addEventListener('touchstart', startLongPress);
      productCard.addEventListener('mouseup', endLongPress);
      productCard.addEventListener('touchend', endLongPress);
      productCard.addEventListener('mouseleave', endLongPress);
      productCard.addEventListener('touchcancel', endLongPress);
      
      productCard.addEventListener('click', () => {
        // Only handle regular clicks, not long presses
        if (isLongPress) {
          productCard.style.opacity = '1';
          return;
        }
        
        // Normal single selection behavior
        document.querySelectorAll(`#products-grid-${paintId} .paint-product-card`).forEach(card => {
          card.classList.remove('selected');
        });
        
        // Select this card
        productCard.classList.add('selected');
        
        // Update paint selection with single product
        paintSelection.products = [product.name];
        paintSelection.selectedProduct = product;
        
        formState.saveState();
      });
      
      // Check if this product was previously selected
      if (paintSelection.selectedProduct && paintSelection.selectedProduct.id === product.id) {
        productCard.classList.add('selected');
      }
      
      productsGrid.appendChild(productCard);
    });
  }
  
  // Show price editing popup (secret feature)
  function showPriceEditingPopup(product, paintSelection, projectType) {
    // Get price info based on project type
    const priceInfo = projectType === 'residential' ? product.residentialPrice : product.commercialPrice;
    
    if (!priceInfo) {
      alert('Price information not available for this product.');
      return;
    }
    
    const minPrice = priceInfo.min || 0;
    const maxPrice = priceInfo.max || 10;
    const currentPrice = paintSelection.customPrice || priceInfo.default || minPrice;
    
    // Create modal if it doesn't exist
    if (!document.getElementById('price-edit-modal')) {
      const modalHTML = `
        <div id="price-edit-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
          <div class="modal-content" style="background: white; padding: 2rem; border-radius: 0.5rem; max-width: 400px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h3 class="text-lg font-semibold mb-4">Edit Price - <span id="product-name"></span></h3>
            <p class="text-sm text-gray-600 mb-4">Adjust the price per square foot for this product.</p>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Price per sq ft ($<span id="min-price"></span> - $<span id="max-price"></span>)
              </label>
              <input type="number" id="custom-price-input" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.01">
              <div class="mt-2 text-xs text-gray-500">
                <div>Min: $<span id="display-min"></span>/sq ft</div>
                <div>Max: $<span id="display-max"></span>/sq ft</div>
                <div>Default: $<span id="default-price"></span>/sq ft</div>
              </div>
            </div>
            
            <div class="flex justify-end gap-3">
              <button type="button" id="reset-price-btn" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Reset to Default
              </button>
              <button type="button" id="cancel-price-btn" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Cancel
              </button>
              <button type="button" id="save-price-btn" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Save Price
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    const modal = document.getElementById('price-edit-modal');
    const productNameEl = document.getElementById('product-name');
    const minPriceEl = document.getElementById('min-price');
    const maxPriceEl = document.getElementById('max-price');
    const displayMinEl = document.getElementById('display-min');
    const displayMaxEl = document.getElementById('display-max');
    const defaultPriceEl = document.getElementById('default-price');
    const priceInput = document.getElementById('custom-price-input');
    
    // Set modal content
    productNameEl.textContent = product.name;
    minPriceEl.textContent = minPrice.toFixed(2);
    maxPriceEl.textContent = maxPrice.toFixed(2);
    displayMinEl.textContent = minPrice.toFixed(2);
    displayMaxEl.textContent = maxPrice.toFixed(2);
    defaultPriceEl.textContent = (priceInfo.default || minPrice).toFixed(2);
    priceInput.value = currentPrice.toFixed(2);
    priceInput.min = minPrice;
    priceInput.max = maxPrice;
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Event handlers
    const saveBtn = document.getElementById('save-price-btn');
    const cancelBtn = document.getElementById('cancel-price-btn');
    const resetBtn = document.getElementById('reset-price-btn');
    
    const cleanup = () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      saveBtn.removeEventListener('click', handleSave);
      cancelBtn.removeEventListener('click', handleCancel);
      resetBtn.removeEventListener('click', handleReset);
    };
    
    const handleSave = () => {
      const newPrice = parseFloat(priceInput.value);
      if (newPrice >= minPrice && newPrice <= maxPrice) {
        paintSelection.customPrice = newPrice;
        formState.saveState();
        cleanup();
        // Optionally refresh the display
        alert(`Price updated to $${newPrice.toFixed(2)}/sq ft`);
      } else {
        alert(`Please enter a price between $${minPrice.toFixed(2)} and $${maxPrice.toFixed(2)}`);
      }
    };
    
    const handleCancel = () => {
      cleanup();
    };
    
    const handleReset = () => {
      priceInput.value = (priceInfo.default || minPrice).toFixed(2);
    };
    
    saveBtn.addEventListener('click', handleSave);
    cancelBtn.addEventListener('click', handleCancel);
    resetBtn.addEventListener('click', handleReset);
    
    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }
  
  // Enhanced paint card creation with surfaces
  function createPaintCardEnhanced(projectType, index) {
    const paintId = `paint-${projectType}-${Date.now()}`;
    const card = document.createElement('div');
    card.className = 'paint-card';
    card.dataset.paintId = paintId;
    
    // Card header with icon - now collapsible
    const header = document.createElement('div');
    header.className = 'mb-4 p-3 bg-gray-50 rounded-lg';
    header.style.cursor = 'pointer';
    header.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <img src="../img/${projectType}_icon.svg" alt="${projectType} icon" class="w-5 h-5">
        ${projectType === 'interior' ? 'Interior' : 'Exterior'} Paint
        <svg class="chevron-icon ml-auto transform transition-transform" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </h3>
    `;
    card.appendChild(header);
    
    // Create service content wrapper
    const serviceContent = document.createElement('div');
    serviceContent.className = 'service-content';
    // Start collapsed - accordion initialization will expand the first one
    serviceContent.style.display = 'none';
    
    // Set chevron to collapsed state initially
    const chevron = header.querySelector('.chevron-icon');
    if (chevron) {
      chevron.style.transform = 'rotate(-90deg)';
    }
    
    // Add click handler to header for collapse/expand
    header.addEventListener('click', () => {
      const chevron = header.querySelector('.chevron-icon');
      handleAccordionToggle(header, serviceContent, chevron);
    });
    
    // Initialize paint selection in formState
    if (!formState.data.paintSelections) {
      formState.data.paintSelections = [];
    }
    
    const paintSelection = {
      id: paintId,
      projectType: projectType,
      brand: '',
      finish: '',
      products: [],
      surfaces: [],
      colorStatus: 'tbd', // Default to "To Be Determined"
      sameColor: true // Default to true (Same Color)
    };
    
    // Check if there's an existing selection with this project type and migrate finish value
    const existingSelection = formState.data.paintSelections.find(p => p.projectType === projectType);
    if (existingSelection) {
      paintSelection.brand = existingSelection.brand || '';
      paintSelection.finish = existingSelection.finish === 'Low Sheen/Lustre' ? 'Low Sheen' : (existingSelection.finish || '');
      paintSelection.products = existingSelection.products || [];
      paintSelection.selectedProduct = existingSelection.selectedProduct;
      paintSelection.colorStatus = existingSelection.colorStatus || 'tbd'; // Preserve color status
      paintSelection.sameColor = existingSelection.sameColor !== undefined ? existingSelection.sameColor : true; // Preserve sameColor state
      // Remove the old selection
      formState.data.paintSelections = formState.data.paintSelections.filter(p => p.projectType !== projectType);
    }
    
    formState.data.paintSelections.push(paintSelection);
    formState.saveState();
    
    // Paint finish selection
    const finishSection = document.createElement('div');
    const finishOptions = createFinishSelector(paintId, projectType);
    finishSection.innerHTML = `
      <h3 class="text-lg font-semibold mb-3">Paint Finish</h3>
      <div class="select-container">
        <select class="paint-finish-select" id="finish-select-${paintId}" onchange="updatePaintFinishEnhanced('${paintId}', this.value)">
          ${finishOptions}
        </select>
      </div>
    `;
    serviceContent.appendChild(finishSection);
    
    // Immediately fix any "Low Sheen/Lustre" options after adding to DOM
    setTimeout(() => {
      const finishSelect = document.getElementById(`finish-select-${paintId}`);
      if (finishSelect) {
        // Set the saved value if exists
        if (paintSelection.finish) {
          const finishValue = paintSelection.finish === 'Low Sheen/Lustre' ? 'Low Sheen' : paintSelection.finish;
          finishSelect.value = finishValue;
        }
        
        // Mark this select as needing fix
        finishSelect.dataset.lowSheenFixed = 'false';
      }
    }, 0);
    
    // Paint brand selection - populate from Bitrix data
    const brandSection = document.createElement('div');
    brandSection.className = 'mt-4';
    let uniqueBrands = [...new Set(window.bitrixProducts.map(p => p.brand))].filter(Boolean);
    
    // Filter out UCI for interior paint selection
    if (projectType === 'interior') {
      uniqueBrands = uniqueBrands.filter(brand => brand !== 'UCI');
    }
    
    let brandOptions = '<option value="">Select a brand...</option>';
    uniqueBrands.forEach(brand => {
      // Keep text concise for dropdown display
      const displayName = brand.length > 15 ? brand.substring(0, 12) + '...' : brand;
      brandOptions += `<option value="${brand}" title="${brand}">${displayName}</option>`;
    });
    
    brandSection.innerHTML = `
      <h3 class="text-lg font-semibold mb-3">Paint Brand</h3>
      <div class="select-container">
        <select class="paint-brand-select" onchange="updatePaintBrandEnhanced('${paintId}', this.value)">
          ${brandOptions}
        </select>
      </div>
    `;
    serviceContent.appendChild(brandSection);
    
    // Set saved brand value if exists
    if (paintSelection.brand) {
      setTimeout(() => {
        const brandSelect = card.querySelector('.paint-brand-select');
        if (brandSelect) {
          brandSelect.value = paintSelection.brand;
          // Trigger products update if both brand and finish are selected
          if (paintSelection.finish) {
            updatePaintBrandEnhanced(paintId, paintSelection.brand);
          }
        }
      }, 0);
    }
    
    // Trigger initial product load if finish is selected but no brand
    if (paintSelection.finish && !paintSelection.brand) {
      setTimeout(() => {
        updatePaintFinishEnhanced(paintId, paintSelection.finish);
      }, 50);
    }
    
    // Paint products section
    const productsSection = document.createElement('div');
    productsSection.className = 'paint-products-section mt-4';
    productsSection.innerHTML = '<h3 class="text-lg font-semibold mb-3">Paint Product</h3>';
    
    const productsGrid = document.createElement('div');
    productsGrid.className = 'paint-products-grid';
    productsGrid.id = `products-grid-${paintId}`;
    productsSection.appendChild(productsGrid);
    
    // Set initial state of products grid based on saved selections
    if (!paintSelection.brand && !paintSelection.finish) {
      productsGrid.innerHTML = '<p class="text-gray-500">Please select a finish and brand first.</p>';
    } else if (paintSelection.brand && !paintSelection.finish) {
      productsGrid.innerHTML = '<p class="text-gray-500">Please select a paint finish</p>';
    } else if (!paintSelection.brand && paintSelection.finish) {
      productsGrid.innerHTML = '<p class="text-gray-500">Please select a paint brand</p>';
    } else if (paintSelection.brand && paintSelection.finish) {
      // Both brand and finish are selected, load products immediately
      productsGrid.innerHTML = '<p class="text-gray-500">Loading products...</p>';
      // Trigger product load after a short delay to ensure DOM is ready
      setTimeout(() => {
        displayPaintProducts(paintId);
      }, 100);
    } else {
      productsGrid.innerHTML = '<p class="text-gray-500">Loading products...</p>';
    }
    
    serviceContent.appendChild(productsSection);
    
    // Add color selection status section
    const colorSection = document.createElement('div');
    colorSection.className = 'mt-4';
    
    // Read the saved sameColor state (default to true if undefined)
    const isSameColor = paintSelection.sameColor !== false;
    
    colorSection.innerHTML = `
      <h3 class="text-lg font-semibold mb-3">Color Selection Status</h3>
      <div class="form-group">
        <select id="color-status-${paintId}" class="input-field" onchange="updateColorStatus('${paintId}', this.value)">
          <option value="tbd">To Be Determined</option>
          <option value="selected">Colors Selected</option>
        </select>
      </div>
      <div id="color-input-section-${paintId}" class="mt-3" style="display: none;">
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700" style="margin-bottom: 0.125rem;">Same Color for All Areas</label>
          <div class="measurement-input-type-selector">
            <span class="toggle-label-left ${!isSameColor ? 'active' : ''}" id="toggle-label-left-${paintId}">Different Colors</span>
            <label class="toggle-switch" for="toggle-same-color-${paintId}">
              <input type="checkbox" id="toggle-same-color-${paintId}" ${isSameColor ? 'checked' : ''} onchange="toggleSameColor('${paintId}', this.checked)">
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label-right ${isSameColor ? 'active' : ''}" id="toggle-label-right-${paintId}">Same Color</span>
          </div>
        </div>
        <div id="single-color-input-${paintId}" class="form-group mt-3" style="display: none; position: relative;">
          <label class="block text-sm font-medium text-gray-700 mb-1">Color Name/ID</label>
          <input type="text" id="color-single-${paintId}" class="input-field" placeholder="Enter color name or ID" autocomplete="off">
          <div id="single-color-suggestions-${paintId}" class="color-suggestions-dropdown" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 132px; overflow-y: auto; background: white; border: 1px solid #e5e7eb; border-radius: 0.375rem; margin-top: 0.25rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); display: none; z-index: 50;"></div>
        </div>
      </div>
    `;
    serviceContent.appendChild(colorSection);
    
    // Set up custom dropdown for single color input
    setTimeout(() => {
      const singleColorInput = document.getElementById(`color-single-${paintId}`);
      const singleColorDropdown = document.getElementById(`single-color-suggestions-${paintId}`);
      
      if (singleColorInput && singleColorDropdown) {
        // Function to show/hide suggestions for single color
        function showSingleColorSuggestions() {
          const inputValue = singleColorInput.value.toLowerCase();
          let suggestionsToShow;
          
          if (inputValue.length === 0) {
            // Show up to 3 suggestions when input is empty
            suggestionsToShow = window.colorSuggestions.slice(0, 3);
          } else {
            // Filter suggestions based on input
            const filteredSuggestions = window.colorSuggestions.filter(color => 
              color.toLowerCase().includes(inputValue)
            );
            // Limit to 3 suggestions
            suggestionsToShow = filteredSuggestions.slice(0, 3);
          }
          
          if (suggestionsToShow.length > 0) {
            singleColorDropdown.innerHTML = '';
            suggestionsToShow.forEach(suggestion => {
              const suggestionItem = document.createElement('div');
              suggestionItem.className = 'color-suggestion-item';
              suggestionItem.textContent = suggestion;
              suggestionItem.style.cssText = 'padding: 0.5rem 0.75rem; cursor: pointer; font-size: 0.875rem; transition: background-color 0.15s;';
              
              suggestionItem.addEventListener('mouseenter', () => {
                suggestionItem.style.backgroundColor = '#f3f4f6';
              });
              
              suggestionItem.addEventListener('mouseleave', () => {
                suggestionItem.style.backgroundColor = 'transparent';
              });
              
              suggestionItem.addEventListener('click', () => {
                singleColorInput.value = suggestion;
                updateSingleColor(paintId, suggestion);
                singleColorDropdown.style.display = 'none';
              });
              
              singleColorDropdown.appendChild(suggestionItem);
            });
            singleColorDropdown.style.display = 'block';
          } else if (inputValue.length === 0 && window.colorSuggestions.length === 0) {
            // Show empty state message when no suggestions exist
            singleColorDropdown.innerHTML = '';
            const emptyMessage = document.createElement('div');
            emptyMessage.style.cssText = `
              padding: 0.75rem;
              color: #6b7280;
              font-size: 0.875rem;
              font-style: italic;
              text-align: center;
            `;
            emptyMessage.textContent = 'No recent colors';
            singleColorDropdown.appendChild(emptyMessage);
            singleColorDropdown.style.display = 'block';
          } else {
            singleColorDropdown.style.display = 'none';
          }
        }
        
        singleColorInput.addEventListener('input', showSingleColorSuggestions);
        singleColorInput.addEventListener('focus', showSingleColorSuggestions);
        singleColorInput.addEventListener('blur', () => {
          setTimeout(() => {
            singleColorDropdown.style.display = 'none';
          }, 200);
        });
        
        singleColorInput.addEventListener('change', () => {
          updateSingleColor(paintId, singleColorInput.value);
        });
      }
    }, 50);
    
    // Set saved color status if exists
    if (paintSelection.colorStatus) {
      setTimeout(() => {
        const colorSelect = document.getElementById(`color-status-${paintId}`);
        if (colorSelect) {
          colorSelect.value = paintSelection.colorStatus;
          // Trigger the update to show/hide color inputs
          updateColorStatus(paintId, paintSelection.colorStatus);
        }
        
        // Set saved single color if exists
        if (paintSelection.singleColor) {
          const singleColorInput = document.getElementById(`color-single-${paintId}`);
          if (singleColorInput) {
            singleColorInput.value = paintSelection.singleColor;
          }
        }
        
        // Set saved same color toggle state
        if (paintSelection.sameColor !== undefined) {
          const sameColorToggle = document.getElementById(`toggle-same-color-${paintId}`);
          if (sameColorToggle) {
            sameColorToggle.checked = paintSelection.sameColor;
            toggleSameColor(paintId, paintSelection.sameColor);
          }
        }
      }, 100);
    }
    
    // Add surfaces section - THIS IS THE KEY INTEGRATION
    // Add surfaces directly to the serviceContent (no wrapper)
    const surfacesFragment = renderSurfacesInPaintCard(paintId, projectType);
    serviceContent.appendChild(surfacesFragment);
    
    // Append the service content to the card
    card.appendChild(serviceContent);
    
    return card;
  }
  
  // Enhanced abrasive service card creation
  function createAbrasiveCardEnhanced() {
    // Get selected abrasive methods from form state (try multiple possible property names)
    let selectedMethods = formState.data.abrasiveMethods || formState.data.abrasiveMethod || [];
    
    // Handle different possible data structures
    if (typeof selectedMethods === 'string') {
      selectedMethods = [selectedMethods];
    } else if (!Array.isArray(selectedMethods)) {
      selectedMethods = [];
    }
    
    if (!selectedMethods || selectedMethods.length === 0) {
      return null;
    }
    
    // Create a fragment to hold all method cards
    const fragment = document.createDocumentFragment();
    
    // Create a measurement section for each selected method
    selectedMethods.forEach((methodValue, index) => {
      try {
        const serviceId = `abrasive-${methodValue}-${Date.now()}-${index}`;
        const methodCard = createAbrasiveMethodCard(methodValue, serviceId, index);
        if (methodCard) {
          fragment.appendChild(methodCard);
        }
      } catch (error) {
        }
    });
    
    return fragment;
  }
  
  // Create individual measurement card for each abrasive method
  function createAbrasiveMethodCard(methodValue, serviceId, index) {
    // Map method values to display names and icons
    const methodData = {
      'sandblasting': { name: 'Sandblasting', icon: 'Sandblasting_Icon.png' },
      'pressure': { name: 'Pressure Cleaning', icon: 'Pressure_Cleaning_Icon.png' },
      'chemical': { name: 'Chemical Stripping', icon: 'Chemical_Icon.png' },
      'grinding': { name: 'Grinding', icon: 'Grinder_Icon.png' }
    };
    
    const method = methodData[methodValue] || { name: methodValue, icon: 'Grinder_Icon.png' };
    const methodId = `${serviceId}-${methodValue}-${index}`;
    
    // Ensure this method has a default surface if none exists
    if (!formState.data.surfaces) {
      formState.data.surfaces = [];
    }
    
    // Check if surfaces exist for this method type
    const existingSurfaces = formState.data.surfaces.filter(s => s.type === methodValue);
    if (existingSurfaces.length === 0) {
      // Create default surface for this method
      const defaultSurface = {
        id: `surface-${Date.now()}-${methodValue}`,
        type: methodValue,
        name: `${method.name} Area`,
        unit: FIXED_UNIT,
        measurements: [{
          id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          description: 'Main Area',
          entryType: 'lxh',
          isDeduction: false,
          dimensions: [{ id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, l: '', h: '' }],
          totalValue: '',
          photos: [],
          color: '' // Initialize color field
        }]
      };
      
      formState.data.surfaces.push(defaultSurface);
      formState.saveState();
    }
    
    const methodCard = document.createElement('div');
    methodCard.className = 'paint-card';
    methodCard.dataset.serviceId = methodId;
    
    // Method header - EXACTLY like paint card header
    const methodHeader = document.createElement('div');
    methodHeader.className = 'mb-4 p-3 bg-gray-50 rounded-lg';
    methodHeader.style.cursor = 'pointer';
    methodHeader.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <img src="../img/${method.icon}" alt="${method.name} icon" class="w-5 h-5">
        ${method.name}
      </h3>
    `;
    methodCard.appendChild(methodHeader);
    
    // Add long press handler for price editing on abrasive methods
    let longPressTimer = null;
    let isLongPress = false;
    
    // Prevent context menu on long press
    methodHeader.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Handle touch/mouse down
    const startLongPress = (e) => {
      isLongPress = false;
      // Add visual feedback for long press start
      methodHeader.style.transition = 'opacity 5s ease-out';
      methodHeader.style.opacity = '0.8';
      
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        // Show visual feedback
        methodHeader.style.transition = 'opacity 0.2s';
        methodHeader.style.opacity = '0.6';
        // Find the service for this abrasive method
        const service = abrasiveServices.find(s => s.serviceType === methodValue);
        if (service) {
          // Create a paint selection-like object for the price editor
          const abrasiveSelection = {
            id: methodId,
            productId: service.id,
            productName: service.title || method.name,
            brand: 'Abrasive Service',
            finish: '',
            color: '',
            scope: 'exterior' // Abrasive is always exterior
          };
          showPriceEditingPopup(service, abrasiveSelection, 'exterior');
        }
      }, 5000); // 5 seconds
    };
    
    // Handle touch/mouse up
    const endLongPress = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      // Reset visual feedback
      methodHeader.style.transition = 'opacity 0.2s';
      methodHeader.style.opacity = '1';
      isLongPress = false;
    };
    
    // Add event listeners for both touch and mouse
    methodHeader.addEventListener('mousedown', startLongPress);
    methodHeader.addEventListener('touchstart', startLongPress);
    methodHeader.addEventListener('mouseup', endLongPress);
    methodHeader.addEventListener('touchend', endLongPress);
    methodHeader.addEventListener('mouseleave', endLongPress);
    methodHeader.addEventListener('touchcancel', endLongPress);
    
    // Add surfaces directly - EXACTLY like paint card
    const surfacesFragment = renderSurfacesInPaintCard(methodId, methodValue);
    methodCard.appendChild(surfacesFragment);
    
    // Ensure delete button visibility is correct after rendering
    setTimeout(() => {
      const methodSurfaces = formState.data.surfaces.filter(s => s.type === methodValue);
      methodSurfaces.forEach(surface => {
        updateMeasurementDeleteButtons(surface.id);
      });
    }, 50);
    
    return methodCard;
  }
  
  // Create surface coating method card (for concrete and wood treatments)
  function createSurfaceCoatingMethodCard(methodType, displayName, selectedServices) {
    // Create a fragment to hold all service cards
    const fragment = document.createDocumentFragment();
    
    // Map service values to display names and icons
    const serviceData = {
      // Concrete coating services
      'epoxy_floors': { name: 'Epoxy Floors', icon: 'Grinder_Icon.png' },
      'sealing': { name: 'Sealing', icon: 'Chemical_Icon.png' },
      'decorative_overlays': { name: 'Decorative Overlays', icon: 'Grinder_Icon.png' },
      'dye_colorants': { name: 'Dye & Colorants', icon: 'Chemical_Icon.png' },
      'polishing': { name: 'Polishing', icon: 'Grinder_Icon.png' },
      // Wood treatment services
      'stains': { name: 'Stains', icon: 'Chemical_Icon.png' },
      'sealers': { name: 'Sealers', icon: 'Chemical_Icon.png' },
      'protective_clearcoat': { name: 'Protective Clearcoat', icon: 'Chemical_Icon.png' }
    };
    
    // Create a card for each selected service
    selectedServices.forEach((serviceValue, index) => {
      try {
        const serviceId = `${methodType}-${serviceValue}-${Date.now()}-${index}`;
        const service = serviceData[serviceValue] || { name: serviceValue, icon: methodType === 'concrete' ? 'Grinder_Icon.png' : 'Chemical_Icon.png' };
        
        // Ensure this service has a default surface if none exists
        if (!formState.data.surfaces) {
          formState.data.surfaces = [];
        }
        
        // Check if surfaces exist for this service type
        const existingSurfaces = formState.data.surfaces.filter(s => s.type === serviceValue);
        if (existingSurfaces.length === 0) {
          // Create default surface for this service
          const defaultSurface = {
            id: `surface-${Date.now()}-${serviceValue}`,
            type: serviceValue,
            name: `${service.name} Area`,
            unit: FIXED_UNIT,
            measurements: [{
              id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              description: 'Main Area',
              entryType: 'lxh',
              isDeduction: false,
              dimensions: [{ id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, l: '', h: '' }],
              totalValue: '',
              photos: [],
              color: ''
            }]
          };
          
          formState.data.surfaces.push(defaultSurface);
          formState.saveState();
        }
        
        const serviceCard = document.createElement('div');
        serviceCard.className = 'paint-card';
        serviceCard.dataset.serviceId = serviceId;
        
        // Service header
        const serviceHeader = document.createElement('div');
        serviceHeader.className = 'mb-4 p-3 bg-gray-50 rounded-lg';
        serviceHeader.style.cursor = 'pointer';
        serviceHeader.innerHTML = `
          <h3 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <img src="../img/${service.icon}" alt="${service.name} icon" class="w-5 h-5">
            ${service.name}
            <svg class="chevron-icon ml-auto transform transition-transform" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </h3>
        `;
        
        // Collapsible content
        const serviceContent = document.createElement('div');
        serviceContent.className = 'service-content';
        serviceContent.style.display = 'none';
        
        // Set chevron to collapsed state initially
        const chevron = serviceHeader.querySelector('.chevron-icon');
        if (chevron) {
          chevron.style.transform = 'rotate(-90deg)';
        }
        
        // Header click to toggle
        serviceHeader.addEventListener('click', () => {
          const chevron = serviceHeader.querySelector('.chevron-icon');
          handleAccordionToggle(serviceHeader, serviceContent, chevron);
        });
        
        serviceCard.appendChild(serviceHeader);
        serviceCard.appendChild(serviceContent);
        
        // Add surfaces for this service
        const serviceSurfaces = renderSurfacesForServiceType(serviceValue);
        serviceContent.appendChild(serviceSurfaces);
        
        fragment.appendChild(serviceCard);
      } catch (error) {
        }
    });
    
    return fragment;
  }
  
  // Render surfaces for a specific service type
  function renderSurfacesForServiceType(serviceType) {
    const fragment = document.createDocumentFragment();
    
    // Get surfaces for this service type
    const surfaces = formState.data.surfaces.filter(s => s.type === serviceType);
    
    surfaces.forEach(surface => {
      const surfaceCard = createSurfaceCard(surface);
      fragment.appendChild(surfaceCard);
    });
    
    // Add surface button
    const addButton = document.createElement('button');
    addButton.className = 'btn btn-secondary w-full';
    addButton.innerHTML = `<i class="fas fa-plus mr-2"></i>Add Section`;
    addButton.addEventListener('click', () => {
      const newSurface = {
        id: `surface-${Date.now()}`,
        type: serviceType,
        name: 'New Section',
        unit: FIXED_UNIT,
        measurements: [{
          id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          description: '',
          entryType: 'lxh',
          isDeduction: false,
          dimensions: [{ id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, l: '', h: '' }],
          totalValue: '',
          photos: [],
          color: ''
        }]
      };
      
      formState.data.surfaces.push(newSurface);
      formState.saveState();
      
      // Re-render
      const container = document.getElementById('paint-selections-container');
      if (container) {
        renderPaintSelectionsEnhanced();
      }
    });
    
    fragment.appendChild(addButton);
    return fragment;
  }
  
  // Render paint selections enhanced
  function renderPaintSelectionsEnhanced() {
    const container = document.getElementById('paint-selections-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Check project scope and service types
    const projectScope = formState.data.projectScope || { interior: true, exterior: false };
    const serviceTypes = formState.data.serviceTypes || ['painting'];
    
    // Create cards based on selected services and project scope
    serviceTypes.forEach(serviceType => {
      if (serviceType === 'painting' || serviceType === 'surface_coating') {
        // Handle surface coating methods
        if (serviceType === 'surface_coating' && formState.data.surfaceCoatingMethods) {
          // Process each surface coating method
          formState.data.surfaceCoatingMethods.forEach(method => {
            if (method === 'painting') {
              // Create paint cards for interior/exterior
              if (projectScope.interior) {
                const interiorCard = createPaintCardEnhanced('interior', 0);
                container.appendChild(interiorCard);
              }
              
              if (projectScope.exterior) {
                const exteriorCard = createPaintCardEnhanced('exterior', 1);
                container.appendChild(exteriorCard);
              }
            } else if (method === 'concrete') {
              // Create concrete coating card(s)
              if (formState.data.concreteCoatingTypes && formState.data.concreteCoatingTypes.length > 0) {
                const concreteCard = createSurfaceCoatingMethodCard('concrete', 'Concrete Coating', formState.data.concreteCoatingTypes);
                container.appendChild(concreteCard);
              }
            } else if (method === 'wood') {
              // Create wood treatment card(s)
              if (formState.data.woodCoatingTypes && formState.data.woodCoatingTypes.length > 0) {
                const woodCard = createSurfaceCoatingMethodCard('wood', 'Wood Treatment', formState.data.woodCoatingTypes);
                container.appendChild(woodCard);
              }
            }
          });
        } else if (serviceType === 'painting') {
          // Legacy support for old 'painting' service type
          if (projectScope.interior) {
            const interiorCard = createPaintCardEnhanced('interior', 0);
            container.appendChild(interiorCard);
          }
          
          if (projectScope.exterior) {
            const exteriorCard = createPaintCardEnhanced('exterior', 1);
            container.appendChild(exteriorCard);
          }
        }
      } else if (serviceType === 'abrasive' || 
                 serviceType === 'Abrasive Cleaning Method' || 
                 serviceType.toLowerCase().includes('abrasive')) {
        // Create abrasive service cards (only if methods are selected)
        const abrasiveCards = createAbrasiveCardEnhanced();
        if (abrasiveCards) {
          // abrasiveCards is a DocumentFragment, append all its children
          while (abrasiveCards.firstChild) {
            container.appendChild(abrasiveCards.firstChild);
          }
        } else {
          }
      }
    });
    
    // After all rendering is complete, update surface delete button visibility
    setTimeout(() => {
      if (projectScope.interior) {
        updateSurfaceDeleteButtons('interior');
      }
      if (projectScope.exterior) {
        updateSurfaceDeleteButtons('exterior');
      }
      // Update for all surface types in case there are others
      const allSurfaceTypes = [...new Set(formState.data.surfaces.map(s => s.type))];
      allSurfaceTypes.forEach(type => {
        if (type !== 'interior' && type !== 'exterior') {
          updateSurfaceDeleteButtons(type);
        }
      });
      
      // Initialize accordion state - only first section should be expanded
      const allServiceContents = document.querySelectorAll('.service-content');
      const allHeaders = document.querySelectorAll('.mb-4.p-3.bg-gray-50.rounded-lg[style*="cursor: pointer"]');
      
      // Collapse all sections first
      allServiceContents.forEach((content, index) => {
        content.style.display = 'none';
      });
      
      // Set all chevrons to collapsed state
      allHeaders.forEach(header => {
        const chevron = header.querySelector('.chevron-icon');
        if (chevron) {
          chevron.style.transform = 'rotate(-90deg)';
        }
      });
      
      // Expand only the first section
      if (allServiceContents.length > 0) {
        allServiceContents[0].style.display = 'block';
        const firstChevron = allHeaders[0]?.querySelector('.chevron-icon');
        if (firstChevron) {
          firstChevron.style.transform = '';
        }
      }
    }, 100);
  }
  
  // Finish Types (from BitrixService)
  const FINISH_TYPES = {
    '2119': 'Flat/Matte',
    '2120': 'Low Sheen', 
    '2121': 'Satin',
    '2122': 'Semi-Gloss',
    '2123': 'Gloss',
    '2124': 'High Gloss'
  };
  
  // Create finish selector options
  function createFinishSelector(paintId, projectType) {
    let finishOptions = '<option value="">Select a finish...</option>';
    
    // Get available finishes across all brands for this project type
    const availableFinishes = getAvailableFinishesForBrand(null, projectType);
    
    // Detect if we're on iPad
    const isIPad = navigator.userAgent.match(/iPad/i) || 
                  (navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints > 1);
    
    Object.entries(FINISH_TYPES).forEach(([id, name]) => {
      // Always use "Low Sheen" instead of "Low Sheen/Lustre"
      let displayName = name;
      if (name === 'Low Sheen/Lustre') {
        displayName = 'Low Sheen';
      }
      
      const isAvailable = availableFinishes.includes(name) || 
                         (name === 'Low Sheen' && availableFinishes.includes('Low Sheen/Lustre'));
      
      // For iPad, use even shorter names
      if (isIPad) {
        const shortNames = {
          'Flat/Matte': 'Flat',
          'Low Sheen': 'Low Sheen',
          'Satin': 'Satin',
          'Semi-Gloss': 'Semi-Gloss',
          'Gloss': 'Gloss',
          'High Gloss': 'Hi-Gloss'
        };
        displayName = shortNames[displayName] || displayName;
      } else if (displayName.length > 15) {
        // For other devices, truncate if needed
        displayName = displayName.substring(0, 12) + '...';
      }
      
      const optionValue = name === 'Low Sheen/Lustre' ? 'Low Sheen' : name;
      finishOptions += `<option value="${optionValue}" title="${displayName}">${displayName}</option>`;
    });
    
    return finishOptions;
  }
  
  // Get available finishes for a brand (or all brands if brand is null)
  function getAvailableFinishesForBrand(brand, projectType) {
    if (!window.bitrixProducts || window.bitrixProducts.length === 0) return [];
    
    let filteredProducts = window.bitrixProducts.filter(product => {
      // Exclude UCI products for interior paint
      if (projectType === 'interior' && product.brand === 'UCI') {
        return false;
      }
      const scopeMatch = (projectType === 'interior' && product.interior) ||
                        (projectType === 'exterior' && product.exterior);
      const brandMatch = !brand || product.brand === brand;
      return scopeMatch && brandMatch;
    });
    
    // Get all unique finishes from filtered products
    const availableFinishes = new Set();
    filteredProducts.forEach(product => {
      if (product.finishes && product.finishes.length > 0) {
        product.finishes.forEach(finish => {
          // Map old finish names to new ones for compatibility
          if (finish === 'Low Sheen/Lustre') {
            availableFinishes.add('Low Sheen');
          } else {
            availableFinishes.add(finish);
          }
        });
      }
    });
    
    return Array.from(availableFinishes);
  }
  
  // Update finish availability based on brand selection
  function updateFinishAvailability(paintId, brand, projectType) {
    const finishSelect = document.getElementById(`finish-select-${paintId}`);
    if (!finishSelect) return;
    
    const availableFinishes = getAvailableFinishesForBrand(brand, projectType);
    const currentFinish = finishSelect.value;
    
    // Update each option
    Array.from(finishSelect.options).forEach(option => {
      if (option.value === '') return; // Skip default option
      
      const isAvailable = availableFinishes.includes(option.value) || 
                          (option.value === 'Low Sheen/Lustre' && availableFinishes.includes('Low Sheen'));
      option.disabled = !isAvailable;
      option.style.color = isAvailable ? '' : '#9ca3af';
      
      // Always shorten "Low Sheen/Lustre" to "Low Sheen"
      if (option.value === 'Low Sheen/Lustre' || option.textContent.includes('Low Sheen/Lustre')) {
        option.textContent = 'Low Sheen' + (isAvailable ? '' : ' (N/A)');
        option.value = 'Low Sheen';
      } else {
        // Truncate text if needed to prevent overflow
        const baseText = option.value;
        const suffix = isAvailable ? '' : ' (N/A)';
        const fullText = baseText + suffix;
        
        // Limit text length for better dropdown display
        if (fullText.length > 20) {
          option.textContent = baseText.substring(0, 15) + '...' + suffix;
          option.title = fullText; // Show full text on hover
        } else {
          option.textContent = fullText;
        }
      }
    });
    
    // If current finish is no longer available, clear selection
    if (currentFinish && !availableFinishes.includes(currentFinish)) {
      finishSelect.value = '';
      updatePaintFinishEnhanced(paintId, '');
    }
  }
  
  // Update brand availability based on finish selection
  function updateBrandAvailability(paintId, finish, projectType) {
    const brandSelect = document.querySelector(`[data-paint-id="${paintId}"] .paint-brand-select`);
    if (!brandSelect) return;
    
    // Get all unique brands that have products with the selected finish
    const availableBrands = new Set();
    
    window.bitrixProducts.forEach(product => {
      // Skip UCI for interior
      if (projectType === 'interior' && product.brand === 'UCI') {
        return;
      }
      
      const scopeMatch = (projectType === 'interior' && product.interior) ||
                        (projectType === 'exterior' && product.exterior);
      
      // Handle finish matching with compatibility for old finish names
      let finishMatch = !finish;
      if (finish && product.finishes) {
        finishMatch = product.finishes.includes(finish) ||
                     (finish === 'Low Sheen' && product.finishes.includes('Low Sheen/Lustre'));
      }
      
      if (scopeMatch && finishMatch && product.brand) {
        availableBrands.add(product.brand);
      }
    });
    
    const currentBrand = brandSelect.value;
    
    // Update each option
    Array.from(brandSelect.options).forEach(option => {
      if (option.value === '') return; // Skip default option
      
      const isAvailable = availableBrands.has(option.value);
      option.disabled = !isAvailable;
      option.style.color = isAvailable ? '' : '#9ca3af';
      
      // Truncate text if needed to prevent overflow
      const baseText = option.value;
      const suffix = isAvailable ? '' : ' (N/A)';
      const fullText = baseText + suffix;
      
      // Limit text length for better dropdown display
      if (fullText.length > 20) {
        option.textContent = baseText.substring(0, 15) + '...' + suffix;
        option.title = fullText; // Show full text on hover
      } else {
        option.textContent = fullText;
      }
    });
    
    // If current brand is no longer available, clear selection
    if (currentBrand && !availableBrands.has(currentBrand)) {
      brandSelect.value = '';
      updatePaintBrandEnhanced(paintId, '');
    }
  }
  
  // Handle finish selection change
  function updatePaintFinishEnhanced(paintId, finish) {
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) return;
    
    // Map "Low Sheen/Lustre" to "Low Sheen" if needed
    if (finish === 'Low Sheen/Lustre') {
      finish = 'Low Sheen';
    }
    
    // Only clear products and selectedProduct if the finish actually changed
    const previousFinish = paintSelection.finish;
    paintSelection.finish = finish;
    
    if (previousFinish !== finish) {
      paintSelection.products = []; // Clear products when finish changes
      paintSelection.selectedProduct = null;
    }
    
    formState.saveState();
    
    // Update brand availability based on finish
    updateBrandAvailability(paintId, finish, paintSelection.projectType);
    
    // Update products based on brand and finish
    if (paintSelection.finish) {
      updatePaintBrandEnhanced(paintId, paintSelection.brand || '');
    }
  }

  // Handle color status selection change
  window.updateColorStatus = function(paintId, colorStatus) {
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) return;
    
    paintSelection.colorStatus = colorStatus;
    formState.saveState();
    
    // Show/hide color input section
    const colorInputSection = document.getElementById(`color-input-section-${paintId}`);
    if (colorInputSection) {
      if (colorStatus === 'selected') {
        colorInputSection.style.display = 'block';
        // Initialize with same color by default if not set
        const sameColorToggle = document.getElementById(`toggle-same-color-${paintId}`);
        if (sameColorToggle && paintSelection.sameColor === undefined) {
          sameColorToggle.checked = true;
          toggleSameColor(paintId, true);
        } else if (sameColorToggle) {
          // Apply saved toggle state
          const isSameColor = paintSelection.sameColor !== false;
          sameColorToggle.checked = isSameColor;
          toggleSameColor(paintId, isSameColor);
        }
      } else {
        colorInputSection.style.display = 'none';
        // Hide all measurement color inputs
        const paintCard = document.querySelector(`[data-paint-id="${paintId}"]`);
        if (paintCard) {
          const measurementColorInputs = paintCard.querySelectorAll('.measurement-color-input-container');
          measurementColorInputs.forEach(container => {
            container.style.display = 'none';
          });
        }
      }
    }
  }

  // Handle same color toggle
  window.toggleSameColor = function(paintId, isSameColor) {
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) return;
    
    paintSelection.sameColor = isSameColor;
    
    // Update toggle labels
    const leftLabel = document.getElementById(`toggle-label-left-${paintId}`);
    const rightLabel = document.getElementById(`toggle-label-right-${paintId}`);
    
    if (isSameColor) {
      leftLabel?.classList.remove('active');
      rightLabel?.classList.add('active');
      document.getElementById(`single-color-input-${paintId}`).style.display = 'block';
      
      // Hide individual color inputs in measurements
      const paintCard = document.querySelector(`[data-paint-id="${paintId}"]`);
      if (paintCard) {
        const measurementColorInputs = paintCard.querySelectorAll('.measurement-color-input-container');
        measurementColorInputs.forEach(container => {
          container.style.display = 'none';
        });
      }
    } else {
      leftLabel?.classList.add('active');
      rightLabel?.classList.remove('active');
      document.getElementById(`single-color-input-${paintId}`).style.display = 'none';
      
      // Show individual color inputs in measurements
      const paintCard = document.querySelector(`[data-paint-id="${paintId}"]`);
      if (paintCard) {
        const measurementColorInputs = paintCard.querySelectorAll('.measurement-color-input-container');
        measurementColorInputs.forEach(container => {
          container.style.display = 'block';
        });
      }
    }
    
    formState.saveState();
  }

  // Update single color for all surfaces
  window.updateSingleColor = function(paintId, color) {
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) return;
    
    paintSelection.singleColor = color;
    
    // Update all measurement colors if same color is selected
    if (paintSelection.sameColor) {
      const paintCard = document.querySelector(`[data-paint-id="${paintId}"]`);
      if (paintCard) {
        // Update all measurements in all surfaces under this paint
        formState.data.surfaces.forEach(surface => {
          if (surface.paintId === paintId) {
            surface.measurements.forEach(measurement => {
              measurement.color = color;
            });
          }
        });
        
        // Update the UI
        const measurementColorInputs = paintCard.querySelectorAll('.measurement-color-input');
        measurementColorInputs.forEach(input => {
          input.value = color;
        });
      }
    }
    
    // Add to color suggestions list
    if (color && !window.colorSuggestions.includes(color)) {
      window.colorSuggestions.push(color);
    }
    
    formState.saveState();
  }

  // Update paint brand enhanced
  function updatePaintBrandEnhanced(paintId, brand) {
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) {
      return;
    }
    
    // Prevent UCI from being selected for interior paint
    if (paintSelection.projectType === 'interior' && brand === 'UCI') {
      alert('UCI brand is not available for interior paint. Please select a different brand.');
      // Reset the select element
      const brandSelect = document.querySelector(`[data-paint-id="${paintId}"] .paint-brand-select`);
      if (brandSelect) {
        brandSelect.value = '';
      }
      return;
    }
    
    paintSelection.brand = brand;
    
    // Only clear products and selectedProduct if the brand actually changed
    const previousBrand = formState.data.paintSelections.find(p => p.id === paintId)?.brand;
    if (previousBrand !== brand) {
      paintSelection.products = []; // Clear products when brand changes
      paintSelection.selectedProduct = null; // Clear selected product
    }
    
    formState.saveState();
    
    // Update finish availability based on brand selection
    updateFinishAvailability(paintId, brand, paintSelection.projectType);
    
    // Update brand availability if finish is already selected
    if (paintSelection.finish) {
      updateBrandAvailability(paintId, paintSelection.finish, paintSelection.projectType);
    }
    
    // Update products grid based on brand and finish
    const productsGrid = document.getElementById(`products-grid-${paintId}`);
    if (!productsGrid) return;
    
    // Use the shared displayPaintProducts function
    displayPaintProducts(paintId);
  }
  
  // Make displayPaintProducts globally accessible
  window.displayPaintProducts = displayPaintProducts;
  
  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', async function() {
    // Initialize paint selection
    await initializePaintSelection();
    
    // Initialize surfaces if not already present
    if (!formState.data.surfaces) {
      formState.data.surfaces = getDefaultSurfaces();
      formState.saveState();
    }
    
    // Expose functions globally
    window.renderPaintSelectionsEnhanced = renderPaintSelectionsEnhanced;
    window.updatePaintBrandEnhanced = updatePaintBrandEnhanced;
    window.updatePaintFinishEnhanced = updatePaintFinishEnhanced;
    window.createPaintCardEnhanced = createPaintCardEnhanced;
    window.updateBrandAvailability = updateBrandAvailability;
    window.fixLowSheenLustre = fixLowSheenLustre;
    window.updateMeasurementIcons = updateMeasurementIcons;
    
    // Call after a short delay to ensure DOM is ready and modal script is loaded
    setTimeout(() => {
      if (window.updateAllWaffleIcons) {
        window.updateAllWaffleIcons();
      }
    }, 500);
    
    // Global observer to fix "Low Sheen/Lustre" anywhere it appears
    let observerTimeout;
    let observerCallCount = 0;
    const MAX_OBSERVER_CALLS = 10; // Prevent infinite loops
    
    const observer = new MutationObserver((mutations) => {
      // Prevent excessive calls
      observerCallCount++;
      if (observerCallCount > MAX_OBSERVER_CALLS) {
        observer.disconnect();
        return;
      }
      
      // Debounce the fix function to avoid excessive calls
      clearTimeout(observerTimeout);
      observerTimeout = setTimeout(() => {
        const hasRelevantChanges = mutations.some(mutation => {
          // Check if the mutation affects select elements or their options
          if (mutation.target.classList && 
              (mutation.target.classList.contains('paint-finish-select') || 
               mutation.target.classList.contains('paint-brand-select'))) {
            return true;
          }
          if (mutation.target.parentElement && 
              mutation.target.parentElement.classList &&
              (mutation.target.parentElement.classList.contains('paint-finish-select') || 
               mutation.target.parentElement.classList.contains('paint-brand-select'))) {
            return true;
          }
          return false;
        });
        
        if (hasRelevantChanges) {
          fixLowSheenLustre();
        }
        
        // Reset call count after successful execution
        observerCallCount = 0;
      }, 25); // Reduced from 50ms for better responsiveness
    });
    
    // Start observing the document for changes (limited to paint selections container)
    const paintContainer = document.getElementById('paint-selections-container');
    if (paintContainer) {
      observer.observe(paintContainer, {
        childList: true,
        subtree: true,
        characterData: false, // Don't need to watch text content changes
        attributes: false // Don't need to watch attribute changes
      });
    }
    
    // Add event listener to constrain dropdown width on focus
    let lastFocusTime = 0;
    let focusHandlerRunning = false;
    
    document.addEventListener('focusin', function(e) {
      if (e.target.classList.contains('paint-brand-select') || 
          e.target.classList.contains('paint-finish-select')) {
        
        // Prevent concurrent execution
        if (focusHandlerRunning) return;
        
        // Throttle to prevent excessive calculations
        const now = Date.now();
        if (now - lastFocusTime < 100) return;
        lastFocusTime = now;
        
        focusHandlerRunning = true;
        
        try {
          const containerWidth = e.target.getBoundingClientRect().width;
          e.target.style.maxWidth = containerWidth + 'px';
          
          // Fix the displayed value if it's "Low Sheen/Lustre"
          if (e.target.value === 'Low Sheen/Lustre') {
            e.target.value = 'Low Sheen';
          }
          
          // Also truncate long options if needed
          Array.from(e.target.options).forEach(option => {
            if (option.textContent.length > 25 && !option.textContent.includes('...')) {
              const originalText = option.textContent;
              option.textContent = originalText.substring(0, 22) + '...';
              option.title = originalText;
            }
          });
          
          // Ensure Low Sheen fix is applied only if not already fixed
          if (e.target.classList.contains('paint-finish-select') && 
              e.target.dataset.lowSheenFixed !== 'true') {
            fixLowSheenLustre();
          }
        } catch (error) {
          } finally {
          focusHandlerRunning = false;
        }
      }
    });
    
    // Check if paint selection container exists
    const container = document.getElementById('paint-selections-container');
    if (container) {
      // Add change event listener to all finish selects to fix display value
      container.addEventListener('change', function(e) {
        if (e.target.classList.contains('paint-finish-select')) {
          // Fix the display if "Low Sheen/Lustre" was selected
          if (e.target.value === 'Low Sheen/Lustre') {
            e.target.value = 'Low Sheen';
            
            // Update the selected option text
            const selectedOption = e.target.options[e.target.selectedIndex];
            if (selectedOption && selectedOption.textContent.includes('Low Sheen/Lustre')) {
              selectedOption.textContent = selectedOption.textContent.replace('Low Sheen/Lustre', 'Low Sheen');
            }
          }
        }
      });
      
      // Check if this includes a painting service
      const serviceTypes = formState.data.serviceTypes || (formState.data.serviceType ? [formState.data.serviceType] : ['surface_coating']);
      const includesPainting = serviceTypes.includes('surface_coating') || 
                             (formState.data.surfaceCoatingMethods && formState.data.surfaceCoatingMethods.includes('painting'));
      const includesAbrasive = serviceTypes.some(type => 
        type === 'abrasive' || 
        type === 'Abrasive Cleaning Method' || 
        type.toLowerCase().includes('abrasive')
      );
      
      if (includesPainting || includesAbrasive) {
        // Small delay to ensure DOM is fully ready
        setTimeout(() => {
          renderPaintSelectionsEnhanced();
        }, 10);
        
        // After rendering, ensure dropdowns are properly constrained (single execution)
        setTimeout(() => {
          const selects = document.querySelectorAll('.paint-brand-select, .paint-finish-select');
          
          // Detect iPad
          const isIPad = navigator.userAgent.match(/iPad/i) || 
                        (navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints > 1);
          
          if (isIPad) {
            // For iPad, apply more aggressive constraints
            selects.forEach(select => {
              const container = select.closest('.select-container');
              if (container) {
                // Limit container width for iPad
                container.style.maxWidth = '260px';
                container.style.width = '260px';
                
                // Also constrain the select element
                select.style.maxWidth = '100%';
                select.style.width = '100%';
                select.style.webkitAppearance = 'none';
                select.style.mozAppearance = 'none';
                select.style.appearance = 'none';
                
                // Add custom arrow if not already styled
                if (!select.style.backgroundImage) {
                  select.style.backgroundImage = 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27/%3E%3C/svg%3E")';
                  select.style.backgroundRepeat = 'no-repeat';
                  select.style.backgroundPosition = 'right 0.75rem center';
                  select.style.backgroundSize = '14px 8px';
                  select.style.paddingRight = '2.5rem';
                }
                
                // Add a wrapper div if needed
                if (!container.querySelector('.select-wrapper')) {
                  const wrapper = document.createElement('div');
                  wrapper.className = 'select-wrapper';
                  wrapper.style.maxWidth = '100%';
                  wrapper.style.overflow = 'hidden';
                  select.parentNode.insertBefore(wrapper, select);
                  wrapper.appendChild(select);
                }
              }
            });
          } else {
            // Regular constraint for non-iPad devices
            selects.forEach(select => {
              const container = select.closest('.select-container');
              if (container) {
                const maxWidth = container.getBoundingClientRect().width;
                select.style.maxWidth = maxWidth + 'px';
              }
            });
          }
          
          // Call fix function once
          fixLowSheenLustre();
          
          // Additional fix for iPad - force redraw
          if (isIPad) {
            selects.forEach(select => {
              select.style.display = 'none';
              select.offsetHeight; // Force reflow
              select.style.display = '';
            });
          }
        }, 100);
      } else {
        // Show message for non-painting services
        container.innerHTML = `
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p class="text-blue-800 text-lg">
              Product selection is not required for this service type.
            </p>
            <p class="text-blue-600 mt-2">
              Service(s) selected: <strong>${serviceTypes.join(' & ')}</strong>
            </p>
          </div>
        `;
      }
    }
    
    // Final fix after everything is loaded
    window.addEventListener('load', function() {
      // Only run if there are paint selections on the page
      const hasSelects = document.querySelector('.paint-finish-select, .paint-brand-select');
      if (!hasSelects) return;
      
      setTimeout(() => {
        // One final fix for any missed instances
        fixLowSheenLustre();
        
        // iPad-specific dropdown width fix
        const isIPad = navigator.userAgent.match(/iPad/i) || 
                      (navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints > 1);
        
        if (isIPad) {
          // Add a class to body for CSS targeting
          document.body.classList.add('is-ipad');
          
          // Add a message for iPad users about the dropdown limitation
          const message = document.createElement('div');
          message.className = 'ipad-message text-sm text-gray-600 mt-2 hidden';
          message.textContent = 'Note: Dropdown width is optimized for iPad display.';
          message.style.maxWidth = '260px';
          
          // Find all select containers and constrain them
          const containers = document.querySelectorAll('.select-container');
          containers.forEach(container => {
            container.style.maxWidth = '260px';
            container.style.width = '260px';
            
            // Add message after container
            if (!container.nextElementSibling || !container.nextElementSibling.classList.contains('ipad-message')) {
              container.parentNode.insertBefore(message.cloneNode(true), container.nextSibling);
            }
            
            // Also update the select elements
            const select = container.querySelector('select');
            if (select) {
              select.style.width = '100%';
              select.style.maxWidth = '100%';
              select.style.webkitAppearance = 'none';
              select.style.mozAppearance = 'none';
              select.style.appearance = 'none';
              
              // Add a data attribute to track iPad styling
              select.dataset.ipadStyled = 'true';
              
              // Add change handler to ensure value is displayed correctly
              select.addEventListener('change', function() {
                // Debounce the repaint to avoid performance issues
                if (this.repaintTimeout) {
                  clearTimeout(this.repaintTimeout);
                }
                this.repaintTimeout = setTimeout(() => {
                  // Force a repaint
                  this.style.display = 'none';
                  this.offsetHeight;
                  this.style.display = '';
                }, 50);
              });
            }
          });
        }
        
        // Ensure dropdowns fit on touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
          const selects = document.querySelectorAll('.paint-finish-select, .paint-brand-select');
          selects.forEach(select => {
            // Set a max width based on viewport
            const viewportWidth = window.innerWidth;
            const maxWidth = Math.min(viewportWidth - 40, 260); // Limited to 260px max
            select.style.maxWidth = maxWidth + 'px';
          });
        }
      }, 500);
    });
  });
  
  // Expose functions to global scope
  window.initializePaintSelection = initializePaintSelection;
  
})(); // End of IIFE
